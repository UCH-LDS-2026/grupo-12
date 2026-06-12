// src/__tests__/barrios.service.test.ts
// ============================================================
// Unit Tests — barrios.service.ts
// Grupo 12 UCH LDS 2026
// ============================================================
// Mockeamos el módulo de supabase para aislar el servicio de
// cualquier llamada real a la base de datos.
// ============================================================

import { crearBarrio, obtenerBarrio } from '../services/barrios.service';
import { supabase } from '../utils/supabase';

// Mock completo del módulo supabase
jest.mock('../utils/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// ────────────────────────────────────────────────────────────
// Helpers para construir la cadena de llamadas de Supabase
// ────────────────────────────────────────────────────────────

/**
 * Construye el mock de la cadena supabase.from(...).insert(...).select().single()
 * y configura qué valor devolverá .single()
 */
function mockInsertChain(result: { data: unknown; error: unknown }) {
  const singleMock = jest.fn().mockResolvedValue(result);
  const selectMock = jest.fn().mockReturnValue({ single: singleMock });
  const insertMock = jest.fn().mockReturnValue({ select: selectMock });
  (supabase.from as jest.Mock).mockReturnValue({ insert: insertMock });

  return { insertMock, selectMock, singleMock };
}

/**
 * Construye el mock de la cadena supabase.from(...).select(...).eq(...).single()
 * y configura qué valor devolverá .single()
 */
function mockSelectChain(result: { data: unknown; error: unknown }) {
  const singleMock = jest.fn().mockResolvedValue(result);
  const eqMock = jest.fn().mockReturnValue({ single: singleMock });
  const selectMock = jest.fn().mockReturnValue({ eq: eqMock });
  (supabase.from as jest.Mock).mockReturnValue({ select: selectMock });

  return { selectMock, eqMock, singleMock };
}

// ────────────────────────────────────────────────────────────
// Datos de prueba reutilizables
// ────────────────────────────────────────────────────────────

const barrioMock = {
  id: 'uuid-barrio-1',
  super_admin_id: 'uuid-admin-1',
  nombre: 'Barrio Las Heras',
  direccion: 'Av. Las Heras 1234, Mendoza',
  status: 'activo' as const,
  logo_url: null,
  created_at: '2026-06-10T00:00:00Z',
};

const inputMock = {
  super_admin_id: 'uuid-admin-1',
  nombre: 'Barrio Las Heras',
  direccion: 'Av. Las Heras 1234, Mendoza',
};

// ────────────────────────────────────────────────────────────
// Tests: crearBarrio()
// ────────────────────────────────────────────────────────────

describe('crearBarrio()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('devuelve el barrio creado cuando Supabase responde correctamente', async () => {
    mockInsertChain({ data: barrioMock, error: null });

    const resultado = await crearBarrio(inputMock);

    expect(resultado).toEqual(barrioMock);
  });

  it('llama a supabase.from con la tabla "barrios"', async () => {
    mockInsertChain({ data: barrioMock, error: null });

    await crearBarrio(inputMock);

    expect(supabase.from).toHaveBeenCalledWith('barrios');
  });

  it('pasa los datos correctos a .insert()', async () => {
    const { insertMock } = mockInsertChain({ data: barrioMock, error: null });

    await crearBarrio(inputMock);

    expect(insertMock).toHaveBeenCalledWith(inputMock);
  });

  it('lanza un Error con el mensaje de Supabase cuando hay un error de BD', async () => {
    mockInsertChain({ data: null, error: { message: 'FK constraint violation' } });

    await expect(crearBarrio(inputMock)).rejects.toThrow(
      'Error al crear barrio: FK constraint violation'
    );
  });

  it('lanza un Error genérico cuando Supabase devuelve data null sin error', async () => {
    mockInsertChain({ data: null, error: null });

    await expect(crearBarrio(inputMock)).rejects.toThrow(
      'Error al crear barrio: Supabase no devolvió ningún dato.'
    );
  });

  it('incluye el id y created_at generados por Supabase en el resultado', async () => {
    mockInsertChain({ data: barrioMock, error: null });

    const resultado = await crearBarrio(inputMock);

    expect(resultado).toHaveProperty('id', 'uuid-barrio-1');
    expect(resultado).toHaveProperty('created_at', '2026-06-10T00:00:00Z');
  });
});

// ────────────────────────────────────────────────────────────
// Tests: obtenerBarrio()
// ────────────────────────────────────────────────────────────

describe('obtenerBarrio()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('devuelve el barrio correcto cuando Supabase lo encuentra', async () => {
    mockSelectChain({ data: barrioMock, error: null });

    const resultado = await obtenerBarrio('uuid-barrio-1');

    expect(resultado).toEqual(barrioMock);
  });

  it('llama a supabase.from con la tabla "barrios"', async () => {
    mockSelectChain({ data: barrioMock, error: null });

    await obtenerBarrio('uuid-barrio-1');

    expect(supabase.from).toHaveBeenCalledWith('barrios');
  });

  it('filtra por el id correcto usando .eq("id", id)', async () => {
    const { eqMock } = mockSelectChain({ data: barrioMock, error: null });

    await obtenerBarrio('uuid-barrio-1');

    expect(eqMock).toHaveBeenCalledWith('id', 'uuid-barrio-1');
  });

  it('lanza un Error con el mensaje de Supabase cuando el barrio no existe', async () => {
    mockSelectChain({ data: null, error: { message: 'Row not found' } });

    await expect(obtenerBarrio('id-inexistente')).rejects.toThrow(
      'Error al obtener barrio con id "id-inexistente": Row not found'
    );
  });

  it('lanza un Error genérico cuando Supabase devuelve data null sin error', async () => {
    mockSelectChain({ data: null, error: null });

    await expect(obtenerBarrio('uuid-barrio-1')).rejects.toThrow(
      'Error al obtener barrio con id "uuid-barrio-1": Supabase no devolvió ningún dato.'
    );
  });

  it('devuelve todos los campos del barrio (id, nombre, direccion, status, logo_url, created_at)', async () => {
    mockSelectChain({ data: barrioMock, error: null });

    const resultado = await obtenerBarrio('uuid-barrio-1');

    expect(resultado).toMatchObject({
      id: expect.any(String),
      nombre: expect.any(String),
      direccion: expect.any(String),
      status: expect.stringMatching(/^(activo|inactivo)$/),
      created_at: expect.any(String),
    });
  });
});
