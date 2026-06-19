// Tipos TypeScript para la entidad Visita — Grupo 12 UCH LDS 2026

// Estados posibles de una visita.
export type EstadoVisita =
  | 'pendiente'
  | 'aprobada'
  | 'ingresada'
  | 'egresada'   // Ya ingresó y el guardia registró su egreso: ciclo completo.
  | 'rechazada'
  | 'expirada'
  | 'cancelada';

// Una visita tal como está almacenada en la tabla `visitas` de Supabase.
export type Visita = {
  id: string;
  barrio_id: string;
  // UUID del residente que autoriza la visita.
  autorizado_por_user_id: string;
  nombre_visitante: string;
  // DNI del visitante: con esto el guardia valida el ingreso en portería.
  dni: string;
  telefono: string | null;
  patente: string | null;
  fecha_desde: string;
  fecha_hasta: string;
  estado: EstadoVisita;
  created_at: string;
};

// Datos que carga el residente para crear una visita.
// El `estado` y los campos autogenerados los maneja el servicio/Supabase.
export type CrearVisitaInput = {
  barrio_id: string;
  autorizado_por_user_id: string;
  nombre_visitante: string;
  dni: string;
  fecha_desde: string;
  fecha_hasta: string;
  telefono?: string;
  patente?: string;
};
