--------------------------------------------------------------------------------
-- MIEMBRO (base) - cubre todos los subtipos
--------------------------------------------------------------------------------
INSERT INTO Miembro (cedula_identidad, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
    fecha_nacimiento, telefono, correo_institucional, direccion_habitacion, total_sesiones, estado_cuenta)
VALUES
-- Estudiantes
(28001001, 'Carlos',    'Andrés',   'Ramírez',   'Torres',  '2002-03-15', '0414-1234567', 'c.ramirez@ucab.edu.ve',   'Urb. La Castellana, Calle 5, Casa 12, Caracas',             0, 'activa'),
(28002002, 'María',     'Fernanda', 'González',  'Pérez',   '2001-07-22', '0424-2345678', 'm.gonzalez@ucab.edu.ve',  'Av. Las Mercedes, Edif. Sol, Piso 3, Caracas',              0, 'activa'),
(29003003, 'Luis',      NULL,       'Hernández', 'Mora',    '2003-11-10', '0412-3456789', 'l.hernandez@ucab.edu.ve', 'Urb. Altamira, Calle Miranda, Qta. Rosa, Caracas',          0, 'suspendida'),
-- Preparador (es estudiante también)
(27004004, 'Sofía',     'Isabel',   'Martínez',  'Blanco',  '2000-05-30', '0416-4567890', 's.martinez@ucab.edu.ve',  'Urb. Los Palos Grandes, Av. 6, Piso 2, Caracas',           0, 'activa'),
-- Egresado
(22005005, 'Andrés',    'Felipe',   'López',     'Rivas',   '1995-09-18', '0426-5678901', 'a.lopez@ucab.edu.ve',     'Urb. Santa Eduvigis, Calle 3, Casa 7, Caracas',            0, 'activa'),
-- Personal UCAB - Profesor
(18006006, 'Elena',     'María',    'Castillo',  'Núñez',   '1975-04-12', '0412-6789012', 'e.castillo@ucab.edu.ve',  'Urb. La Florida, Torre B, Piso 5, Caracas',                0, 'activa'),
-- Personal UCAB - Administrativo
(20007007, 'Roberto',   NULL,       'Vargas',    'Fuentes', '1980-12-01', '0414-7890123', 'r.vargas@ucab.edu.ve',    'Urb. Bello Monte, Calle Los Mangos, Casa 22, Caracas',     0, 'activa'),
-- Miembro bloqueado (caso borde)
(30008008, 'Valentina', 'Lucía',    'Díaz',      NULL,      '2004-02-28', '0424-8901234', 'v.diaz@ucab.edu.ve',      'Urb. Chuao, Calle Principal, Piso 1, Caracas',             0, 'bloqueada');

--------------------------------------------------------------------------------
-- HISTORIAL_MIEMBRO
--------------------------------------------------------------------------------
INSERT INTO Historial_Miembro (id_miembro, fecha_inicio, fecha_fin)
VALUES
(1, '2022-09-01 08:00:00', NULL),
(2, '2022-09-01 08:00:00', NULL),
(3, '2022-09-01 08:00:00', NULL),

(4, '2021-09-01 08:00:00', NULL),
(5, '2018-09-01 08:00:00', NULL),
(6, '2010-03-01 08:00:00', NULL),
(7, '2015-06-01 08:00:00', NULL),
-- Valentina: dada de baja, historial cerrado
(8, '2023-09-01 08:00:00', '2024-01-15 17:00:00');

--------------------------------------------------------------------------------
-- HISTORIAL_CONTRASENA (bcrypt simulado - en producción el backend hashea)
--------------------------------------------------------------------------------
INSERT INTO Historial_Contrasena (id_miembro, fecha_inicio, contrasena, fecha_fin)
VALUES
-- Contraseña vigente (fecha_fin NULL = activa)
(1, '2022-09-01 08:00:00', '123456', NULL),
(2, '2022-09-01 08:00:00', '$2b$12$LJY9RfL2yMi6HlEK4q0oPfC5AnZdU8xSwO3tB2eG7hI1kQ4rM9nVz', NULL),
(3, '2022-09-01 08:00:00', '$2b$12$MKZ0SgM3zNj7ImFL5r1pQgD6BoAeV9yTxP4uC3fH8iJ2lR5sN0oWA', NULL),
(4, '2021-09-01 08:00:00', '$2b$12$NLA1ThN4AOk8JnGM6s2qRhE7CpBfW0zUyQ5vD4gI9jK3mS6tO1pXB', NULL),
(5, '2018-09-01 08:00:00', '$2b$12$OMB2UiO5BPl9KoHN7t3rSiF8DqCgX1AVzR6wE5hJ0kL4nT7uP2qYC', NULL),
(6, '2010-03-01 08:00:00', '123456', NULL),
(7, '2015-06-01 08:00:00', '123456', NULL),
-- Valentina: tuvo rotación de contraseña, ambas cerradas al dar de baja
(8, '2023-09-01 08:00:00', '$2b$12$ROE5XlR8ESo2NrKQ0w6uVlI1GtFjA4DYCu9zH8kM3nO7qW0xS5tBF', '2023-12-01 09:00:00'),
(8, '2023-12-01 09:00:00', '$2b$12$SPF6YmS9FTp3OsLR1x7vWmJ2HuGkB5EZDv0AI9lN4oP8rX1yT6uCG', '2024-01-15 17:00:00');

--------------------------------------------------------------------------------
-- HISTORIAL_SESIONES
-- Regla 4: hora_fin siempre NOT NULL, el backend la escribe al hacer logout
--------------------------------------------------------------------------------
INSERT INTO Historial_Sesiones (id_miembro, lugar_conexion, direccion_ip, fecha_inicio, hora_inicio, hora_fin)
VALUES
(1, 'Campus Caracas - Lab Informática A',   '192.168.1.101', '2025-03-10', '08:15', '10:30'),
(1, 'Residencia - Acceso Remoto',            '186.4.22.113',  '2025-03-12', '14:00', '16:45'),
(2, 'Campus Caracas - Biblioteca',           '192.168.1.205', '2025-03-10', '09:00', '11:00'),
(3, 'Campus Caracas - Lab Informática B',   '192.168.1.102', '2025-03-11', '13:30', '14:00'),
(4, 'Campus Caracas - Sala de Preparadores','192.168.2.010', '2025-03-13', '07:45', '09:00'),
(5, 'Acceso Remoto - Externo',               '200.11.45.67',  '2025-03-14', '10:15', '10:55'),
(6, 'Campus Caracas - Oficina Docente',     '192.168.2.050', '2025-03-10', '07:30', '13:00'),
(7, 'Campus Caracas - Administración',      '192.168.3.001', '2025-03-11', '08:00', '17:00');

--------------------------------------------------------------------------------
-- JERARQUÍA: ESTUDIANTE
--------------------------------------------------------------------------------
INSERT INTO Estudiante (id_miembro, promedio, uc_aprobadas, semestre_actual, escuela, facultad, tipo_beca)
VALUES
(1, 14.50, 45, 6, 'Ingeniería Informática',    'Facultad de Ingeniería',  NULL),
(2, 17.80, 60, 7, 'Ingeniería Industrial',      'Facultad de Ingeniería',  'excelencia'),
(3, 10.20, 30, 5, 'Comunicación Social',        'Facultad de Humanidades', 'ayuda económica'),
(4, 16.90, 75, 8, 'Ingeniería en Computación', 'Facultad de Ingeniería',  'excelencia');

-- PREPARADOR (Sofía es estudiante y preparadora)
INSERT INTO Preparador (id_miembro, tipo_asignatura, horas_ayudantia)
VALUES
(4, 'Algoritmos y Estructuras de Datos', 8);

--------------------------------------------------------------------------------
-- JERARQUÍA: EGRESADO
--------------------------------------------------------------------------------
INSERT INTO Egresado (id_miembro, año_graduacion, titulo_obtenido, promedio_final)
VALUES
(5, 2018, 'Ingeniero en Informática', 16.75);

--------------------------------------------------------------------------------
-- JERARQUÍA: PERSONAL UCAB
--------------------------------------------------------------------------------
INSERT INTO Personal_ucab (id_miembro)
VALUES (6), (7);

INSERT INTO Profesor (id_miembro, codigo_investigador, escalafon_docente, carga_horaria_semanal)
VALUES
(6, 'INV-2010-045', 'Asociado', 20);

INSERT INTO Administrativo (id_miembro, carga_horaria_semanal, unidad_presupuestaria)
VALUES
(7, 40, 'Dirección de Servicios Estudiantiles');


--------------------------------------------------------------------------------
-- 1. SEDES 
--------------------------------------------------------------------------------
INSERT INTO Sede (nombre_sede, tarifa_min, tarifa_max) VALUES
('Sede Montalbán', 10.00, 500.00),
('Sede Guayana', 8.00, 350.00);

--------------------------------------------------------------------------------
-- 1.1. POBLAR EDIFICACIONES
-- Nota: La llave primaria es compuesta (nombre_edificacion, direccion_interna)
--------------------------------------------------------------------------------
INSERT INTO Edificacion (nombre_edificacion, direccion_interna, nombre_sede) VALUES
-- Edificaciones Sede Montalbán
('Edificio Cincuentenario', 'Módulo 1 - Entrada Principal', 'Sede Montalbán'),
('Edificio de Aulas', 'Módulo 2 - Zona Central', 'Sede Montalbán'),
('Centro Loyola', 'Zona Deportiva - Oeste', 'Sede Montalbán'),
('Biblioteca Central', 'Zona Norte', 'Sede Montalbán'),

-- Edificaciones Sede Guayana
('Edificio Principal', 'Campus Puerto Ordaz - Bloque A', 'Sede Guayana'),
('Biblioteca Guayana', 'Campus Puerto Ordaz - Bloque B', 'Sede Guayana');

--------------------------------------------------------------------------------
-- 1.2. POBLAR ESPACIOS FÍSICOS
-- Nota: Deben coincidir exactamente con (nombre_edificacion, direccion_interna)
--------------------------------------------------------------------------------
INSERT INTO Espacio_Fisico (nro, nombre_edificacion, direccion_interna, tipo_inmobiliario, capacidad_maxima_aforo) VALUES
-- Espacios en el Edificio Cincuentenario (Montalbán)
(101, 'Edificio Cincuentenario', 'Módulo 1 - Entrada Principal', 'Aula tradicional', 45),
(102, 'Edificio Cincuentenario', 'Módulo 1 - Entrada Principal', 'Laboratorio de Computación', 25),
(103, 'Edificio Cincuentenario', 'Módulo 1 - Entrada Principal', 'Sala de Reuniones', 15),

-- Espacios en el Edificio de Aulas (Montalbán)
(201, 'Edificio de Aulas', 'Módulo 2 - Zona Central', 'Aula tradicional', 60),
(202, 'Edificio de Aulas', 'Módulo 2 - Zona Central', 'Auditorio Principal', 250),
(203, 'Edificio de Aulas', 'Módulo 2 - Zona Central', 'Sala de Usos Múltiples', 80),

-- Espacios en Biblioteca Central (Montalbán)
(1, 'Biblioteca Central', 'Zona Norte', 'Sala de Lectura Silenciosa', 100),
(2, 'Biblioteca Central', 'Zona Norte', 'Cubículo de Estudio', 6),

-- Espacios en Centro Loyola (Montalbán)
(1, 'Centro Loyola', 'Zona Deportiva - Oeste', 'Cancha Techada', 300),

-- Espacios en Edificio Principal (Guayana)
(101, 'Edificio Principal', 'Campus Puerto Ordaz - Bloque A', 'Aula tradicional', 40),
(102, 'Edificio Principal', 'Campus Puerto Ordaz - Bloque A', 'Laboratorio de Física', 20),
(103, 'Edificio Principal', 'Campus Puerto Ordaz - Bloque A', 'Aula de Dibujo', 30),

-- Espacios en Biblioteca Guayana
(1, 'Biblioteca Guayana', 'Campus Puerto Ordaz - Bloque B', 'Sala de Lectura General', 80);


--------------------------------------------------------------------------------
-- 2. ENTIDADES PRESTADORAS (Clase Padre)
--------------------------------------------------------------------------------
INSERT INTO Entidad_Prestadora (nombre_entidad, categoria, ajuste) VALUES
('Dirección de Tecnología', 'Tecnología e Informática', 'Sin ajuste aplicable'),
('Centro de Innovación y Emprendimiento', 'Académico e Investigación', 'Ajuste semestral 5%'),
('Banco Mercantil C.A.', 'Servicios Financieros', 'Ajuste anual según BCV'),
('Empresas Polar', 'Consumo Masivo', 'Acuerdo corporativo cerrado');

--------------------------------------------------------------------------------
-- 3. TABLA PUENTE "OPERA" (Relación Entidad - Sede)
--------------------------------------------------------------------------------
INSERT INTO Opera (nombre_entidad, nombre_sede) VALUES
('Dirección de Tecnología', 'Sede Montalbán'),
('Centro de Innovación y Emprendimiento', 'Sede Montalbán'),
('Banco Mercantil C.A.', 'Sede Montalbán'),
('Empresas Polar', 'Sede Guayana');

--------------------------------------------------------------------------------
-- 4. ENTIDADES PROPIAS (Subclase)
--------------------------------------------------------------------------------
INSERT INTO Entidad_Propia (nombre_entidad, cod_presupuestario, dir_oficina) VALUES
('Dirección de Tecnología', 'UCAB-TEC-001', 'Edificio Cincuentenario, Piso 3, Oficina 301'),
('Centro de Innovación y Emprendimiento', 'UCAB-INV-002', 'Centro Cultural, Planta Baja, Local 2');

--------------------------------------------------------------------------------
-- 5. ORGANIZACIONES EXTERNAS (Subclase)
-- Ojo: Noté que en tu CREATE tienes el campo como "contacto_lega", lo mantuve igual.
--------------------------------------------------------------------------------
INSERT INTO Organizacion_externa (nombre_entidad, rif, razon_social, precio_institucional, fecha_contrato, contacto_lega) VALUES
('Banco Mercantil C.A.', 'J-00002961-0', 'Banco Mercantil, C.A., Banco Universal', 150.00, '2023-01-15', 'asuntoslegales@mercantil.com'),
('Empresas Polar', 'J-00006372-9', 'Cervecería Polar C.A.', 200.00, '2022-11-20', 'rrhh.legal@polar.com');

--------------------------------------------------------------------------------
-- 6. OFERTAS LABORALES (Ancladas sólo a Organizaciones Externas según tu FK)
--------------------------------------------------------------------------------
INSERT INTO Oferta_laboral (nombre_entidad, cargo, responsabilidades, beneficios, perfil_buscado, fecha_oferta, estatus_vacante) VALUES
('Banco Mercantil C.A.', 'Analista de Datos Jr', 'Manejo de SQL, creación de dashboards y optimización de consultas.', 'Seguro HCM, Bono de alimentación, Excelente clima laboral.', 'Estudiante de últimos semestres de Ingeniería Informática.', '2026-06-01', 'disponible'),
('Empresas Polar', 'Pasante de Logística', 'Apoyo en control de inventario y cadena de suministros.', 'Bono de transporte, comedor, posibilidad de contrato.', 'Estudiante de Ingeniería Industrial proactivo.', '2026-06-15', 'disponible');

--------------------------------------------------------------------------------
-- 7. OFERTA (Postulaciones de los Miembros)
-- Asumiendo que el id_miembro 1 es Carlos y el 2 es María (de los datos que ya pasaste)
--------------------------------------------------------------------------------
INSERT INTO Oferta (nombre_entidad, cargo, id_miembro) VALUES
('Banco Mercantil C.A.', 'Analista de Datos Jr', 1), -- Postulación de Carlos
('Empresas Polar', 'Pasante de Logística', 2);       -- Postulación de María


--------------------------------------------------------------------------------
-- SERVICIOS (Necesarios para el módulo financiero)
--------------------------------------------------------------------------------
INSERT INTO Servicio (id_servicio, nombre_servicio, descripcion, costo) VALUES
(1, 'Bootcamp de Emprendimiento', 'Programa intensivo', 50.00),
(2, 'Alquiler de Espacio Co-Working', 'Alquiler por jornada', 15.00),
(3, 'Soporte Tecnico para Eventos', 'Soporte tecnico por hora', 45.00),
(4, 'Asesoria Legal Básica', 'Consulta legal', 30.00),
(5, 'Stand Comercial', 'Reserva de stand', 100.00);
--------------------------------------------------------------------------------
-- TARIFAS BASE (Historico_Tarifa inicial)
--------------------------------------------------------------------------------
INSERT INTO Historico_Tarifa (id_servicio, fecha_inicio, tarifa_precio) VALUES
(1, '2025-01-01', 50.00), -- Tarifa base del Bootcamp
(2, '2025-01-01', 15.00), -- Tarifa base del Co-Working
(3, '2025-01-01', 45.00), -- Tarifa base de Soporte
(4, '2025-01-01', 30.00),
(5, '2025-01-01', 100.00);


--------------------------------------------------------------------------------
-- 8. BILLETERA DIGITAL (TAI)
-- Asignar billeteras a los miembros base creados arriba con saldo 100.00
--------------------------------------------------------------------------------
INSERT INTO Billetera_digital (uid, id_miembro, saldo) VALUES
('TAI-28001001-NFC', 1, 100.00),
('TAI-28002002-NFC', 2, 100.00),
('TAI-29003003-NFC', 3, 100.00),
('TAI-27004004-NFC', 4, 100.00),
('TAI-22005005-NFC', 5, 100.00),
('TAI-18006006-NFC', 6, 100.00),
('TAI-20007007-NFC', 7, 100.00),
('TAI-30008008-NFC', 8, 100.00)
ON CONFLICT (id_miembro) DO NOTHING;

