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

    -- 2. Validaciones generales del familiar
    IF p_nombre_familiar IS NULL OR TRIM(p_nombre_familiar) = '' THEN
        RAISE EXCEPTION 'Error: El nombre del familiar no puede estar vacío.';
    END IF;

    IF p_parentesco IS NULL OR TRIM(p_parentesco) = '' THEN
        RAISE EXCEPTION 'Error: Se debe especificar el parentesco del familiar.';
    END IF;

    IF p_edad_familiar IS NULL OR p_edad_familiar < 0 THEN
        RAISE EXCEPTION 'Error: La edad no es válida.';
    END IF;

    -- 3. Validaciones específicas según la edad (Lógica de Negocio)
    IF p_edad_familiar > 18 THEN
        -- Validación para Cargo Mayor
        IF p_estudios IS NULL OR p_estudios NOT IN ('Primaria', 'Bachiller', 'Técnico', 'Universitario', 'Postgrado') THEN
            RAISE EXCEPTION 'Error: Para familiares mayores de 18 años, debe indicar un nivel de estudios válido (Primaria, Bachiller, Técnico, Universitario, Postgrado).';
        END IF;
    ELSE
        -- Validación para Cargo Menor
        IF p_vacunacion IS NULL OR TRIM(p_vacunacion) = '' THEN
            RAISE EXCEPTION 'Error: Para familiares de 18 años o menos, debe proporcionar los datos de vacunación.';
        END IF;
        
        IF p_educacion_inicial IS NULL OR TRIM(p_educacion_inicial) = '' THEN
            RAISE EXCEPTION 'Error: Para familiares de 18 años o menos, debe indicar la educación inicial.';
        END IF;
    END IF;

    -- 4. Insertar en la tabla principal de Familiar
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

    -- 5. Insertar en la sub-entidad correspondiente
    IF p_edad_familiar > 18 THEN
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
