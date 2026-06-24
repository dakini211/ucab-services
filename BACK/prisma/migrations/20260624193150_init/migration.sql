-- CreateTable
CREATE TABLE "acompanante" (
    "id_miembro" BIGINT NOT NULL,
    "id_servicio" INTEGER NOT NULL,
    "fecha_de_creacion" TIMESTAMP(6) NOT NULL,
    "ci" VARCHAR(20) NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "activo" VARCHAR(50) NOT NULL,

    CONSTRAINT "pk_acompanante" PRIMARY KEY ("id_miembro","id_servicio","fecha_de_creacion","ci")
);

-- CreateTable
CREATE TABLE "administrativo" (
    "id_miembro" BIGINT NOT NULL,
    "carga_horaria_semanal" INTEGER NOT NULL,
    "unidad_presupuestaria" VARCHAR(100) NOT NULL,

    CONSTRAINT "administrativo_pkey" PRIMARY KEY ("id_miembro")
);

-- CreateTable
CREATE TABLE "billetera_digital" (
    "uid" VARCHAR(100) NOT NULL,
    "id_miembro" BIGINT NOT NULL,
    "saldo" DECIMAL(15,2) NOT NULL DEFAULT 0.00,

    CONSTRAINT "billetera_digital_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "cargo_mayor" (
    "cedula" VARCHAR(15) NOT NULL,
    "estudios" VARCHAR(150) NOT NULL,

    CONSTRAINT "cargo_mayor_pkey" PRIMARY KEY ("cedula")
);

-- CreateTable
CREATE TABLE "cargo_menor" (
    "cedula" VARCHAR(15) NOT NULL,
    "vacunacion" TEXT,
    "educacion_inicial" VARCHAR(150),

    CONSTRAINT "cargo_menor_pkey" PRIMARY KEY ("cedula")
);

-- CreateTable
CREATE TABLE "criptomoneda" (
    "numero_de_control" VARCHAR(50) NOT NULL,
    "fecha_operacion" TIMESTAMP(6) NOT NULL,
    "dxid" VARCHAR(255) NOT NULL,
    "red" VARCHAR(50) NOT NULL,
    "billetera" VARCHAR(255) NOT NULL,
    "tasa" DECIMAL(20,8) NOT NULL,

    CONSTRAINT "pk_cripto" PRIMARY KEY ("numero_de_control","fecha_operacion")
);

-- CreateTable
CREATE TABLE "edificacion" (
    "nombre_edificacion" VARCHAR(50) NOT NULL,
    "direccion_interna" TEXT NOT NULL,
    "nombre_sede" VARCHAR(150) NOT NULL,

    CONSTRAINT "pk_edificacion" PRIMARY KEY ("nombre_edificacion","direccion_interna")
);

-- CreateTable
CREATE TABLE "efectivo" (
    "numero_de_control" VARCHAR(50) NOT NULL,
    "fecha_operacion" TIMESTAMP(6) NOT NULL,
    "monto" DECIMAL(15,2) NOT NULL,
    "tasa" DECIMAL(20,8) NOT NULL,

    CONSTRAINT "pk_efectivo" PRIMARY KEY ("numero_de_control","fecha_operacion")
);

-- CreateTable
CREATE TABLE "egresado" (
    "id_miembro" BIGINT NOT NULL,
    "año_graduacion" INTEGER NOT NULL,
    "titulo_obtenido" VARCHAR(150) NOT NULL,
    "promedio_final" DECIMAL(4,2) NOT NULL,

    CONSTRAINT "egresado_pkey" PRIMARY KEY ("id_miembro")
);

-- CreateTable
CREATE TABLE "entidad_prestadora" (
    "nombre_entidad" VARCHAR(150) NOT NULL,
    "categoria" VARCHAR(100) NOT NULL,
    "ajuste" VARCHAR(255),

    CONSTRAINT "entidad_prestadora_pkey" PRIMARY KEY ("nombre_entidad")
);

-- CreateTable
CREATE TABLE "entidad_propia" (
    "nombre_entidad" VARCHAR(150) NOT NULL,
    "cod_presupuestario" VARCHAR(50) NOT NULL,
    "dir_oficina" TEXT NOT NULL,

    CONSTRAINT "entidad_propia_pkey" PRIMARY KEY ("nombre_entidad")
);

-- CreateTable
CREATE TABLE "espacio_fisico" (
    "nro" INTEGER NOT NULL,
    "nombre_edificacion" VARCHAR(50) NOT NULL,
    "direccion_interna" TEXT NOT NULL,
    "tipo_inmobiliario" VARCHAR(50) NOT NULL,
    "capacidad_maxima_aforo" INTEGER NOT NULL,

    CONSTRAINT "pk_espacio_fisico" PRIMARY KEY ("nombre_edificacion","direccion_interna","nro")
);

-- CreateTable
CREATE TABLE "estudiante" (
    "id_miembro" BIGINT NOT NULL,
    "promedio" DECIMAL(4,2) NOT NULL DEFAULT 0.00,
    "uc_aprobadas" INTEGER NOT NULL DEFAULT 0,
    "semestre_actual" INTEGER NOT NULL,
    "escuela" VARCHAR(100) NOT NULL,
    "facultad" VARCHAR(100) NOT NULL,
    "tipo_beca" VARCHAR(30),

    CONSTRAINT "estudiante_pkey" PRIMARY KEY ("id_miembro")
);

-- CreateTable
CREATE TABLE "factura" (
    "numero_de_control" VARCHAR(50) NOT NULL,
    "fecha_de_emision" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estatus" VARCHAR(50) NOT NULL,
    "id_miembro" BIGINT NOT NULL,
    "id_servicio" INTEGER NOT NULL,
    "fecha_de_creacion" TIMESTAMP(6) NOT NULL,
    "nro_de_folio" VARCHAR(50) NOT NULL,

    CONSTRAINT "pk_factura" PRIMARY KEY ("numero_de_control")
);

-- CreateTable
CREATE TABLE "familiar" (
    "cedula" VARCHAR(15) NOT NULL,
    "id_personal_ucab" BIGINT NOT NULL,
    "nombre_familiar" VARCHAR(100) NOT NULL,
    "parentesco" VARCHAR(50) NOT NULL,
    "edad_familiar" INTEGER NOT NULL,
    "fecha_de_inicio" DATE NOT NULL,
    "fecha_de_fin" DATE,

    CONSTRAINT "familiar_pkey" PRIMARY KEY ("cedula")
);

-- CreateTable
CREATE TABLE "folio" (
    "id_miembro" BIGINT NOT NULL,
    "id_servicio" INTEGER NOT NULL,
    "fecha_de_creacion" TIMESTAMP(6) NOT NULL,
    "nro_de_folio" VARCHAR(50) NOT NULL,
    "estado" VARCHAR(50) NOT NULL,
    "fecha_inicio_mes" DATE NOT NULL,
    "fecha_fin_mes" DATE,

    CONSTRAINT "pk_folio" PRIMARY KEY ("id_miembro","id_servicio","fecha_de_creacion","nro_de_folio")
);

-- CreateTable
CREATE TABLE "historial_contrasena" (
    "id_miembro" BIGINT NOT NULL,
    "fecha_inicio" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contrasena" VARCHAR(255) NOT NULL,
    "fecha_fin" TIMESTAMP(6),

    CONSTRAINT "pk_historial_contrasena" PRIMARY KEY ("id_miembro","fecha_inicio")
);

-- CreateTable
CREATE TABLE "historial_miembro" (
    "id_miembro" BIGINT NOT NULL,
    "fecha_inicio" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_fin" TIMESTAMP(6),

    CONSTRAINT "pk_historial_miembro" PRIMARY KEY ("id_miembro","fecha_inicio")
);

-- CreateTable
CREATE TABLE "historial_reservas" (
    "id_servicio" INTEGER NOT NULL,
    "nro" INTEGER NOT NULL,
    "nombre_edificacion" VARCHAR(50) NOT NULL,
    "direccion_interna" TEXT NOT NULL,
    "fecha_reserva" DATE NOT NULL,
    "hora_inicio" TIME(6) NOT NULL,
    "hora_fin" TIME(6) NOT NULL,

    CONSTRAINT "pk_historial_reservas" PRIMARY KEY ("id_servicio","nro","nombre_edificacion","direccion_interna","fecha_reserva")
);

-- CreateTable
CREATE TABLE "historial_sesiones" (
    "id_miembro" BIGINT NOT NULL,
    "identificador_uuid" BIGSERIAL NOT NULL,
    "lugar_conexion" TEXT NOT NULL,
    "direccion_ip" VARCHAR(45) NOT NULL,
    "fecha_inicio" DATE NOT NULL,
    "hora_inicio" TIME(0),
    "hora_fin" TIME(0),

    CONSTRAINT "pk_historial_sesiones" PRIMARY KEY ("id_miembro","identificador_uuid")
);

-- CreateTable
CREATE TABLE "historico_tarifa" (
    "id_servicio" INTEGER NOT NULL,
    "fecha_inicio" DATE NOT NULL,
    "tarifa_precio" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "pk_historico_tarifa" PRIMARY KEY ("id_servicio","fecha_inicio")
);

-- CreateTable
CREATE TABLE "items_consumo" (
    "id_miembro" BIGINT NOT NULL,
    "id_servicio" INTEGER NOT NULL,
    "fecha_de_creacion" TIMESTAMP(6) NOT NULL,
    "nro_de_folio" VARCHAR(50) NOT NULL,
    "concepto" VARCHAR(150) NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "impuesto_ley" DECIMAL(5,2) NOT NULL,
    "precio_unitario" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "pk_items_consumo" PRIMARY KEY ("id_miembro","id_servicio","fecha_de_creacion","nro_de_folio","concepto")
);

-- CreateTable
CREATE TABLE "metodo_pago" (
    "numero_de_control" VARCHAR(50) NOT NULL,
    "fecha_operacion" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "pk_metodo_pago" PRIMARY KEY ("numero_de_control","fecha_operacion")
);

-- CreateTable
CREATE TABLE "miembro" (
    "id_miembro" BIGSERIAL NOT NULL,
    "cedula_identidad" INTEGER NOT NULL,
    "primer_nombre" VARCHAR(50) NOT NULL,
    "segundo_nombre" VARCHAR(50),
    "primer_apellido" VARCHAR(50) NOT NULL,
    "segundo_apellido" VARCHAR(50),
    "fecha_nacimiento" DATE NOT NULL,
    "telefono" VARCHAR(20) NOT NULL,
    "correo_institucional" VARCHAR(100) NOT NULL,
    "direccion_habitacion" TEXT NOT NULL,
    "total_sesiones" INTEGER NOT NULL DEFAULT 0,
    "estado_cuenta" VARCHAR(15) NOT NULL DEFAULT 'activa',

    CONSTRAINT "miembro_pkey" PRIMARY KEY ("id_miembro")
);

-- CreateTable
CREATE TABLE "obtiene" (
    "numero_de_control" VARCHAR(50) NOT NULL,
    "fecha_operacion" TIMESTAMP(6) NOT NULL,
    "moneda_origen" VARCHAR(10) NOT NULL,
    "moneda_destino" VARCHAR(10) NOT NULL,
    "fecha_vigencia" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "pk_obtiene" PRIMARY KEY ("numero_de_control","fecha_operacion","moneda_origen","moneda_destino","fecha_vigencia")
);

-- CreateTable
CREATE TABLE "oferta" (
    "nombre_entidad" VARCHAR(150) NOT NULL,
    "cargo" VARCHAR(100) NOT NULL,
    "id_miembro" BIGINT NOT NULL,

    CONSTRAINT "pk_oferta" PRIMARY KEY ("nombre_entidad","cargo","id_miembro")
);

-- CreateTable
CREATE TABLE "oferta_laboral" (
    "nombre_entidad" VARCHAR(150) NOT NULL,
    "cargo" VARCHAR(100) NOT NULL,
    "responsabilidades" TEXT NOT NULL,
    "beneficios" TEXT NOT NULL,
    "perfil_buscado" TEXT NOT NULL,
    "fecha_oferta" DATE NOT NULL,
    "estatus_vacante" VARCHAR(15) NOT NULL DEFAULT 'disponible',

    CONSTRAINT "pk_oferta_laboral" PRIMARY KEY ("nombre_entidad","cargo")
);

-- CreateTable
CREATE TABLE "opera" (
    "nombre_entidad" VARCHAR(150) NOT NULL,
    "nombre_sede" VARCHAR(150) NOT NULL,

    CONSTRAINT "opera_pkey" PRIMARY KEY ("nombre_entidad")
);

-- CreateTable
CREATE TABLE "organizacion_externa" (
    "nombre_entidad" VARCHAR(150) NOT NULL,
    "rif" VARCHAR(20) NOT NULL,
    "razon_social" VARCHAR(150) NOT NULL,
    "precio_institucional" DECIMAL(10,2) NOT NULL,
    "fecha_contrato" DATE NOT NULL,
    "contacto_lega" VARCHAR(150) NOT NULL,

    CONSTRAINT "organizacion_externa_pkey" PRIMARY KEY ("nombre_entidad")
);

-- CreateTable
CREATE TABLE "pago_movil" (
    "numero_de_control" VARCHAR(50) NOT NULL,
    "fecha_operacion" TIMESTAMP(6) NOT NULL,
    "telefono_emisor" VARCHAR(20) NOT NULL,
    "banco" VARCHAR(50) NOT NULL,
    "referencia" VARCHAR(50) NOT NULL,

    CONSTRAINT "pk_pago_movil" PRIMARY KEY ("numero_de_control","fecha_operacion")
);

-- CreateTable
CREATE TABLE "personal_ucab" (
    "id_miembro" BIGINT NOT NULL,

    CONSTRAINT "personal_ucab_pkey" PRIMARY KEY ("id_miembro")
);

-- CreateTable
CREATE TABLE "preparador" (
    "id_miembro" BIGINT NOT NULL,
    "tipo_asignatura" VARCHAR(100) NOT NULL,
    "horas_ayudantia" INTEGER NOT NULL,

    CONSTRAINT "preparador_pkey" PRIMARY KEY ("id_miembro")
);

-- CreateTable
CREATE TABLE "profesor" (
    "id_miembro" BIGINT NOT NULL,
    "codigo_investigador" VARCHAR(50),
    "escalafon_docente" VARCHAR(50) NOT NULL,
    "carga_horaria_semanal" INTEGER NOT NULL,

    CONSTRAINT "profesor_pkey" PRIMARY KEY ("id_miembro")
);

-- CreateTable
CREATE TABLE "publica" (
    "id_servicio" INTEGER NOT NULL,
    "nombre_entidad" VARCHAR(150) NOT NULL,

    CONSTRAINT "pk_publica" PRIMARY KEY ("id_servicio")
);

-- CreateTable
CREATE TABLE "recurso_tecnologicos" (
    "descripcion" VARCHAR(100) NOT NULL,
    "nombre_edificacion" VARCHAR(50) NOT NULL,
    "direccion_interna" TEXT NOT NULL,
    "nro" INTEGER NOT NULL,
    "estado_mantenimiento" VARCHAR(15) NOT NULL DEFAULT 'operativo',

    CONSTRAINT "pk_recurso_tecnologico" PRIMARY KEY ("nombre_edificacion","direccion_interna","nro","descripcion")
);

-- CreateTable
CREATE TABLE "sede" (
    "nombre_sede" VARCHAR(150) NOT NULL,
    "tarifa_min" DECIMAL(10,2) NOT NULL,
    "tarifa_max" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "sede_pkey" PRIMARY KEY ("nombre_sede")
);

-- CreateTable
CREATE TABLE "servicio" (
    "id_servicio" INTEGER NOT NULL,
    "nombre_servicio" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "costo" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "servicio_pkey" PRIMARY KEY ("id_servicio")
);

-- CreateTable
CREATE TABLE "solicitud_servicio" (
    "id_miembro" BIGINT NOT NULL,
    "id_servicio" INTEGER NOT NULL,
    "fecha_de_creacion" TIMESTAMP(6) NOT NULL,
    "estado" VARCHAR(50) NOT NULL,
    "resolucion" TEXT,

    CONSTRAINT "pk_solicitud_servicio" PRIMARY KEY ("id_miembro","id_servicio","fecha_de_creacion")
);

-- CreateTable
CREATE TABLE "tai" (
    "numero_de_control" VARCHAR(50) NOT NULL,
    "fecha_operacion" TIMESTAMP(6) NOT NULL,
    "uid" VARCHAR(100) NOT NULL,
    "pos" VARCHAR(50) NOT NULL,
    "remanente" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "pk_tai" PRIMARY KEY ("numero_de_control","fecha_operacion")
);

-- CreateTable
CREATE TABLE "tarjeta" (
    "numero_de_control" VARCHAR(50) NOT NULL,
    "fecha_operacion" TIMESTAMP(6) NOT NULL,
    "nro_tarjeta" VARCHAR(20) NOT NULL,
    "vencimiento" VARCHAR(5) NOT NULL,
    "compania" VARCHAR(50) NOT NULL,
    "red" VARCHAR(20) NOT NULL,

    CONSTRAINT "pk_tarjeta" PRIMARY KEY ("numero_de_control","fecha_operacion")
);

-- CreateTable
CREATE TABLE "tasa_cambio" (
    "moneda_origen" VARCHAR(10) NOT NULL,
    "moneda_destino" VARCHAR(10) NOT NULL,
    "fecha_vigencia" TIMESTAMP(6) NOT NULL,
    "valor_tasa" DECIMAL(20,8) NOT NULL,

    CONSTRAINT "pk_tasa_cambio" PRIMARY KEY ("moneda_origen","moneda_destino","fecha_vigencia")
);

-- CreateTable
CREATE TABLE "zelle" (
    "numero_de_control" VARCHAR(50) NOT NULL,
    "fecha_operacion" TIMESTAMP(6) NOT NULL,
    "correo" VARCHAR(150) NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "confirmacion" VARCHAR(100) NOT NULL,

    CONSTRAINT "pk_zelle" PRIMARY KEY ("numero_de_control","fecha_operacion")
);

-- CreateIndex
CREATE UNIQUE INDEX "billetera_digital_id_miembro_key" ON "billetera_digital"("id_miembro");

-- CreateIndex
CREATE UNIQUE INDEX "criptomoneda_dxid_key" ON "criptomoneda"("dxid");

-- CreateIndex
CREATE UNIQUE INDEX "id_entidad_propia" ON "entidad_propia"("cod_presupuestario", "dir_oficina");

-- CreateIndex
CREATE UNIQUE INDEX "uq_factura_folio" ON "factura"("id_miembro", "id_servicio", "fecha_de_creacion", "nro_de_folio");

-- CreateIndex
CREATE UNIQUE INDEX "miembro_cedula_identidad_key" ON "miembro"("cedula_identidad");

-- CreateIndex
CREATE UNIQUE INDEX "miembro_correo_institucional_key" ON "miembro"("correo_institucional");

-- CreateIndex
CREATE UNIQUE INDEX "uq_metodo_unica_tasa" ON "obtiene"("numero_de_control", "fecha_operacion");

-- CreateIndex
CREATE UNIQUE INDEX "organizacion_externa_rif_key" ON "organizacion_externa"("rif");

-- CreateIndex
CREATE UNIQUE INDEX "pago_movil_referencia_key" ON "pago_movil"("referencia");

-- CreateIndex
CREATE UNIQUE INDEX "zelle_confirmacion_key" ON "zelle"("confirmacion");

-- AddForeignKey
ALTER TABLE "acompanante" ADD CONSTRAINT "fk_acompanante_solicitud" FOREIGN KEY ("id_miembro", "id_servicio", "fecha_de_creacion") REFERENCES "solicitud_servicio"("id_miembro", "id_servicio", "fecha_de_creacion") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "administrativo" ADD CONSTRAINT "fk_administrativo_personal" FOREIGN KEY ("id_miembro") REFERENCES "personal_ucab"("id_miembro") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "billetera_digital" ADD CONSTRAINT "fk_billetera_miembro" FOREIGN KEY ("id_miembro") REFERENCES "miembro"("id_miembro") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cargo_mayor" ADD CONSTRAINT "fk_mayor_familiar" FOREIGN KEY ("cedula") REFERENCES "familiar"("cedula") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cargo_menor" ADD CONSTRAINT "fk_menor_familiar" FOREIGN KEY ("cedula") REFERENCES "familiar"("cedula") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "criptomoneda" ADD CONSTRAINT "fk_cripto_metodo" FOREIGN KEY ("numero_de_control", "fecha_operacion") REFERENCES "metodo_pago"("numero_de_control", "fecha_operacion") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "edificacion" ADD CONSTRAINT "fk_edificacion" FOREIGN KEY ("nombre_sede") REFERENCES "sede"("nombre_sede") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "efectivo" ADD CONSTRAINT "fk_efectivo_metodo" FOREIGN KEY ("numero_de_control", "fecha_operacion") REFERENCES "metodo_pago"("numero_de_control", "fecha_operacion") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "egresado" ADD CONSTRAINT "fk_egresado_miembro" FOREIGN KEY ("id_miembro") REFERENCES "miembro"("id_miembro") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "entidad_propia" ADD CONSTRAINT "fk_propia_prestadora" FOREIGN KEY ("nombre_entidad") REFERENCES "entidad_prestadora"("nombre_entidad") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "espacio_fisico" ADD CONSTRAINT "fk_espacio_edificacion" FOREIGN KEY ("nombre_edificacion", "direccion_interna") REFERENCES "edificacion"("nombre_edificacion", "direccion_interna") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "estudiante" ADD CONSTRAINT "fk_estudiante_miembro" FOREIGN KEY ("id_miembro") REFERENCES "miembro"("id_miembro") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "factura" ADD CONSTRAINT "fk_factura_folio" FOREIGN KEY ("id_miembro", "id_servicio", "fecha_de_creacion", "nro_de_folio") REFERENCES "folio"("id_miembro", "id_servicio", "fecha_de_creacion", "nro_de_folio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "familiar" ADD CONSTRAINT "fk_familiar_personal" FOREIGN KEY ("id_personal_ucab") REFERENCES "personal_ucab"("id_miembro") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "folio" ADD CONSTRAINT "fk_folio_solicitud" FOREIGN KEY ("id_miembro", "id_servicio", "fecha_de_creacion") REFERENCES "solicitud_servicio"("id_miembro", "id_servicio", "fecha_de_creacion") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_contrasena" ADD CONSTRAINT "fk_hist_contrasena_miembro" FOREIGN KEY ("id_miembro") REFERENCES "miembro"("id_miembro") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "historial_miembro" ADD CONSTRAINT "fk_historial_miembro" FOREIGN KEY ("id_miembro") REFERENCES "miembro"("id_miembro") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "historial_reservas" ADD CONSTRAINT "fk_historial_reserva_servicio" FOREIGN KEY ("id_servicio") REFERENCES "servicio"("id_servicio") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "historial_reservas" ADD CONSTRAINT "fk_historial_reservas_espacio" FOREIGN KEY ("nombre_edificacion", "direccion_interna", "nro") REFERENCES "espacio_fisico"("nombre_edificacion", "direccion_interna", "nro") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "historial_sesiones" ADD CONSTRAINT "fk_hist_sesiones_miembro" FOREIGN KEY ("id_miembro") REFERENCES "miembro"("id_miembro") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "historico_tarifa" ADD CONSTRAINT "fk_historico_tarifa_servicio" FOREIGN KEY ("id_servicio") REFERENCES "servicio"("id_servicio") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "items_consumo" ADD CONSTRAINT "fk_items_folio" FOREIGN KEY ("id_miembro", "id_servicio", "fecha_de_creacion", "nro_de_folio") REFERENCES "folio"("id_miembro", "id_servicio", "fecha_de_creacion", "nro_de_folio") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metodo_pago" ADD CONSTRAINT "fk_metodo_factura" FOREIGN KEY ("numero_de_control") REFERENCES "factura"("numero_de_control") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "obtiene" ADD CONSTRAINT "fk_obtiene_metodo" FOREIGN KEY ("numero_de_control", "fecha_operacion") REFERENCES "metodo_pago"("numero_de_control", "fecha_operacion") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "obtiene" ADD CONSTRAINT "fk_obtiene_tasa" FOREIGN KEY ("moneda_origen", "moneda_destino", "fecha_vigencia") REFERENCES "tasa_cambio"("moneda_origen", "moneda_destino", "fecha_vigencia") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "oferta" ADD CONSTRAINT "fk_oferta_miembro" FOREIGN KEY ("id_miembro") REFERENCES "miembro"("id_miembro") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "oferta" ADD CONSTRAINT "fk_oferta_oferta_laboral" FOREIGN KEY ("nombre_entidad", "cargo") REFERENCES "oferta_laboral"("nombre_entidad", "cargo") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "oferta_laboral" ADD CONSTRAINT "fk_oferta_organizacion" FOREIGN KEY ("nombre_entidad") REFERENCES "organizacion_externa"("nombre_entidad") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "opera" ADD CONSTRAINT "fk_opera_prestadora" FOREIGN KEY ("nombre_entidad") REFERENCES "entidad_prestadora"("nombre_entidad") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "opera" ADD CONSTRAINT "fk_opera_sede" FOREIGN KEY ("nombre_sede") REFERENCES "sede"("nombre_sede") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "organizacion_externa" ADD CONSTRAINT "fk_externa_prestadora" FOREIGN KEY ("nombre_entidad") REFERENCES "entidad_prestadora"("nombre_entidad") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pago_movil" ADD CONSTRAINT "fk_pm_metodo" FOREIGN KEY ("numero_de_control", "fecha_operacion") REFERENCES "metodo_pago"("numero_de_control", "fecha_operacion") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "personal_ucab" ADD CONSTRAINT "fk_personal_miembro" FOREIGN KEY ("id_miembro") REFERENCES "miembro"("id_miembro") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "preparador" ADD CONSTRAINT "fk_preparador_estudiante" FOREIGN KEY ("id_miembro") REFERENCES "estudiante"("id_miembro") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "profesor" ADD CONSTRAINT "fk_profesor_personal" FOREIGN KEY ("id_miembro") REFERENCES "personal_ucab"("id_miembro") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "publica" ADD CONSTRAINT "fk_publica_entidad_prestadora" FOREIGN KEY ("nombre_entidad") REFERENCES "entidad_prestadora"("nombre_entidad") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "publica" ADD CONSTRAINT "fk_publica_servicio" FOREIGN KEY ("id_servicio") REFERENCES "servicio"("id_servicio") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "recurso_tecnologicos" ADD CONSTRAINT "fk_recurso_espacio" FOREIGN KEY ("nombre_edificacion", "direccion_interna", "nro") REFERENCES "espacio_fisico"("nombre_edificacion", "direccion_interna", "nro") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "solicitud_servicio" ADD CONSTRAINT "fk_solicitud_miembro" FOREIGN KEY ("id_miembro") REFERENCES "miembro"("id_miembro") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "solicitud_servicio" ADD CONSTRAINT "fk_solicitud_servicio" FOREIGN KEY ("id_servicio") REFERENCES "servicio"("id_servicio") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tai" ADD CONSTRAINT "fk_tai_metodo" FOREIGN KEY ("numero_de_control", "fecha_operacion") REFERENCES "metodo_pago"("numero_de_control", "fecha_operacion") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tarjeta" ADD CONSTRAINT "fk_tarjeta_metodo" FOREIGN KEY ("numero_de_control", "fecha_operacion") REFERENCES "metodo_pago"("numero_de_control", "fecha_operacion") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "zelle" ADD CONSTRAINT "fk_zelle_metodo" FOREIGN KEY ("numero_de_control", "fecha_operacion") REFERENCES "metodo_pago"("numero_de_control", "fecha_operacion") ON DELETE CASCADE ON UPDATE NO ACTION;
