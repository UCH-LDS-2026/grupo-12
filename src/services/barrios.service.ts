// src/services/barrios.service.ts
// ============================================================
// Servicio de Barrios — Grupo 12 UCH LDS 2026
// ============================================================
// Contiene las funciones que se comunican con Supabase para
// la entidad Barrio:
//   - crearBarrio()   → equivale al POST
//   - obtenerBarrio() → equivale al GET por ID
// ============================================================

import { Barrio, CrearBarrioInput } from '../types/barrio.types';
import { supabase } from '../utils/supabase';

// ============================================================
// POST: Crear un nuevo barrio
// ============================================================
/**
 * Inserta un nuevo barrio en la tabla `barrios` de Supabase.
 *
 * @param datos - Los campos necesarios para crear el barrio.
 *                Ver tipo `CrearBarrioInput` para los campos requeridos.
 * @returns El barrio recién creado, incluyendo su `id` y `created_at`.
 * @throws Error si Supabase devuelve un error (ej: FK inválida, campos faltantes).
 *
 * @example
 * const barrio = await crearBarrio({
 *   superAdminId: 'uuid-del-super-admin',
 *   nombre: 'Barrio Las Heras',
 *   direccion: 'Av. Las Heras 1234, Mendoza',
 * });
 * console.log(barrio.id); // UUID generado por Supabase
 */
export async function crearBarrio(datos: CrearBarrioInput) {
    const { data, error } = await supabase
        .from('barrios') // Tabla destino en Supabase
        .insert(datos)   // Inserta los datos recibidos
        .select()        // Le pide a Supabase que devuelva el registro insertado
        .single();       // Esperamos exactamente un resultado (no un array)

    if (error) {
        // Lanzamos el error para que el componente que llama pueda manejarlo
        throw new Error(`Error al crear barrio: ${error.message}`);
    }

    if (!data) {
        throw new Error('Error al crear barrio: Supabase no devolvió ningún dato.');
    }

    return data as Barrio;
}

// ============================================================
// GET: Obtener los detalles de un barrio por su ID
// ============================================================
/**
 * Busca y devuelve un barrio de la tabla `barrios` por su UUID.
 *
 * @param id - El UUID del barrio a buscar.
 * @returns El barrio encontrado con todos sus campos.
 * @throws Error si el barrio no existe o Supabase devuelve un error.
 *
 * @example
 * const barrio = await obtenerBarrio('550e8400-e29b-41d4-a716-446655440000');
 * console.log(barrio.nombre); // 'Barrio Las Heras'
 */
export async function obtenerBarrio(id: string) {
    const { data, error } = await supabase
        .from('barrios') // Tabla a consultar
        .select('*')     // Trae todas las columnas (id, nombre, direccion, status, etc.)
        .eq('id', id)    // Filtra: WHERE id = el parámetro recibido
        .single();       // Esperamos exactamente un resultado

    if (error) {
        throw new Error(`Error al obtener barrio con id "${id}": ${error.message}`);
    }

    if (!data) {
        throw new Error(`Error al obtener barrio con id "${id}": Supabase no devolvió ningún dato.`);
    }

    return data as Barrio;
}
