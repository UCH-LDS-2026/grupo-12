// src/__tests__/usuarios.service.test.ts
// ============================================================
// Unit Tests — usuarios.service.ts
// Grupo 12 UCH LDS 2026
// ============================================================
// Mockeamos el módulo de supabase para aislar el servicio de
// cualquier llamada real a la base de datos.
// ============================================================

import {
    crearAdminBarrio,
    crearResidente,
    crearGuardia,
    listarUsuariosPorBarrio,
    listarUsuariosPorRol,
    obtenerUsuarioPorEmail,
    buscarUsuarios,
} from '../services/usuarios.service';
import { supabase } from '../utils/supabase';

// Mock completo del módulo supabase
jest.mock('../utils/supabase', () => ({
    supabase: {
        from: jest.fn(),
    },
}));

// ────────────────────────────────────────────────────────────
// Helper: construye el mock de la cadena
// supabase.from(...).insert(...).select().single()
// ────────────────────────────────────────────────────────────
function mockInsertChain(result: { data: unknown; error: unknown }) {
    const singleMock = jest.fn().mockResolvedValue(result);
    const selectMock = jest.fn().mockReturnValue({ single: singleMock });
    const insertMock = jest.fn().mockReturnValue({ select: selectMock });
    (supabase.from as jest.Mock).mockReturnValue({ insert: insertMock });

    return { insertMock, selectMock, singleMock };
}

// ────────────────────────────────────────────────────────────
// Helper: construye el mock de la cadena
// supabase.from(...).select().eq(...).eq(...).or(...).maybeSingle()
// El objeto devuelto es "thenable" para soportar `await` directo
// sobre cualquier punto de la cadena (sin invocar maybeSingle/single).
// ────────────────────────────────────────────────────────────
function mockSelectChain(result: { data: unknown; error: unknown }) {
    const chain: any = {
        eq: jest.fn(() => chain),
        or: jest.fn(() => chain),
        maybeSingle: jest.fn().mockResolvedValue(result),
        then: (resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve),
    };
    const selectMock = jest.fn().mockReturnValue(chain);
    (supabase.from as jest.Mock).mockReturnValue({ select: selectMock });

    return { selectMock, chain };
}

// ────────────────────────────────────────────────────────────
// Datos de prueba reutilizables
// ────────────────────────────────────────────────────────────
const inputBase = {
    barrio_id: 'uuid-barrio-1',
    email: 'usuario@test.com',
    password_hash: '$2b$10$hashEjemplo',
    nombre: 'Juan',
    apellido: 'Pérez',
};

const usuarioAdminMock = {
    id: 'uuid-usuario-1',
    ...inputBase,
    telefono: null,
    rol: 'admin_barrio' as const,
    activo: true,
    created_at: '2026-06-10T00:00:00Z',
};

const usuarioResidenteMock = { ...usuarioAdminMock, id: 'uuid-usuario-2', rol: 'residente' as const };
const usuarioGuardiaMock  = { ...usuarioAdminMock, id: 'uuid-usuario-3', rol: 'guardia' as const };

// ════════════════════════════════════════════════════════════
// Tests: crearAdminBarrio()
// ════════════════════════════════════════════════════════════
describe('crearAdminBarrio()', () => {
    beforeEach(() => jest.clearAllMocks());

    it('devuelve el admin creado cuando Supabase responde correctamente', async () => {
        mockInsertChain({ data: usuarioAdminMock, error: null });

        const resultado = await crearAdminBarrio(inputBase);

        expect(resultado).toEqual(usuarioAdminMock);
    });

    it('llama a supabase.from con la tabla "usuarios"', async () => {
        mockInsertChain({ data: usuarioAdminMock, error: null });

        await crearAdminBarrio(inputBase);

        expect(supabase.from).toHaveBeenCalledWith('usuarios');
    });

    it('inserta el rol "admin_barrio" sin importar lo que pase el llamador', async () => {
        const { insertMock } = mockInsertChain({ data: usuarioAdminMock, error: null });

        await crearAdminBarrio(inputBase);

        // El rol debe ser hardcodeado, no provenir del input
        expect(insertMock).toHaveBeenCalledWith(
            expect.objectContaining({ rol: 'admin_barrio' })
        );
    });

    it('lanza un Error con el mensaje de Supabase cuando hay un error de BD', async () => {
        mockInsertChain({ data: null, error: { message: 'duplicate key value' } });

        await expect(crearAdminBarrio(inputBase)).rejects.toThrow(
            'Error al crear usuario (admin_barrio): duplicate key value'
        );
    });

    it('lanza un Error genérico cuando Supabase devuelve data null sin error', async () => {
        mockInsertChain({ data: null, error: null });

        await expect(crearAdminBarrio(inputBase)).rejects.toThrow(
            'Error al crear usuario (admin_barrio): Supabase no devolvió ningún dato.'
        );
    });

    it('el resultado incluye id, rol y created_at generados por Supabase', async () => {
        mockInsertChain({ data: usuarioAdminMock, error: null });

        const resultado = await crearAdminBarrio(inputBase);

        expect(resultado).toHaveProperty('id', 'uuid-usuario-1');
        expect(resultado).toHaveProperty('rol', 'admin_barrio');
        expect(resultado).toHaveProperty('created_at', '2026-06-10T00:00:00Z');
    });
});

// ════════════════════════════════════════════════════════════
// Tests: crearResidente()
// ════════════════════════════════════════════════════════════
describe('crearResidente()', () => {
    beforeEach(() => jest.clearAllMocks());

    it('devuelve el residente creado cuando Supabase responde correctamente', async () => {
        mockInsertChain({ data: usuarioResidenteMock, error: null });

        const resultado = await crearResidente(inputBase);

        expect(resultado).toEqual(usuarioResidenteMock);
    });

    it('llama a supabase.from con la tabla "usuarios"', async () => {
        mockInsertChain({ data: usuarioResidenteMock, error: null });

        await crearResidente(inputBase);

        expect(supabase.from).toHaveBeenCalledWith('usuarios');
    });

    it('inserta el rol "residente" sin importar lo que pase el llamador', async () => {
        const { insertMock } = mockInsertChain({ data: usuarioResidenteMock, error: null });

        await crearResidente(inputBase);

        expect(insertMock).toHaveBeenCalledWith(
            expect.objectContaining({ rol: 'residente' })
        );
    });

    it('lanza un Error con el mensaje de Supabase cuando hay un error de BD', async () => {
        mockInsertChain({ data: null, error: { message: 'FK constraint violation' } });

        await expect(crearResidente(inputBase)).rejects.toThrow(
            'Error al crear usuario (residente): FK constraint violation'
        );
    });

    it('lanza un Error genérico cuando Supabase devuelve data null sin error', async () => {
        mockInsertChain({ data: null, error: null });

        await expect(crearResidente(inputBase)).rejects.toThrow(
            'Error al crear usuario (residente): Supabase no devolvió ningún dato.'
        );
    });

    it('acepta el campo opcional telefono y lo incluye en el insert', async () => {
        const inputConTelefono = { ...inputBase, telefono: '+54 261 123-4567' };
        const { insertMock } = mockInsertChain({ data: usuarioResidenteMock, error: null });

        await crearResidente(inputConTelefono);

        expect(insertMock).toHaveBeenCalledWith(
            expect.objectContaining({ telefono: '+54 261 123-4567' })
        );
    });
});

// ════════════════════════════════════════════════════════════
// Tests: crearGuardia()
// ════════════════════════════════════════════════════════════
describe('crearGuardia()', () => {
    beforeEach(() => jest.clearAllMocks());

    it('devuelve el guardia creado cuando Supabase responde correctamente', async () => {
        mockInsertChain({ data: usuarioGuardiaMock, error: null });

        const resultado = await crearGuardia(inputBase);

        expect(resultado).toEqual(usuarioGuardiaMock);
    });

    it('llama a supabase.from con la tabla "usuarios"', async () => {
        mockInsertChain({ data: usuarioGuardiaMock, error: null });

        await crearGuardia(inputBase);

        expect(supabase.from).toHaveBeenCalledWith('usuarios');
    });

    it('inserta el rol "guardia" sin importar lo que pase el llamador', async () => {
        const { insertMock } = mockInsertChain({ data: usuarioGuardiaMock, error: null });

        await crearGuardia(inputBase);

        expect(insertMock).toHaveBeenCalledWith(
            expect.objectContaining({ rol: 'guardia' })
        );
    });

    it('lanza un Error con el mensaje de Supabase cuando hay un error de BD', async () => {
        mockInsertChain({ data: null, error: { message: 'duplicate key value' } });

        await expect(crearGuardia(inputBase)).rejects.toThrow(
            'Error al crear usuario (guardia): duplicate key value'
        );
    });

    it('lanza un Error genérico cuando Supabase devuelve data null sin error', async () => {
        mockInsertChain({ data: null, error: null });

        await expect(crearGuardia(inputBase)).rejects.toThrow(
            'Error al crear usuario (guardia): Supabase no devolvió ningún dato.'
        );
    });

    it('el resultado tiene todos los campos del schema (id, barrio_id, email, nombre, apellido, rol, activo, created_at)', async () => {
        mockInsertChain({ data: usuarioGuardiaMock, error: null });

        const resultado = await crearGuardia(inputBase);

        expect(resultado).toMatchObject({
            id: expect.any(String),
            email: expect.any(String),
            nombre: expect.any(String),
            apellido: expect.any(String),
            rol: expect.stringMatching(/^(admin_barrio|residente|guardia)$/),
            activo: expect.any(Boolean),
            created_at: expect.any(String),
        });
    });
});

// ════════════════════════════════════════════════════════════
// Tests: listarUsuariosPorBarrio()
// ════════════════════════════════════════════════════════════
describe('listarUsuariosPorBarrio()', () => {
    beforeEach(() => jest.clearAllMocks());

    it('devuelve la lista de usuarios del barrio cuando Supabase responde correctamente', async () => {
        mockSelectChain({ data: [usuarioAdminMock, usuarioResidenteMock], error: null });

        const resultado = await listarUsuariosPorBarrio('uuid-barrio-1');

        expect(resultado).toEqual([usuarioAdminMock, usuarioResidenteMock]);
    });

    it('llama a supabase.from con la tabla "usuarios" y filtra por barrio_id', async () => {
        const { chain } = mockSelectChain({ data: [], error: null });

        await listarUsuariosPorBarrio('uuid-barrio-1');

        expect(supabase.from).toHaveBeenCalledWith('usuarios');
        expect(chain.eq).toHaveBeenCalledWith('barrio_id', 'uuid-barrio-1');
    });

    it('devuelve un arreglo vacío cuando Supabase responde data null', async () => {
        mockSelectChain({ data: null, error: null });

        const resultado = await listarUsuariosPorBarrio('uuid-barrio-1');

        expect(resultado).toEqual([]);
    });

    it('lanza un Error con el mensaje de Supabase cuando hay un error de BD', async () => {
        mockSelectChain({ data: null, error: { message: 'connection error' } });

        await expect(listarUsuariosPorBarrio('uuid-barrio-1')).rejects.toThrow(
            'Error al listar usuarios del barrio: connection error'
        );
    });
});

// ════════════════════════════════════════════════════════════
// Tests: listarUsuariosPorRol()
// ════════════════════════════════════════════════════════════
describe('listarUsuariosPorRol()', () => {
    beforeEach(() => jest.clearAllMocks());

    it('devuelve la lista de usuarios filtrada por rol', async () => {
        mockSelectChain({ data: [usuarioGuardiaMock], error: null });

        const resultado = await listarUsuariosPorRol('uuid-barrio-1', 'guardia');

        expect(resultado).toEqual([usuarioGuardiaMock]);
    });

    it('filtra por barrio_id y rol', async () => {
        const { chain } = mockSelectChain({ data: [], error: null });

        await listarUsuariosPorRol('uuid-barrio-1', 'residente');

        expect(chain.eq).toHaveBeenNthCalledWith(1, 'barrio_id', 'uuid-barrio-1');
        expect(chain.eq).toHaveBeenNthCalledWith(2, 'rol', 'residente');
    });

    it('lanza un Error con el mensaje de Supabase cuando hay un error de BD', async () => {
        mockSelectChain({ data: null, error: { message: 'connection error' } });

        await expect(listarUsuariosPorRol('uuid-barrio-1', 'guardia')).rejects.toThrow(
            'Error al listar usuarios por rol: connection error'
        );
    });
});

// ════════════════════════════════════════════════════════════
// Tests: obtenerUsuarioPorEmail()
// ════════════════════════════════════════════════════════════
describe('obtenerUsuarioPorEmail()', () => {
    beforeEach(() => jest.clearAllMocks());

    it('devuelve el usuario cuando existe', async () => {
        mockSelectChain({ data: usuarioAdminMock, error: null });

        const resultado = await obtenerUsuarioPorEmail('usuario@test.com');

        expect(resultado).toEqual(usuarioAdminMock);
    });

    it('filtra por email y usa maybeSingle', async () => {
        const { chain } = mockSelectChain({ data: usuarioAdminMock, error: null });

        await obtenerUsuarioPorEmail('usuario@test.com');

        expect(chain.eq).toHaveBeenCalledWith('email', 'usuario@test.com');
        expect(chain.maybeSingle).toHaveBeenCalled();
    });

    it('devuelve null cuando no existe ningún usuario con ese email', async () => {
        mockSelectChain({ data: null, error: null });

        const resultado = await obtenerUsuarioPorEmail('inexistente@test.com');

        expect(resultado).toBeNull();
    });

    it('lanza un Error con el mensaje de Supabase cuando hay un error de BD', async () => {
        mockSelectChain({ data: null, error: { message: 'connection error' } });

        await expect(obtenerUsuarioPorEmail('usuario@test.com')).rejects.toThrow(
            'Error al obtener usuario por email: connection error'
        );
    });
});

// ════════════════════════════════════════════════════════════
// Tests: buscarUsuarios()
// ════════════════════════════════════════════════════════════
describe('buscarUsuarios()', () => {
    beforeEach(() => jest.clearAllMocks());

    it('devuelve la lista de usuarios sin aplicar filtros', async () => {
        mockSelectChain({ data: [usuarioAdminMock], error: null });

        const resultado = await buscarUsuarios({});

        expect(resultado).toEqual([usuarioAdminMock]);
    });

    it('aplica los filtros barrio_id, rol y activo cuando se proveen', async () => {
        const { chain } = mockSelectChain({ data: [], error: null });

        await buscarUsuarios({ barrio_id: 'uuid-barrio-1', rol: 'residente', activo: true });

        expect(chain.eq).toHaveBeenCalledWith('barrio_id', 'uuid-barrio-1');
        expect(chain.eq).toHaveBeenCalledWith('rol', 'residente');
        expect(chain.eq).toHaveBeenCalledWith('activo', true);
    });

    it('aplica el filtro nombreOApellido usando "or" con ilike', async () => {
        const { chain } = mockSelectChain({ data: [], error: null });

        await buscarUsuarios({ nombreOApellido: 'gonz' });

        expect(chain.or).toHaveBeenCalledWith('nombre.ilike.%gonz%,apellido.ilike.%gonz%');
    });

    it('devuelve un arreglo vacío cuando Supabase responde data null', async () => {
        mockSelectChain({ data: null, error: null });

        const resultado = await buscarUsuarios({});

        expect(resultado).toEqual([]);
    });

    it('lanza un Error con el mensaje de Supabase cuando hay un error de BD', async () => {
        mockSelectChain({ data: null, error: { message: 'connection error' } });

        await expect(buscarUsuarios({})).rejects.toThrow(
            'Error al buscar usuarios: connection error'
        );
    });
});
