INSERT INTO Publica (id_servicio, nombre_entidad) VALUES
(1, 'Centro de Innovación y Emprendimiento'),  -- Bootcamp de Emprendimiento
(2, 'Centro de Innovación y Emprendimiento'),  -- Alquiler Co-Working
(3, 'Dirección de Tecnología'),                -- Soporte Técnico para Eventos
(4, 'Centro de Innovación y Emprendimiento'),  -- Asesoría Legal Básica
(5, 'Empresas Polar');                         -- Stand Comercial (aliado externo)

INSERT INTO Recurso_Tecnologicos (nombre_edificacion, direccion_interna, nro, descripcion) VALUES
-- Laboratorio de Computación (Cincuentenario 102)
('Edificio Cincuentenario', 'Módulo 1 - Entrada Principal', 102, 'Videobeam Epson PowerLite'),
('Edificio Cincuentenario', 'Módulo 1 - Entrada Principal', 102, 'Switch de red Cisco 24 puertos'),
('Edificio Cincuentenario', 'Módulo 1 - Entrada Principal', 102, 'Pizarra digital interactiva'),

-- Sala de Reuniones (Cincuentenario 103)
('Edificio Cincuentenario', 'Módulo 1 - Entrada Principal', 103, 'Sistema de videoconferencia Logitech'),

-- Auditorio Principal (Edificio de Aulas 202)
('Edificio de Aulas', 'Módulo 2 - Zona Central', 202, 'Consola de sonido Yamaha MG16'),
('Edificio de Aulas', 'Módulo 2 - Zona Central', 202, 'Proyector láser 5000 lúmenes'),
('Edificio de Aulas', 'Módulo 2 - Zona Central', 202, 'Micrófonos inalámbricos Shure (x4)'),

-- Aula tradicional (Edificio de Aulas 201)
('Edificio de Aulas', 'Módulo 2 - Zona Central', 201, 'Videobeam BenQ MW550'),

-- Laboratorio de Física (Guayana)
('Edificio Principal', 'Campus Puerto Ordaz - Bloque A', 102, 'Osciloscopio digital Tektronix'),
('Edificio Principal', 'Campus Puerto Ordaz - Bloque A', 102, 'Fuente de poder regulable');



--------------------------------------------------------------------------------
INSERT INTO Historial_Reservas (id_servicio, nro, nombre_edificacion, direccion_interna, fecha_reserva, hora_inicio, hora_fin) VALUES
-- Bootcamp de Carlos: aula del Edificio de Aulas
(1, 201, 'Edificio de Aulas', 'Módulo 2 - Zona Central', '2026-02-10', '14:00:00', '18:00:00'),
(1, 201, 'Edificio de Aulas', 'Módulo 2 - Zona Central', '2026-02-11', '14:00:00', '18:00:00'),

-- Co-Working de María: sala de reuniones
(2, 103, 'Edificio Cincuentenario', 'Módulo 1 - Entrada Principal', '2026-03-05', '08:00:00', '17:00:00'),

-- Soporte técnico de Elena: auditorio
(3, 202, 'Edificio de Aulas', 'Módulo 2 - Zona Central', '2026-07-01', '07:00:00', '13:00:00'),

-- Asesoría legal de Sofía (folio nuevo, más abajo)
(4, 103, 'Edificio Cincuentenario', 'Módulo 1 - Entrada Principal', '2026-05-12', '10:00:00', '12:00:00'),

-- Stand comercial en Guayana
(5, 1, 'Biblioteca Guayana', 'Campus Puerto Ordaz - Bloque B', '2026-06-20', '09:00:00', '16:00:00');



INSERT INTO Familiar (cedula, id_personal_ucab, nombre_familiar, parentesco, edad_familiar, fecha_de_inicio, fecha_de_fin) VALUES

(15111222, 6, 'Jorge Luis Castillo Ramos',   'Cónyuge', 52, '2010-03-01', NULL),
(31222333, 6, 'Daniela Castillo Núñez',      'Hija',    21, '2010-03-01', NULL),
(33444555, 6, 'Mateo Castillo Núñez',        'Hijo',    12, '2014-08-15', NULL),

(16555666, 7, 'Patricia Fuentes de Vargas',  'Cónyuge', 44, '2015-06-01', NULL),
(34666777, 7, 'Sebastián Vargas Fuentes',    'Hijo',     8, '2018-02-10', NULL),

(17888999, (SELECT id_miembro FROM Miembro WHERE cedula_identidad = 12009009),
           'Gabriel Ortiz Mendoza', 'Hijo', 25, '2025-04-01', NULL),


(32777888, 6, 'Lucía Castillo Núñez', 'Hija', 24, '2010-03-01', '2024-06-30');


INSERT INTO cargo_mayor (cedula, estudios) VALUES
(15111222, 'Universitario - Ingeniería Civil'),
(31222333, 'Universitario - Derecho (en curso)'),
(16555666, 'Técnico Superior en Administración'),
(17888999, 'Universitario - Medicina'),
(32777888, 'Universitario - Psicología');


INSERT INTO cargo_menor (cedula, vacunacion, educacion_inicial) VALUES
(33444555, 'Esquema completo: BCG, Hepatitis B, Pentavalente, Polio, Trivalente viral, Refuerzo COVID-19 (2024).',
           'Colegio San Ignacio - 1er año de bachillerato'),
(34666777, 'Esquema completo: BCG, Hepatitis B, Pentavalente, Polio, Trivalente viral. Pendiente refuerzo DPT.',
           'Colegio Los Arcos - 3er grado');



INSERT INTO Acompanante (id_miembro, id_servicio, fecha_de_creacion, ci, nombre, activo) VALUES
(6, 3, '2026-07-01 08:00:00', 19876543, 'Pedro Antonio Rangel Díaz', 'activo'),
(6, 3, '2026-07-01 08:00:00', 21345678, 'Ana Lucía Moreno Silva',    'activo'),
(1, 1, '2026-02-10 09:00:00', 25999888, 'Jesús Eduardo Parra León',  'activo');



INSERT INTO Tasa_Cambio (moneda_origen, moneda_destino, fecha_vigencia, valor_tasa) VALUES
('USD',  'VES', '2026-05-01 08:00:00', 34.80000000),
('USD',  'VES', '2026-07-01 08:00:00', 36.50000000),
('USD',  'VES', '2026-07-15 08:00:00', 38.25000000),   -- vigente hoy
('EUR',  'VES', '2026-07-15 08:00:00', 41.80000000),
('USDT', 'USD', '2026-05-01 08:00:00',  1.00100000),
('USDT', 'USD', '2026-07-15 08:00:00',  0.99850000),
('BTC',  'USD', '2026-07-15 08:00:00', 64200.00000000);



INSERT INTO Solicitud_servicio (id_miembro, id_servicio, fecha_de_creacion, estado, resolucion) VALUES
(4, 4, '2026-05-12 10:00:00', 'finalizada', 'Asesoría legal para constitución de firma personal.');

INSERT INTO Folio (id_miembro, id_servicio, fecha_de_creacion, nro_de_folio, estado, fecha_inicio_mes, fecha_fin_mes) VALUES
(4, 4, '2026-05-12 10:00:00', 'FOL-202605-00004', 'abierto', '2026-05-12', NULL);

SELECT SETVAL('seq_nro_folio', 4);


CALL sp_agregar_item_consumo(
    4, 4, '2026-05-12 10:00:00', 'FOL-202605-00004',
    'Consulta legal inicial (hora)', 2, 16.00, NULL
);
CALL sp_agregar_item_consumo(
    4, 4, '2026-05-12 10:00:00', 'FOL-202605-00004',
    'Redaccion de documento constitutivo', 1, 16.00, 25.00
);


CALL sp_generar_factura(4, 4, '2026-05-12 10:00:00', 'FOL-202605-00004', 'FAC-2026-000003');


SELECT SETVAL('seq_numero_control', 3);


CALL sp_registrar_pago(
    p_numero_de_control => 'FAC-2026-000003'::VARCHAR,
    p_monto             => 50.00::NUMERIC,
    p_tipo              => 'efectivo'::VARCHAR,
    p_fecha_operacion   => '2026-05-20 09:30:00'::TIMESTAMP,
    p_tasa              => 34.80::NUMERIC
);

CALL sp_registrar_pago(
    p_numero_de_control => 'FAC-2026-000003'::VARCHAR,
    p_monto             => 20.00::NUMERIC,
    p_tipo              => 'cripto'::VARCHAR,
    p_fecha_operacion   => '2026-05-22 15:45:00'::TIMESTAMP,
    p_dxid              => '0x9f2a4c7e1b8d3f5a6c0e2d4b8a1f3c5e7d9b0a2c4e6f8a1b3d5c7e9f0a2b4d6'::VARCHAR,
    p_red               => 'TRC20'::VARCHAR,
    p_billetera         => 'TXn8Kp2mQr5vWx9YzA3bC6dE1fG4hJ7kL0'::VARCHAR,
    p_tasa              => 1.00100000::NUMERIC
);

INSERT INTO Obtiene (numero_de_control, fecha_operacion, moneda_origen, moneda_destino, fecha_vigencia) VALUES
('FAC-2026-000003', '2026-05-20 09:30:00', 'USD',  'VES', '2026-05-01 08:00:00'),  
('FAC-2026-000003', '2026-05-22 15:45:00', 'USDT', 'USD', '2026-05-01 08:00:00');  

