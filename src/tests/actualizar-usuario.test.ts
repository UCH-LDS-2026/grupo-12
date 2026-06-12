import { actualizarUsuario } from '../services/usuarios.service';
import { supabase } from '../utils/supabase';

jest.mock('../utils/supabase', () => ({
  supabase: { from: jest.fn() },
}));

// Mock de la cadena supabase.from(...).update(...).eq(...).select().maybeSingle()
function mockUpdateChain(result: { data: unknown; error: unknown }) {
  const maybeSingleMock = jest.fn().mockResolvedValue(result);
  const selectMock = jest.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
  const eqMock = jest.fn().mockReturnValue({ select: selectMock });
  const updateMock = jest.fn().mockReturnValue({ eq: eqMock });
  (supabase.from as jest.Mock).mockReturnValue({ update: updateMock });
  return { updateMock, eqMock, selectMock, maybeSingleMock };
}

const usuarioMock = {
  id: 'uuid-usuario-2',
  barrio_id: 'uuid-barrio-1',
  email: 'usuario@test.com',
  nombre: 'Juan',
  apellido: 'Pérez',
  telefono: null,
  rol: 'residente' as const,
  activo: true,
  created_at: '2026-06-10T00:00:00Z',
};

describe('actualizarUsuario()', () => {
  beforeEach(() => jest.clearAllMocks());

  const cambios = { nombre: 'Juan Carlos', telefono: '+54 261 555-0000' };
  const usuarioActualizado = { ...usuarioMock, ...cambios };

  it('devuelve el usuario actualizado cuando Supabase responde correctamente', async () => {
    mockUpdateChain({ data: usuarioActualizado, error: null });

    const resultado = await actualizarUsuario('uuid-usuario-2', cambios);

    expect(resultado).toEqual(usuarioActualizado);
  });

  it('llama a supabase.from con "usuarios", aplica los cambios y filtra por id', async () => {
    const { updateMock, eqMock } = mockUpdateChain({ data: usuarioActualizado, error: null });

    await actualizarUsuario('uuid-usuario-2', cambios);

    expect(supabase.from).toHaveBeenCalledWith('usuarios');
    expect(updateMock).toHaveBeenCalledWith(cambios);
    expect(eqMock).toHaveBeenCalledWith('id', 'uuid-usuario-2');
  });

  it('solo envía los campos provistos (update parcial)', async () => {
    const { updateMock } = mockUpdateChain({ data: usuarioActualizado, error: null });

    await actualizarUsuario('uuid-usuario-2', { telefono: '+54 261 111-2222' });

    expect(updateMock).toHaveBeenCalledWith({ telefono: '+54 261 111-2222' });
  });

  it('lanza un Error con el mensaje de Supabase cuando hay un error de BD', async () => {
    mockUpdateChain({ data: null, error: { message: 'connection error' } });

    await expect(actualizarUsuario('uuid-usuario-2', cambios)).rejects.toThrow(
      'Error al actualizar usuario: connection error'
    );
  });

  it('lanza un Error cuando no existe un usuario con ese id', async () => {
    mockUpdateChain({ data: null, error: null });

    await expect(actualizarUsuario('uuid-inexistente', cambios)).rejects.toThrow(
      'Error al actualizar usuario: no existe un usuario con id uuid-inexistente.'
    );
  });
});
