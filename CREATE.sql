-------------------------------------------------------------------------------
-- 1. BLOQUE: MIEMBRO Y SUS HISTORIALES
--------------------------------------------------------------------------------

CREATE TABLE Miembro (
    id_miembro BIGSERIAL PRIMARY KEY,          
    cedula_identidad INTEGER UNIQUE NOT NULL, 
    primer_nombre VARCHAR(50) NOT NULL,          
    segundo_nombre VARCHAR(50),                  
    primer_apellido VARCHAR(50) NOT NULL,         
    segundo_apellido VARCHAR(50),                
    fecha_nacimiento DATE NOT NULL,             
    telefono VARCHAR(20) NOT NULL,               
    correo_institucional VARCHAR(100) UNIQUE NOT NULL, 
    direccion_habitacion TEXT NOT NULL,         
    total_sesiones INT DEFAULT 0 NOT NULL,       
    estado_cuenta VARCHAR(15) DEFAULT 'activa' NOT NULL, 

    CONSTRAINT chk_estado_cuenta CHECK (estado_cuenta IN ('activa', 'suspendida', 'bloqueada'))
);

CREATE TABLE Historial_Contrasena (
    id_miembro BIGINT NOT NULL,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    contrasena VARCHAR(255) NOT NULL, 
    fecha_fin TIMESTAMP,
    
    CONSTRAINT pk_historial_contrasena PRIMARY KEY (id_miembro, fecha_inicio),
    CONSTRAINT fk_hist_contrasena_miembro FOREIGN KEY (id_miembro) REFERENCES Miembro(id_miembro) ON DELETE CASCADE,
    CONSTRAINT chk_fechas_contrasena CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio)
);

CREATE TABLE Historial_Sesiones (
    id_miembro BIGINT NOT NULL,
    identificador_UUID BIGSERIAL NOT NULL,
    lugar_conexion TEXT NOT NULL,
    direccion_ip VARCHAR(45) NOT NULL,
    fecha_inicio DATE NOT NULL,
    hora_inicio TIME(0), 
    hora_fin TIME(0),
    
    CONSTRAINT pk_historial_sesiones PRIMARY KEY (id_miembro, identificador_UUID),
    CONSTRAINT fk_hist_sesiones_miembro FOREIGN KEY (id_miembro) REFERENCES Miembro(id_miembro) ON DELETE CASCADE
);

CREATE TABLE Historial_Miembro (
    id_miembro BIGINT NOT NULL,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP,

    CONSTRAINT pk_historial_miembro PRIMARY KEY (id_miembro, fecha_inicio),
    CONSTRAINT fk_historial_miembro FOREIGN KEY (id_miembro) REFERENCES Miembro(id_miembro) ON DELETE CASCADE,
    CONSTRAINT chk_fechas_historial_miembro CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio)
);

--------------------------------------------------------------------------------
-- 2. BLOQUE: JERARQUÍA DE MIEMBROS
--------------------------------------------------------------------------------
CREATE TABLE Estudiante (
    id_miembro BIGINT PRIMARY KEY, 
    promedio NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    uc_aprobadas INT NOT NULL DEFAULT 0,
    semestre_actual INT NOT NULL,
    escuela VARCHAR(100) NOT NULL,
    facultad VARCHAR(100) NOT NULL,
    tipo_beca VARCHAR(30), 
    
    CONSTRAINT fk_estudiante_miembro FOREIGN KEY (id_miembro) 
        REFERENCES Miembro (id_miembro) ON DELETE CASCADE,
    CONSTRAINT chk_tipo_beca CHECK (tipo_beca IN ('ayuda económica', 'excelencia', 'comedor'))
);

CREATE TABLE Preparador (
    id_miembro BIGINT PRIMARY KEY,
    tipo_asignatura VARCHAR(100) NOT NULL,
    horas_ayudantia INT NOT NULL,
    
    CONSTRAINT fk_preparador_estudiante FOREIGN KEY (id_miembro) 
        REFERENCES Estudiante (id_miembro) ON DELETE CASCADE
);

CREATE TABLE Egresado (
    id_miembro BIGINT PRIMARY KEY,
    año_graduacion INT NOT NULL,
    titulo_obtenido VARCHAR(150) NOT NULL,
    promedio_final NUMERIC(4,2) NOT NULL,
    
    CONSTRAINT fk_egresado_miembro FOREIGN KEY (id_miembro) 
        REFERENCES Miembro (id_miembro) ON DELETE CASCADE
);

CREATE TABLE Personal_ucab (
    id_miembro BIGINT PRIMARY KEY,
    
    CONSTRAINT fk_personal_miembro FOREIGN KEY (id_miembro) 
        REFERENCES Miembro (id_miembro) ON DELETE CASCADE
);

CREATE TABLE Profesor (
    id_miembro BIGINT PRIMARY KEY,
    codigo_investigador VARCHAR(50), 
    escalafon_docente VARCHAR(50) NOT NULL,
    carga_horaria_semanal INT NOT NULL,
    
    CONSTRAINT fk_profesor_personal FOREIGN KEY (id_miembro) 
        REFERENCES Personal_ucab (id_miembro) ON DELETE CASCADE
);

CREATE TABLE Administrativo (
    id_miembro BIGINT PRIMARY KEY,
    carga_horaria_semanal INT NOT NULL,
    unidad_presupuestaria VARCHAR(100) NOT NULL, 
    
    CONSTRAINT fk_administrativo_personal FOREIGN KEY (id_miembro) 
        REFERENCES Personal_ucab (id_miembro) ON DELETE CASCADE
);

--------------------------------------------------------------------------------
-- 3. BLOQUE: FAMILIARES Y CARGAS
--------------------------------------------------------------------------------
CREATE TABLE Familiar (
    cedula INTEGER PRIMARY KEY,             
    id_personal_ucab BIGINT NOT NULL,          
    nombre_familiar VARCHAR(100) NOT NULL,      
    parentesco VARCHAR(50) NOT NULL,            
    edad_familiar INT NOT NULL,                 
    fecha_de_inicio DATE NOT NULL,              
    fecha_de_fin DATE,                          

    CONSTRAINT fk_familiar_personal FOREIGN KEY (id_personal_ucab)
        REFERENCES Personal_ucab (id_miembro) ON DELETE CASCADE,
    CONSTRAINT chk_fechas_familiar CHECK (fecha_de_fin IS NULL OR fecha_de_fin >= fecha_de_inicio)
);

CREATE TABLE cargo_mayor (
    cedula INTEGER PRIMARY KEY,             
    estudios VARCHAR(150) NOT NULL,             
    
    CONSTRAINT fk_mayor_familiar FOREIGN KEY (cedula)
        REFERENCES Familiar (cedula) ON DELETE CASCADE
);

CREATE TABLE cargo_menor (
    cedula INTEGER PRIMARY KEY,             
    vacunacion TEXT,                            
    educacion_inicial VARCHAR(150),             
    
    CONSTRAINT fk_menor_familiar FOREIGN KEY (cedula)
        REFERENCES Familiar (cedula) ON DELETE CASCADE
);

--------------------------------------------------------------------------------
-- 4. BLOQUE: INFRAESTRUCTURA DE SEDES
--------------------------------------------------------------------------------
CREATE TABLE Sede (
    nombre_sede VARCHAR(150) PRIMARY KEY,        
    tarifa_min NUMERIC(10, 2) NOT NULL,          
    tarifa_max NUMERIC(10, 2) NOT NULL,          
    
    CONSTRAINT chk_tarifas_sede CHECK (tarifa_max >= tarifa_min)
);

CREATE TABLE Edificacion (
    nombre_edificacion VARCHAR(50) NOT NULL,
    direccion_interna TEXT NOT NULL,
    nombre_sede VARCHAR(150) NOT NULL,

    CONSTRAINT pk_edificacion PRIMARY KEY(nombre_edificacion, direccion_interna),
    CONSTRAINT fk_edificacion FOREIGN KEY(nombre_sede) REFERENCES Sede(nombre_sede) ON DELETE CASCADE
);

CREATE TABLE Espacio_Fisico (
    nro INT NOT NULL, -- Cambiado de NUMBER a INT
    nombre_edificacion VARCHAR(50) NOT NULL,
    direccion_interna TEXT NOT NULL,
    tipo_inmobiliario VARCHAR(50) NOT NULL,
    capacidad_maxima_aforo INT NOT NULL, -- Cambiado de NUMBER a INT
    
    CONSTRAINT pk_espacio_fisico PRIMARY KEY(nombre_edificacion, direccion_interna, nro),
    CONSTRAINT fk_espacio_edificacion FOREIGN KEY(nombre_edificacion, direccion_interna) 
        REFERENCES Edificacion(nombre_edificacion, direccion_interna) ON DELETE CASCADE
);

CREATE TABLE Recurso_Tecnologicos (
    descripcion VARCHAR(100) NOT NULL,
    nombre_edificacion VARCHAR(50) NOT NULL,
    direccion_interna TEXT NOT NULL,
    nro INT NOT NULL, -- Cambiado de NUMBER a INT
    estado_mantenimiento VARCHAR(15) DEFAULT 'operativo' NOT NULL,
    
    CONSTRAINT pk_recurso_tecnologico PRIMARY KEY(nombre_edificacion, direccion_interna, nro, descripcion),
    CONSTRAINT fk_recurso_espacio FOREIGN KEY(nombre_edificacion, direccion_interna, nro) 
        REFERENCES Espacio_Fisico(nombre_edificacion, direccion_interna, nro) ON DELETE CASCADE,
    CONSTRAINT chk_estado_recurso CHECK (estado_mantenimiento IN ('operativo', 'mantenimiento', 'desactivado')) -- Homologados en masculino
);

--------------------------------------------------------------------------------
-- 5. BLOQUE: ENTIDADES PRESTADORAS Y RELACIÓN OPERA
--------------------------------------------------------------------------------
CREATE TABLE Entidad_Prestadora (
    nombre_entidad VARCHAR(150) PRIMARY KEY,     
    categoria VARCHAR(100) NOT NULL,             
    ajuste VARCHAR(255)                          
);

CREATE TABLE Opera (
    nombre_entidad VARCHAR(150) PRIMARY KEY, 				
    nombre_sede VARCHAR(150) NOT NULL,           
    
    CONSTRAINT fk_opera_prestadora FOREIGN KEY (nombre_entidad)
        REFERENCES Entidad_Prestadora (nombre_entidad) ON DELETE CASCADE,
    CONSTRAINT fk_opera_sede FOREIGN KEY (nombre_sede)
        REFERENCES Sede (nombre_sede) ON DELETE RESTRICT
);

CREATE TABLE Entidad_Propia (
    nombre_entidad VARCHAR(150) PRIMARY KEY,     
    cod_presupuestario VARCHAR(50) NOT NULL,     
    dir_oficina TEXT NOT NULL,                   

    CONSTRAINT fk_propia_prestadora FOREIGN KEY (nombre_entidad)
        REFERENCES Entidad_Prestadora (nombre_entidad) ON DELETE CASCADE,
    CONSTRAINT id_entidad_propia UNIQUE (cod_presupuestario, dir_oficina)
);

CREATE TABLE Organizacion_externa (
    nombre_entidad VARCHAR(150) PRIMARY KEY,     
    rif VARCHAR(20) UNIQUE NOT NULL,             
    razon_social VARCHAR(150) NOT NULL,          
    precio_institucional NUMERIC(10, 2) NOT NULL,
    fecha_contrato DATE NOT NULL,                
    contacto_lega VARCHAR(150) NOT NULL,         

    CONSTRAINT fk_externa_prestadora FOREIGN KEY (nombre_entidad)
        REFERENCES Entidad_Prestadora (nombre_entidad) ON DELETE CASCADE
);

--------------------------------------------------------------------------------
--6 Ofertas laborales
--------------------------------------------------------------------------------

CREATE TABLE Oferta_laboral (
    nombre_entidad VARCHAR(150) NOT NULL,        
    cargo VARCHAR(100) NOT NULL,                 
    responsabilidades TEXT NOT NULL,             
    beneficios TEXT NOT NULL,                    
    perfil_buscado TEXT NOT NULL,                
    fecha_oferta DATE NOT NULL,                  
    estatus_vacante VARCHAR(15) DEFAULT 'disponible' NOT NULL, 

    CONSTRAINT pk_oferta_laboral PRIMARY KEY (nombre_entidad, cargo),
    
    CONSTRAINT fk_oferta_organizacion FOREIGN KEY (nombre_entidad)
        REFERENCES Organizacion_externa (nombre_entidad) ON DELETE CASCADE,         
    CONSTRAINT chk_estatus_vacante CHECK (estatus_vacante IN ('disponible', 'finalizada'))
);

CREATE TABLE Oferta (
    nombre_entidad VARCHAR(150) NOT NULL,
    cargo VARCHAR(100) NOT NULL,
    id_miembro BIGINT NOT NULL,

    -- PK ahora incluye id_miembro → muchos miembros pueden postularse a la misma oferta
    CONSTRAINT pk_oferta PRIMARY KEY (nombre_entidad, cargo, id_miembro),
    
    CONSTRAINT fk_oferta_oferta_laboral FOREIGN KEY (nombre_entidad, cargo) 
        REFERENCES Oferta_laboral (nombre_entidad, cargo) ON DELETE CASCADE,
        
    CONSTRAINT fk_oferta_miembro FOREIGN KEY (id_miembro) 
        REFERENCES Miembro (id_miembro) ON DELETE CASCADE
);



--------------------------------------------------------------------------------
--7:SERVICIO 
--------------------------------------------------------------------------------


CREATE TABLE Servicio (  
    id_servicio INT PRIMARY KEY,    
    nombre_servicio VARCHAR(100) NOT NULL,
    descripcion TEXT,
    costo NUMERIC(10, 2) NOT NULL,   
    
    CONSTRAINT chk_costo_positivo CHECK (costo >= 0)
);

CREATE TABLE Solicitud_servicio (
   id_miembro BIGINT NOT NULL,
   id_servicio INT NOT NULL,
   fecha_de_creacion TIMESTAMP NOT NULL,
   estado VARCHAR(50) NOT NULL,
   resolucion TEXT,
 
   CONSTRAINT pk_solicitud_servicio PRIMARY KEY (id_miembro, id_servicio, fecha_de_creacion),
 
   CONSTRAINT fk_solicitud_miembro FOREIGN KEY (id_miembro)
       REFERENCES Miembro (id_miembro) ON DELETE CASCADE,
 
   CONSTRAINT fk_solicitud_servicio FOREIGN KEY (id_servicio)
       REFERENCES Servicio (id_servicio) ON DELETE RESTRICT,
 
   -- Dominio del estado. 'aprobada' es OBLIGATORIO en la lista:
   -- sp_reservar_espacio() en pl.sql inserta ese valor literal.
   CONSTRAINT chk_estado_solicitud
       CHECK (estado IN ('pendiente', 'aprobada', 'rechazada', 'finalizada'))
);







CREATE TABLE Acompanante (
    -- Herencia obligatoria de la PK del padre (Solicitud_servicio)
    id_miembro BIGINT NOT NULL,
    id_servicio INT NOT NULL,
    fecha_de_creacion TIMESTAMP NOT NULL,      
    ci INT NOT NULL,
    
    
    nombre VARCHAR(150) NOT NULL,
    activo VARCHAR(50) NOT NULL, 
    
    -- PK Compuesta: Identidad anclada a la solicitud específica + la CI de la persona
    CONSTRAINT pk_acompanante PRIMARY KEY (id_miembro, id_servicio, fecha_de_creacion, ci),
    
    -- Relación identificadora en Cascada
    CONSTRAINT fk_acompanante_solicitud FOREIGN KEY (id_miembro, id_servicio, fecha_de_creacion)
        REFERENCES Solicitud_servicio (id_miembro, id_servicio, fecha_de_creacion) ON DELETE CASCADE
);

CREATE TABLE Historial_Reservas(
 id_servicio INT NOT NULL,
 nro INT NOT NULL, -- Cambiado de NUMBER a INT
 nombre_edificacion VARCHAR(50) NOT NULL,
 direccion_interna TEXT NOT NULL,
fecha_reserva Date NOT NULL,
hora_inicio TIME NOT NULL,
hora_fin TIME NOT NULL,
CONSTRAINT pk_historial_reservas PRIMARY KEY(id_servicio,nro , nombre_edificacion, direccion_interna, fecha_reserva) ,
CONSTRAINT fk_historial_reserva_servicio FOREIGN KEY(id_servicio) REFERENCES Servicio(id_servicio) ON DELETE CASCADE,
CONSTRAINT fk_historial_reservas_espacio FOREIGN KEY(nombre_edificacion, direccion_interna, nro) REFERENCES Espacio_Fisico(nombre_edificacion, direccion_interna, nro) ON DELETE CASCADE
);

CREATE TABLE Historico_Tarifa(
id_servicio INT NOT NULL,
fecha_inicio DATE NOT NULL,
tarifa_precio  NUMERIC(10, 2) NOT NULL,
CONSTRAINT pk_historico_tarifa PRIMARY KEY(id_servicio, fecha_inicio),
CONSTRAINT fk_historico_tarifa_servicio FOREIGN KEY(id_servicio) REFERENCES Servicio(id_servicio) ON DELETE CASCADE
);

CREATE TABLE Publica(
id_servicio INT NOT NULL,
nombre_entidad VARCHAR(150) NOT NULL,

CONSTRAINT pk_publica PRIMARY KEY(id_servicio),
CONSTRAINT fk_publica_servicio FOREIGN KEY(id_servicio) 
REFERENCES Servicio(id_servicio) ON DELETE CASCADE,
CONSTRAINT fk_publica_entidad_prestadora FOREIGN KEY (nombre_entidad) REFERENCES Entidad_Prestadora(nombre_entidad) ON DELETE CASCADE
);




--------------------------------------------------------------------------------
-- TABLA8: FOLIO
--------------------------------------------------------------------------------

CREATE TABLE Folio (
   id_miembro BIGINT NOT NULL,
   id_servicio INT NOT NULL,
   fecha_de_creacion TIMESTAMP NOT NULL,
   nro_de_folio VARCHAR(50) NOT NULL,
 
   estado VARCHAR(50) NOT NULL,
   fecha_inicio_mes DATE NOT NULL,
   fecha_fin_mes DATE,
 
   CONSTRAINT pk_folio PRIMARY KEY (id_miembro, id_servicio, fecha_de_creacion, nro_de_folio),
 
   CONSTRAINT fk_folio_solicitud FOREIGN KEY (id_miembro, id_servicio, fecha_de_creacion)
       REFERENCES Solicitud_servicio (id_miembro, id_servicio, fecha_de_creacion)
       ON DELETE CASCADE ON UPDATE CASCADE,

   CONSTRAINT chk_estado_folio
       CHECK (estado IN ('abierto', 'facturado')),

   -- fecha_fin_mes NULL = folio del mes en curso, aun sin cerrar.
   CONSTRAINT chk_fechas_folio
       CHECK (fecha_fin_mes IS NULL OR fecha_fin_mes >= fecha_inicio_mes),

   -- (fecha_de_creacion viaja en la PK del folio, por eso se puede comparar aqui)
   CONSTRAINT chk_folio_posterior_solicitud
       CHECK (fecha_inicio_mes >= fecha_de_creacion::DATE)
);


CREATE TABLE Items_Consumo (
   id_miembro BIGINT NOT NULL,
   id_servicio INT NOT NULL,
   fecha_de_creacion TIMESTAMP NOT NULL,
   nro_de_folio VARCHAR(50) NOT NULL,
   concepto VARCHAR(150) NOT NULL,
 
   cantidad INT NOT NULL,
   impuesto_ley NUMERIC(5, 2) NOT NULL,
   precio_unitario NUMERIC(15, 2) NOT NULL, -- Valor congelado historicamente
 
   CONSTRAINT pk_items_consumo PRIMARY KEY (id_miembro, id_servicio, fecha_de_creacion, nro_de_folio, concepto),
 
   CONSTRAINT fk_items_folio FOREIGN KEY (id_miembro, id_servicio, fecha_de_creacion, nro_de_folio)
       REFERENCES Folio (id_miembro, id_servicio, fecha_de_creacion, nro_de_folio)
       ON DELETE CASCADE ON UPDATE CASCADE,
 
   -- Una linea de cargo sin unidades no tiene sentido de negocio.
   CONSTRAINT chk_cantidad_items
       CHECK (cantidad > 0), 

   CONSTRAINT chk_precio_unitario_items
       CHECK (precio_unitario >= 0),
 

   CONSTRAINT chk_impuesto_ley_items
       CHECK (impuesto_ley >= 0)
);


-------------------------------------------------------------------------------
-- TABLA9: FACTURA
--------------------------------------------------------------------------------


CREATE TABLE Factura (
   saldo NUMERIC(10, 2) NOT NULL,
   numero_de_control VARCHAR(50) NOT NULL,
   fecha_de_emision TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   estatus VARCHAR(50) NOT NULL,
 
   id_miembro BIGINT NOT NULL,
   id_servicio INT NOT NULL,
   fecha_de_creacion TIMESTAMP NOT NULL,
   nro_de_folio VARCHAR(50) NOT NULL,
 
   CONSTRAINT pk_factura PRIMARY KEY (numero_de_control),
 
   -- UNIQUE garantiza que un folio no se convierta en dos facturas
   CONSTRAINT uq_factura_folio UNIQUE (id_miembro, id_servicio, fecha_de_creacion, nro_de_folio),
 
   CONSTRAINT fk_factura_folio FOREIGN KEY (id_miembro, id_servicio, fecha_de_creacion, nro_de_folio)
       REFERENCES Folio (id_miembro, id_servicio, fecha_de_creacion, nro_de_folio)
       ON DELETE RESTRICT ON UPDATE CASCADE,
 
   CONSTRAINT chk_estatus_factura
       CHECK (estatus IN ('pendiente', 'parcial', 'pagada', 'anulada')),

   CONSTRAINT chk_saldo_factura
       CHECK (saldo >= 0),
 

   CONSTRAINT chk_saldo_vs_estatus
       CHECK (
           (estatus = 'pagada'    AND saldo = 0) OR
           (estatus = 'pendiente' AND saldo > 0) OR
           (estatus = 'parcial'   AND saldo > 0) OR
           (estatus = 'anulada')
       ),
 
   
   CONSTRAINT chk_fecha_emision_factura
       CHECK (fecha_de_emision >= fecha_de_creacion)
);



--------------------------------------------------------------------------------
-- 10. BLOQUE: TASAS DE CONVERSIÓN Y MÉTODOS DE PAGO
--------------------------------------------------------------------------------


CREATE TABLE Tasa_Cambio (
    moneda_origen VARCHAR(10) NOT NULL,
    moneda_destino VARCHAR(10) NOT NULL,
    fecha_vigencia TIMESTAMP NOT NULL,
    valor_tasa NUMERIC(20, 8) NOT NULL,
    
    CONSTRAINT pk_tasa_cambio PRIMARY KEY (moneda_origen, moneda_destino, fecha_vigencia)
);


CREATE TABLE Metodo_Pago (
    monto NUMERIC(10, 2) NOT NULL,
    numero_de_control VARCHAR(50) NOT NULL,
    fecha_operacion TIMESTAMP NOT NULL,
    
    CONSTRAINT pk_metodo_pago PRIMARY KEY (numero_de_control, fecha_operacion),
    
    CONSTRAINT fk_metodo_factura FOREIGN KEY (numero_de_control) 
        REFERENCES Factura (numero_de_control) ON DELETE CASCADE
);



CREATE TABLE Obtiene (
    -- Claves del Método de Pago
    numero_de_control VARCHAR(50) NOT NULL,
    fecha_operacion TIMESTAMP NOT NULL,
    
    -- Claves de la Tasa de Cambio
    moneda_origen VARCHAR(10) NOT NULL,
    moneda_destino VARCHAR(10) NOT NULL,
    fecha_vigencia TIMESTAMP NOT NULL,
    
   
    CONSTRAINT pk_obtiene PRIMARY KEY (numero_de_control, fecha_operacion, moneda_origen, moneda_destino, fecha_vigencia),
    
    CONSTRAINT fk_obtiene_metodo FOREIGN KEY (numero_de_control, fecha_operacion) 
        REFERENCES Metodo_Pago (numero_de_control, fecha_operacion) ON DELETE CASCADE,
        
    CONSTRAINT fk_obtiene_tasa FOREIGN KEY (moneda_origen, moneda_destino, fecha_vigencia) 
        REFERENCES Tasa_Cambio (moneda_origen, moneda_destino, fecha_vigencia) ON DELETE RESTRICT,
        
    
    CONSTRAINT uq_metodo_unica_tasa UNIQUE (numero_de_control, fecha_operacion)
);




--------------------------------------------------------------------------------
-- SUBCLASES DE MÉTODOS DE PAGO (Ajustadas a la última imagen)
--------------------------------------------------------------------------------

-- Zelle: (correo, nombre, confirmacion)
CREATE TABLE Zelle (
    numero_de_control VARCHAR(50) NOT NULL,
    fecha_operacion TIMESTAMP NOT NULL,
    correo VARCHAR(150) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    confirmacion VARCHAR(100) UNIQUE NOT NULL,
    
    CONSTRAINT pk_zelle PRIMARY KEY (numero_de_control, fecha_operacion),
    CONSTRAINT fk_zelle_metodo FOREIGN KEY (numero_de_control, fecha_operacion) 
        REFERENCES Metodo_Pago (numero_de_control, fecha_operacion) ON DELETE CASCADE
);

-- Criptomoneda: (DXID, red, billetera, tasa)
CREATE TABLE Criptomoneda (
    numero_de_control VARCHAR(50) NOT NULL,
    fecha_operacion TIMESTAMP NOT NULL,
    DXID VARCHAR(255) UNIQUE NOT NULL,
    red VARCHAR(50) NOT NULL,
    billetera VARCHAR(255) NOT NULL,
    tasa NUMERIC(20, 8) NOT NULL,
    
    CONSTRAINT pk_cripto PRIMARY KEY (numero_de_control, fecha_operacion),
    CONSTRAINT fk_cripto_metodo FOREIGN KEY (numero_de_control, fecha_operacion) 
        REFERENCES Metodo_Pago (numero_de_control, fecha_operacion) ON DELETE CASCADE
);

-- Tarjeta: (nro_tarjeta, vencimiento, compania, red)
CREATE TABLE Tarjeta (
    numero_de_control VARCHAR(50) NOT NULL,
    fecha_operacion TIMESTAMP NOT NULL,
    nro_tarjeta VARCHAR(20) NOT NULL,
    vencimiento VARCHAR(5) NOT NULL,
    compania VARCHAR(50) NOT NULL,
    red VARCHAR(20) NOT NULL,
    
    CONSTRAINT pk_tarjeta PRIMARY KEY (numero_de_control, fecha_operacion),
    CONSTRAINT fk_tarjeta_metodo FOREIGN KEY (numero_de_control, fecha_operacion) 
        REFERENCES Metodo_Pago (numero_de_control, fecha_operacion) ON DELETE CASCADE
);

-- Pago_Movil: (telefono_emisor, banco, referencia)
CREATE TABLE Pago_Movil (
    numero_de_control VARCHAR(50) NOT NULL,
    fecha_operacion TIMESTAMP NOT NULL,
    telefono_emisor VARCHAR(20) NOT NULL,
    banco VARCHAR(50) NOT NULL,
    referencia VARCHAR(50) UNIQUE NOT NULL,
    
    CONSTRAINT pk_pago_movil PRIMARY KEY (numero_de_control, fecha_operacion),
    CONSTRAINT fk_pm_metodo FOREIGN KEY (numero_de_control, fecha_operacion) 
        REFERENCES Metodo_Pago (numero_de_control, fecha_operacion) ON DELETE CASCADE
);

-- Efectivo: (monto, tasa)
CREATE TABLE Efectivo (
    numero_de_control VARCHAR(50) NOT NULL,
    fecha_operacion TIMESTAMP NOT NULL,
    monto NUMERIC(15, 2) NOT NULL,
    tasa NUMERIC(20, 8) NOT NULL,
    
    CONSTRAINT pk_efectivo PRIMARY KEY (numero_de_control, fecha_operacion),
    CONSTRAINT fk_efectivo_metodo FOREIGN KEY (numero_de_control, fecha_operacion) 
        REFERENCES Metodo_Pago (numero_de_control, fecha_operacion) ON DELETE CASCADE
);

-- TAI: (uid, pos, remanente)
CREATE TABLE TAI (
    numero_de_control VARCHAR(50) NOT NULL,
    fecha_operacion TIMESTAMP NOT NULL,
    uid VARCHAR(100) NOT NULL,
    pos VARCHAR(50) NOT NULL,
    remanente NUMERIC(15, 2) NOT NULL,
    
    CONSTRAINT pk_tai PRIMARY KEY (numero_de_control, fecha_operacion),
    CONSTRAINT fk_tai_metodo FOREIGN KEY (numero_de_control, fecha_operacion) 
        REFERENCES Metodo_Pago (numero_de_control, fecha_operacion) ON DELETE CASCADE
);


CREATE TABLE Billetera_digital (
    uid VARCHAR(100) PRIMARY KEY,      -- Identificador físico del chip NFC
    id_miembro BIGINT NOT NULL UNIQUE, -- UNIQUE garantiza relación 1:1
    saldo NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
    
    -- La restricción de "debilitamiento" lógico:
    CONSTRAINT fk_billetera_miembro FOREIGN KEY (id_miembro) 
        REFERENCES Miembro(id_miembro) ON DELETE CASCADE, -- Si el miembro muere, la billetera muere
        
    CONSTRAINT chk_saldo_positivo CHECK (saldo >= 0)
);



CREATE TABLE Admid_General (
    id_miembro BIGINT PRIMARY KEY,


    CONSTRAINT fk_admid_general_administrativo 
        FOREIGN KEY (id_miembro) 
        REFERENCES Administrativo (id_miembro) 
        ON DELETE CASCADE
);
