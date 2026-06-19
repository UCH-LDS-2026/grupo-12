import { crearVisita, listarVisitasPorResidente, cancelarVisita } from '../services/visitas.service';
import { supabase } from '../utils/supabase';

jest.mock('../utils/supabase', () => ({
  supabase: { from: jest.fn() },
}));

// Mock de la cadena supabase.from(...).insert(...).select().single()
function mockInsertChain(result: { data: unknown; error: unknown }) {
  const singleMock = jest.fn().mockResolvedValue(result);
  const selectMock = jest.fn().mockReturnValue({ single: singleMock });
  const insertMock = jest.fn().mockReturnValue({ select: selectMock });
  (supabase.from as jest.Mock).mockReturnValue({ insert: insertMock });
  return { insertMock, selectMock, singleMock };
}

// Mock de la cadena supabase.from(...).select(...).eq(...).order(...) (thenable)
function mockSelectChain(result: { data: unknown; error: unknown }) {
  const chain: any = {
    eq: jest.fn(() => chain),
    order: jest.fn(() => chain),
    then: (resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve),
  };
  const selectMock = jest.fn().mockReturnValue(chain);
  (supabase.from as jest.Mock).mockReturnValue({ select: selectMock });
  return { selectMock, chain };
}

// Mock de la cadena supabase.from(...).update(...).eq(...).select().maybeSingle()
function mockUpdateChain(result: { data: unknown; error: unknown }) {
  const maybeSingleMock = jest.fn().mockResolvedValue(result);
  const selectMock = jest.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
  const eqMock = jest.fn().mockReturnValue({ select: selectMock });
  const updateMock = jest.fn().mockReturnValue({ eq: eqMock });
  (supabase.from as jest.Mock).mockReturnValue({ update: updateMock });
  return { updateMock, eqMock, selectMock, maybeSingleMock };
}

const inputMock = {
  barrio_id: 'uuid-barrio-1',
  autorizado_por_user_id: 'uuid-residente-1',
  nombre_visitante: 'Pedro Gómez',
  dni: '30123456',
  fecha_desde: '2026-06-13T10:00:00Z',
  fecha_hasta: '2026-06-13T20:00:00Z',
};

const visitaMock = {
  id: 'uuid-visita-1',
  ...inputMock,
  telefono: null,
  patente: null,
  estado: 'pendiente' as const,
  created_at: '2026-06-12T00:00:00Z',
};

describe('crearVisita()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('devuelve la visita creada cuando Supabase responde correctamente', async () => {
    mockInsertChain({ data: visitaMock, error: null });

    const resultado = await crearVisita(inputMock);

    expect(resultado).toEqual(visitaMock);
  });

  it('llama a supabase.from con la tabla "visitas"', async () => {
    mockInsertChain({ data: visitaMock, error: null });

    await crearVisita(inputMock);

    expect(supabase.from).toHaveBeenCalledWith('visitas');
  });

  it('inserta los datos con el DNI y el estado "pendiente"', async () => {
    const { insertMock } = mockInsertChain({ data: visitaMock, error: null });

    await crearVisita(inputMock);

    expect(insertMock).toHaveBeenCalledWith({ ...inputMock, estado: 'pendiente' });
  });

  it('lanza un Error con el mensaje de Supabase cuando hay un error de BD', async () => {
    mockInsertChain({ data: null, error: { message: 'FK constraint violation' } });

    await expect(crearVisita(inputMock)).rejects.toThrow(
      'Error al crear visita: FK constraint violation'
    );
  });

  it('lanza un Error genérico cuando Supabase devuelve data null sin error', async () => {
    mockInsertChain({ data: null, error: null });

    await expect(crearVisita(inputMock)).rejects.toThrow(
      'Error al crear visita: Supabase no devolvió ningún dato.'
    );
  });
});

describe('listarVisitasPorResidente()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('devuelve las visitas del residente', async () => {
    mockSelectChain({ data: [visitaMock], error: null });

    const resultado = await listarVisitasPorResidente('uuid-residente-1');

    expect(resultado).toEqual([visitaMock]);
  });

  it('filtra por autorizado_por_user_id', async () => {
    const { chain } = mockSelectChain({ data: [], error: null });

    await listarVisitasPorResidente('uuid-residente-1');

    expect(supabase.from).toHaveBeenCalledWith('visitas');
    expect(chain.eq).toHaveBeenCalledWith('autorizado_por_user_id', 'uuid-residente-1');
  });

  it('devuelve un arreglo vacío cuando Supabase responde data null', async () => {
    mockSelectChain({ data: null, error: null });

    const resultado = await listarVisitasPorResidente('uuid-residente-1');

    expect(resultado).toEqual([]);
  });

  it('lanza un Error con el mensaje de Supabase cuando hay un error de BD', async () => {
    mockSelectChain({ data: null, error: { message: 'connection error' } });

    await expect(listarVisitasPorResidente('uuid-residente-1')).rejects.toThrow(
      'Error al listar visitas: connection error'
    );
  });
});

describe('cancelarVisita()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('marca la visita como "cancelada" y la devuelve', async () => {
    const canceladaMock = { ...visitaMock, estado: 'cancelada' };
    const { updateMock, eqMock } = mockUpdateChain({ data: canceladaMock, error: null });

    const resultado = await cancelarVisita('uuid-visita-1');

    expect(supabase.from).toHaveBeenCalledWith('visitas');
    expect(updateMock).toHaveBeenCalledWith({ estado: 'cancelada' });
    expect(eqMock).toHaveBeenCalledWith('id', 'uuid-visita-1');
    expect(resultado.estado).toBe('cancelada');
  });

  it('lanza un Error cuando no existe una visita con ese id', async () => {
    mockUpdateChain({ data: null, error: null });

    await expect(cancelarVisita('inexistente')).rejects.toThrow(
      'Error al cancelar la visita: no existe una visita con id inexistente.'
    );
  });

  it('lanza un Error con el mensaje de Supabase cuando hay un error de BD', async () => {
    mockUpdateChain({ data: null, error: { message: 'connection error' } });

    await expect(cancelarVisita('uuid-visita-1')).rejects.toThrow(
      'Error al cancelar la visita: connection error'
    );
  });
});
