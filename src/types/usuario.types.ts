// src/types/usuario.types.ts
// ============================================================
// Tipos TypeScript para la entidad Usuario — Grupo 12 UCH LDS 2026
// ============================================================

/**
 * Roles posibles dentro del sistema.
 * - `admin_barrio`: Administrador de un barrio privado. Lo crea el SuperAdmin.
 * - `residente`:    Propietario/inquilino de un lote. Lo crea el Admin del barrio.
 * - `guardia`:      Personal de seguridad en portería. Lo crea el Admin del barrio.
 */
export type Rol = 'admin_barrio' | 'guardia' | 'residente';

/**
 * Representa un usuario tal como está almacenado en la tabla `usuarios` de Supabase.
 * Incluye todos los campos, incluso los generados automáticamente por Supabase.
 */
export type Usuario = {
    /** UUID generado automáticamente por Supabase */
    id: string;
    /** UUID del barrio al que pertenece el usuario */
    barrio_id: string;
    /** Email único del usuario (se usa para login) */
    email: string;
    /** Hash de la contraseña. Nunca almacenar la contraseña en texto plano */
    password_hash: string;
    /** Nombre del usuario */
    nombre: string;
    /** Apellido del usuario */
    apellido: string;
    /** Teléfono de contacto. Puede ser null */
    telefono: string | null;
    /** Rol del usuario dentro del sistema */
    rol: Rol;
    /** Indica si el usuario está activo. Por defecto true */
    activo: boolean;
    /** Fecha y hora de creación. La genera Supabase automáticamente */
    created_at: string;
};

/**
 * Campos comunes requeridos para crear cualquier tipo de usuario.
 * NO incluye `id`, `created_at`, `activo` (los genera Supabase) ni `rol`
 * (lo define cada función de servicio de forma interna).
 *
 * ⚠️ IMPORTANTE: `password_hash` debe recibirse ya hasheado.
 * El servicio NO realiza el hashing. Esta responsabilidad recae en el llamador.
 */
export type CrearUsuarioBaseInput = {
    /** UUID del barrio al que pertenecerá el usuario */
    barrio_id: string;
    /** Email único del usuario */
    email: string;
    /**
     * Hash de la contraseña del usuario.
     * Debe generarse antes de llamar al servicio (ej: con bcrypt o Supabase Auth).
     */
    password_hash: string;
    /** Nombre del usuario. Máximo 100 caracteres */
    nombre: string;
    /** Apellido del usuario. Máximo 100 caracteres */
    apellido: string;
    /** Teléfono de contacto. Opcional. Máximo 50 caracteres */
    telefono?: string;
};

/**
 * Datos necesarios para que el SuperAdmin cree un Administrador de barrio.
 * El `rol` se fija internamente como `'admin_barrio'`.
 */
export type CrearAdminBarrioInput = CrearUsuarioBaseInput;

/**
 * Datos necesarios para que el Admin de barrio cree un Residente.
 * El `rol` se fija internamente como `'residente'`.
 */
export type CrearResidenteInput = CrearUsuarioBaseInput;

/**
 * Datos necesarios para que el Admin de barrio cree un Guardia.
 * El `rol` se fija internamente como `'guardia'`.
 */
export type CrearGuardiaInput = CrearUsuarioBaseInput;

/**
 * Filtros opcionales para `buscarUsuarios()`.
 * Todos los campos son opcionales y se combinan con AND.
 */
export type BuscarUsuariosFiltros = {
    /** Filtra por barrio */
    barrio_id?: string;
    /** Filtra por rol exacto */
    rol?: Rol;
    /** Filtra por estado activo/inactivo */
    activo?: boolean;
    /**
     * Búsqueda parcial (case-insensitive) por nombre o apellido.
     * Coincide si alguno de los dos campos contiene el texto.
     */
    nombreOApellido?: string;
};
