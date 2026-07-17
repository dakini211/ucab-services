--------------------------------------------------------------------------------
-- DATOS DE PRUEBA: ENTIDADES FALTANTES
-- Services UCAB - PostgreSQL
--
-- POR QUE ESTE ARCHIVO EXISTE:
-- El enunciado es tajante: "Cada entidad debe contener datos registrados. Sin
-- datos cargados no se efectuará la revisión del proyecto." No es que baje
-- puntos: es que no revisan. Estas tablas estaban vacías.
--
-- ORDEN: ejecutar AL FINAL, después de:
--   DROP.sql -> CREATE.sql -> INSERT.sql -> PROCEDURES_FINANCIEROS.sql
--   -> PL_FINANCIERO.sql -> INSERT_FINANCIERO.sql -> ESTE ARCHIVO
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
-- 1. TASA_CAMBIO
-- El enunciado (pág. 5) habla de "actualización global de las tasas de
-- conversión para criptomonedas y divisas".
--------------------------------------------------------------------------------
INSERT INTO Tasa_Cambio (moneda_origen, moneda_destino, fecha_vigencia, valor_tasa) VALUES
('USD', 'VES', '2026-07-01 08:00:00', 36.50000000),
('USD', 'VES', '2026-07-15 08:00:00', 38.25000000),   -- tasa más reciente
('EUR', 'VES', '2026-07-15 08:00:00', 41.80000000),
('USDT','USD', '2026-07-15 08:00:00',  0.99850000),
('BTC', 'USD', '2026-07-15 08:00:00', 64200.00000000);


--------------------------------------------------------------------------------
-- 2. BILLETERA_DIGITAL
-- Relación 1:1 con Miembro (el UNIQUE sobre id_miembro lo garantiza).
-- El uid es el identificador físico del chip NFC del carnet.
--------------------------------------------------------------------------------
INSERT INTO Billetera_digital (uid, id_miembro, saldo) VALUES
('NFC-04A3B1C2D4E5F6', 1, 120.00),   -- Carlos: con saldo, paga por TAI abajo
('NFC-04B7C8D9E0F1A2', 2,  45.50),   -- María
('NFC-04C1D2E3F4A5B6', 6, 300.00);   -- Elena


--------------------------------------------------------------------------------
-- 3. ADMID_GENERAL
-- Subclase de Administrativo. Es la que determina el rol 'Admin' en
-- auth.service.ts, así que SIN datos aquí nadie puede entrar como admin.
--
-- OJO: el id_miembro debe ser un Administrativo ya existente. Verifica antes:
--   SELECT id_miembro FROM Administrativo;
-- Si el 7 no existe en tu Administrativo, cambia el número.
--------------------------------------------------------------------------------
INSERT INTO Admid_General (id_miembro)
SELECT id_miembro FROM Administrativo LIMIT 1
ON CONFLICT DO NOTHING;


--------------------------------------------------------------------------------
-- 4. ACOMPANANTE
-- Entidad débil de Solicitud_servicio. Se cuelga de la solicitud de Elena
-- (Soporte Técnico), que es la que sigue abierta.
--
-- OJO: si tu Acompanante.ci es VARCHAR en lugar de INT, entrecomilla los
-- valores. Ese es el conflicto entre create.sql y CREATE.sql que hay que
-- resolver borrando el archivo viejo.
--------------------------------------------------------------------------------
INSERT INTO Acompanante (id_miembro, id_servicio, fecha_de_creacion, ci, nombre, activo) VALUES
(6, 3, '2026-07-01 08:00:00', 19876543, 'Pedro Antonio Rangel Díaz', 'activo'),
(6, 3, '2026-07-01 08:00:00', 21345678, 'Ana Lucía Moreno Silva',    'activo');


--------------------------------------------------------------------------------
-- 5. PAGOS QUE FALTABAN: EFECTIVO, CRIPTOMONEDA, TAI
--
-- Las 6 subclases de Metodo_Pago deben tener datos. INSERT_FINANCIERO.sql ya
-- cargó Zelle, Pago_Movil y Tarjeta; faltaban estas tres.
--
-- Se usa sp_registrar_pago en lugar de INSERT directo para que el trigger
-- trg_actualizar_saldo_factura haga su trabajo y quede demostrado.
--
-- PROBLEMA: las facturas existentes ya están pagada/parcial. Hace falta una
-- factura nueva con saldo. Se factura el folio de Elena.
--------------------------------------------------------------------------------

-- 5.1 Facturar el folio de Elena para tener contra qué pagar
CALL sp_generar_factura(6, 3, '2026-07-01 08:00:00', 'FOL-202607-00003', 'FAC-2026-000003');
-- -> total 156.60, estatus 'pendiente'

SELECT SETVAL('seq_numero_control', 3);

-- 5.2 EFECTIVO: 50.00 aplicados a la factura, recibidos en bolívares a tasa 38.25
CALL sp_registrar_pago(
    p_numero_de_control => 'FAC-2026-000003',
    p_monto             => 50.00,
    p_tipo              => 'efectivo',
    p_fecha_operacion   => '2026-07-10 09:00:00',
    p_tasa              => 38.25
);
-- -> saldo 106.60, estatus 'parcial'

-- 5.3 CRIPTOMONEDA: 40.00 en USDT por red TRC20
CALL sp_registrar_pago(
    p_numero_de_control => 'FAC-2026-000003',
    p_monto             => 40.00,
    p_tipo              => 'cripto',
    p_fecha_operacion   => '2026-07-12 14:30:00',
    p_dxid              => '0x9f2a4c7e1b8d3f5a6c0e2d4b8a1f3c5e7d9b0a2c4e6f8a1b3d5c7e9f0a2b4d6',
    p_red               => 'TRC20',
    p_billetera         => 'TXn8Kp2mQr5vWx9YzA3bC6dE1fG4hJ7kL0',
    p_tasa              => 0.99850000
);
-- -> saldo 66.60, estatus 'parcial'

-- 5.4 TAI: 66.60 desde la billetera digital de Elena.
--     El procedimiento descuenta de Billetera_digital y guarda el remanente
--     (regla pág. 5: "descuenta el monto del saldo virtual, mostrando el
--     saldo remanente"). Elena tenía 300.00 -> queda 233.40.
CALL sp_registrar_pago(
    p_numero_de_control => 'FAC-2026-000003',
    p_monto             => 66.60,
    p_tipo              => 'tai',
    p_fecha_operacion   => '2026-07-14 11:15:00',
    p_uid               => 'NFC-04C1D2E3F4A5B6',
    p_pos               => 'POS-CAJA-MONTALBAN-01'
);
-- -> saldo 0.00, estatus 'pagada'. Billetera de Elena: 233.40


--------------------------------------------------------------------------------
-- 6. OBTIENE
-- Relación Metodo_Pago <-> Tasa_Cambio: registra qué tasa se aplicó a cada
-- pago en divisa. El UNIQUE (numero_de_control, fecha_operacion) impide que un
-- mismo pago se asocie a dos tasas distintas.
--------------------------------------------------------------------------------
INSERT INTO Obtiene (numero_de_control, fecha_operacion, moneda_origen, moneda_destino, fecha_vigencia) VALUES
('FAC-2026-000003', '2026-07-10 09:00:00', 'USD',  'VES', '2026-07-15 08:00:00'),  -- efectivo
('FAC-2026-000003', '2026-07-12 14:30:00', 'USDT', 'USD', '2026-07-15 08:00:00');  -- cripto


--------------------------------------------------------------------------------
-- 7. VERIFICACION: ¿QUEDA ALGUNA TABLA VACIA?
--
-- Esta consulta es la que hay que correr ANTES de entregar. Lista todas las
-- tablas con 0 filas. Si devuelve algo, esa tabla bloquea la revisión.
--------------------------------------------------------------------------------

-- SELECT relname AS tabla, n_live_tup AS filas
-- FROM pg_stat_user_tables
-- WHERE schemaname = 'public'
-- ORDER BY n_live_tup ASC, relname;
--
-- NOTA: n_live_tup es una ESTIMACION del planificador y puede ir desfasada.
-- Corre esto primero para refrescarla:
--   ANALYZE;
--
-- Para un conteo exacto (más lento pero fiable):
--
-- SELECT table_name,
--        (xpath('/row/c/text()',
--               query_to_xml(format('SELECT COUNT(*) AS c FROM %I.%I', table_schema, table_name),
--                            FALSE, TRUE, '')))[1]::TEXT::INT AS filas
-- FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
-- ORDER BY filas ASC, table_name;


--------------------------------------------------------------------------------
-- 8. ESTADO FINAL ESPERADO DEL MODULO FINANCIERO
--------------------------------------------------------------------------------
-- SELECT numero_de_control, estatus, saldo FROM Factura ORDER BY numero_de_control;
--   FAC-2026-000001 | pagada  |   0.00   (Carlos: Zelle + Pago Móvil)
--   FAC-2026-000002 | parcial |  53.68   (María: Tarjeta)
--   FAC-2026-000003 | pagada  |   0.00   (Elena: Efectivo + Cripto + TAI)
--
-- SELECT uid, saldo FROM Billetera_digital ORDER BY uid;
--   NFC-04A3B1C2D4E5F6 | 120.00
--   NFC-04B7C8D9E0F1A2 |  45.50
--   NFC-04C1D2E3F4A5B6 | 233.40   <- descontado por el pago TAI
