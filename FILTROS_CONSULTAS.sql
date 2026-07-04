-- =================================================================================
-- SCRIPT DE SEGURIDAD Y FILTRADO (SOLO LECTURA)
-- Implementación de Row-Level Security (RLS) para miembros no administrativos
-- =================================================================================

-- 1. Crear un rol para los miembros con acceso de solo lectura (Estudiantes, Profesores, etc.)
DO
$$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'rol_miembro_general') THEN
        CREATE ROLE rol_miembro_general;
    END IF;
END
$$;

-- 2. Otorgar permisos de solo consulta (SELECT) sobre las tablas principales
GRANT SELECT ON Miembro TO rol_miembro_general;
GRANT SELECT ON Edificacion TO rol_miembro_general;
GRANT SELECT ON Espacio_Fisico TO rol_miembro_general;
-- (Añadir GRANT para Servicios si la tabla se llama Servicio_ofrecido o similar)

-- =================================================================================
-- ACTIVAR ROW-LEVEL SECURITY (RLS) EN LAS TABLAS
-- =================================================================================
ALTER TABLE Miembro ENABLE ROW LEVEL SECURITY;
ALTER TABLE Edificacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE Espacio_Fisico ENABLE ROW LEVEL SECURITY;

-- =================================================================================
-- CREACIÓN DE POLÍTICAS (Estos actúan como los "filtros automáticos")
-- =================================================================================

-- Política para Miembro: Los usuarios con rol_miembro_general solo pueden ver 
-- miembros que tengan estado_cuenta = 'activa'
DROP POLICY IF EXISTS solo_ver_miembros_activos ON Miembro;
CREATE POLICY solo_ver_miembros_activos 
ON Miembro 
FOR SELECT 
TO rol_miembro_general 
USING (estado_cuenta = 'activa');

-- Para administradores (rol por defecto postgres o superusuarios), crear una política 
-- que les permita ver todo (bypassea RLS o se crea explícita)
DROP POLICY IF EXISTS admin_ver_todo_miembro ON Miembro;
CREATE POLICY admin_ver_todo_miembro 
ON Miembro 
FOR ALL 
TO postgres 
USING (true);

-- Si deseas políticas similares para Edificación o Espacios, puedes añadirlas aquí.
-- Ejemplo: Si Edificacion tuviera un campo "estado = 'activa'", la política sería:
-- CREATE POLICY solo_edificaciones_activas ON Edificacion FOR SELECT TO rol_miembro_general USING (estado = 'activa');
-- Como en CREATE.sql actual no hay estado en Edificación, la política será permitir ver todas:
DROP POLICY IF EXISTS solo_ver_edificaciones ON Edificacion;
CREATE POLICY solo_ver_edificaciones 
ON Edificacion 
FOR SELECT 
TO rol_miembro_general 
USING (true);

DROP POLICY IF EXISTS admin_ver_todo_edificacion ON Edificacion;
CREATE POLICY admin_ver_todo_edificacion ON Edificacion FOR ALL TO postgres USING (true);

-- Política para Espacios_Físicos
DROP POLICY IF EXISTS solo_ver_espacios ON Espacio_Fisico;
CREATE POLICY solo_ver_espacios 
ON Espacio_Fisico 
FOR SELECT 
TO rol_miembro_general 
USING (true);

DROP POLICY IF EXISTS admin_ver_todo_espacios ON Espacio_Fisico;
CREATE POLICY admin_ver_todo_espacios ON Espacio_Fisico FOR ALL TO postgres USING (true);

-- NOTA: Para usar esto desde tu backend (NestJS/TypeORM o pg), el usuario de conexión 
-- tendría que adoptar el rol 'rol_miembro_general' dinámicamente antes de hacer la consulta:
-- SET ROLE rol_miembro_general;
-- (Consulta de TypeORM)
-- RESET ROLE;
