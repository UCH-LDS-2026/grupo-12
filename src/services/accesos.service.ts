// Servicio de Accesos — Grupo 12 UCH LDS 2026
// Flujo del guardia en portería (validación de ingreso por DNI):
//   - buscarVisitaVigentePorDni() → GET: busca la visita autorizada y vigente de un DNI
//   - registrarIngreso()          → POST: registra el ingreso y marca la visita como 'ingresada'

import { Acceso, VisitaParaIngreso } from '../types/acceso.types';
import { supabase } from '../utils/supabase';

// Busca una visita autorizada y vigente para un DNI.
// "Vigente" = estado pendiente/aprobada y la fecha de hoy dentro de fecha_desde–fecha_hasta.
// Devuelve la visita (para que el guardia confirme quién es) o null si no hay ninguna.
export async function buscarVisitaVigentePorDni(dni: string) {
  const ahora = new Date().toISOString();

  const { data, error } = await supabase
    .from('visitas')
    .select('id, barrio_id, nombre_visitante, dni, fecha_desde, fecha_hasta, estado')
    .eq('dni', dni)
    .in('estado', ['pendiente', 'aprobada'])
    .lte('fecha_desde', ahora)
    .gte('fecha_hasta', ahora)
    .order('fecha_desde', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Error al buscar la visita por DNI: ${error.message}`);
  }

  return data as VisitaParaIngreso | null;
}

// Registra el ingreso de una visita en portería y la marca como 'ingresada'
// (para que no pueda volver a usarse el mismo pase).
export async function registrarIngreso(visita: VisitaParaIngreso, guardiaUserId: string) {
  const { data, error } = await supabase
    .from('accesos')
    .insert({
      barrio_id: visita.barrio_id,
      visita_id: visita.id,
      guardia_user_id: guardiaUserId,
      tipo: 'ingreso',
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Error al registrar el ingreso: ${error.message}`);
  }

  if (!data) {
    throw new Error('Error al registrar el ingreso: Supabase no devolvió ningún dato.');
  }

  // Marcamos la visita como ingresada (best-effort: el ingreso ya quedó registrado).
  await supabase.from('visitas').update({ estado: 'ingresada' }).eq('id', visita.id);

  return data as Acceso;
}
