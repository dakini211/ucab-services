--------------------------------------------------------------------------------
-- MODULO FINANCIERO: FUNCIONES Y TRIGGERS
-- Services UCAB - PostgreSQL / PL/pgSQL
--
-- ORDEN DE EJECUCION:
--   1. create.sql
--   2. insert.sql            (datos base: miembros, servicios, tarifas...)
--   3. funciones_triggers.sql  <-- ESTE ARCHIVO
--   4. pl_financiero.sql       (procedimientos)
--   5. insert_financiero.sql   (datos de prueba del modulo)
--
-- NOTA DE ALCANCE: no se agrega ninguna entidad ni atributo al modelo ER.
-- Las SECUENCIAS son objetos del gestor (no entidades), y los CHECK solo
-- automatizan el dominio de atributos ya existentes.
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
-- 0. LIMPIEZA (permite re-ejecutar el script durante las pruebas)
--------------------------------------------------------------------------------

DROP TRIGGER IF EXISTS trg_bloquear_folio_facturado ON Items_Consumo;
DROP TRIGGER IF EXISTS trg_congelar_precio_item     ON Items_Consumo;
DROP TRIGGER IF EXISTS trg_actualizar_saldo_factura ON Metodo_Pago;

DROP FUNCTION IF EXISTS trg_fn_bloquear_folio_facturado();
DROP FUNCTION IF EXISTS trg_fn_congelar_precio_item();
DROP FUNCTION IF EXISTS trg_fn_actualizar_saldo_factura();

DROP FUNCTION IF EXISTS fn_saldo_factura(VARCHAR);
DROP FUNCTION IF EXISTS fn_total_pagado(VARCHAR);
DROP FUNCTION IF EXISTS fn_total_folio(BIGINT, INT, TIMESTAMP, VARCHAR);
DROP FUNCTION IF EXISTS fn_tarifa_vigente(INT, TIMESTAMP);


--------------------------------------------------------------------------------
-- 1. SECUENCIAS (generacion de identificadores de negocio)
--    No son entidades del ER: son objetos del gestor, igual que un indice.
--------------------------------------------------------------------------------

CREATE SEQUENCE IF NOT EXISTS seq_nro_folio
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS seq_numero_control
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    CACHE 1;


--------------------------------------------------------------------------------
-- 2. CONSTRAINT ADICIONAL EN Metodo_Pago
--    (Si ya lo agregaste en create.sql, esta sentencia dara error: ignoralo.)
--------------------------------------------------------------------------------

ALTER TABLE Metodo_Pago DROP CONSTRAINT IF EXISTS chk_monto_metodo_pago;

ALTER TABLE Metodo_Pago
    ADD CONSTRAINT chk_monto_metodo_pago
    CHECK (monto > 0);


--------------------------------------------------------------------------------
-- 3. FUNCIONES
--------------------------------------------------------------------------------

-- 3.1 fn_tarifa_vigente: precio base del servicio en un momento dado
CREATE OR REPLACE FUNCTION fn_tarifa_vigente(
    p_id_servicio INT,
    p_fecha       TIMESTAMP
)
RETURNS NUMERIC(10,2)
LANGUAGE plpgsql
AS $$
DECLARE
    v_tarifa NUMERIC(10,2);
BEGIN
    SELECT tarifa_precio
    INTO   v_tarifa
    FROM   Historico_Tarifa
    WHERE  id_servicio = p_id_servicio
      AND  fecha_inicio <= p_fecha::DATE
    ORDER BY fecha_inicio DESC
    LIMIT 1;

    RETURN v_tarifa;   -- NULL si no hay tarifa registrada
END;
$$;


-- 3.2 fn_total_folio: suma de (precio_unitario * cantidad * (1 + impuesto/100))
CREATE OR REPLACE FUNCTION fn_total_folio(
    p_id_miembro      BIGINT,
    p_id_servicio     INT,
    p_fecha_creacion  TIMESTAMP,
    p_nro_folio       VARCHAR
)
RETURNS NUMERIC(12,2)
LANGUAGE plpgsql
AS $$
DECLARE
    v_total NUMERIC(12,2);
BEGIN
    SELECT COALESCE(
               SUM(precio_unitario * cantidad * (1 + impuesto_ley / 100.0)),
               0
           )
    INTO   v_total
    FROM   Items_Consumo
    WHERE  id_miembro     = p_id_miembro
      AND  id_servicio    = p_id_servicio
      AND  fecha_de_creacion = p_fecha_creacion
      AND  nro_de_folio   = p_nro_folio;

    RETURN v_total;
END;
$$;


-- 3.3 fn_total_pagado: suma de abonos registrados contra una factura
CREATE OR REPLACE FUNCTION fn_total_pagado(p_numero_de_control VARCHAR)
RETURNS NUMERIC(12,2)
LANGUAGE plpgsql
AS $$
DECLARE
    v_pagado NUMERIC(12,2);
BEGIN
    SELECT COALESCE(SUM(monto), 0)
    INTO   v_pagado
    FROM   Metodo_Pago
    WHERE  numero_de_control = p_numero_de_control;

    RETURN v_pagado;
END;
$$;


-- 3.4 fn_saldo_factura: total - pagado (recalculo en tiempo real)
CREATE OR REPLACE FUNCTION fn_saldo_factura(p_numero_de_control VARCHAR)
RETURNS NUMERIC(12,2)
LANGUAGE plpgsql
AS $$
DECLARE
    v_total  NUMERIC(12,2);
    v_pagado NUMERIC(12,2);
    v_rec    RECORD;
BEGIN
    SELECT id_miembro, id_servicio, fecha_de_creacion, nro_de_folio
    INTO   v_rec
    FROM   Factura
    WHERE  numero_de_control = p_numero_de_control;

    v_total  := fn_total_folio(v_rec.id_miembro, v_rec.id_servicio,
                               v_rec.fecha_de_creacion, v_rec.nro_de_folio);
    v_pagado := fn_total_pagado(p_numero_de_control);

    RETURN GREATEST(v_total - v_pagado, 0);
END;
$$;


--------------------------------------------------------------------------------
-- 4. TRIGGER: trg_bloquear_folio_facturado
--    Impide agregar items a un folio ya facturado.
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION trg_fn_bloquear_folio_facturado()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_estado VARCHAR;
BEGIN
    SELECT estado
    INTO   v_estado
    FROM   Folio
    WHERE  id_miembro      = NEW.id_miembro
      AND  id_servicio     = NEW.id_servicio
      AND  fecha_de_creacion = NEW.fecha_de_creacion
      AND  nro_de_folio    = NEW.nro_de_folio;

    IF v_estado = 'facturado' THEN
        RAISE EXCEPTION
            'El folio % ya fue facturado y no admite nuevos items.',
            NEW.nro_de_folio;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_bloquear_folio_facturado
    BEFORE INSERT ON Items_Consumo
    FOR EACH ROW
    EXECUTE FUNCTION trg_fn_bloquear_folio_facturado();


--------------------------------------------------------------------------------
-- 5. TRIGGER: trg_congelar_precio_item
--    Si precio_unitario llega NULL, lo congela con la tarifa vigente
--    en la fecha del folio. Si no hay tarifa, lanza excepcion.
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION trg_fn_congelar_precio_item()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_tarifa NUMERIC(10,2);
BEGIN
    IF NEW.precio_unitario IS NULL THEN
        v_tarifa := fn_tarifa_vigente(NEW.id_servicio, NEW.fecha_de_creacion);

        IF v_tarifa IS NULL THEN
            RAISE EXCEPTION
                'No existe tarifa para el servicio % en la fecha %.',
                NEW.id_servicio, NEW.fecha_de_creacion;
        END IF;

        NEW.precio_unitario := v_tarifa;

        RAISE NOTICE
            'Precio congelado para "%": % (tarifa vigente al %).',
            NEW.concepto, v_tarifa, NEW.fecha_de_creacion::DATE;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_congelar_precio_item
    BEFORE INSERT ON Items_Consumo
    FOR EACH ROW
    EXECUTE FUNCTION trg_fn_congelar_precio_item();


--------------------------------------------------------------------------------
-- 6. TRIGGER: trg_actualizar_saldo_factura
--    Despues de cada abono recalcula el saldo y actualiza el estatus
--    de la factura (pendiente -> parcial -> pagada).
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION trg_fn_actualizar_saldo_factura()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_total   NUMERIC(12,2);
    v_pagado  NUMERIC(12,2);
    v_saldo   NUMERIC(12,2);
    v_estatus VARCHAR(20);
    v_rec     RECORD;
BEGIN
    -- Obtener datos del folio a partir de la factura
    SELECT id_miembro, id_servicio, fecha_de_creacion, nro_de_folio
    INTO   v_rec
    FROM   Factura
    WHERE  numero_de_control = NEW.numero_de_control;

    -- Verificar que la factura no esta ya pagada
    SELECT estatus INTO v_estatus
    FROM   Factura
    WHERE  numero_de_control = NEW.numero_de_control;

    IF v_estatus = 'pagada' THEN
        RAISE EXCEPTION
            'La factura % ya esta pagada. No se admiten mas abonos.',
            NEW.numero_de_control;
    END IF;

    -- Recalcular totales
    v_total  := fn_total_folio(v_rec.id_miembro, v_rec.id_servicio,
                               v_rec.fecha_de_creacion, v_rec.nro_de_folio);
    v_pagado := fn_total_pagado(NEW.numero_de_control);
    v_saldo  := GREATEST(v_total - v_pagado, 0);

    -- Determinar nuevo estatus
    IF v_saldo = 0 THEN
        v_estatus := 'pagada';
    ELSIF v_pagado > 0 THEN
        v_estatus := 'parcial';
    ELSE
        v_estatus := 'pendiente';
    END IF;

    -- Actualizar la factura
    UPDATE Factura
    SET    saldo   = v_saldo,
           estatus = v_estatus
    WHERE  numero_de_control = NEW.numero_de_control;

    RAISE NOTICE
        'Abono de % aplicado a la factura %. Pagado: % de %. Saldo: %. Estatus: %.',
        NEW.monto, NEW.numero_de_control, v_pagado, v_total, v_saldo, v_estatus;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_actualizar_saldo_factura
    AFTER INSERT ON Metodo_Pago
    FOR EACH ROW
    EXECUTE FUNCTION trg_fn_actualizar_saldo_factura();