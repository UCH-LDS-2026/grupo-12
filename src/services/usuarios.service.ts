// src/services/usuarios.service.ts
// ============================================================
// Servicio de Usuarios — Grupo 12 UCH LDS 2026
// ============================================================
// Contiene las funciones que se comunican con Supabase para
// la creación y consulta de usuarios dentro de la tabla `usuarios`:
//
//   - crearAdminBarrio()      → POST: SuperAdmin crea un Admin de barrio
//   - crearResidente()        → POST: Admin crea un Residente
//   - crearGuardia()          → POST: Admin crea un Guardia
//   - listarUsuariosPorBarrio() → GET: Lista todos los usuarios de un barrio
//   - listarUsuariosPorRol()    → GET: Lista los usuarios de un barrio con un rol dado
//   - obtenerUsuarioPorEmail()  → GET: Busca un usuario por su email
//   - buscarUsuarios()          → GET: Búsqueda combinada por filtros opcionales
//
// ⚠️ ROLES: cada función de creación hardcodea el rol internamente
//    para evitar que el llamador pueda asignar un rol incorrecto.
// ============================================================

import {
    BuscarUsuariosFiltros,
    CrearAdminBarrioInput,
    CrearGuardiaInput,
    CrearResidenteInput,
    Rol,
    Usuario,
} from '../types/usuario.types';
import { supabase } from '../utils/supabase';

// ============================================================
// Helper interno: inserta un usuario con un rol específico
// ============================================================
/**
 * Función interna compartida por las tres funciones públicas.
 * Inserta un registro en la tabla `usuarios` con el rol recibido.
 *
 * @param datos - Campos del usuario (sin rol ni campos auto-generados).
 * @param rol   - Rol a asignar. Lo define cada función pública internamente.
 * @returns El usuario recién creado con su `id` y `created_at`.
 * @throws Error si Supabase devuelve un error o si data es null.
 */
async function insertarUsuario(
    datos: CrearAdminBarrioInput | CrearResidenteInput | CrearGuardiaInput,
    rol: 'admin_barrio' | 'residente' | 'guardia'
) {
    const { data, error } = await supabase
        .from('usuarios')
        .insert({ ...datos, rol })  // Combina los datos con el rol hardcodeado
        .select()
        .single();

    if (error) {
        throw new Error(`Error al crear usuario (${rol}): ${error.message}`);
    }

    if (!data) {
        throw new Error(`Error al crear usuario (${rol}): Supabase no devolvió ningún dato.`);
    }

    return data as Usuario;
}

// ============================================================
// POST: SuperAdmin crea un Administrador de barrio
// ============================================================
/**
 * Inserta un nuevo usuario con `rol = 'admin_barrio'` en la tabla `usuarios`.
 * Solo debe ser invocada por un SuperAdmin autenticado.
 *
 * @param datos - Campos del administrador a crear. Ver `CrearAdminBarrioInput`.
 * @returns El administrador recién creado, incluyendo su `id` y `created_at`.
 * @throws Error si Supabase devuelve un error (ej: email duplicado, FK inválida).
 *
 * @example
 * const admin = await crearAdminBarrio({
 *   barrio_id: 'uuid-del-barrio',
 *   email: 'admin@barrio.com',
 *   password_hash: '$2b$10$...', // ya hasheado
 *   nombre: 'Juan',
 *   apellido: 'Pérez',
 * });
 * console.log(admin.id); // UUID generado por Supabase
 */
export async function crearAdminBarrio(datos: CrearAdminBarrioInput) {
    return insertarUsuario(datos, 'admin_barrio');
}

// ============================================================
// POST: Admin de barrio crea un Residente
// ============================================================
/**
 * Inserta un nuevo usuario con `rol = 'residente'` en la tabla `usuarios`.
 * Solo debe ser invocada por un Admin de barrio autenticado.
 *
 * @param datos - Campos del residente a crear. Ver `CrearResidenteInput`.
 * @returns El residente recién creado, incluyendo su `id` y `created_at`.
 * @throws Error si Supabase devuelve un error (ej: email duplicado, FK inválida).
 *
 * @example
 * const residente = await crearResidente({
 *   barrio_id: 'uuid-del-barrio',
 *   email: 'residente@ejemplo.com',
 *   password_hash: '$2b$10$...', // ya hasheado
 *   nombre: 'María',
 *   apellido: 'González',
 *   telefono: '+54 261 123-4567',
 * });
 * console.log(residente.rol); // 'residente'
 */
export async function crearResidente(datos: CrearResidenteInput) {
    return insertarUsuario(datos, 'residente');
}

// ============================================================
// POST: Admin de barrio crea un Guardia
// ============================================================
/**
 * Inserta un nuevo usuario con `rol = 'guardia'` en la tabla `usuarios`.
 * Solo debe ser invocada por un Admin de barrio autenticado.
 *
 * @param datos - Campos del guardia a crear. Ver `CrearGuardiaInput`.
 * @returns El guardia recién creado, incluyendo su `id` y `created_at`.
 * @throws Error si Supabase devuelve un error (ej: email duplicado, FK inválida).
 *
 * @example
 * const guardia = await crearGuardia({
 *   barrio_id: 'uuid-del-barrio',
 *   email: 'guardia@barrio.com',
 *   password_hash: '$2b$10$...', // ya hasheado
 *   nombre: 'Carlos',
 *   apellido: 'Rodríguez',
 * });
 * console.log(guardia.rol); // 'guardia'
 */
export async function crearGuardia(datos: CrearGuardiaInput) {
    return insertarUsuario(datos, 'guardia');
}

// ============================================================
// GET: Lista todos los usuarios de un barrio
// ============================================================
/**
 * Obtiene todos los usuarios pertenecientes a un barrio, sin
 * importar su rol.
 *
 * @param barrioId - UUID del barrio.
 * @returns Lista de usuarios del barrio (puede estar vacía).
 * @throws Error si Supabase devuelve un error.
 */
export async function listarUsuariosPorBarrio(barrioId: string) {
    const { data, error } = await supabase
        .from('usuarios')
        .select()
        .eq('barrio_id', barrioId);

    if (error) {
        throw new Error(`Error al listar usuarios del barrio: ${error.message}`);
    }

    return (data ?? []) as Usuario[];
}

// ============================================================
// GET: Lista los usuarios de un barrio con un rol específico
// ============================================================
/**
 * Obtiene los usuarios de un barrio que tengan un rol determinado.
 *
 * @param barrioId - UUID del barrio.
 * @param rol      - Rol por el cual filtrar (`admin_barrio`, `residente` o `guardia`).
 * @returns Lista de usuarios que cumplen el filtro (puede estar vacía).
 * @throws Error si Supabase devuelve un error.
 */
export async function listarUsuariosPorRol(barrioId: string, rol: Rol) {
    const { data, error } = await supabase
        .from('usuarios')
        .select()
        .eq('barrio_id', barrioId)
        .eq('rol', rol);

    if (error) {
        throw new Error(`Error al listar usuarios por rol: ${error.message}`);
    }

    return (data ?? []) as Usuario[];
}

// ============================================================
// GET: Busca un usuario por su email
// ============================================================
/**
 * Busca un usuario por su email. El email es único en la tabla,
 * por lo que devuelve un único usuario o `null` si no existe.
 *
 * @param email - Email del usuario a buscar.
 * @returns El usuario encontrado, o `null` si no existe.
 * @throws Error si Supabase devuelve un error distinto a "no encontrado".
 */
export async function obtenerUsuarioPorEmail(email: string) {
    const { data, error } = await supabase
        .from('usuarios')
        .select()
        .eq('email', email)
        .maybeSingle();

    if (error) {
        throw new Error(`Error al obtener usuario por email: ${error.message}`);
    }

    return data as Usuario | null;
}

// ============================================================
// GET: Búsqueda combinada de usuarios por filtros opcionales
// ============================================================
/**
 * Busca usuarios combinando filtros opcionales (`barrio_id`, `rol`,
 * `activo` y/o coincidencia parcial por nombre/apellido). Los filtros
 * provistos se combinan con AND.
 *
 * @param filtros - Filtros opcionales. Ver `BuscarUsuariosFiltros`.
 * @returns Lista de usuarios que cumplen todos los filtros (puede estar vacía).
 * @throws Error si Supabase devuelve un error.
 *
 * @example
 * const residentesActivos = await buscarUsuarios({
 *   barrio_id: 'uuid-del-barrio',
 *   rol: 'residente',
 *   activo: true,
 *   nombreOApellido: 'gonz',
 * });
 */
export async function buscarUsuarios(filtros: BuscarUsuariosFiltros) {
    let query = supabase.from('usuarios').select();

    if (filtros.barrio_id) {
        query = query.eq('barrio_id', filtros.barrio_id);
    }

    if (filtros.rol) {
        query = query.eq('rol', filtros.rol);
    }

    if (filtros.activo !== undefined) {
        query = query.eq('activo', filtros.activo);
    }

    if (filtros.nombreOApellido) {
        const texto = filtros.nombreOApellido;
        query = query.or(`nombre.ilike.%${texto}%,apellido.ilike.%${texto}%`);
    }

    const { data, error } = await query;

    if (error) {
        throw new Error(`Error al buscar usuarios: ${error.message}`);
    }

    return (data ?? []) as Usuario[];
}
