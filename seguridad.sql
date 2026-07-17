--------------------------------------------------------------------------------
-- SEGURIDAD LOGICA EN EL GESTOR
-- Services UCAB - PostgreSQL
--
-- Cubre el entregable: "todo el diseño de seguridad lógica que aplique para el
-- negocio... roles, cuentas, privilegios de sistema y privilegios sobre objetos".
--
-- ORDEN: ejecutar DESPUES de create.sql y de los procedimientos/funciones.
-- Los GRANT sobre tablas y funciones exigen que esos objetos ya existan.
--
-- Ejecutar como superusuario (postgres).
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
-- POR QUE ESTO HACE FALTA (la explicación que hay que saber defender)
--------------------------------------------------------------------------------
-- Hoy la aplicación se conecta a PostgreSQL con el superusuario `postgres`.
-- Eso significa que, en la práctica, NO HAY SEGURIDAD EN EL GESTOR:
--
--   - Un bug de inyección SQL en cualquier endpoint permite DROP TABLE.
--   - El backend puede borrar la base de datos entera por accidente.
--   - Los roles del JWT (Admin, Estudiante...) son seguridad de APLICACION:
--     viven en el código de NestJS. Si alguien se conecta con psql o DBeaver,
--     esos roles no existen y puede hacer lo que quiera.
--
-- El enunciado pide seguridad "utilizando los recursos del sistema gestor".
-- La diferencia clave: la seguridad de aplicación se puede saltar conectándose
-- por fuera; la del gestor no. Son dos capas distintas y hacen falta las dos.
--
-- MODELO EN DOS NIVELES:
--   ROLES DE GRUPO (NOLOGIN)  -> definen QUE se puede hacer. Son permisos.
--   CUENTAS       (LOGIN)     -> definen QUIEN se conecta. Heredan de un rol.
--
-- Se separa así porque los permisos cambian poco y las cuentas cambian mucho.
-- Si mañana entra otro cajero, se crea la cuenta y se le da el rol: no se
-- vuelve a tocar ni un GRANT.
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
-- 0. LIMPIEZA (permite re-ejecutar el script)
--------------------------------------------------------------------------------

-- Las cuentas primero: no se puede borrar un rol que otro rol tiene asignado.
DROP OWNED BY svc_app       CASCADE;
DROP OWNED BY svc_reportes  CASCADE;
DROP ROLE IF EXISTS svc_app;
DROP ROLE IF EXISTS svc_reportes;

DROP ROLE IF EXISTS ucab_admin;
DROP ROLE IF EXISTS ucab_finanzas;
DROP ROLE IF EXISTS ucab_miembro;
DROP ROLE IF EXISTS ucab_consulta;


--------------------------------------------------------------------------------
-- 1. ROLES DE GRUPO (NOLOGIN = son permisos, no cuentas)
--
-- Se corresponden 1 a 1 con los roles que ya calcula auth.service.ts,
-- para que la seguridad del gestor y la de la app digan lo mismo.
--------------------------------------------------------------------------------

CREATE ROLE ucab_admin    NOLOGIN;  -- administrativo con admid_general
CREATE ROLE ucab_finanzas NOLOGIN;  -- caja: cobra y factura
CREATE ROLE ucab_miembro  NOLOGIN;  -- estudiante / profesor / egresado
CREATE ROLE ucab_consulta NOLOGIN;  -- solo lectura (reportes)


--------------------------------------------------------------------------------
-- 2. PRIVILEGIOS DE SISTEMA
--
-- En PostgreSQL los privilegios de sistema son atributos del rol
-- (LOGIN, CREATEDB, CREATEROLE, SUPERUSER...).
--
-- NINGUN rol de negocio los recibe: nadie crea bases ni roles. Solo el DBA.
-- Que estén todos sin CREATEDB/CREATEROLE/SUPERUSER es una decisión explícita,
-- no un olvido: es el principio de mínimo privilegio.
--------------------------------------------------------------------------------

ALTER ROLE ucab_admin    NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
ALTER ROLE ucab_finanzas NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
ALTER ROLE ucab_miembro  NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
ALTER ROLE ucab_consulta NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;


--------------------------------------------------------------------------------
-- 3. PRIVILEGIO DE CONEXION Y ESQUEMA
--------------------------------------------------------------------------------

GRANT CONNECT ON DATABASE services_ucab TO ucab_admin, ucab_finanzas, ucab_miembro, ucab_consulta;
GRANT USAGE   ON SCHEMA public          TO ucab_admin, ucab_finanzas, ucab_miembro, ucab_consulta;

-- Nadie crea tablas nuevas en producción. En PostgreSQL 15+ ya es el default,
-- pero se declara explícito para que quede documentado.
REVOKE CREATE ON SCHEMA public FROM PUBLIC;


--------------------------------------------------------------------------------
-- 4. PRIVILEGIOS SOBRE OBJETOS
--------------------------------------------------------------------------------

-- ── ucab_consulta: SOLO LECTURA ───────────────────────────────────────────────
-- Para reportes. No puede modificar ni un byte.
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ucab_consulta;


-- ── ucab_admin: DML completo, pero NO DDL ─────────────────────────────────────
-- Puede operar el negocio entero. NO puede hacer DROP TABLE ni ALTER TABLE:
-- eso es del DBA. Un admin del negocio no debería poder borrar el esquema.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES    IN SCHEMA public TO ucab_admin;
GRANT USAGE, SELECT                  ON ALL SEQUENCES IN SCHEMA public TO ucab_admin;


-- ── ucab_finanzas: caja ───────────────────────────────────────────────────────
-- Lee todo (necesita ver miembros y servicios para cobrar)...
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ucab_finanzas;

-- ...pero solo ESCRIBE en el módulo financiero.
GRANT INSERT, UPDATE ON Folio, Items_Consumo, Factura       TO ucab_finanzas;
GRANT INSERT         ON Metodo_Pago                          TO ucab_finanzas;
GRANT INSERT         ON Zelle, Tarjeta, Pago_Movil,
                        Efectivo, Criptomoneda, TAI, Obtiene TO ucab_finanzas;
GRANT UPDATE         ON Billetera_digital                    TO ucab_finanzas; -- pagos TAI descuentan saldo
GRANT USAGE, SELECT  ON SEQUENCE seq_nro_folio, seq_numero_control TO ucab_finanzas;

-- OJO: NO tiene DELETE en ninguna tabla financiera. Un cajero no borra facturas
-- ni pagos: eso destruiría la trazabilidad contable. Anular una factura es un
-- UPDATE del estatus a 'anulada', no un DELETE. La restricción
-- ON DELETE RESTRICT de fk_factura_folio ya apuntaba en esa dirección; esto la
-- refuerza a nivel de permisos.


-- ── ucab_miembro: el usuario final ────────────────────────────────────────────
-- Lee los catálogos públicos...
GRANT SELECT ON Servicio, Sede, Edificacion, Espacio_Fisico,
                Recurso_Tecnologicos, Oferta_laboral,
                Organizacion_externa, Entidad_Prestadora,
                Historico_Tarifa, Tasa_Cambio            TO ucab_miembro;

-- ...ve sus propios datos financieros...
GRANT SELECT ON Miembro, Solicitud_servicio, Folio,
                Items_Consumo, Factura, Metodo_Pago,
                Billetera_digital                        TO ucab_miembro;

-- ...y solo puede CREAR solicitudes, postularse y pagar.
GRANT INSERT ON Solicitud_servicio, Acompanante          TO ucab_miembro;
GRANT INSERT ON Oferta                                   TO ucab_miembro;
GRANT INSERT ON Metodo_Pago                              TO ucab_miembro;
GRANT INSERT ON Zelle, Tarjeta, Pago_Movil,
                Efectivo, Criptomoneda, TAI              TO ucab_miembro;

-- LIMITACION HONESTA QUE HAY QUE SABER DEFENDER:
-- Este GRANT deja que un miembro inserte un pago contra CUALQUIER factura,
-- no solo las suyas. Los privilegios de PostgreSQL son por TABLA, no por FILA.
-- La regla "un miembro solo paga sus propias facturas" es de nivel FILA, y en
-- el gestor se resuelve con Row Level Security (sección 7, más abajo).


--------------------------------------------------------------------------------
-- 5. PRIVILEGIOS SOBRE FUNCIONES Y PROCEDIMIENTOS
--
-- Desde PostgreSQL 11, EXECUTE está concedido a PUBLIC por defecto. Eso es
-- justo lo contrario de lo que queremos: cualquiera podría ejecutar el cierre
-- masivo. Se revoca y se concede a dedo.
--------------------------------------------------------------------------------

REVOKE EXECUTE ON ALL FUNCTIONS  IN SCHEMA public FROM PUBLIC;
REVOKE EXECUTE ON ALL PROCEDURES IN SCHEMA public FROM PUBLIC;

-- Funciones de consulta: las puede usar cualquiera que tenga que ver montos.
GRANT EXECUTE ON FUNCTION fn_total_folio(BIGINT, INT, TIMESTAMP, VARCHAR) TO ucab_admin, ucab_finanzas, ucab_miembro, ucab_consulta;
GRANT EXECUTE ON FUNCTION fn_total_pagado(VARCHAR)                        TO ucab_admin, ucab_finanzas, ucab_miembro, ucab_consulta;
GRANT EXECUTE ON FUNCTION fn_saldo_factura(VARCHAR)                       TO ucab_admin, ucab_finanzas, ucab_miembro, ucab_consulta;
GRANT EXECUTE ON FUNCTION fn_tarifa_vigente(INT, TIMESTAMP)               TO ucab_admin, ucab_finanzas, ucab_consulta;

-- Operaciones de caja.
GRANT EXECUTE ON PROCEDURE sp_abrir_folio(BIGINT, INT, TIMESTAMP, DATE, VARCHAR)          TO ucab_admin, ucab_finanzas;
GRANT EXECUTE ON PROCEDURE sp_agregar_item_consumo(BIGINT, INT, TIMESTAMP, VARCHAR, VARCHAR, INT, NUMERIC, NUMERIC) TO ucab_admin, ucab_finanzas;
GRANT EXECUTE ON PROCEDURE sp_generar_factura(BIGINT, INT, TIMESTAMP, VARCHAR, VARCHAR)   TO ucab_admin, ucab_finanzas;

-- Registrar un pago SÍ lo puede hacer el miembro (paga desde el portal).
GRANT EXECUTE ON PROCEDURE sp_registrar_pago(
    VARCHAR, NUMERIC, VARCHAR, TIMESTAMP, VARCHAR, VARCHAR, VARCHAR,
    VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR,
    NUMERIC, VARCHAR, VARCHAR, VARCHAR, VARCHAR
) TO ucab_admin, ucab_finanzas, ucab_miembro;

-- El cierre masivo mensual es una operación de dirección: SOLO admin.
-- Un cajero no puede facturar el mes entero de golpe.
GRANT EXECUTE ON PROCEDURE sp_cierre_masivo_folios(DATE) TO ucab_admin;

-- Postularse a una oferta: solo el miembro.
GRANT EXECUTE ON PROCEDURE sp_aplicar_oferta_laboral(BIGINT, VARCHAR, VARCHAR) TO ucab_admin, ucab_miembro;


--------------------------------------------------------------------------------
-- 6. CUENTAS DE USUARIO (LOGIN)
--
-- Estas son las que se conectan de verdad. Cada una hereda de un rol de grupo.
-- CAMBIAR LAS CONTRASEÑAS antes de la entrega.
--------------------------------------------------------------------------------

-- La cuenta que usa NestJS. Reemplaza a `postgres` en el .env
CREATE ROLE svc_app LOGIN PASSWORD 'cambiar_esto_app' INHERIT;
GRANT ucab_admin TO svc_app;

-- Cuenta de solo lectura para los reportes (jsreport/JasperReports).
-- Si el generador de reportes tuviera un fallo, no podría escribir nada.
CREATE ROLE svc_reportes LOGIN PASSWORD 'cambiar_esto_rep' INHERIT;
GRANT ucab_consulta TO svc_reportes;

-- NOTA SOBRE POR QUE svc_app ES ucab_admin Y NO ALGO MENOR:
-- La aplicación atiende a todos los roles con una sola conexión (pool de
-- Prisma), así que necesita la unión de todos los permisos. La separación fina
-- por rol de negocio la hace NestJS con el JWT.
-- Lo que se gana igual, y es lo importante: svc_app NO ES SUPERUSUARIO. No
-- puede hacer DROP TABLE, ni ALTER, ni leer archivos del servidor, ni crear
-- roles. Una inyección SQL ya no puede tumbar la base.


--------------------------------------------------------------------------------
-- 7. SEGURIDAD A NIVEL DE FILA (RLS)
--
-- Resuelve la regla "un miembro solo puede pagar/ver SUS facturas", que los
-- GRANT por tabla no pueden expresar.
--
-- Está comentado a propósito: si se activa, la aplicación debe ejecutar
--     SET LOCAL app.id_miembro = '<id del JWT>';
-- al inicio de cada transacción, o dejará de ver datos. Actívalo solo si vas a
-- hacer ese cambio en PrismaService.
--------------------------------------------------------------------------------

-- ALTER TABLE Factura ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY factura_propia ON Factura
--     FOR SELECT
--     TO ucab_miembro
--     USING (id_miembro = current_setting('app.id_miembro', TRUE)::BIGINT);
--
-- CREATE POLICY factura_admin ON Factura
--     FOR ALL
--     TO ucab_admin, ucab_finanzas
--     USING (TRUE);


--------------------------------------------------------------------------------
-- 8. VERIFICACION (para la corrección)
--------------------------------------------------------------------------------

-- 8.1 Roles y sus privilegios de sistema
-- SELECT rolname, rolsuper, rolcreatedb, rolcreaterole, rolcanlogin
-- FROM pg_roles WHERE rolname LIKE 'ucab%' OR rolname LIKE 'svc%'
-- ORDER BY rolcanlogin, rolname;

-- 8.2 Quién hereda de quién
-- SELECT r.rolname AS cuenta, g.rolname AS rol_heredado
-- FROM pg_auth_members m
-- JOIN pg_roles r ON r.oid = m.member
-- JOIN pg_roles g ON g.oid = m.roleid
-- WHERE r.rolname LIKE 'svc%';

-- 8.3 Privilegios sobre objetos del módulo financiero
-- SELECT grantee, table_name, string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privilegios
-- FROM information_schema.role_table_grants
-- WHERE grantee LIKE 'ucab%'
--   AND table_name IN ('folio', 'factura', 'items_consumo', 'metodo_pago')
-- GROUP BY grantee, table_name
-- ORDER BY table_name, grantee;

-- 8.4 DEMOSTRACION EN VIVO: el cajero no puede borrar una factura
-- SET ROLE ucab_finanzas;
-- DELETE FROM Factura WHERE numero_de_control = 'FAC-2026-000001';
-- -- ERROR:  permiso denegado para la tabla factura
-- RESET ROLE;

-- 8.5 DEMOSTRACION: el cajero no puede correr el cierre masivo
-- SET ROLE ucab_finanzas;
-- CALL sp_cierre_masivo_folios('2026-07-01');
-- -- ERROR:  permiso denegado para la función sp_cierre_masivo_folios
-- RESET ROLE;
