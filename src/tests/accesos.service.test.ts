import { buscarVisitaVigentePorDni, registrarIngreso } from '../services/accesos.service';
import { supabase } from '../utils/supabase';

jest.mock('../utils/supabase', () => ({
  supabase: { from: jest.fn() },
}));

// Mock encadenable: todos los métodos de filtro/escritura devuelven la misma cadena;
// single/maybeSingle/then resuelven al resultado { data, error }.
function setupChain(result: { data: unknown; error: unknown }) {
  const chain: any = {};
  for (const m of ['select', 'insert', 'update', 'eq', 'in', 'lte', 'gte', 'order', 'limit']) {
    chain[m] = jest.fn(() => chain);
  }
  chain.single = jest.fn(() => Promise.resolve(result));
  chain.maybeSingle = jest.fn(() => Promise.resolve(result));
  chain.then = (resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve);
  (supabase.from as jest.Mock).mockReturnValue(chain);
  return chain;
}

const visitaMock = {
  id: 'uuid-visita-1',
  barrio_id: 'uuid-barrio-1',
  nombre_visitante: 'Pedro Gómez',
  dni: '30123456',
  fecha_desde: '2026-06-13T10:00:00Z',
  fecha_hasta: '2026-06-13T20:00:00Z',
  estado: 'pendiente',
};

const accesoMock = {
  id: 'uuid-acceso-1',
  barrio_id: 'uuid-barrio-1',
  visita_id: 'uuid-visita-1',
  autorizacion_permanente_id: null,
  guardia_user_id: 'uuid-guardia-1',
  tipo: 'ingreso' as const,
  fecha: '2026-06-13T11:00:00Z',
  observaciones: null,
};

describe('buscarVisitaVigentePorDni()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('devuelve la visita cuando hay una vigente para ese DNI', async () => {
    setupChain({ data: visitaMock, error: null });

    const resultado = await buscarVisitaVigentePorDni('30123456');

    expect(resultado).toEqual(visitaMock);
  });

  it('busca en "visitas" filtrando por dni y estados vigentes', async () => {
    const chain = setupChain({ data: visitaMock, error: null });

    await buscarVisitaVigentePorDni('30123456');

    expect(supabase.from).toHaveBeenCalledWith('visitas');
    expect(chain.eq).toHaveBeenCalledWith('dni', '30123456');
    expect(chain.in).toHaveBeenCalledWith('estado', ['pendiente', 'aprobada']);
  });

  it('devuelve null cuando no hay visita vigente', async () => {
    setupChain({ data: null, error: null });

    const resultado = await buscarVisitaVigentePorDni('00000000');

    expect(resultado).toBeNull();
  });

  it('lanza un Error con el mensaje de Supabase cuando hay un error de BD', async () => {
    setupChain({ data: null, error: { message: 'connection error' } });

    await expect(buscarVisitaVigentePorDni('30123456')).rejects.toThrow(
      'Error al buscar la visita por DNI: connection error'
    );
  });
});

describe('registrarIngreso()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('registra el acceso de ingreso con los datos correctos', async () => {
    const chain = setupChain({ data: accesoMock, error: null });

    const resultado = await registrarIngreso(visitaMock, 'uuid-guardia-1');

    expect(supabase.from).toHaveBeenCalledWith('accesos');
    expect(chain.insert).toHaveBeenCalledWith({
      barrio_id: 'uuid-barrio-1',
      visita_id: 'uuid-visita-1',
      guardia_user_id: 'uuid-guardia-1',
      tipo: 'ingreso',
    });
    expect(resultado).toEqual(accesoMock);
  });

  it('marca la visita como "ingresada"', async () => {
    const chain = setupChain({ data: accesoMock, error: null });

    await registrarIngreso(visitaMock, 'uuid-guardia-1');

    expect(supabase.from).toHaveBeenCalledWith('visitas');
    expect(chain.update).toHaveBeenCalledWith({ estado: 'ingresada' });
    expect(chain.eq).toHaveBeenCalledWith('id', 'uuid-visita-1');
  });

  it('lanza un Error si Supabase falla al registrar el ingreso', async () => {
    setupChain({ data: null, error: { message: 'FK constraint violation' } });

    await expect(registrarIngreso(visitaMock, 'uuid-guardia-1')).rejects.toThrow(
      'Error al registrar el ingreso: FK constraint violation'
    );
  });
});
