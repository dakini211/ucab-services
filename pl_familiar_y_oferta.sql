DROP PROCEDURE IF EXISTS sp_aplicar_oferta_laboral(BIGINT, INT);
DROP PROCEDURE IF EXISTS sp_aplicar_oferta_laboral(BIGINT, VARCHAR, VARCHAR);


CREATE OR REPLACE PROCEDURE sp_aplicar_oferta_laboral(
    p_id_miembro     BIGINT,
    p_nombre_entidad VARCHAR,
    p_cargo          VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_fecha_nacimiento DATE;
    v_edad             INT;
    v_estado_cuenta    VARCHAR(50);
    v_estatus_vacante  VARCHAR(15);
    v_ya_postulado     INT;
BEGIN
    -- 1. El miembro debe existir
    SELECT fecha_nacimiento, estado_cuenta
    INTO v_fecha_nacimiento, v_estado_cuenta
    FROM Miembro
    WHERE id_miembro = p_id_miembro;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'El miembro % no existe.', p_id_miembro;
    END IF;

    -- 2. La cuenta debe estar activa: un miembro suspendido o bloqueado no se postula
    IF v_estado_cuenta <> 'activa' THEN
        RAISE EXCEPTION 'Tu cuenta está %. No puedes postularte a ofertas laborales.', v_estado_cuenta;
    END IF;

    -- 3. Mayoría de edad.
    --    age() maneja bisiestos y el día exacto del cumpleaños; una resta de
    --    años (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM nacimiento))
    --    daría 18 a alguien que todavía no los cumple.
    IF v_fecha_nacimiento IS NULL THEN
        RAISE EXCEPTION 'El miembro % no tiene fecha de nacimiento registrada.', p_id_miembro;
    END IF;

    v_edad := EXTRACT(YEAR FROM age(CURRENT_DATE, v_fecha_nacimiento));

    IF v_edad < 18 THEN
        RAISE EXCEPTION 'Debes tener al menos 18 años para postularte (edad actual: %).', v_edad;
    END IF;

    -- 4. La oferta debe existir y estar disponible
    SELECT estatus_vacante
    INTO v_estatus_vacante
    FROM Oferta_laboral
    WHERE nombre_entidad = p_nombre_entidad
      AND cargo = p_cargo;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No existe la oferta "%" de la entidad "%".', p_cargo, p_nombre_entidad;
    END IF;

    IF v_estatus_vacante <> 'disponible' THEN
        RAISE EXCEPTION 'La vacante "%" ya está finalizada: no admite postulaciones.', p_cargo;
    END IF;

    -- 5. No duplicar la postulación.
    --    Se valida explícitamente en vez de dejarlo al ON CONFLICT DO NOTHING:
    --    el usuario debe enterarse de que ya estaba postulado, no recibir un
    --    "éxito" silencioso mientras no pasa nada.
    SELECT COUNT(*)
    INTO v_ya_postulado
    FROM Oferta
    WHERE id_miembro     = p_id_miembro
      AND nombre_entidad = p_nombre_entidad
      AND cargo          = p_cargo;

    IF v_ya_postulado > 0 THEN
        RAISE EXCEPTION 'Ya te postulaste a la vacante "%" de %.', p_cargo, p_nombre_entidad;
    END IF;

    -- 6. Registrar la postulación
    INSERT INTO Oferta (nombre_entidad, cargo, id_miembro)
    VALUES (p_nombre_entidad, p_cargo, p_id_miembro);

    RAISE NOTICE 'Postulación registrada: miembro % -> "%" (%). Edad: % años.',
        p_id_miembro, p_cargo, p_nombre_entidad, v_edad;


END;
$$;



CREATE OR REPLACE FUNCTION fn_ofertas_sugeridas(p_id_miembro BIGINT)
RETURNS TABLE (
    nombre_entidad  VARCHAR,
    cargo           VARCHAR,
    perfil_buscado  TEXT,
    razon_social    VARCHAR,
    fecha_oferta    DATE
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_carrera VARCHAR(150);
BEGIN
    -- La carrera del estudiante es el criterio de emparejamiento disponible.
    SELECT e.carrera
    INTO v_carrera
    FROM Estudiante e
    WHERE e.id_miembro = p_id_miembro;

    RETURN QUERY
    SELECT
        ol.nombre_entidad,
        ol.cargo,
        ol.perfil_buscado,
        oe.razon_social,
        ol.fecha_oferta
    FROM Oferta_laboral ol
    JOIN Organizacion_externa oe ON oe.nombre_entidad = ol.nombre_entidad
    WHERE ol.estatus_vacante = 'disponible'
      -- No sugerir lo que ya se postuló
      AND NOT EXISTS (
          SELECT 1 FROM Oferta o
          WHERE o.nombre_entidad = ol.nombre_entidad
            AND o.cargo = ol.cargo
            AND o.id_miembro = p_id_miembro
      )
      -- Coincidencia por carrera; si no hay carrera registrada, devuelve todas
      AND (v_carrera IS NULL OR ol.perfil_buscado ILIKE '%' || v_carrera || '%')
    ORDER BY ol.fecha_oferta DESC;
END;
$$;



CREATE OR REPLACE FUNCTION registrar_familiar_personal_ucab(
    p_id_miembro_personal BIGINT,
    p_cedula INT,
    p_nombre_familiar VARCHAR(100),
    p_parentesco VARCHAR(50),
    p_edad_familiar INT,
    p_estudios VARCHAR(150) DEFAULT NULL,
    p_vacunacion TEXT DEFAULT NULL,
    p_educacion_inicial VARCHAR(150) DEFAULT NULL
) 
RETURNS VOID AS $$
DECLARE
    v_existe_personal BOOLEAN;
    v_total_familiares INT;
BEGIN
    -- 1. Validar que el ID del Personal exista
    SELECT EXISTS (
        SELECT 1 
        FROM personal_ucab 
        WHERE id_miembro = p_id_miembro_personal
    ) INTO v_existe_personal;

    IF NOT v_existe_personal THEN
        RAISE EXCEPTION 'Error: El ID % no corresponde a un miembro del Personal UCAB registrado.', p_id_miembro_personal;
    END IF;

    -- 2. Validar que no supere el límite de 5 familiares
    SELECT COUNT(*) INTO v_total_familiares
    FROM familiar
    WHERE id_personal_ucab = p_id_miembro_personal;

    IF v_total_familiares >= 5 THEN
        RAISE EXCEPTION 'Error: Ha alcanzado el límite máximo de 5 beneficiarios permitidos por miembro del Personal UCAB.';
    END IF;

    -- 3. Validaciones generales del familiar
    IF p_nombre_familiar IS NULL OR TRIM(p_nombre_familiar) = '' THEN
        RAISE EXCEPTION 'Error: El nombre del familiar no puede estar vacío.';
    END IF;

    IF p_parentesco IS NULL OR TRIM(p_parentesco) = '' THEN
        RAISE EXCEPTION 'Error: Se debe especificar el parentesco del familiar.';
    END IF;

    IF p_edad_familiar IS NULL OR p_edad_familiar < 0 THEN
        RAISE EXCEPTION 'Error: La edad no es válida.';
    END IF;

    -- 4. Validaciones específicas según la edad (Lógica de Negocio)
    IF p_edad_familiar >= 18 THEN
        -- Validación para Cargo Mayor
        IF p_estudios IS NULL OR p_estudios NOT IN ('Primaria', 'Bachiller', 'Técnico', 'Universitario', 'Postgrado', 'Universitarios') THEN
            RAISE EXCEPTION 'Error: Para familiares de 18 años o más, debe indicar un nivel de estudios válido (Primaria, Bachiller, Técnico, Universitario, Postgrado).';
        END IF;
    ELSE
        -- Validación para Cargo Menor
        IF p_vacunacion IS NULL OR TRIM(p_vacunacion) = '' THEN
            RAISE EXCEPTION 'Error: Para familiares menores de 18 años, debe proporcionar los datos de vacunación.';
        END IF;
        
        IF p_educacion_inicial IS NULL OR TRIM(p_educacion_inicial) = '' THEN
            RAISE EXCEPTION 'Error: Para familiares menores de 18 años, debe indicar la educación inicial.';
        END IF;
    END IF;

    -- 5. Insertar en la tabla principal de Familiar
    INSERT INTO familiar (
        cedula,
        id_personal_ucab, 
        nombre_familiar, 
        parentesco, 
        edad_familiar,
        fecha_de_inicio
    ) VALUES (
        p_cedula,
        p_id_miembro_personal, 
        p_nombre_familiar, 
        p_parentesco, 
        p_edad_familiar,
        CURRENT_DATE
    );

    -- 6. Insertar en la sub-entidad correspondiente
    IF p_edad_familiar >= 18 THEN
        INSERT INTO cargo_mayor (cedula, estudios) 
        VALUES (p_cedula, p_estudios);
        
        RAISE NOTICE 'Familiar "%" registrado en CARGO MAYOR. Estudios: %', p_nombre_familiar, p_estudios;
    ELSE
        INSERT INTO cargo_menor (cedula, vacunacion, educacion_inicial) 
        VALUES (p_cedula, p_vacunacion, p_educacion_inicial);
        
        RAISE NOTICE 'Familiar "%" registrado en CARGO MENOR. Vacunación y educación guardadas.', p_nombre_familiar;
    END IF;

EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Ya existe un familiar registrado con la cédula %', p_cedula;
    WHEN OTHERS THEN
        IF SQLSTATE = 'P0001' THEN
            RAISE;
        ELSE
            RAISE EXCEPTION 'Ocurrió un error al intentar registrar el familiar: %', SQLERRM;
        END IF;
END;
$$ LANGUAGE plpgsql;
