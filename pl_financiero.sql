--------------------------------------------------------------------------------
-- MODULO FINANCIERO: PROCEDIMIENTOS ALMACENADOS
-- Services UCAB - PostgreSQL / PL/pgSQL
--
-- Anexar a pl.sql. Requiere funciones_triggers.sql ejecutado previamente.
--
-- CONVENCION: los procedimientos NO devuelven el identificador generado por
-- parametro OUT; lo informan con RAISE NOTICE. Para recuperarlo desde el backend
-- basta consultar por la clave unica del folio (uq_factura_folio garantiza que
-- un folio tiene a lo sumo una factura):
--
--   SELECT numero_de_control FROM Factura
--   WHERE id_miembro = ? AND id_servicio = ? AND fecha_de_creacion = ? AND nro_de_folio = ?;
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
-- sp_abrir_folio
-- Abre un estado de cuenta (folio) sobre una solicitud existente.
--
-- REGLA (pag. 4): "Cuando un usuario inicia un tramite o reserva, se abre un
-- estado de cuenta vinculado a su solicitud."
--------------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_abrir_folio(
    p_id_miembro        BIGINT,
    p_id_servicio       INT,
    p_fecha_de_creacion TIMESTAMP,
    p_fecha_inicio_mes  DATE    DEFAULT NULL,
    p_nro_de_folio      VARCHAR DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_existe INT;
    v_inicio DATE;
    v_nro    VARCHAR(50);
BEGIN
    -- 1. La solicitud debe existir (el folio es una entidad debil de la solicitud)
    SELECT COUNT(*)
    INTO v_existe
    FROM Solicitud_servicio
    WHERE id_miembro        = p_id_miembro
      AND id_servicio       = p_id_servicio
      AND fecha_de_creacion = p_fecha_de_creacion;

    IF v_existe = 0 THEN
        RAISE EXCEPTION 'No existe la solicitud de servicio (miembro %, servicio %, fecha %).',
            p_id_miembro, p_id_servicio, p_fecha_de_creacion;
    END IF;

    -- 2. Determinar el inicio del periodo del folio
    v_inicio := COALESCE(p_fecha_inicio_mes, GREATEST(CURRENT_DATE, p_fecha_de_creacion::DATE));

    -- Respeta chk_folio_posterior_solicitud
    IF v_inicio < p_fecha_de_creacion::DATE THEN
        RAISE EXCEPTION 'El folio no puede iniciar el % : es anterior a su solicitud (%).',
            v_inicio, p_fecha_de_creacion::DATE;
    END IF;

    -- 3. Generar el numero de folio si no se suministra
    v_nro := COALESCE(
        p_nro_de_folio,
        'FOL-' || TO_CHAR(v_inicio, 'YYYYMM') || '-' || LPAD(NEXTVAL('seq_nro_folio')::TEXT, 5, '0')
    );

    -- 4. Abrir el folio. fecha_fin_mes NULL = periodo aun en curso.
    INSERT INTO Folio (
        id_miembro, id_servicio, fecha_de_creacion, nro_de_folio,
        estado, fecha_inicio_mes, fecha_fin_mes
    ) VALUES (
        p_id_miembro, p_id_servicio, p_fecha_de_creacion, v_nro,
        'abierto', v_inicio, NULL
    );

    RAISE NOTICE 'Folio % abierto (miembro %, servicio %, inicio %).',
        v_nro, p_id_miembro, p_id_servicio, v_inicio;
END;
$$;


--------------------------------------------------------------------------------
-- sp_agregar_item_consumo
-- Carga una linea de consumo al folio.
--
-- REGLA (pag. 4): "A medida que el proceso avanza, se van cargando diversos
-- items de consumo. Cada linea de cargo especifica el concepto, la cantidad,
-- el precio unitario tomado del historial de tarifas... y los impuestos de ley."
--
-- p_precio_unitario NULL -> el trigger trg_congelar_precio_item lo congela
--                           desde Historico_Tarifa (cargo propio del servicio).
-- p_precio_unitario dado -> se respeta (concepto suplementario sin tarifa propia).
--------------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_agregar_item_consumo(
    p_id_miembro        BIGINT,
    p_id_servicio       INT,
    p_fecha_de_creacion TIMESTAMP,
    p_nro_de_folio      VARCHAR,
    p_concepto          VARCHAR,
    p_cantidad          INT,
    p_impuesto_ley      NUMERIC DEFAULT 16.00,   -- IVA vigente, en PORCENTAJE
    p_precio_unitario   NUMERIC DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_estado VARCHAR(50);
BEGIN
    SELECT estado
    INTO v_estado
    FROM Folio
    WHERE id_miembro        = p_id_miembro
      AND id_servicio       = p_id_servicio
      AND fecha_de_creacion = p_fecha_de_creacion
      AND nro_de_folio      = p_nro_de_folio;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No existe el folio %.', p_nro_de_folio;
    END IF;

    IF v_estado <> 'abierto' THEN
        RAISE EXCEPTION 'El folio % no admite cargos (estado actual: %).', p_nro_de_folio, v_estado;
    END IF;

    -- El trigger trg_congelar_precio_item resuelve el precio si viene NULL.
    INSERT INTO Items_Consumo (
        id_miembro, id_servicio, fecha_de_creacion, nro_de_folio,
        concepto, cantidad, impuesto_ley, precio_unitario
    ) VALUES (
        p_id_miembro, p_id_servicio, p_fecha_de_creacion, p_nro_de_folio,
        p_concepto, p_cantidad, p_impuesto_ley, p_precio_unitario
    );

    RAISE NOTICE 'Item "%" (x%) cargado al folio %.', p_concepto, p_cantidad, p_nro_de_folio;
END;
$$;


--------------------------------------------------------------------------------
-- sp_generar_factura
-- Convierte UN folio en factura.
--
-- REGLA (pag. 4): "el sistema genera la factura. Este es el documento legal y
-- fiscal definitivo que consolida todos los cargos del estado de cuenta.
-- La factura posee un numero de control unico, una fecha de emision..."
--
-- Implementa la relacion Se_convierte (0,1) del ER: el UNIQUE uq_factura_folio
-- ya impide que un folio produzca dos facturas; aqui ademas se valida el estado.
--------------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_generar_factura(
    p_id_miembro        BIGINT,
    p_id_servicio       INT,
    p_fecha_de_creacion TIMESTAMP,
    p_nro_de_folio      VARCHAR,
    p_numero_de_control VARCHAR DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_estado  VARCHAR(50);
    v_items   INT;
    v_total   NUMERIC(15, 2);
    v_estatus VARCHAR(50);
    v_emision TIMESTAMP := CURRENT_TIMESTAMP;
    v_nro     VARCHAR(50);
BEGIN
    -- 1. El folio debe existir y estar abierto. FOR UPDATE evita que dos cierres
    --    concurrentes intenten facturar el mismo folio.
    SELECT estado
    INTO v_estado
    FROM Folio
    WHERE id_miembro        = p_id_miembro
      AND id_servicio       = p_id_servicio
      AND fecha_de_creacion = p_fecha_de_creacion
      AND nro_de_folio      = p_nro_de_folio
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No existe el folio %.', p_nro_de_folio;
    END IF;

    IF v_estado <> 'abierto' THEN
        RAISE EXCEPTION 'El folio % ya fue facturado (estado: %).', p_nro_de_folio, v_estado;
    END IF;

    -- 2. No se factura un folio vacio: no habria nada que "consolidar".
    SELECT COUNT(*)
    INTO v_items
    FROM Items_Consumo
    WHERE id_miembro        = p_id_miembro
      AND id_servicio       = p_id_servicio
      AND fecha_de_creacion = p_fecha_de_creacion
      AND nro_de_folio      = p_nro_de_folio;

    IF v_items = 0 THEN
        RAISE EXCEPTION 'El folio % no tiene items de consumo: no se puede facturar.', p_nro_de_folio;
    END IF;

    -- 3. Total consolidado (atributo derivado "Total" del ER)
    v_total := fn_total_folio(p_id_miembro, p_id_servicio, p_fecha_de_creacion, p_nro_de_folio);

    -- 4. CASO BORDE: chk_saldo_vs_estatus exige que 'pendiente' tenga saldo > 0.
    --    Un folio integramente exonerado (total 0) nace pagado.
    IF v_total = 0 THEN
        v_estatus := 'pagada';
    ELSE
        v_estatus := 'pendiente';
    END IF;

    -- 5. Numero de control unico
    v_nro := COALESCE(
        p_numero_de_control,
        'FAC-' || TO_CHAR(v_emision, 'YYYY') || '-' || LPAD(NEXTVAL('seq_numero_control')::TEXT, 6, '0')
    );

    -- 6. Respeta chk_fecha_emision_factura (emision >= creacion de la solicitud)
    IF v_emision < p_fecha_de_creacion THEN
        v_emision := p_fecha_de_creacion;
    END IF;

    INSERT INTO Factura (
        saldo, numero_de_control, fecha_de_emision, estatus,
        id_miembro, id_servicio, fecha_de_creacion, nro_de_folio
    ) VALUES (
        v_total, v_nro, v_emision, v_estatus,
        p_id_miembro, p_id_servicio, p_fecha_de_creacion, p_nro_de_folio
    );

    -- 7. Cerrar el folio: queda congelado (lo hace cumplir trg_bloquear_folio_facturado)
    UPDATE Folio
    SET estado        = 'facturado',
        fecha_fin_mes = GREATEST(v_emision::DATE, fecha_inicio_mes)
    WHERE id_miembro        = p_id_miembro
      AND id_servicio       = p_id_servicio
      AND fecha_de_creacion = p_fecha_de_creacion
      AND nro_de_folio      = p_nro_de_folio;

    RAISE NOTICE 'Factura % emitida para el folio %. Total: %. Estatus: %.',
        v_nro, p_nro_de_folio, v_total, v_estatus;
END;
$$;


--------------------------------------------------------------------------------
-- sp_cierre_masivo_folios
-- Cierre masivo mensual de estados de cuenta.
--
-- REGLA (pag. 7): "El sistema puede ejecutar un cierre masivo de estados de
-- cuenta al final de cada mes, convirtiendo todos los folios de consumo
-- pendientes en facturas formales de manera simultanea."
--
-- Un folio que falle (p.ej. sin items) NO aborta el lote: se cuenta y se reporta.
--------------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_cierre_masivo_folios(
    p_mes DATE DEFAULT NULL   -- cualquier fecha dentro del mes a cerrar
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_mes    DATE;
    v_inicio DATE;
    v_fin    DATE;
    r        RECORD;
    v_ok     INT := 0;
    v_omit   INT := 0;
BEGIN
    v_mes    := COALESCE(p_mes, CURRENT_DATE);
    v_inicio := DATE_TRUNC('month', v_mes)::DATE;
    v_fin    := (DATE_TRUNC('month', v_mes) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

    RAISE NOTICE 'Iniciando cierre masivo del periodo % a %...', v_inicio, v_fin;

    FOR r IN
        SELECT f.id_miembro, f.id_servicio, f.fecha_de_creacion, f.nro_de_folio
        FROM Folio f
        WHERE f.estado = 'abierto'
          AND f.fecha_inicio_mes BETWEEN v_inicio AND v_fin
        ORDER BY f.id_miembro, f.nro_de_folio
    LOOP
        BEGIN
            CALL sp_generar_factura(r.id_miembro, r.id_servicio, r.fecha_de_creacion, r.nro_de_folio);
            v_ok := v_ok + 1;
        EXCEPTION
            WHEN OTHERS THEN
                v_omit := v_omit + 1;
                RAISE NOTICE 'Folio % omitido: %', r.nro_de_folio, SQLERRM;
        END;
    END LOOP;

    RAISE NOTICE 'Cierre masivo de % completado. Facturados: %. Omitidos: %.',
        TO_CHAR(v_inicio, 'MM/YYYY'), v_ok, v_omit;
END;
$$;


--------------------------------------------------------------------------------
-- sp_registrar_pago
-- Registra un abono contra una factura, con su subclase de metodo de pago.
--
-- REGLA (pag. 4): "El sistema rastrea el saldo de la factura en todo momento,
-- permitiendo abonos parciales hasta alcanzar la liquidacion total."
--
-- El saldo y el estatus los actualiza el trigger trg_actualizar_saldo_factura.
-- Este procedimiento solo inserta el pago y su subclase (jerarquia disjunta 'd').
--
-- p_tipo: 'zelle' | 'tarjeta' | 'pago_movil' | 'efectivo' | 'cripto' | 'tai'
--------------------------------------------------------------------------------

CREATE OR REPLACE PROCEDURE sp_registrar_pago(
    p_numero_de_control VARCHAR,
    p_monto             NUMERIC,
    p_tipo              VARCHAR,
    p_fecha_operacion   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Zelle
    p_correo            VARCHAR DEFAULT NULL,
    p_nombre            VARCHAR DEFAULT NULL,
    p_confirmacion      VARCHAR DEFAULT NULL,
    -- Tarjeta
    p_nro_tarjeta       VARCHAR DEFAULT NULL,
    p_vencimiento       VARCHAR DEFAULT NULL,
    p_compania          VARCHAR DEFAULT NULL,
    p_red               VARCHAR DEFAULT NULL,
    -- Pago_Movil
    p_telefono_emisor   VARCHAR DEFAULT NULL,
    p_banco             VARCHAR DEFAULT NULL,
    p_referencia        VARCHAR DEFAULT NULL,
    -- Efectivo / Criptomoneda
    p_tasa              NUMERIC DEFAULT 1.0,
    -- Criptomoneda
    p_dxid              VARCHAR DEFAULT NULL,
    p_billetera         VARCHAR DEFAULT NULL,
    -- TAI
    p_uid               VARCHAR DEFAULT NULL,
    p_pos               VARCHAR DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_tipo       VARCHAR(20) := LOWER(TRIM(p_tipo));
    v_remanente  NUMERIC(15, 2);
BEGIN
    IF p_monto IS NULL OR p_monto <= 0 THEN
        RAISE EXCEPTION 'El monto del abono debe ser mayor a cero.';
    END IF;

    -- 1. Insertar el metodo de pago (padre). Dispara trg_actualizar_saldo_factura,
    --    que valida la factura y recalcula saldo + estatus.
    INSERT INTO Metodo_Pago (monto, numero_de_control, fecha_operacion)
    VALUES (p_monto, p_numero_de_control, p_fecha_operacion);

    -- 2. Insertar la subclase correspondiente (jerarquia disjunta)
    CASE v_tipo

        WHEN 'zelle' THEN
            IF p_correo IS NULL OR p_nombre IS NULL OR p_confirmacion IS NULL THEN
                RAISE EXCEPTION 'Zelle requiere correo, nombre del titular y codigo de confirmacion.';
            END IF;
            INSERT INTO Zelle (numero_de_control, fecha_operacion, correo, nombre, confirmacion)
            VALUES (p_numero_de_control, p_fecha_operacion, p_correo, p_nombre, p_confirmacion);

        WHEN 'tarjeta' THEN
            IF p_nro_tarjeta IS NULL OR p_vencimiento IS NULL OR p_compania IS NULL OR p_red IS NULL THEN
                RAISE EXCEPTION 'Tarjeta requiere nro_tarjeta, vencimiento, compania y red.';
            END IF;
            INSERT INTO Tarjeta (numero_de_control, fecha_operacion, nro_tarjeta, vencimiento, compania, red)
            VALUES (p_numero_de_control, p_fecha_operacion, p_nro_tarjeta, p_vencimiento, p_compania, p_red);

        WHEN 'pago_movil' THEN
            IF p_telefono_emisor IS NULL OR p_banco IS NULL OR p_referencia IS NULL THEN
                RAISE EXCEPTION 'Pago Movil requiere telefono emisor, banco y referencia.';
            END IF;
            INSERT INTO Pago_Movil (numero_de_control, fecha_operacion, telefono_emisor, banco, referencia)
            VALUES (p_numero_de_control, p_fecha_operacion, p_telefono_emisor, p_banco, p_referencia);

        WHEN 'efectivo' THEN
            -- Efectivo.monto = efectivo fisico recibido en su moneda de curso.
            -- Metodo_Pago.monto = lo aplicado a la factura. Se relacionan por la tasa.
            INSERT INTO Efectivo (numero_de_control, fecha_operacion, monto, tasa)
            VALUES (p_numero_de_control, p_fecha_operacion, ROUND(p_monto * COALESCE(p_tasa, 1.0), 2), COALESCE(p_tasa, 1.0));

        WHEN 'cripto' THEN
            IF p_dxid IS NULL OR p_red IS NULL OR p_billetera IS NULL THEN
                RAISE EXCEPTION 'Criptomoneda requiere DXID, red y billetera de origen.';
            END IF;
            INSERT INTO Criptomoneda (numero_de_control, fecha_operacion, DXID, red, billetera, tasa)
            VALUES (p_numero_de_control, p_fecha_operacion, p_dxid, p_red, p_billetera, COALESCE(p_tasa, 1.0));

        WHEN 'tai' THEN
            IF p_uid IS NULL OR p_pos IS NULL THEN
                RAISE EXCEPTION 'Pago TAI requiere el UID del chip y el terminal POS.';
            END IF;

            -- REGLA (pag. 5): "descuenta el monto directamente del saldo virtual
            -- del usuario, mostrando en pantalla el saldo remanente".
            -- Si no hay saldo suficiente, chk_saldo_positivo de Billetera_digital
            -- aborta la transaccion completa.
            UPDATE Billetera_digital
            SET saldo = saldo - p_monto
            WHERE uid = p_uid
            RETURNING saldo INTO v_remanente;

            IF NOT FOUND THEN
                RAISE EXCEPTION 'No existe la billetera digital con UID %.', p_uid;
            END IF;

            INSERT INTO TAI (numero_de_control, fecha_operacion, uid, pos, remanente)
            VALUES (p_numero_de_control, p_fecha_operacion, p_uid, p_pos, v_remanente);

            RAISE NOTICE 'Saldo remanente de la billetera %: %.', p_uid, v_remanente;

        ELSE
            RAISE EXCEPTION 'Tipo de pago no valido: "%". Use: zelle, tarjeta, pago_movil, efectivo, cripto o tai.', p_tipo;
    END CASE;

    RAISE NOTICE 'Pago % de % registrado contra la factura %.', v_tipo, p_monto, p_numero_de_control;
END;
$$;


