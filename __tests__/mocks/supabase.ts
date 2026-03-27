/**
 * Mock de Supabase para testing
 * Proporciona un cliente mock que simula las operaciones de Supabase
 */

// Tipo para el mock de Supabase
export type MockSupabaseClient = {
  from: jest.Mock
  auth: {
    getUser: jest.Mock
    signIn: jest.Mock
    signOut: jest.Mock
  }
}

/**
 * Crea un mock del cliente de Supabase
 */
export function createMockSupabaseClient(): MockSupabaseClient {
  // Builder para queries
  const createQueryBuilder = (tableData: unknown[] = []) => {
    const builder = {
      data: tableData,
      error: null,
      count: tableData.length,

      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),

      then: jest.fn((callback: (result: { data: unknown; error: null }) => unknown) =>
        Promise.resolve(callback({ data: tableData, error: null }))
      ),
    }

    return builder
  }

  // Data tables mock
  const tables: Record<string, unknown[]> = {
    alumnos: [],
    profesores: [],
    clases: [],
    pagos: [],
  }

  const mockClient = {
    from: jest.fn((table: string) => createQueryBuilder(tables[table] || [])),
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      }),
      signIn: jest.fn().mockResolvedValue({ data: null, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
  }

  return mockClient as MockSupabaseClient
}

/**
 * Mock factory para el módulo de Supabase
 * Uso: jest.mock('@/lib/supabase-client', () => mockSupabaseModule())
 */
export function mockSupabaseModule() {
  const mockClient = createMockSupabaseClient()

  return {
    createClient: jest.fn(() => mockClient),
    __mockClient: mockClient, // Exportar para acceso en tests
  }
}

/**
 * Helper para simular errores de Supabase
 */
export function mockSupabaseError(
  mockClient: MockSupabaseClient,
  operation: string,
  errorMessage: string
) {
  const error = { message: errorMessage, code: 'TEST_ERROR' }

  switch (operation) {
    case 'select':
      mockClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error }),
      })
      break
    case 'insert':
      mockClient.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: null, error }),
      })
      break
    case 'update':
      mockClient.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: null, error }),
      })
      break
    case 'delete':
      mockClient.from.mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error }),
      })
      break
    case 'auth':
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error,
      })
      break
  }
}

/**
 * Mock de usuario autenticado
 */
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  aud: 'authenticated',
  role: 'authenticated',
  created_at: '2024-01-01T00:00:00.000Z',
}

/**
 * Mock de alumno para tests
 */
export const mockAlumno = {
  id: 'test-alumno-id',
  user_id: 'test-user-id',
  nombre: 'Juan Pérez',
  dni: '12345678',
  telefono: '11 1234-5678',
  email: 'juan@example.com',
  direccion: 'Calle Falsa 123',
  contacto_emergencia: 'María Pérez 11 8765-4321',
  medico: 'Dr. García',
  fecha_alta: '2024-01-15',
  estado: 'activo',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
}
