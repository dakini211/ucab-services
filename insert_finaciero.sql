--------------------------------------------------------------------------------
-- MODULO FINANCIERO: DATOS DE PRUEBA
-- Services UCAB - PostgreSQL
--
-- IMPORTANTE - ORDEN DE EJECUCION:
--   1. create.sql
--   2. insert.sql             (miembros, servicios, tarifas base)
--   3. funciones_triggers.sql
--   4. pl_financiero.sql
--   5. insert_financiero.sql  <-- ESTE ARCHIVO
--
-- Si se ejecuta ANTES de los triggers, los precios NO se congelaran solos
-- y los items con precio NULL fallaran por la restriccion NOT NULL.
--
-- ESCENARIOS CUBIERTOS:
--   Carlos (1)  -> folio facturado y PAGADO       (parcial -> pagada, 2 abonos)
--   Maria  (2)  -> folio facturado y PARCIAL      (1 abono, queda saldo)
--   Elena  (6)  -> folio ABIERTO sin facturar     (para correr el cierre masivo en vivo)
--   Luis   (3)  -> solicitud RECHAZADA sin folio  (caso borde)
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
-- 1. HISTORICO_TARIFA: tarifas nuevas para demostrar el CONGELADO DE PRECIOS
--
-- Este es el detalle que suele preguntar el profesor: el item debe conservar la
-- tarifa vigente EL DIA DEL CARGO, no la tarifa actual.
--
--   Servicio 1 (Bootcamp):    50.00 desde 2025-01-01  ->  65.00 desde 2026-03-01
--   Servicio 2 (Co-Working):  15.00 desde 2025-01-01  ->  18.00 desde 2026-01-01
--                                                      ->  22.00 desde 2026-06-01
--------------------------------------------------------------------------------
INSERT INTO Historico_Tarifa (id_servicio, fecha_inicio, tarifa_precio) VALUES
(1, '2026-03-01', 65.00),   -- Bootcamp subio DESPUES del folio de Carlos
(2, '2026-01-01', 18.00),   -- Co-Working: esta es la que congela Maria
(2, '2026-06-01', 22.00);   -- Co-Working: subio DESPUES del folio de Maria


--------------------------------------------------------------------------------
-- 2. SOLICITUD_SERVICIO
--------------------------------------------------------------------------------
INSERT INTO Solicitud_servicio (id_miembro, id_servicio, fecha_de_creacion, estado, resolucion) VALUES
-- Carlos Ramirez -> Bootcamp de Emprendimiento (ciclo cerrado y cobrado)
(1, 1, '2026-02-10 09:00:00', 'finalizada', 'Inscripcion procesada y cupo confirmado en la cohorte de febrero.'),

-- Maria Gonzalez -> Alquiler de Espacio Co-Working (facturada, en cobranza)
(2, 2, '2026-03-05 10:30:00', 'finalizada', 'Reserva de puesto de co-working confirmada por 5 jornadas.'),

-- Elena Castillo (profesora) -> Soporte Tecnico para Eventos (folio aun abierto)
(6, 3, '2026-07-01 08:00:00', 'aprobada',   'Soporte tecnico aprobado para las jornadas de investigacion.'),

-- Luis Hernandez -> Stand Comercial: RECHAZADA (caso borde: nunca genera folio)
(3, 5, '2026-04-20 14:15:00', 'rechazada',  'Solicitud rechazada: la cuenta del miembro se encuentra suspendida.');


--------------------------------------------------------------------------------
-- 3. FOLIO (estados de cuenta)
-- Se insertan con nro_de_folio explicito para que el resto del script sea
-- deterministico. En la aplicacion se usara sp_abrir_folio(), que lo autogenera.
--------------------------------------------------------------------------------
INSERT INTO Folio (id_miembro, id_servicio, fecha_de_creacion, nro_de_folio, estado, fecha_inicio_mes, fecha_fin_mes) VALUES
(1, 1, '2026-02-10 09:00:00', 'FOL-202602-00001', 'abierto', '2026-02-10', NULL),
(2, 2, '2026-03-05 10:30:00', 'FOL-202603-00002', 'abierto', '2026-03-05', NULL),
(6, 3, '2026-07-01 08:00:00', 'FOL-202607-00003', 'abierto', '2026-07-01', NULL);

-- Sincronizar la secuencia con los folios cargados a mano
SELECT SETVAL('seq_nro_folio', 3);


--------------------------------------------------------------------------------
-- 4. ITEMS_CONSUMO
--
-- Se cargan con sp_agregar_item_consumo() a proposito: asi el trigger
-- trg_congelar_precio_item hace su trabajo y queda demostrado en los NOTICE.
--
--   precio NULL  -> el trigger lo congela desde Historico_Tarifa
--   precio dado  -> concepto suplementario (materiales, certificados): no tiene
--                   tarifa propia porque Historico_Tarifa es por SERVICIO
--------------------------------------------------------------------------------

-- ===== FOLIO DE CARLOS (Bootcamp) =====
-- Cargo principal: precio NULL -> congela 50.00 (tarifa de 2025-01-01),
-- NO los 65.00 vigentes hoy. Ese es el punto de la regla de la pag. 4.
CALL sp_agregar_item_consumo(
    1, 1, '2026-02-10 09:00:00', 'FOL-202602-00001',
    'Inscripcion Bootcamp de Emprendimiento', 1, 16.00, NULL
);

-- Suplementos con precio propio
CALL sp_agregar_item_consumo(
    1, 1, '2026-02-10 09:00:00', 'FOL-202602-00001',
    'Material de apoyo impreso', 2, 16.00, 12.50
);

-- Concepto exento de impuesto (impuesto_ley = 0)
CALL sp_agregar_item_consumo(
    1, 1, '2026-02-10 09:00:00', 'FOL-202602-00001',
    'Certificado digital de participacion', 1, 0.00, 5.00
);
-- Total esperado: 1x50.00x1.16 + 2x12.50x1.16 + 1x5.00x1.00 = 58.00 + 29.00 + 5.00 = 92.00


-- ===== FOLIO DE MARIA (Co-Working) =====
-- Cargo principal: congela 18.00 (tarifa de 2026-01-01), no los 22.00 de hoy.
CALL sp_agregar_item_consumo(
    2, 2, '2026-03-05 10:30:00', 'FOL-202603-00002',
    'Alquiler de puesto Co-Working (jornada)', 5, 16.00, NULL
);

CALL sp_agregar_item_consumo(
    2, 2, '2026-03-05 10:30:00', 'FOL-202603-00002',
    'Casillero mensual', 1, 16.00, 8.00
);
-- Total esperado: 5x18.00x1.16 + 1x8.00x1.16 = 104.40 + 9.28 = 113.68


-- ===== FOLIO DE ELENA (Soporte Tecnico) - QUEDA ABIERTO =====
CALL sp_agregar_item_consumo(
    6, 3, '2026-07-01 08:00:00', 'FOL-202607-00003',
    'Soporte tecnico en sitio (hora)', 3, 16.00, NULL
);
-- Total esperado: 3x45.00x1.16 = 156.60  (sin facturar todavia)


--------------------------------------------------------------------------------
-- 5. FACTURAS
-- Se generan con sp_generar_factura(), pasando el numero_de_control explicito
-- para que los pagos de abajo puedan referenciarlo de forma deterministica.
-- El procedimiento calcula el total, fija saldo = total y cierra el folio.
--------------------------------------------------------------------------------

CALL sp_generar_factura(1, 1, '2026-02-10 09:00:00', 'FOL-202602-00001', 'FAC-2026-000001');
-- -> saldo 92.00, estatus 'pendiente', folio marcado 'facturado'

CALL sp_generar_factura(2, 2, '2026-03-05 10:30:00', 'FOL-202603-00002', 'FAC-2026-000002');
-- -> saldo 113.68, estatus 'pendiente'

-- El folio de Elena NO se factura aqui: queda vivo para demostrar
-- sp_cierre_masivo_folios() durante la correccion.

SELECT SETVAL('seq_numero_control', 2);


--------------------------------------------------------------------------------
-- 6. METODOS DE PAGO (abonos)
-- Cada CALL dispara trg_actualizar_saldo_factura, que recalcula saldo y estatus.
--------------------------------------------------------------------------------

-- ===== FACTURA DE CARLOS: abono parcial y luego liquidacion total =====

-- Abono 1: Zelle por 50.00 -> saldo 42.00, estatus pasa a 'parcial'
CALL sp_registrar_pago(
    p_numero_de_control => 'FAC-2026-000001',
    p_monto             => 50.00,
    p_tipo              => 'zelle',
    p_fecha_operacion   => '2026-03-01 11:20:00',
    p_correo            => 'carlos.ramirez.pagos@gmail.com',
    p_nombre            => 'Carlos Andres Ramirez Torres',
    p_confirmacion      => 'ZEL-8842197365'
);

-- Abono 2: Pago Movil por 42.00 -> saldo 0.00, estatus pasa a 'pagada'
CALL sp_registrar_pago(
    p_numero_de_control => 'FAC-2026-000001',
    p_monto             => 42.00,
    p_tipo              => 'pago_movil',
    p_fecha_operacion   => '2026-03-04 16:45:00',
    p_telefono_emisor   => '0414-1234567',
    p_banco             => 'Banco Mercantil',
    p_referencia        => 'PM-000998877'
);


-- ===== FACTURA DE MARIA: un solo abono, queda saldo pendiente =====

-- Abono unico: Tarjeta por 60.00 -> saldo 53.68, estatus 'parcial'
CALL sp_registrar_pago(
    p_numero_de_control => 'FAC-2026-000002',
    p_monto             => 60.00,
    p_tipo              => 'tarjeta',
    p_fecha_operacion   => '2026-04-02 09:15:00',
    p_nro_tarjeta       => '4539112233445566',
    p_vencimiento       => '08/28',
    p_compania          => 'Visa',
    p_red               => 'Nacional'
);

-- Abono 2: Pago con Billetera TAI por 53.68 -> saldo 0.00, estatus 'pagada'
-- El SP descuenta de Billetera_digital, crea registro en Metodo_Pago y en TAI (registrando el remanente)
CALL sp_registrar_pago(
    p_numero_de_control => 'FAC-2026-000002',
    p_monto             => 53.68,
    p_tipo              => 'tai',
    p_fecha_operacion   => '2026-04-03 12:00:00',
    p_uid               => 'TAI-28002002-NFC',
    p_pos               => 'POS-CAJA-01'
);


--------------------------------------------------------------------------------
-- 7. VERIFICACION (opcional - para la correccion)
--------------------------------------------------------------------------------

-- 7.1 Estado general del modulo financiero
-- SELECT f.numero_de_control, f.estatus, f.saldo,
--        fn_total_folio(f.id_miembro, f.id_servicio, f.fecha_de_creacion, f.nro_de_folio) AS total,
--        fn_total_pagado(f.numero_de_control) AS pagado,
--        fn_saldo_factura(f.numero_de_control) AS saldo_recalculado
-- FROM Factura f
-- ORDER BY f.numero_de_control;
--
-- Esperado:
--   FAC-2026-000001 | pagada  |   0.00 |  92.00 |  92.00 |   0.00
--   FAC-2026-000002 | parcial |  53.68 | 113.68 |  60.00 |  53.68


-- 7.2 DEMOSTRACION DEL CONGELADO DE PRECIOS
-- El item de Carlos conserva 50.00 aunque la tarifa de hoy sea 65.00.
-- SELECT ic.concepto, ic.precio_unitario AS precio_congelado,
--        fn_tarifa_vigente(ic.id_servicio, CURRENT_TIMESTAMP) AS tarifa_hoy
-- FROM Items_Consumo ic
-- WHERE ic.nro_de_folio = 'FOL-202602-00001';


-- 7.3 DEMOSTRACION DEL CIERRE MASIVO (folio de Elena, julio 2026)
-- CALL sp_cierre_masivo_folios('2026-07-15');
-- SELECT * FROM Factura WHERE nro_de_folio = 'FOL-202607-00003';


-- 7.4 DEMOSTRACION DEL BLOQUEO DE FOLIO FACTURADO (debe fallar)
-- CALL sp_agregar_item_consumo(1, 1, '2026-02-10 09:00:00', 'FOL-202602-00001', 'Cargo tardio', 1, 16.00, 10.00);
-- -> ERROR: El folio FOL-202602-00001 ya fue facturado...


 --------------------------------------------------------------------------------
-- INSERT DEL ADMINISTRADOR GENERAL (ID auto-generado)
--------------------------------------------------------------------------------

-- 1. Primero se registra como Miembro (Superclase base)
INSERT INTO Miembro (cedula_identidad, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, fecha_nacimiento, telefono, correo_institucional, direccion_habitacion, total_sesiones, estado_cuenta)
VALUES 
(12009009, 'Carmen', 'Alicia', 'Ortiz', 'Mendoza', '1970-05-14', '0414-5556677', 'c.ortiz@ucab.edu.ve', 'Urb. Macaracuay, Calle 2, Caracas', 0, 'activa');

-- 2. Se registra como Personal UCAB (Subclase nivel 1)
INSERT INTO Personal_ucab (id_miembro)
VALUES 
((SELECT id_miembro FROM Miembro WHERE cedula_identidad = 12009009));

-- 3. Se registra como Administrativo (Subclase nivel 2)
INSERT INTO Administrativo (id_miembro, carga_horaria_semanal, unidad_presupuestaria)
VALUES 
((SELECT id_miembro FROM Miembro WHERE cedula_identidad = 12009009), 40, 'Dirección General de Administración');

-- 4. Finalmente, se registra como Admid_General (Subclase nivel 3)
INSERT INTO Admid_General (id_miembro)
VALUES 
((SELECT id_miembro FROM Miembro WHERE cedula_identidad = 12009009));



--------------------------------------------------------------------------------
-- HISTORIALES DEL ADMINISTRADOR GENERAL
--------------------------------------------------------------------------------

-- 1. Historial_Miembro (Registra cuándo ingresó a la universidad/sistema)
INSERT INTO Historial_Miembro (id_miembro, fecha_inicio, fecha_fin)
VALUES 
((SELECT id_miembro FROM Miembro WHERE cedula_identidad = 12009009), '2025-04-01 08:00:00', NULL);

-- 2. Historial_Contrasena (Se le asigna su primera contraseña encriptada)
INSERT INTO Historial_Contrasena (id_miembro, fecha_inicio, contrasena, fecha_fin)
VALUES 
((SELECT id_miembro FROM Miembro WHERE cedula_identidad = 12009009), '2025-04-01 08:00:00', '123456', NULL);

-- 3. Historial_Sesiones (Registramos su primera sesión en el sistema)
INSERT INTO Historial_Sesiones (id_miembro, lugar_conexion, direccion_ip, fecha_inicio, hora_inicio, hora_fin)
VALUES 
((SELECT id_miembro FROM Miembro WHERE cedula_identidad = 12009009), 'Campus Caracas - Dirección General', '192.168.3.100', '2025-04-02', '08:30:00', '16:00:00');
