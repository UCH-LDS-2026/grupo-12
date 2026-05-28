-- ============================================================
-- Sistema de Gestión de Barrio Privado
-- Grupo 12 - UCH LDS 2026
-- schema.sql (Actualizado según el nuevo DER)
-- ============================================================
-- Compatible con PostgreSQL (producción) y SQLite (desarrollo)
-- ============================================================

-- SuperAdmin: administradores globales del sistema informático
CREATE TABLE super_admins (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre        VARCHAR(100) NOT NULL
);

-- Barrios: unidades administrativas principales
CREATE TABLE barrios (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    super_admin_id UUID NOT NULL REFERENCES super_admins(id),
    nombre         VARCHAR(100) NOT NULL,
    direccion      VARCHAR(255) NOT NULL,
    status         VARCHAR(20)  NOT NULL DEFAULT 'activo'
                     CHECK (status IN ('activo', 'inactivo')),
    logo_url       VARCHAR(500),
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Lotes: propiedades físicas dentro de un barrio
CREATE TABLE lotes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barrio_id   UUID NOT NULL REFERENCES barrios(id) ON DELETE CASCADE,
    manzana     VARCHAR(50) NOT NULL,
    numero      VARCHAR(20) NOT NULL,
    calle       VARCHAR(100),
    descripcion TEXT,
    activo      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (barrio_id, manzana, numero)
);

-- Usuarios: residentes, guardias y administradores de barrio
CREATE TABLE usuarios (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barrio_id     UUID REFERENCES barrios(id), -- NULL para globales, NOT NULL si pertenecen estrictamente a un barrio
    email         VARCHAR(200) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre        VARCHAR(100) NOT NULL,
    apellido      VARCHAR(100) NOT NULL,
    telefono      VARCHAR(50),
    rol           VARCHAR(20)  NOT NULL 
                    CHECK (rol IN ('admin_barrio', 'guardia', 'residente')),
    activo        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Intermedia ResidenteLote: vinculación histórica de residencia (Muchos a Muchos)
CREATE TABLE residente_lotes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    lote_id     UUID NOT NULL REFERENCES lotes(id) ON DELETE CASCADE,
    fecha_desde DATE NOT NULL,
    fecha_hasta DATE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- InvitacionesUsuario: para registrar residentes/guardias y enviarles el mail de alta
CREATE TABLE invitaciones_usuario (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES usuarios(id), -- Usuario emisor/admin que invita
    barrio_id   UUID NOT NULL REFERENCES barrios(id),
    email       VARCHAR(255) NOT NULL,
    rol_destino VARCHAR(20) NOT NULL,
    token       VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    expires_at  TIMESTAMP NOT NULL,
    used_at     TIMESTAMP
);

-- Visitas: registros de accesos puntuales creados por los residentes
CREATE TABLE visitas (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barrio_id              UUID NOT NULL REFERENCES barrios(id),
    autorizado_por_user_id UUID NOT NULL REFERENCES usuarios(id), -- El residente que autoriza
    nombre_visitante       VARCHAR(200) NOT NULL,
    telefono               VARCHAR(50),
    patente                VARCHAR(20),
    fecha_desde            TIMESTAMP NOT NULL,
    fecha_hasta            TIMESTAMP NOT NULL,
    reserva_id             UUID, -- Referencia lógica opcional a futuro
    estado                 VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                             CHECK (estado IN ('pendiente', 'aprobada', 'ingresada', 'rechazada', 'expirada')),
    created_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- OTPs: tokens de seguridad de un solo uso enlazados a las visitas
CREATE TABLE otps (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visita_id      UUID NOT NULL UNIQUE REFERENCES visitas(id) ON DELETE CASCADE,
    codigo         VARCHAR(20) NOT NULL,
    qr_egreso_token VARCHAR(255),
    expires_at     TIMESTAMP NOT NULL,
    used_at        TIMESTAMP,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Autorizaciones Permanentes: pases extendidos para personal recurrente
CREATE TABLE autorizaciones_permanentes (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barrio_id              UUID NOT NULL REFERENCES barrios(id),
    lote_id                UUID NOT NULL REFERENCES lotes(id),
    autorizado_por_user_id UUID NOT NULL REFERENCES usuarios(id), -- El residente titular
    nombre                 VARCHAR(150) NOT NULL,
    foto_url               VARCHAR(500),
    franja_horaria_json    TEXT, -- Formato JSON con días y horas permitidas
    vigencia_hasta         DATE NOT NULL,
    activo                 BOOLEAN NOT NULL DEFAULT TRUE,
    created_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Accesos: bitácora de ingresos y egresos físicos en la guardia de entrada
CREATE TABLE accesos (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barrio_id                   UUID NOT NULL REFERENCES barrios(id),
    visita_id                   UUID REFERENCES visitas(id),
    autorizacion_permanente_id  UUID REFERENCES autorizaciones_permanentes(id),
    guardia_user_id             UUID NOT NULL REFERENCES usuarios(id), -- El guardia de turno
    tipo                        VARCHAR(10) NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
    fecha                       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observaciones               TEXT,
    CONSTRAINT check_origen_acceso CHECK (
        (visita_id IS NOT NULL AND autorizacion_permanente_id IS NULL) OR
        (visita_id IS NULL AND autorizacion_permanente_id IS NOT NULL)
    )
);

-- ============================================================
-- Índices para optimizar la velocidad de respuesta en BD
-- ============================================================
CREATE INDEX idx_lotes_barrio                  ON lotes(barrio_id);
CREATE INDEX idx_usuarios_barrio               ON usuarios(barrio_id);
CREATE INDEX idx_residente_lotes_user          ON residente_lotes(user_id);
CREATE INDEX idx_residente_lotes_lote          ON residente_lotes(lote_id);
CREATE INDEX idx_invitaciones_token            ON invitaciones_usuario(token);
CREATE INDEX idx_visitas_autorizado            ON visitas(autorizado_por_user_id);
CREATE INDEX idx_autorizaciones_permanentes    ON autorizaciones_permanentes(autorizado_por_user_id);
CREATE INDEX idx_accesos_fecha                 ON accesos(fecha);
