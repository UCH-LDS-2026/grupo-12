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
 */
export type Usuario = {
	id: string;
	barrio_id: string;
	email: string;
	nombre: string;
	apellido: string;
	telefono: string | null;
	rol: Rol;
	activo: boolean;
	created_at: string;
};

/**
 * Campos comunes requeridos para crear cualquier tipo de usuario.
 * NO incluye `id`, `created_at` ni `rol`
 * (lo define cada función de servicio de forma interna).
 */
export type CrearUsuarioBaseInput = {
	barrio_id: string;
	email: string;
	nombre: string;
	apellido: string;
	telefono?: string;
};

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
