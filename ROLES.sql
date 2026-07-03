-- ROLES.sql

-- ==============================================================================
-- PRUEBA DE ROLES DE SEGURIDAD
-- ==============================================================================

-- NOTA: PostgreSQL requiere tener los roles creados a nivel de base de datos.
-- Si los roles ya existen, esto generará error, por lo que usaremos bloques anónimos
-- para crearlos de manera segura.

DO
$do$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'rol_admin') THEN
      CREATE ROLE rol_admin WITH LOGIN PASSWORD 'Admin123!';
   END IF;
   
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'rol_miembro') THEN
      CREATE ROLE rol_miembro WITH LOGIN PASSWORD 'Miembro123!';
   END IF;
   
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'rol_entidad') THEN
      CREATE ROLE rol_entidad WITH LOGIN PASSWORD 'Entidad123!';
   END IF;
END
$do$;
 

-- ==============================================================================
-- PRIVILEGIOS: rol_admin
-- ==============================================================================
-- El administrador debe tener control total.
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rol_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rol_admin;


-- ==============================================================================
-- PRIVILEGIOS: rol_miembro
-- ==============================================================================
-- Un miembro puede ver información general, ver servicios y ofertas,
-- pero solo modificar su propio perfil, historiales y postulaciones (a nivel app se filtrará, 
-- a nivel BD le damos los permisos sobre las tablas que usa).

-- Permisos de lectura general
GRANT SELECT ON Sede, Edificacion, Espacio_Fisico, Recurso_Tecnologicos TO rol_miembro;
GRANT SELECT ON Servicio, Historico_Tarifa TO rol_miembro;
GRANT SELECT ON Oferta_laboral, Entidad_Prestadora, Organizacion_externa TO rol_miembro;
GRANT SELECT ON Miembro, Estudiante, Preparador, Egresado, Personal_ucab, Profesor, Administrativo TO rol_miembro;

-- Permisos de escritura específicos para actividades del miembro
GRANT INSERT, UPDATE, SELECT ON Historial_Contrasena, Historial_Sesiones, Historial_Miembro TO rol_miembro;
GRANT INSERT, UPDATE, SELECT, DELETE ON Oferta TO rol_miembro; -- Postularse a ofertas
GRANT INSERT, UPDATE, SELECT ON Solicitud_servicio, Acompanante TO rol_miembro; 

-- Secuencias necesarias para inserciones
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO rol_miembro;


-- ==============================================================================
-- PRIVILEGIOS: rol_entidad
-- ==============================================================================
-- Las entidades externas pueden ver información relacionada con la sede, 
-- manejar sus propias ofertas laborales y visualizar quién se postula.

-- Lectura general y servicios/publicaciones
GRANT SELECT ON Sede, Opera, Entidad_Prestadora, Organizacion_externa TO rol_entidad;
GRANT SELECT ON Miembro TO rol_entidad; -- Para ver datos básicos de los postulantes

-- Gestión de Ofertas Laborales
GRANT INSERT, UPDATE, DELETE, SELECT ON Oferta_laboral TO rol_entidad;

-- Ver las postulaciones a sus ofertas
GRANT SELECT ON Oferta TO rol_entidad;

-- Revocar permisos si se quiere hacer más estricto, pero por defecto estos son suficientes para probar.
