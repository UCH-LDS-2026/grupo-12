// Servicio de Accesos — Grupo 12 UCH LDS 2026
// Flujo del guardia en portería (validación por DNI):
//   - listarVisitasDePorteria()     → GET: visitas del barrio con acción pendiente (panel del guardia)
//   - buscarVisitaVigentePorDni()   → GET: visita autorizada y vigente, para registrar el INGRESO
//   - registrarIngreso()            → POST: registra el ingreso y marca la visita como 'ingresada'
//   - buscarVisitaIngresadaPorDni() → GET: visita que ya ingresó, para registrar el EGRESO
//   - registrarEgreso()             → POST: registra el egreso y marca la visita como 'egresada'

import { Acceso, VisitaParaAcceso } from '../types/acceso.types';
import { supabase } from '../utils/supabase';

// Lista las visitas del barrio que requieren acción del guardia, para el panel de portería:
//   - 'pendiente' / 'aprobada' → programadas, todavía no ingresaron (se les registra el INGRESO)
//   - 'ingresada'              → están dentro del barrio (se les registra el EGRESO)
// Las que ya completaron su ciclo ('egresada') u otras ('cancelada', etc.) quedan fuera.
// Ordenadas por fecha_desde ascendente. Devuelve [] si no hay ninguna.
export async function listarVisitasDePorteria(barrioId: string) {
  const { data, error } = await supabase
    .from('visitas')
    .select('id, barrio_id, nombre_visitante, dni, fecha_desde, fecha_hasta, estado')
    .eq('barrio_id', barrioId)
    .in('estado', ['pendiente', 'aprobada', 'ingresada'])
    .order('fecha_desde', { ascending: true });

  if (error) {
    throw new Error(`Error al listar las visitas de portería: ${error.message}`);
  }

  return (data ?? []) as VisitaParaAcceso[];
}

// Busca una visita autorizada y vigente para un DNI, dentro del barrio del guardia (para el ingreso).
// "Vigente" = estado pendiente/aprobada y la fecha de hoy dentro de fecha_desde–fecha_hasta.
// Devuelve la visita (para que el guardia confirme quién es) o null si no hay ninguna.
export async function buscarVisitaVigentePorDni(dni: string, barrioId: string) {
  const ahora = new Date().toISOString();

  const { data, error } = await supabase
    .from('visitas')
    .select('id, barrio_id, nombre_visitante, dni, fecha_desde, fecha_hasta, estado')
    .eq('dni', dni)
    .eq('barrio_id', barrioId)
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

  // Marcamos la visita como ingresada para que no se reutilice el mismo pase.
  const { error: updateError } = await supabase
    .from('visitas')
    .update({ estado: 'ingresada' })
    .eq('id', visita.id);

  if (updateError) {
    throw new Error(`Error al marcar la visita como ingresada: ${updateError.message}`);
  }

  return data as Acceso;
}

// Busca una visita que ya ingresó (estado 'ingresada') para un DNI, dentro del barrio del guardia (para el egreso).
// No filtra por fecha: si la persona está adentro, tiene que poder salir igual.
export async function buscarVisitaIngresadaPorDni(dni: string, barrioId: string) {
  const { data, error } = await supabase
    .from('visitas')
    .select('id, barrio_id, nombre_visitante, dni, fecha_desde, fecha_hasta, estado')
    .eq('dni', dni)
    .eq('barrio_id', barrioId)
    .eq('estado', 'ingresada')
    .order('fecha_desde', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Error al buscar la visita ingresada por DNI: ${error.message}`);
  }

  return data as VisitaParaAcceso | null;
}

// Registra el egreso de una visita en portería y marca su pase como 'egresada'
// (ya entró y salió: completó su ciclo y no debe seguir apareciendo en el panel del
// guardia). El movimiento queda igual registrado en la bitácora `accesos`.
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

  // La visita completó su ciclo ingreso → egreso: queda 'egresada'.
  const { error: updateError } = await supabase
    .from('visitas')
    .update({ estado: 'egresada' })
    .eq('id', visita.id);

  if (updateError) {
    throw new Error(`Error al cerrar la visita tras el egreso: ${updateError.message}`);
  }

  return data as Acceso;
}
