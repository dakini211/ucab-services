
--limpieza de roles
DO $$
DECLARE
    v_rol TEXT;
BEGIN
    FOREACH v_rol IN ARRAY ARRAY[
        'svc_app', 'svc_reportes',                                   -- cuentas
        'ucab_admin', 'ucab_finanzas', 'ucab_miembro', 'ucab_consulta' -- grupos
    ]
    LOOP
        IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = v_rol) THEN
            -- Si el rol llegara a ser dueño de algún objeto, se lo pasamos al
            -- usuario actual en vez de borrarlo.
            EXECUTE format('REASSIGN OWNED BY %I TO CURRENT_USER', v_rol);
            -- Revoca todos los privilegios que se le concedieron.
            EXECUTE format('DROP OWNED BY %I', v_rol);
            EXECUTE format('DROP ROLE %I', v_rol);
            RAISE NOTICE 'Rol % eliminado.', v_rol;
        END IF;
    END LOOP;
END $$;


--------------------------------------------------------------------------------
-- 1. ROLES DE GRUPO (NOLOGIN = son permisos, no cuentas)
--------------------------------------------------------------------------------

CREATE ROLE ucab_admin    NOLOGIN;  -- administrativo con admid_general
CREATE ROLE ucab_finanzas NOLOGIN;  -- caja: cobra y factura
CREATE ROLE ucab_miembro  NOLOGIN;  -- estudiante / profesor / egresado
CREATE ROLE ucab_consulta NOLOGIN;  -- solo lectura (reportes)




ALTER ROLE ucab_admin    NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;
ALTER ROLE ucab_finanzas NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;
ALTER ROLE ucab_miembro  NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;
ALTER ROLE ucab_consulta NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;


--------------------------------------------------------------------------------
-- 3. CONEXION Y ESQUEMA
--------------------------------------------------------------------------------

DO $$
BEGIN
    EXECUTE format(
        'GRANT CONNECT ON DATABASE %I TO ucab_admin, ucab_finanzas, ucab_miembro, ucab_consulta',
        current_database()
    );
END $$;

GRANT USAGE ON SCHEMA public TO ucab_admin, ucab_finanzas, ucab_miembro, ucab_consulta;


REVOKE CREATE ON SCHEMA public FROM PUBLIC;


--------------------------------------------------------------------------------
--  PRIVILEGIOS SOBRE OBJETOS (TABLAS)
--------------------------------------------------------------------------------

-- ── ucab_consulta: SOLO LECTURA ──────────────────────────────────────────────
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ucab_consulta;


-- ── ucab_admin: DML completo, pero NO DDL ────────────────────────────────────
-- Opera el negocio entero. NO puede hacer DROP TABLE ni ALTER TABLE: eso
-- depende de ser DUEÑO del objeto, y el dueño es postgres. Un administrador
-- del negocio no debería poder borrar el esquema.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES    IN SCHEMA public TO ucab_admin;
GRANT USAGE, SELECT                  ON ALL SEQUENCES IN SCHEMA public TO ucab_admin;


-- ── ucab_finanzas: caja ──────────────────────────────────────────────────────
-- Lee todo (necesita ver miembros y servicios para cobrar)...
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ucab_finanzas;

-- ...pero solo ESCRIBE en el módulo financiero.
GRANT INSERT, UPDATE ON Folio, Items_Consumo, Factura       TO ucab_finanzas;
GRANT INSERT         ON Metodo_Pago                          TO ucab_finanzas;
GRANT INSERT         ON Zelle, Tarjeta, Pago_Movil,
                        Efectivo, Criptomoneda, TAI, Obtiene TO ucab_finanzas;
GRANT UPDATE         ON Billetera_digital                    TO ucab_finanzas; 
GRANT USAGE, SELECT  ON ALL SEQUENCES IN SCHEMA public       TO ucab_finanzas;



-- ── ucab_miembro: el usuario final ───────────────────────────────────────────
GRANT SELECT ON Servicio, Sede, Edificacion, Espacio_Fisico,
                Recurso_Tecnologicos, Oferta_laboral,
                Organizacion_externa, Entidad_Prestadora,
                Historico_Tarifa, Tasa_Cambio            TO ucab_miembro;

GRANT SELECT ON Miembro, Solicitud_servicio, Folio,
                Items_Consumo, Factura, Metodo_Pago,
                Billetera_digital, Oferta                TO ucab_miembro;

GRANT INSERT ON Solicitud_servicio, Acompanante          TO ucab_miembro;
GRANT INSERT ON Oferta                                   TO ucab_miembro;
GRANT INSERT ON Metodo_Pago                              TO ucab_miembro;
GRANT INSERT ON Zelle, Tarjeta, Pago_Movil,
                Efectivo, Criptomoneda, TAI              TO ucab_miembro;




--------------------------------------------------------------------------------
--  PRIVILEGIOS SOBRE FUNCIONES Y PROCEDIMIENTOS
--------------------------------------------------------------------------------

REVOKE EXECUTE ON ALL ROUTINES IN SCHEMA public FROM PUBLIC;

GRANT EXECUTE ON ALL ROUTINES  IN SCHEMA public TO ucab_admin;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO ucab_finanzas, ucab_miembro, ucab_consulta;

-- Procedimientos de caja: admin y finanzas.
DO $$
DECLARE
    v_proc TEXT;
BEGIN
    FOREACH v_proc IN ARRAY ARRAY[
        'sp_abrir_folio', 'sp_agregar_item_consumo', 'sp_generar_factura'
    ]
    LOOP
        EXECUTE (
            SELECT string_agg(
                format('GRANT EXECUTE ON PROCEDURE %s TO ucab_finanzas;', p.oid::regprocedure),
                ' '
            )
            FROM pg_proc p
            JOIN pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname = 'public' AND p.proname = v_proc AND p.prokind = 'p'
        );
    END LOOP;
END $$;

-- Registrar un pago SI lo puede hacer el miembro (paga desde el portal).
DO $$
BEGIN
    EXECUTE (
        SELECT string_agg(
            format('GRANT EXECUTE ON PROCEDURE %s TO ucab_miembro, ucab_finanzas;', p.oid::regprocedure),
            ' '
        )
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public' AND p.proname = 'sp_registrar_pago' AND p.prokind = 'p'
    );
END $$;

-- Postularse a una oferta: solo el miembro.
DO $$
BEGIN
    EXECUTE (
        SELECT string_agg(
            format('GRANT EXECUTE ON PROCEDURE %s TO ucab_miembro;', p.oid::regprocedure),
            ' '
        )
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public' AND p.proname = 'sp_aplicar_oferta_laboral' AND p.prokind = 'p'
    );
END $$;

-- El cierre masivo mensual es una operación de dirección: SOLO admin.
DO $$
BEGIN
    EXECUTE (
        SELECT string_agg(
            format('REVOKE EXECUTE ON PROCEDURE %s FROM ucab_finanzas, ucab_miembro, ucab_consulta;',
                   p.oid::regprocedure),
            ' '
        )
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public' AND p.proname = 'sp_cierre_masivo_folios' AND p.prokind = 'p'
    );
END $$;


--------------------------------------------------------------------------------
-- CUENTAS DE USUARIO (LOGIN)
--------------------------------------------------------------------------------

-- La cuenta que usa NestJS. Reemplaza a `postgres` en el DATABASE_URL del .env
CREATE ROLE svc_app LOGIN PASSWORD '123456' INHERIT;
GRANT ucab_admin TO svc_app;


CREATE ROLE svc_reportes LOGIN PASSWORD '123456' INHERIT;
GRANT ucab_consulta TO svc_reportes;
