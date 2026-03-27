import {
  AppError,
  ValidationError,
  AuthError,
  AuthorizationError,
  NotFoundError,
  DatabaseError,
  ConfigError,
  isAppError,
  toAppError,
} from '@/lib/errors'

describe('AppError', () => {
  it('debe crear un AppError con valores por defecto', () => {
    const error = new AppError('Mensaje de error')

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(AppError)
    expect(error.message).toBe('Mensaje de error')
    expect(error.code).toBe('APP_ERROR')
    expect(error.statusCode).toBe(500)
    expect(error.isOperational).toBe(true)
    expect(error.name).toBe('AppError')
  })

  it('debe crear un AppError con valores personalizados', () => {
    const error = new AppError(
      'Error personalizado',
      'CUSTOM_CODE',
      400,
      false
    )

    expect(error.code).toBe('CUSTOM_CODE')
    expect(error.statusCode).toBe(400)
    expect(error.isOperational).toBe(false)
  })

  it('debe capturar el stack trace', () => {
    const error = new AppError('Test error')
    expect(error.stack).toBeDefined()
    expect(error.stack).toContain('AppError')
  })
})

describe('ValidationError', () => {
  it('debe crear un error de validación', () => {
    const error = new ValidationError('Campo inválido')

    expect(error).toBeInstanceOf(AppError)
    expect(error.code).toBe('VALIDATION_ERROR')
    expect(error.statusCode).toBe(400)
    expect(error.name).toBe('ValidationError')
  })
})

describe('AuthError', () => {
  it('debe crear un error de autenticación con mensaje por defecto', () => {
    const error = new AuthError()

    expect(error).toBeInstanceOf(AppError)
    expect(error.message).toBe('No autenticado')
    expect(error.code).toBe('AUTH_ERROR')
    expect(error.statusCode).toBe(401)
  })

  it('debe aceptar mensaje personalizado', () => {
    const error = new AuthError('Sesión expirada')

    expect(error.message).toBe('Sesión expirada')
  })
})

describe('AuthorizationError', () => {
  it('debe crear un error de autorización', () => {
    const error = new AuthorizationError()

    expect(error.code).toBe('AUTHORIZATION_ERROR')
    expect(error.statusCode).toBe(403)
  })
})

describe('NotFoundError', () => {
  it('debe crear un error de recurso no encontrado', () => {
    const error = new NotFoundError('Alumno')

    expect(error.message).toBe('Alumno no encontrado')
    expect(error.code).toBe('NOT_FOUND')
    expect(error.statusCode).toBe(404)
  })

  it('debe usar mensaje por defecto si no se especifica recurso', () => {
    const error = new NotFoundError()

    expect(error.message).toBe('Recurso no encontrado')
  })
})

describe('DatabaseError', () => {
  it('debe crear un error de base de datos', () => {
    const error = new DatabaseError('Error de conexión')

    expect(error.code).toBe('DATABASE_ERROR')
    expect(error.statusCode).toBe(500)
    expect(error.isOperational).toBe(false)
  })

  it('debe preservar el stack del error original', () => {
    const originalError = new Error('Error original')
    originalError.stack = 'Stack trace original'

    const error = new DatabaseError('Error de base de datos', originalError)

    expect(error.stack).toBe('Stack trace original')
  })
})

describe('ConfigError', () => {
  it('debe crear un error de configuración', () => {
    const error = new ConfigError('Variable de entorno faltante')

    expect(error.code).toBe('CONFIG_ERROR')
    expect(error.statusCode).toBe(500)
    expect(error.isOperational).toBe(false)
  })
})

describe('isAppError', () => {
  it('debe retornar true para AppError', () => {
    const error = new AppError('Test')
    expect(isAppError(error)).toBe(true)
  })

  it('debe retornar true para subclases de AppError', () => {
    expect(isAppError(new ValidationError('Test'))).toBe(true)
    expect(isAppError(new AuthError())).toBe(true)
    expect(isAppError(new NotFoundError())).toBe(true)
  })

  it('debe retornar false para Error normal', () => {
    const error = new Error('Test')
    expect(isAppError(error)).toBe(false)
  })

  it('debe retornar false para null', () => {
    expect(isAppError(null)).toBe(false)
  })

  it('debe retornar false para undefined', () => {
    expect(isAppError(undefined)).toBe(false)
  })

  it('debe retornar false para string', () => {
    expect(isAppError('error')).toBe(false)
  })
})

describe('toAppError', () => {
  it('debe retornar el mismo error si ya es AppError', () => {
    const original = new AppError('Test')
    const result = toAppError(original)

    expect(result).toBe(original)
  })

  it('debe convertir Error normal a AppError', () => {
    const original = new Error('Error normal')
    const result = toAppError(original)

    expect(result).toBeInstanceOf(AppError)
    expect(result.message).toBe('Error normal')
    expect(result.code).toBe('UNKNOWN_ERROR')
    expect(result.isOperational).toBe(false)
  })

  it('debe manejar string como error', () => {
    const result = toAppError('Error string')

    expect(result).toBeInstanceOf(AppError)
    expect(result.message).toBe('Error string')
  })

  it('debe manejar null', () => {
    const result = toAppError(null)

    expect(result).toBeInstanceOf(AppError)
    expect(result.message).toBe('Error desconocido')
  })

  it('debe manejar undefined', () => {
    const result = toAppError(undefined)

    expect(result).toBeInstanceOf(AppError)
    expect(result.message).toBe('Error desconocido')
  })

  it('debe manejar objetos sin message', () => {
    const result = toAppError({ some: 'object' })

    expect(result).toBeInstanceOf(AppError)
    expect(result.message).toBe('Error desconocido')
  })
})
