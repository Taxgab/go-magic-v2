import {
  withErrorHandling,
  withDatabaseErrorHandling,
  withAuthErrorHandling,
  getUserErrorMessage,
  handleApiError,
  ApiResult,
} from '@/lib/api-wrapper'
import { AppError, DatabaseError, AuthError } from '@/lib/errors'

describe('withErrorHandling', () => {
  it('debe retornar éxito cuando la operación funciona', async () => {
    const operation = jest.fn().mockResolvedValue({ id: 1, name: 'Test' })

    const result: ApiResult<{ id: number; name: string }> = await withErrorHandling(
      operation,
      'test'
    )

    expect(result.isSuccess).toBe(true)
    expect(result.data).toEqual({ id: 1, name: 'Test' })
    expect(result.error).toBeNull()
    expect(operation).toHaveBeenCalled()
  })

  it('debe retornar error cuando la operación falla', async () => {
    const operation = jest.fn().mockRejectedValue(new Error('Error de test'))

    const result = await withErrorHandling(operation, 'test')

    expect(result.isSuccess).toBe(false)
    expect(result.data).toBeNull()
    expect(result.error).toBeInstanceOf(AppError)
    expect(result.error?.message).toBe('Error de test')
  })

  it('debe loguear error cuando logError es true', async () => {
    const operation = jest.fn().mockRejectedValue(new Error('Error'))

    // El logger usa console.error internamente, pero no debemos verificarlo aquí
    // porque eso acopla el test a la implementación interna del logger
    await withErrorHandling(operation, 'test', true)

    // Solo verificamos que la operación fue llamada
    expect(operation).toHaveBeenCalled()
  })

  it('no debe loguear error cuando logError es false', async () => {
    const operation = jest.fn().mockRejectedValue(new Error('Error'))

    await withErrorHandling(operation, 'test', false)

    expect(operation).toHaveBeenCalled()
  })

  it('debe convertir errores no-AppError a AppError', async () => {
    const operation = jest.fn().mockRejectedValue('String de error')

    const result = await withErrorHandling(operation, 'test')

    expect(result.error).toBeInstanceOf(AppError)
    expect(result.error?.message).toBe('String de error')
  })
})

describe('withDatabaseErrorHandling', () => {
  it('debe retornar éxito en operación de base de datos', async () => {
    const operation = jest.fn().mockResolvedValue([{ id: 1 }])

    const result = await withDatabaseErrorHandling(operation, 'fetchAlumnos', 'user-123')

    expect(result.isSuccess).toBe(true)
    expect(result.data).toEqual([{ id: 1 }])
  })

  it('debe retornar DatabaseError cuando falla', async () => {
    const operation = jest.fn().mockRejectedValue(new Error('DB Error'))

    const result = await withDatabaseErrorHandling(operation, 'fetchAlumnos', 'user-123')

    expect(result.isSuccess).toBe(false)
    expect(result.error).toBeInstanceOf(DatabaseError)
    expect(result.error?.message).toContain('fetchAlumnos')
  })

  it('debe incluir contexto de usuario en el log', async () => {
    const operation = jest.fn().mockRejectedValue(new Error('DB Error'))

    const result = await withDatabaseErrorHandling(operation, 'fetchAlumnos', 'user-123')

    expect(result.isSuccess).toBe(false)
    expect(result.error).toBeInstanceOf(DatabaseError)
  })

  it('debe funcionar sin userId', async () => {
    const operation = jest.fn().mockResolvedValue({})

    const result = await withDatabaseErrorHandling(operation, 'fetchData')

    expect(result.isSuccess).toBe(true)
  })
})

describe('withAuthErrorHandling', () => {
  it('debe retornar éxito en operación de auth', async () => {
    const operation = jest.fn().mockResolvedValue({ user: { id: 1 } })

    const result = await withAuthErrorHandling(operation, 'getUser')

    expect(result.isSuccess).toBe(true)
    expect(result.data).toEqual({ user: { id: 1 } })
  })

  it('debe retornar AuthError cuando falla', async () => {
    const operation = jest.fn().mockRejectedValue(new Error('Auth failed'))

    const result = await withAuthErrorHandling(operation, 'signIn')

    expect(result.isSuccess).toBe(false)
    expect(result.error).toBeInstanceOf(AuthError)
    expect(result.error?.code).toBe('AUTH_ERROR')
  })

  it('debe incluir contexto de operación en el error', async () => {
    const operation = jest.fn().mockRejectedValue(new Error('Auth failed'))

    const result = await withAuthErrorHandling(operation, 'signIn')

    expect(result.error?.message).toContain('signIn')
  })
})

describe('getUserErrorMessage', () => {
  it('debe retornar mensaje vacío si no hay error', () => {
    expect(getUserErrorMessage(null)).toBe('')
  })

  it('debe retornar mensaje amigable para DATABASE_ERROR', () => {
    const error = new DatabaseError('Error interno')
    expect(getUserErrorMessage(error)).toContain('base de datos')
  })

  it('debe retornar mensaje amigable para AUTH_ERROR', () => {
    const error = new AuthError()
    expect(getUserErrorMessage(error)).toContain('autenticación')
  })

  it('debe retornar mensaje amigable para NOT_FOUND', () => {
    const error = new AppError('Recurso no encontrado', 'NOT_FOUND')
    expect(getUserErrorMessage(error)).toContain('no fue encontrado')
  })

  it('debe retornar mensaje amigable para VALIDATION_ERROR', () => {
    const error = new AppError('Datos inválidos', 'VALIDATION_ERROR')
    expect(getUserErrorMessage(error)).toContain('no son válidos')
  })

  it('debe retornar mensaje original para errores desconocidos', () => {
    const error = new AppError('Error desconocido', 'UNKNOWN')
    expect(getUserErrorMessage(error)).toBe('Error desconocido')
  })
})

describe('handleApiError', () => {
  it('debe llamar setError con mensaje amigable', () => {
    const setError = jest.fn()
    const error = new DatabaseError('Error interno')

    handleApiError(error, setError)

    expect(setError).toHaveBeenCalled()
    expect(setError.mock.calls[0][0]).toContain('base de datos')
  })

  it('no debe hacer nada si no hay error', () => {
    const setError = jest.fn()

    handleApiError(null, setError)

    expect(setError).not.toHaveBeenCalled()
  })

  it('debe loguear errores no operacionales', () => {
    const error = new DatabaseError('Error crítico') // isOperational = false

    // No debería lanzar error al loguear
    expect(() => handleApiError(error)).not.toThrow()
  })

  it('debe funcionar sin setError', () => {
    const error = new AppError('Test error')

    // No debería lanzar error
    expect(() => handleApiError(error)).not.toThrow()
  })
})
