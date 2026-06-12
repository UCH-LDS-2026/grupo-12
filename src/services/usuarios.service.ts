// ============================================================
// Servicio de Usuarios — Grupo 12 UCH LDS 2026
// ============================================================
// Contiene las funciones que se comunican con Supabase para
// la creación y consulta de usuarios dentro de la tabla `usuarios`:
//
//   - crearAdminBarrio(): Solo el SuperAdmin puede crear un Admin de barrio.
//   - crearResidente(): Solo un Admin de barrio puede crear un Residente.
//   - crearGuardia(): Solo un Admin de barrio puede crear un Guardia.
//   - obtenerUsuarioPorEmail(): Busca un usuario por su email (único).
//   - buscarUsuarios(): Búsqueda combinada por filtros opcionales.
//
// ============================================================

import { USER_ROLES } from '@/utils/roles';
import {
  BuscarUsuariosFiltros,
  CrearUsuarioBaseInput,
  Usuario
} from '../types/usuario.types';
import { supabase } from '../utils/supabase';

// ============================================================
// POST: SuperAdmin crea un Administrador de barrio
// ============================================================
/**
 * Inserta un nuevo usuario con `rol = 'admin_barrio'` en la tabla `usuarios`.
 * Solo debe ser invocada por un SuperAdmin autenticado.
 * 
 * @param datos - Campos del admin de barrio a crear. Ver `CrearUsuarioBaseInput`.
 * @returns El admin de barrio recién creado
 * @throws Error si Supabase devuelve un error (ej: email duplicado, FK inválida).
 *
 */
export async function crearAdminBarrio(datos: CrearUsuarioBaseInput) {
  // TODO: Agregar validaciones (ej: es llamado por un superadmin)
  const { data, error } = await supabase
    .from('usuarios')
    .insert({
      ...datos,
      rol: USER_ROLES.ADMIN_BARRIO,
      activo: true,
    })
    .select("*")
    .single();
  
  if (error) {
    throw new Error(`Error al crear admin de barrio: ${error.message}`);
  }

  return data;
}

// ============================================================
// POST: Admin de barrio crea un Residente
// ============================================================
/**
 * Inserta un nuevo usuario con `rol = 'residente'` en la tabla `usuarios`.
 * Solo debe ser invocada por un Admin de barrio autenticado.
 * 
 * @param datos - Campos del residente a crear. Ver `CrearUsuarioBaseInput`.
 * @returns El residente recién creado, incluyendo su `id` y `created_at`.
 * @throws Error si Supabase devuelve un error (ej: email duplicado, FK inválida).
 *
 */
export async function crearResidente(datos: CrearUsuarioBaseInput) {
  // TODO: Agregar validaciones (ej: es llamado por un admin de barrio, el barrio_id corresponde al admin, etc)
  const { data, error } = await supabase
    .from('usuarios')
    .insert({
      ...datos,
      rol: USER_ROLES.RESIDENTE,
      activo: true,
    })
    .select("*")
    .single();
  
  if (error) {
    throw new Error(`Error al crear residente: ${error.message}`);
  }

  return data;
}

// ============================================================
// POST: Admin de barrio crea un Guardia
// ============================================================
/**
 * Inserta un nuevo usuario con `rol = 'guardia'` en la tabla `usuarios`.
 * Solo debe ser invocada por un Admin de barrio autenticado.
 *
 * @param datos - Campos del guardia a crear. Ver `CrearUsuarioBaseInput`.
 * @returns El guardia recién creado, incluyendo su `id` y `created_at`.
 * @throws Error si Supabase devuelve un error (ej: email duplicado, FK inválida).
 *
 */
export async function crearGuardia(datos: CrearUsuarioBaseInput) {
  // TODO: Agregar validaciones (ej: es llamado por un admin de barrio, el barrio_id corresponde al admin, etc)
  const { data, error } = await supabase
    .from('usuarios')
    .insert({
      ...datos,
      rol: USER_ROLES.GUARDIA,
      activo: true,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Error al crear guardia: ${error.message}`);
  }

  return data;
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
    const texto = filtros.nombreOApellido.replace(/[(),]/g, '')
    query = query.or(`nombre.ilike.%${texto}%,apellido.ilike.%${texto}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Error al buscar usuarios: ${error.message}`);
  }

  return (data ?? []) as Usuario[];
}
