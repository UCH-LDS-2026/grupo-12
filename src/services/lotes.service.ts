import { supabase } from '@/utils/supabase';
import type { CrearLoteInput, Lote } from '@/types/lote';

export async function crearLote(input: CrearLoteInput): Promise<Lote> {
  const { data, error } = await supabase
    .from('lotes')
    .insert(input)
    .select()
    .single();

  if (error) {
    throw new Error(`No se pudo crear el lote: ${error.message}`);
  }

  return data as Lote;
}

export async function listarLotesPorBarrio(barrioId: string): Promise<Lote[]> {
  const { data, error } = await supabase
    .from('lotes')
    .select()
    .eq('barrio_id', barrioId)
    .eq('activo', true)
    .order('manzana', { ascending: true })
    .order('numero', { ascending: true });

  if (error) {
    throw new Error(`No se pudieron obtener los lotes: ${error.message}`);
  }

  return data as Lote[];
}

export async function obtenerLotePorId(id: string): Promise<Lote | null> {
  const { data, error } = await supabase
    .from('lotes')
    .select()
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo obtener el lote: ${error.message}`);
  }

  return data as Lote | null;
}
