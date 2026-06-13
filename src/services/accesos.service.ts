// Servicio de Accesos — Grupo 12 UCH LDS 2026
// Flujo del guardia en portería (validación por DNI):
//   - buscarVisitaVigentePorDni()   → GET: visita autorizada y vigente, para registrar el INGRESO
//   - registrarIngreso()            → POST: registra el ingreso y marca la visita como 'ingresada'
//   - buscarVisitaIngresadaPorDni() → GET: visita que ya ingresó, para registrar el EGRESO
//   - registrarEgreso()             → POST: registra el egreso

import { Acceso, VisitaParaAcceso } from '../types/acceso.types';
import { supabase } from '../utils/supabase';

// Busca una visita autorizada y vigente para un DNI (para el ingreso).
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

  return data as VisitaParaAcceso | null;
}

// Registra el ingreso de una visita en portería y la marca como 'ingresada'
// (para que no pueda volver a usarse el mismo pase).
export async function registrarIngreso(visita: VisitaParaAcceso, guardiaUserId: string) {
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

// Busca una visita que ya ingresó (estado 'ingresada') para un DNI, para registrar el egreso.
// No filtra por fecha: si la persona está adentro, tiene que poder salir igual.
export async function buscarVisitaIngresadaPorDni(dni: string) {
  const { data, error } = await supabase
    .from('visitas')
    .select('id, barrio_id, nombre_visitante, dni, fecha_desde, fecha_hasta, estado')
    .eq('dni', dni)
    .eq('estado', 'ingresada')
    .order('fecha_desde', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Error al buscar la visita ingresada por DNI: ${error.message}`);
  }

  return data as VisitaParaAcceso | null;
}

// Registra el egreso de una visita en portería.
export async function registrarEgreso(visita: VisitaParaAcceso, guardiaUserId: string) {
  const { data, error } = await supabase
    .from('accesos')
    .insert({
      barrio_id: visita.barrio_id,
      visita_id: visita.id,
      guardia_user_id: guardiaUserId,
      tipo: 'egreso',
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Error al registrar el egreso: ${error.message}`);
  }

  if (!data) {
    throw new Error('Error al registrar el egreso: Supabase no devolvió ningún dato.');
  }

  return data as Acceso;
}
