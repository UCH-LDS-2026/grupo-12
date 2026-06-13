// Tipos TypeScript para la entidad Acceso — Grupo 12 UCH LDS 2026

export type TipoAcceso = 'ingreso' | 'egreso';

// Un acceso tal como está almacenado en la tabla `accesos` de Supabase.
export type Acceso = {
  id: string;
  barrio_id: string;
  visita_id: string | null;
  autorizacion_permanente_id: string | null;
  guardia_user_id: string;
  tipo: TipoAcceso;
  fecha: string;
  observaciones: string | null;
};

// Datos de la visita que el guardia ve al buscar por DNI en portería.
// (Vista acotada de la tabla `visitas`, solo lo necesario para validar el ingreso.)
export type VisitaParaIngreso = {
  id: string;
  barrio_id: string;
  nombre_visitante: string;
  dni: string;
  fecha_desde: string;
  fecha_hasta: string;
  estado: string;
};
