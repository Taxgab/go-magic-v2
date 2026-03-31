/**
 * Clase base para errores de la aplicación
 * Permite distinguir errores controlados de errores inesperados
 */
export class AppError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(
    message: string,
    code: string = 'APP_ERROR',
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.isOperational = isOperational

    // Mantiene el stack trace correcto en V8
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Error de validación de datos
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400, true)
    this.name = 'ValidationError'
  }
}

/**
 * Error de autenticación
 */
export class AuthError extends AppError {
  constructor(message: string = 'No autenticado') {
    super(message, 'AUTH_ERROR', 401, true)
    this.name = 'AuthError'
  }
}

/**
 * Error de autorización
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'No autorizado') {
    super(message, 'AUTHORIZATION_ERROR', 403, true)
    this.name = 'AuthorizationError'
  }
}

/**
 * Error de recurso no encontrado
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Recurso') {
    super(`${resource} no encontrado`, 'NOT_FOUND', 404, true)
    this.name = 'NotFoundError'
  }
}

/**
 * Error de base de datos / Supabase
 */
export class DatabaseError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(
      message,
      'DATABASE_ERROR',
      500,
      false // No es operacional, requiere atención
    )
    this.name = 'DatabaseError'
    if (originalError) {
      this.stack = originalError.stack
    }
  }
}

/**
 * Error de configuración
 */
export class ConfigError extends AppError {
  constructor(message: string) {
    super(message, 'CONFIG_ERROR', 500, false)
    this.name = 'ConfigError'
  }
}

/**
 * Type guard para verificar si un error es AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

/**
 * Helper para convertir errores desconocidos a AppError
 */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error
  }

  if (error instanceof Error) {
    return new AppError(error.message, 'UNKNOWN_ERROR', 500, false)
  }

  // Manejar strings y otros tipos
  if (typeof error === 'string') {
    return new AppError(error, 'UNKNOWN_ERROR', 500, false)
  }

  return new AppError('Error desconocido', 'UNKNOWN_ERROR', 500, false)
}
