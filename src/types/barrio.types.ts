// src/types/barrio.types.ts
// ============================================================
// Tipos TypeScript para la entidad Barrio — Grupo 12 UCH LDS 2026
// ============================================================

/**
 * Representa un SuperAdmin tal como está en la tabla `SuperAdmin` de Supabase.
 * Nota: el campo es `passwordHash` (camelCase) según la BD real.
 */
export type SuperAdmin = {
    id: string;
    email: string;
    passwordHash: string;
    nombre: string;
};

/**
 * Representa un barrio tal como está almacenado en la base de datos.
 * Incluye todos los campos, incluso los generados automáticamente por Supabase.
 */
export type Barrio = {
    /** UUID generado automáticamente por Supabase */
    id: string;
    /** UUID del SuperAdmin que creó este barrio */
    superAdminId: string;
    /** Nombre del barrio privado */
    nombre: string;
    /** Dirección física del barrio */
    direccion: string;
    /** Estado del barrio: solo puede ser 'activo' o 'inactivo' */
    status: 'activo' | 'inactivo';
    /** URL del logo del barrio. Puede ser null si no tiene logo */
    logo_url: string | null;
    /** Fecha y hora de creación. La genera Supabase automáticamente */
    created_at: string;
};

/**
 * Datos necesarios para crear un nuevo barrio mediante el POST.
 * NO incluye `id` ni `created_at` porque los genera Supabase.
 */
export type CrearBarrioInput = {
    /** UUID del SuperAdmin que crea el barrio. Debe existir en la tabla SuperAdmin */
    superAdminId: string;
    /** Nombre del barrio. Máximo 100 caracteres */
    nombre: string;
    /** Dirección del barrio. Máximo 255 caracteres */
    direccion: string;
    /**
     * Estado inicial del barrio.
     * @default 'activo'
     */
    status?: 'activo' | 'inactivo';
    /** URL del logo del barrio. Opcional. Máximo 500 caracteres */
    logo_url?: string;
};
