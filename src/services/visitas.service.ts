// Servicio de Visitas — Grupo 12 UCH LDS 2026
// Funciones que hablan con Supabase para la entidad Visita:
//   - crearVisita()                → POST: el residente carga una visita
//   - listarVisitasPorResidente()  → GET: visitas creadas por un residente

import { CrearVisitaInput, Visita } from '../types/visita.types';
import { supabase } from '../utils/supabase';

// POST: el residente crea una visita. Arranca en estado 'pendiente'.
export async function crearVisita(datos: CrearVisitaInput) {
  const { data, error } = await supabase
    .from('visitas')
    .insert({ ...datos, estado: 'pendiente' })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Error al crear visita: ${error.message}`);
  }

  if (!data) {
    throw new Error('Error al crear visita: Supabase no devolvió ningún dato.');
  }

  return data as Visita;
}

// GET: lista las visitas autorizadas por un residente, de la más reciente a la más vieja.
export async function listarVisitasPorResidente(userId: string) {
  const { data, error } = await supabase
    .from('visitas')
    .select('*')
    .eq('autorizado_por_user_id', userId)
    .order('fecha_desde', { ascending: false });

  if (error) {
    throw new Error(`Error al listar visitas: ${error.message}`);
  }

  return (data ?? []) as Visita[];
}
