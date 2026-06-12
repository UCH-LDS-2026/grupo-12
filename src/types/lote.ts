export interface Lote {
  id: string;
  barrio_id: string;
  manzana: string;
  numero: string;
  calle: string | null;
  descripcion: string | null;
  activo: boolean;
  created_at: string;
}

export interface CrearLoteInput {
  barrio_id: string;
  manzana: string;
  numero: string;
  calle?: string;
  descripcion?: string;
}
