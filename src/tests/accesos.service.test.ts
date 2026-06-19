import {
  buscarVisitaVigentePorDni,
  registrarIngreso,
  buscarVisitaIngresadaPorDni,
  registrarEgreso,
} from '../services/accesos.service';
import { supabase } from '../utils/supabase';

jest.mock('../utils/supabase', () => ({
  supabase: { from: jest.fn() },
}));

// Construye un mock encadenable: los métodos de filtro/escritura devuelven la misma cadena;
// single/maybeSingle/then resuelven al resultado { data, error }.
function buildChain(result: { data: unknown; error: unknown }) {
  const chain: any = {};
  for (const m of ['select', 'insert', 'update', 'eq', 'in', 'lte', 'gte', 'order', 'limit']) {
    chain[m] = jest.fn(() => chain);
  }
  chain.single = jest.fn(() => Promise.resolve(result));
  chain.maybeSingle = jest.fn(() => Promise.resolve(result));
  chain.then = (resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve);
  return chain;
}

// Configura supabase.from(...) para que devuelva una cadena con ese resultado.
function setupChain(result: { data: unknown; error: unknown }) {
  const chain = buildChain(result);
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

const visitaIngresadaMock = { ...visitaMock, estado: 'ingresada' };

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

  it('devuelve la visita cuando hay una vigente para ese DNI en el barrio', async () => {
    setupChain({ data: visitaMock, error: null });

    const resultado = await buscarVisitaVigentePorDni('30123456', 'uuid-barrio-1');

    expect(resultado).toEqual(visitaMock);
  });

  it('busca en "visitas" filtrando por dni, barrio y estados vigentes', async () => {
    const chain = setupChain({ data: visitaMock, error: null });

    await buscarVisitaVigentePorDni('30123456', 'uuid-barrio-1');

    expect(supabase.from).toHaveBeenCalledWith('visitas');
    expect(chain.eq).toHaveBeenCalledWith('dni', '30123456');
    expect(chain.eq).toHaveBeenCalledWith('barrio_id', 'uuid-barrio-1');
    expect(chain.in).toHaveBeenCalledWith('estado', ['pendiente', 'aprobada']);
  });

  it('devuelve null cuando no hay visita vigente', async () => {
    setupChain({ data: null, error: null });

    const resultado = await buscarVisitaVigentePorDni('00000000', 'uuid-barrio-1');

    expect(resultado).toBeNull();
  });

  it('lanza un Error con el mensaje de Supabase cuando hay un error de BD', async () => {
    setupChain({ data: null, error: { message: 'connection error' } });

    await expect(buscarVisitaVigentePorDni('30123456', 'uuid-barrio-1')).rejects.toThrow(
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

  it('lanza un Error si falla al marcar la visita como ingresada', async () => {
    // El insert del acceso sale bien, pero el update de la visita falla.
    (supabase.from as jest.Mock)
      .mockReturnValueOnce(buildChain({ data: accesoMock, error: null }))
      .mockReturnValueOnce(buildChain({ data: null, error: { message: 'rls denied' } }));

    await expect(registrarIngreso(visitaMock, 'uuid-guardia-1')).rejects.toThrow(
      'Error al marcar la visita como ingresada: rls denied'
    );
  });
});

describe('buscarVisitaIngresadaPorDni()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('devuelve la visita ingresada para ese DNI en el barrio', async () => {
    setupChain({ data: visitaIngresadaMock, error: null });

    const resultado = await buscarVisitaIngresadaPorDni('30123456', 'uuid-barrio-1');

    expect(resultado).toEqual(visitaIngresadaMock);
  });

  it('busca en "visitas" filtrando por dni, barrio y estado "ingresada"', async () => {
    const chain = setupChain({ data: visitaIngresadaMock, error: null });

    await buscarVisitaIngresadaPorDni('30123456', 'uuid-barrio-1');

    expect(supabase.from).toHaveBeenCalledWith('visitas');
    expect(chain.eq).toHaveBeenCalledWith('dni', '30123456');
    expect(chain.eq).toHaveBeenCalledWith('barrio_id', 'uuid-barrio-1');
    expect(chain.eq).toHaveBeenCalledWith('estado', 'ingresada');
  });

  it('devuelve null cuando no hay visita ingresada', async () => {
    setupChain({ data: null, error: null });

    const resultado = await buscarVisitaIngresadaPorDni('00000000', 'uuid-barrio-1');

    expect(resultado).toBeNull();
  });

  it('lanza un Error con el mensaje de Supabase cuando hay un error de BD', async () => {
    setupChain({ data: null, error: { message: 'connection error' } });

    await expect(buscarVisitaIngresadaPorDni('30123456', 'uuid-barrio-1')).rejects.toThrow(
      'Error al buscar la visita ingresada por DNI: connection error'
    );
  });
});

describe('registrarEgreso()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('registra el acceso de egreso con los datos correctos', async () => {
    const chain = setupChain({ data: { ...accesoMock, tipo: 'egreso' }, error: null });

    const resultado = await registrarEgreso(visitaIngresadaMock, 'uuid-guardia-1');

    expect(supabase.from).toHaveBeenCalledWith('accesos');
    expect(chain.insert).toHaveBeenCalledWith({
      barrio_id: 'uuid-barrio-1',
      visita_id: 'uuid-visita-1',
      guardia_user_id: 'uuid-guardia-1',
      tipo: 'egreso',
    });
    expect(resultado).toEqual({ ...accesoMock, tipo: 'egreso' });
  });

  it('lanza un Error si Supabase falla al registrar el egreso', async () => {
    setupChain({ data: null, error: { message: 'FK constraint violation' } });

    await expect(registrarEgreso(visitaIngresadaMock, 'uuid-guardia-1')).rejects.toThrow(
      'Error al registrar el egreso: FK constraint violation'
    );
  });
});
