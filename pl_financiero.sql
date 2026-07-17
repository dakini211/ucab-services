--------------------------------------------------------------------------------
-- MODULO FINANCIERO: PROCEDIMIENTOS ALMACENADOS (Stored Procedures)
-- Services UCAB - PostgreSQL
--
-- ORDEN DE EJECUCION:
--   1. create.sql
--   2. insert.sql
--   3. procedures_finacieros.sql
--   4. pl_financiero.sql          <-- ESTE ARCHIVO
--   5. insert_financiero.sql
--------------------------------------------------------------------------------

--------------------------------------------------------------------------------
-- 1. sp_agregar_item_consumo
-- Inserta un item de consumo en un folio.
-- Deja que el trigger congele el precio si p_precio_unitario viene NULL.
--------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_agregar_item_consumo(BIGINT, INT, TIMESTAMP, VARCHAR, VARCHAR, INT, NUMERIC, NUMERIC);

CREATE OR REPLACE PROCEDURE sp_agregar_item_consumo(
    p_id_miembro        BIGINT,
    p_id_servicio       INT,
    p_fecha_de_creacion TIMESTAMP,
    p_nro_de_folio      VARCHAR,
    p_concepto          VARCHAR,
    p_cantidad          INT,
    p_impuesto_ley      NUMERIC,
    p_precio_unitario   NUMERIC DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO Items_Consumo (
        id_miembro, id_servicio, fecha_de_creacion, nro_de_folio,
        concepto, cantidad, impuesto_ley, precio_unitario
    ) VALUES (
        p_id_miembro, p_id_servicio, p_fecha_de_creacion, p_nro_de_folio,
        p_concepto, p_cantidad, p_impuesto_ley, p_precio_unitario
    );
END;
$$;


--------------------------------------------------------------------------------
-- 2. sp_generar_factura
-- Cierra el folio, calcula el total mediante la funcion fn_total_folio y
-- emite la factura con estatus 'pendiente'.
--
-- Columnas reales de Factura (segun CREATE.sql):
--   saldo, numero_de_control, fecha_de_emision, estatus,
--   id_miembro, id_servicio, fecha_de_creacion, nro_de_folio
--------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_generar_factura(BIGINT, INT, TIMESTAMP, VARCHAR, VARCHAR);

CREATE OR REPLACE PROCEDURE sp_generar_factura(
    p_id_miembro        BIGINT,
    p_id_servicio       INT,
    p_fecha_de_creacion TIMESTAMP,
    p_nro_de_folio      VARCHAR,
    p_numero_de_control VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_total NUMERIC(12,2);
BEGIN
    -- 1. Validar que el folio este abierto
    IF (SELECT estado FROM Folio WHERE nro_de_folio = p_nro_de_folio) = 'facturado' THEN
        RAISE EXCEPTION 'El folio % ya fue facturado.', p_nro_de_folio;
    END IF;

    -- 2. Calcular total sumando los items
    v_total := fn_total_folio(p_id_miembro, p_id_servicio, p_fecha_de_creacion, p_nro_de_folio);

    -- 3. Emitir la factura
    INSERT INTO Factura (
        numero_de_control, id_miembro, id_servicio, fecha_de_creacion, nro_de_folio,
        fecha_de_emision, saldo, estatus
    ) VALUES (
        p_numero_de_control, p_id_miembro, p_id_servicio, p_fecha_de_creacion, p_nro_de_folio,
        CURRENT_TIMESTAMP, v_total, 'pendiente'
    );

    -- 4. Cerrar el folio
    UPDATE Folio
    SET estado = 'facturado',
        fecha_fin_mes = CURRENT_DATE
    WHERE nro_de_folio = p_nro_de_folio;

    RAISE NOTICE 'Factura % emitida para el folio %. Total: %. Estatus: pendiente.',
        p_numero_de_control, p_nro_de_folio, v_total;
END;
$$;


--------------------------------------------------------------------------------
-- 3. sp_registrar_pago
-- Inserta un pago en Metodo_Pago y sus subclases.
-- El trigger trg_actualizar_saldo_factura hara el resto (actualizar la factura).
--
-- Estructura real de las tablas (segun CREATE.sql):
--   Metodo_Pago  PK(numero_de_control, fecha_operacion) + monto
--   Zelle        FK + correo, nombre, confirmacion
--   Pago_Movil   FK + telefono_emisor, banco, referencia
--   Tarjeta      FK + nro_tarjeta, vencimiento, compania, red
--   TAI          FK + uid, pos, remanente
--------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_registrar_pago(VARCHAR, NUMERIC, VARCHAR, TIMESTAMP, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR);

CREATE OR REPLACE PROCEDURE sp_registrar_pago(
    p_numero_de_control VARCHAR,
    p_monto             NUMERIC,
    p_tipo              VARCHAR, -- 'zelle', 'pago_movil', 'tarjeta', 'tai'
    p_fecha_operacion   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Campos Zelle
    p_correo            VARCHAR DEFAULT NULL,
    p_nombre            VARCHAR DEFAULT NULL,
    p_confirmacion      VARCHAR DEFAULT NULL,
    -- Campos Pago Movil
    p_telefono_emisor   VARCHAR DEFAULT NULL,
    p_banco             VARCHAR DEFAULT NULL,
    p_referencia        VARCHAR DEFAULT NULL,
    -- Campos Tarjeta
    p_nro_tarjeta       VARCHAR DEFAULT NULL,
    p_vencimiento       VARCHAR DEFAULT NULL,
    p_compania          VARCHAR DEFAULT NULL,
    p_red               VARCHAR DEFAULT NULL,
    -- Campos TAI
    p_uid               VARCHAR DEFAULT NULL,
    p_pos               VARCHAR DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_remanente NUMERIC(15,2);
BEGIN
    -- 1. Insertar en la superclase Metodo_Pago
    --    PK = (numero_de_control, fecha_operacion), columna extra = monto
    INSERT INTO Metodo_Pago (numero_de_control, fecha_operacion, monto)
    VALUES (p_numero_de_control, p_fecha_operacion, p_monto);

    -- 2. Insertar en la subclase correspondiente
    IF p_tipo = 'zelle' THEN
        INSERT INTO Zelle (numero_de_control, fecha_operacion, correo, nombre, confirmacion)
        VALUES (p_numero_de_control, p_fecha_operacion, p_correo, p_nombre, p_confirmacion);

    ELSIF p_tipo = 'pago_movil' THEN
        INSERT INTO Pago_Movil (numero_de_control, fecha_operacion, telefono_emisor, banco, referencia)
        VALUES (p_numero_de_control, p_fecha_operacion, p_telefono_emisor, p_banco, p_referencia);

    ELSIF p_tipo = 'tarjeta' THEN
        INSERT INTO Tarjeta (numero_de_control, fecha_operacion, nro_tarjeta, vencimiento, compania, red)
        VALUES (p_numero_de_control, p_fecha_operacion, p_nro_tarjeta, p_vencimiento, p_compania, p_red);

    ELSIF p_tipo = 'tai' THEN
        -- Descontar de la billetera digital
        UPDATE Billetera_Digital
        SET saldo = saldo - p_monto
        WHERE uid = p_uid;

        -- Calcular remanente (saldo que queda en la billetera)
        SELECT saldo INTO v_remanente
        FROM Billetera_Digital
        WHERE uid = p_uid;

        INSERT INTO TAI (numero_de_control, fecha_operacion, uid, pos, remanente)
        VALUES (p_numero_de_control, p_fecha_operacion, p_uid, p_pos, COALESCE(v_remanente, 0));

    ELSE
        RAISE EXCEPTION 'Tipo de pago no soportado: %', p_tipo;
    END IF;

    -- El trigger AFTER INSERT en Metodo_Pago se encarga de
    -- recalcular el saldo y estatus de la Factura.
END;
$$;


--------------------------------------------------------------------------------
-- 4. sp_cierre_masivo_folios
-- Encuentra todos los folios abiertos y les emite una factura automatica.
--------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_cierre_masivo_folios(TIMESTAMP);

CREATE OR REPLACE PROCEDURE sp_cierre_masivo_folios(p_fecha_cierre TIMESTAMP)
LANGUAGE plpgsql
AS $$
DECLARE
    f RECORD;
    v_nro_control VARCHAR;
BEGIN
    FOR f IN (SELECT * FROM Folio WHERE estado = 'abierto') LOOP
        -- Generar numero de control dinamicamente con la secuencia
        v_nro_control := 'FAC-AUT-' || nextval('seq_numero_control')::VARCHAR;

        CALL sp_generar_factura(
            f.id_miembro, f.id_servicio, f.fecha_de_creacion, f.nro_de_folio, v_nro_control
        );
    END LOOP;
END;
$$;
