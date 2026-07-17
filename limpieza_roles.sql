SELECT
    p.proname                                          AS rutina,
    COUNT(*)                                           AS versiones,
    string_agg(p.oid::regprocedure::TEXT, E'\n  ' ORDER BY p.oid) AS firmas
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
GROUP BY p.proname
HAVING COUNT(*) > 1
ORDER BY p.proname;




SELECT
    p.oid::regprocedure AS firma_completa,
    CASE p.prokind WHEN 'p' THEN 'procedimiento' WHEN 'f' THEN 'función' END AS tipo,
    pg_get_userbyid(p.proowner) AS dueno
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
      'sp_cierre_masivo_folios',
      'sp_agregar_item_consumo',
      'sp_generar_factura',
      'sp_abrir_folio',
      'sp_registrar_pago',
      'sp_aplicar_oferta_laboral'
  )
ORDER BY p.proname, p.oid;


DO $$
DECLARE
    r RECORD;
    v_canonicas TEXT[] := ARRAY[
        'sp_abrir_folio(bigint,integer,timestamp without time zone,date,character varying)',
        'sp_agregar_item_consumo(bigint,integer,timestamp without time zone,character varying,character varying,integer,numeric,numeric)',
        'sp_generar_factura(bigint,integer,timestamp without time zone,character varying,character varying)',
        'sp_cierre_masivo_folios(date)',
        'sp_aplicar_oferta_laboral(bigint,character varying,character varying)'
    ];
    v_borradas INT := 0;
BEGIN
    FOR r IN
        SELECT
            p.oid::regprocedure AS firma,
            p.proname,
            p.prokind
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
          AND p.proname IN (
              'sp_abrir_folio', 'sp_agregar_item_consumo', 'sp_generar_factura',
              'sp_cierre_masivo_folios', 'sp_aplicar_oferta_laboral'
          )
    LOOP
        
        IF NOT (replace(r.firma::TEXT, ', ', ',') = ANY (v_canonicas)) THEN
            EXECUTE format('DROP %s %s',
                CASE r.prokind WHEN 'p' THEN 'PROCEDURE' ELSE 'FUNCTION' END,
                r.firma);
            RAISE NOTICE 'Sobrecarga eliminada: %', r.firma;
            v_borradas := v_borradas + 1;
        ELSE
            RAISE NOTICE 'Conservada (canónica): %', r.firma;
        END IF;
    END LOOP;

    RAISE NOTICE 'Total de sobrecargas eliminadas: %', v_borradas;
END $$;


