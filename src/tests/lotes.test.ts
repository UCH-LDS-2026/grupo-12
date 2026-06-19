import { crearLote, listarLotesPorBarrio, obtenerLotePorId } from '@/services/lotes.service';
import type { Lote } from '@/types/lote';
import { supabase } from '@/utils/supabase';

jest.mock('@/utils/supabase', () => ({
  supabase: { from: jest.fn() },
}));

const fromMock = supabase.from as jest.Mock;

// Construye un mock encadenable del query builder de Supabase.
// Cada método encadenable devuelve el mismo objeto; los terminales
// (single/maybeSingle/then) resuelven al resultado { data, error }.
function buildChain(result: { data: unknown; error: unknown }) {
  const chain: any = {
    insert: jest.fn(() => chain),
    select: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    order: jest.fn(() => chain),
    single: jest.fn(() => Promise.resolve(result)),
    maybeSingle: jest.fn(() => Promise.resolve(result)),
    then: (onFulfilled: any, onRejected: any) =>
      Promise.resolve(result).then(onFulfilled, onRejected),
  };
  return chain;
}

const loteEjemplo: Lote = {
  id: 'lote-1',
  barrio_id: 'barrio-1',
  manzana: 'A',
  numero: '15',
  calle: 'Los Aromos',
  descripcion: null,
  activo: true,
  created_at: '2026-01-01T00:00:00Z',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('crearLote', () => {
  it('crea un lote y devuelve el registro creado', async () => {
    const chain = buildChain({ data: loteEjemplo, error: null });
    fromMock.mockReturnValue(chain);
    const input = { barrio_id: 'barrio-1', manzana: 'A', numero: '15' };

    const result = await crearLote(input);

    expect(fromMock).toHaveBeenCalledWith('lotes');
    expect(chain.insert).toHaveBeenCalledWith(input);
    expect(result).toEqual(loteEjemplo);
  });

  it('lanza un error si Supabase falla', async () => {
    const chain = buildChain({ data: null, error: { message: 'fallo de red' } });
    fromMock.mockReturnValue(chain);

    await expect(
      crearLote({ barrio_id: 'barrio-1', manzana: 'A', numero: '15' }),
    ).rejects.toThrow('No se pudo crear el lote: fallo de red');
  });
});

describe('listarLotesPorBarrio', () => {
  it('devuelve los lotes activos del barrio', async () => {
    const chain = buildChain({ data: [loteEjemplo], error: null });
    fromMock.mockReturnValue(chain);

    const result = await listarLotesPorBarrio('barrio-1');

    expect(fromMock).toHaveBeenCalledWith('lotes');
    expect(chain.eq).toHaveBeenCalledWith('barrio_id', 'barrio-1');
    expect(chain.eq).toHaveBeenCalledWith('activo', true);
    expect(result).toEqual([loteEjemplo]);
  });

  it('lanza un error si Supabase falla', async () => {
    const chain = buildChain({ data: null, error: { message: 'boom' } });
    fromMock.mockReturnValue(chain);

    await expect(listarLotesPorBarrio('barrio-1')).rejects.toThrow(
      'No se pudieron obtener los lotes: boom',
    );
  });
});

describe('obtenerLotePorId', () => {
  it('devuelve el lote cuando existe', async () => {
    const chain = buildChain({ data: loteEjemplo, error: null });
    fromMock.mockReturnValue(chain);

    const result = await obtenerLotePorId('lote-1');

    expect(chain.eq).toHaveBeenCalledWith('id', 'lote-1');
    expect(result).toEqual(loteEjemplo);
  });

  it('devuelve null cuando el lote no existe', async () => {
    const chain = buildChain({ data: null, error: null });
    fromMock.mockReturnValue(chain);

    const result = await obtenerLotePorId('inexistente');

    expect(result).toBeNull();
  });

  it('lanza un error si Supabase falla', async () => {
    const chain = buildChain({ data: null, error: { message: 'boom' } });
    fromMock.mockReturnValue(chain);

    await expect(obtenerLotePorId('lote-1')).rejects.toThrow(
      'No se pudo obtener el lote: boom',
    );
  });
});
