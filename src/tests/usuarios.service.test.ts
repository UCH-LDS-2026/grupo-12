import {
  crearAdminBarrio,
  crearResidente,
  crearGuardia,
  obtenerUsuarioPorEmail,
  buscarUsuarios
} from '../services/usuarios.service';
import { supabase } from '../utils/supabase';
import { USER_ROLES } from '../utils/roles';

// Mock the supabase client
jest.mock('../utils/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('usuarios.service', () => {
  const mockUser = {
    id: '1',
    barrio_id: 'barrio-1',
    email: 'test@example.com',
    nombre: 'Test',
    apellido: 'User',
    rol: USER_ROLES.RESIDENTE,
    activo: true,
    created_at: '2023-01-01T00:00:00Z',
  };

  const mockInput = {
    barrio_id: 'barrio-1',
    email: 'test@example.com',
    nombre: 'Test',
    apellido: 'User',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('crearAdminBarrio', () => {
    it('should create an admin barrio successfully', async () => {
      const mockSingle = jest.fn().mockResolvedValue({ data: { ...mockUser, rol: USER_ROLES.ADMIN_BARRIO }, error: null });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

      const result = await crearAdminBarrio(mockInput);

      expect(supabase.from).toHaveBeenCalledWith('usuarios');
      expect(mockInsert).toHaveBeenCalledWith({
        ...mockInput,
        rol: USER_ROLES.ADMIN_BARRIO,
        activo: true,
      });
      expect(result.rol).toBe(USER_ROLES.ADMIN_BARRIO);
    });

    it('should throw error if supabase returns an error', async () => {
      const mockSingle = jest.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

      await expect(crearAdminBarrio(mockInput)).rejects.toThrow('Error al crear admin de barrio: Database error');
    });
  });

  describe('crearResidente', () => {
    it('should create a residente successfully', async () => {
      const mockSingle = jest.fn().mockResolvedValue({ data: mockUser, error: null });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

      const result = await crearResidente(mockInput);

      expect(supabase.from).toHaveBeenCalledWith('usuarios');
      expect(mockInsert).toHaveBeenCalledWith({
        ...mockInput,
        rol: USER_ROLES.RESIDENTE,
        activo: true,
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw error if supabase returns an error', async () => {
      const mockSingle = jest.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

      await expect(crearResidente(mockInput)).rejects.toThrow('Error al crear residente: Database error');
    });
  });

  describe('crearGuardia', () => {
    it('should create a guardia successfully', async () => {
      const mockSingle = jest.fn().mockResolvedValue({ data: { ...mockUser, rol: USER_ROLES.GUARDIA }, error: null });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

      const result = await crearGuardia(mockInput);

      expect(supabase.from).toHaveBeenCalledWith('usuarios');
      expect(mockInsert).toHaveBeenCalledWith({
        ...mockInput,
        rol: USER_ROLES.GUARDIA,
        activo: true,
      });
      expect(result.rol).toBe(USER_ROLES.GUARDIA);
    });

    it('should throw error if supabase returns an error', async () => {
      const mockSingle = jest.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

      await expect(crearGuardia(mockInput)).rejects.toThrow('Error al crear guardia: Database error');
    });
  });

  describe('obtenerUsuarioPorEmail', () => {
    it('should return user by email', async () => {
      const mockMaybeSingle = jest.fn().mockResolvedValue({ data: mockUser, error: null });
      const mockEq = jest.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await obtenerUsuarioPorEmail('test@example.com');

      expect(supabase.from).toHaveBeenCalledWith('usuarios');
      expect(mockEq).toHaveBeenCalledWith('email', 'test@example.com');
      expect(result).toEqual(mockUser);
    });

    it('should throw error if supabase returns an error', async () => {
      const mockMaybeSingle = jest.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } });
      const mockEq = jest.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      await expect(obtenerUsuarioPorEmail('test@example.com')).rejects.toThrow('Error al obtener usuario por email: Database error');
    });

    it('should return null if user not found', async () => {
      const mockMaybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });
      const mockEq = jest.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await obtenerUsuarioPorEmail('nonexistent@example.com');
      expect(result).toBeNull();
    });
  });

  describe('buscarUsuarios', () => {
    it('should fetch users with filters', async () => {
      const mockData = [mockUser];
      const mockQuery: any = {
        eq: jest.fn().mockImplementation(() => mockQuery),
        or: jest.fn().mockImplementation(() => mockQuery),
        then: jest.fn().mockImplementation((callback) => callback({ data: mockData, error: null })),
      };
      const mockSelect = jest.fn().mockReturnValue(mockQuery);
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const filtros = {
        barrio_id: 'barrio-1',
        rol: USER_ROLES.RESIDENTE,
        activo: true,
        nombreOApellido: 'Test',
      };

      const result = await buscarUsuarios(filtros);

      expect(supabase.from).toHaveBeenCalledWith('usuarios');
      expect(mockQuery.eq).toHaveBeenCalledWith('barrio_id', 'barrio-1');
      expect(mockQuery.eq).toHaveBeenCalledWith('rol', USER_ROLES.RESIDENTE);
      expect(mockQuery.eq).toHaveBeenCalledWith('activo', true);
      expect(mockQuery.or).toHaveBeenCalledWith('nombre.ilike.%Test%,apellido.ilike.%Test%');
      expect(result).toEqual(mockData);
    });

    it('should fetch users with partial filters', async () => {
      const mockQuery: any = {
        eq: jest.fn().mockImplementation(() => mockQuery),
        then: jest.fn().mockImplementation((callback) => callback({ data: [], error: null })),
      };
      const mockSelect = jest.fn().mockReturnValue(mockQuery);
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      await buscarUsuarios({ barrio_id: 'barrio-1' });

      expect(mockQuery.eq).toHaveBeenCalledWith('barrio_id', 'barrio-1');
      expect(mockQuery.eq).not.toHaveBeenCalledWith('rol', expect.any(String));
    });

    it('should fetch users with activo=false filter', async () => {
      const mockQuery: any = {
        eq: jest.fn().mockImplementation(() => mockQuery),
        then: jest.fn().mockImplementation((callback) => callback({ data: [], error: null })),
      };
      const mockSelect = jest.fn().mockReturnValue(mockQuery);
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      await buscarUsuarios({ activo: false });

      expect(mockQuery.eq).toHaveBeenCalledWith('activo', false);
    });

    it('should throw error if search fails', async () => {
      const mockQuery: any = {
        then: jest.fn().mockImplementation((callback) => callback({ data: null, error: { message: 'Search failed' } })),
      };
      const mockSelect = jest.fn().mockReturnValue(mockQuery);
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      await expect(buscarUsuarios({})).rejects.toThrow('Error al buscar usuarios: Search failed');
    });

    it('should return empty array if no results', async () => {
      const mockQuery: any = {
        then: jest.fn().mockImplementation((callback) => callback({ data: null, error: null })),
      };
      const mockSelect = jest.fn().mockReturnValue(mockQuery);
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await buscarUsuarios({});
      expect(result).toEqual([]);
    });
  });
});
