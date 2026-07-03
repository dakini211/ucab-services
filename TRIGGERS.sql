-- TRIGGERS.sql

-- ==============================================================================
-- 1. BLOQUE: MIEMBRO Y SUS HISTORIALES
-- ==============================================================================

-- 1.1 Trigger para Historial_Contrasena (Actualizar fecha_fin del registro anterior)
CREATE OR REPLACE FUNCTION func_update_historial_contrasena()
RETURNS TRIGGER AS $$
BEGIN
    -- Cerramos la contraseña anterior (si existe) asignando fecha_fin = nueva fecha_inicio
    UPDATE Historial_Contrasena
    SET fecha_fin = NEW.fecha_inicio
    WHERE id_miembro = NEW.id_miembro
      AND fecha_fin IS NULL
      AND fecha_inicio < NEW.fecha_inicio;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_historial_contrasena_insert
BEFORE INSERT ON Historial_Contrasena
FOR EACH ROW
EXECUTE FUNCTION func_update_historial_contrasena();

-- 1.2 Trigger para Historial_Sesiones (Actualizar total_sesiones en Miembro)
CREATE OR REPLACE FUNCTION func_update_total_sesiones()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Miembro
    SET total_sesiones = total_sesiones + 1
    WHERE id_miembro = NEW.id_miembro;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_historial_sesiones_insert
AFTER INSERT ON Historial_Sesiones
FOR EACH ROW
EXECUTE FUNCTION func_update_total_sesiones();

-- 1.3 Trigger para Historial_Miembro (Actualizar fecha_fin del registro anterior)
CREATE OR REPLACE FUNCTION func_update_historial_miembro()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Historial_Miembro
    SET fecha_fin = NEW.fecha_inicio
    WHERE id_miembro = NEW.id_miembro
      AND fecha_fin IS NULL
      AND fecha_inicio < NEW.fecha_inicio;
      
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_historial_miembro_insert
BEFORE INSERT ON Historial_Miembro
FOR EACH ROW
EXECUTE FUNCTION func_update_historial_miembro();

-- ==============================================================================
-- BLOQUE 5: ENTIDADES PRESTADORAS Y SEDE (Ajustes)
-- ==============================================================================

-- La regla dice: "para toda entidad prestadora, no puede tener un ajuste mayor o menor a lo establecido por la sede en la relación opera"
-- Esto significa que cuando se inserte/actualice en Entidad_Prestadora, debemos revisar Sede a través de Opera.
-- Como Entidad_Prestadora es una tabla independiente que se relaciona con Sede mediante "Opera", 
-- el trigger real debe estar en 'Opera' y también en 'Entidad_Prestadora' (si cambia el ajuste).

CREATE OR REPLACE FUNCTION func_validar_ajuste_entidad()
RETURNS TRIGGER AS $$
DECLARE
    v_tarifa_min NUMERIC(10,2);
    v_tarifa_max NUMERIC(10,2);
    v_ajuste NUMERIC;
BEGIN
    -- Obtenemos el ajuste de la entidad y lo convertimos a numérico si es posible.
    -- (Nota: la tabla original lo tiene como VARCHAR, esto es un punto delicado. 
    -- Asumiremos que contiene valores numéricos interpretables, ej. "100.50").
    BEGIN
        -- Intentar castear el texto a numerico. Si falla, el bloque EXCEPTION lo atrapa.
        SELECT CAST(e.ajuste AS NUMERIC) INTO v_ajuste
        FROM Entidad_Prestadora e
        WHERE e.nombre_entidad = NEW.nombre_entidad;
    EXCEPTION WHEN OTHERS THEN
        -- Si el ajuste no es un número válido, no podemos comparar matemáticamente.
        RAISE NOTICE 'El ajuste de la entidad % no es un valor numérico.', NEW.nombre_entidad;
        RETURN NEW;
    END;

    IF v_ajuste IS NOT NULL THEN
        -- Obtenemos los limites de la sede
        SELECT tarifa_min, tarifa_max INTO v_tarifa_min, v_tarifa_max
        FROM Sede
        WHERE nombre_sede = NEW.nombre_sede;

        -- Validar
        IF v_ajuste < v_tarifa_min OR v_ajuste > v_tarifa_max THEN
            RAISE EXCEPTION 'El ajuste de la entidad (%) está fuera de los límites de la Sede (%) : Min=%, Max=%', 
                            v_ajuste, NEW.nombre_sede, v_tarifa_min, v_tarifa_max;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_ajuste_opera
BEFORE INSERT OR UPDATE ON Opera
FOR EACH ROW
EXECUTE FUNCTION func_validar_ajuste_entidad();


-- También necesitamos validar si actualizan la Entidad_Prestadora
CREATE OR REPLACE FUNCTION func_validar_ajuste_entidad_update()
RETURNS TRIGGER AS $$
DECLARE
    v_tarifa_min NUMERIC(10,2);
    v_tarifa_max NUMERIC(10,2);
    v_ajuste NUMERIC;
    r_opera RECORD;
BEGIN
    BEGIN
        v_ajuste := CAST(NEW.ajuste AS NUMERIC);
    EXCEPTION WHEN OTHERS THEN
        RETURN NEW;
    END;

    IF v_ajuste IS NOT NULL THEN
        -- Puede operar en múltiples sedes, revisamos todas.
        FOR r_opera IN (SELECT s.nombre_sede, s.tarifa_min, s.tarifa_max 
                        FROM Opera o 
                        JOIN Sede s ON o.nombre_sede = s.nombre_sede 
                        WHERE o.nombre_entidad = NEW.nombre_entidad) LOOP
            IF v_ajuste < r_opera.tarifa_min OR v_ajuste > r_opera.tarifa_max THEN
                RAISE EXCEPTION 'El nuevo ajuste (%) está fuera de los límites de la Sede % : Min=%, Max=%', 
                                v_ajuste, r_opera.nombre_sede, r_opera.tarifa_min, r_opera.tarifa_max;
            END IF;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_ajuste_entidad_upd
BEFORE UPDATE ON Entidad_Prestadora
FOR EACH ROW
WHEN (OLD.ajuste IS DISTINCT FROM NEW.ajuste)
EXECUTE FUNCTION func_validar_ajuste_entidad_update();


-- ==============================================================================
-- 6. BLOQUE: OFERTAS LABORALES
-- ==============================================================================

CREATE OR REPLACE FUNCTION func_validar_postulacion_oferta()
RETURNS TRIGGER AS $$
DECLARE
    v_estatus VARCHAR(15);
BEGIN
    SELECT estatus_vacante INTO v_estatus
    FROM Oferta_laboral
    WHERE nombre_entidad = NEW.nombre_entidad 
      AND cargo = NEW.cargo;
      
    IF v_estatus = 'finalizada' THEN
        RAISE EXCEPTION 'No se puede postular a la oferta (%) en la entidad (%). La oferta ha finalizado.', 
                        NEW.cargo, NEW.nombre_entidad;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_oferta_postulacion
BEFORE INSERT ON Oferta
FOR EACH ROW
EXECUTE FUNCTION func_validar_postulacion_oferta();
