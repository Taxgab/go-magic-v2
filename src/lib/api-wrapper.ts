import { AppError, DatabaseError, AuthError, toAppError } from './errors'
import { logger } from './logger'

/**
 * Wrapper genérico para operaciones async con manejo de errores consistente
 * Elimina el patrón DRY de try-catch repetido en toda la app
 */

export interface ApiResult<T> {
  data: T | null
  error: AppError | null
  isSuccess: boolean
}

/**
 * Wrapper para operaciones de base de datos (Supabase)
 * Maneja errores de forma consistente y loguea automáticamente
 */
export async function withDatabaseErrorHandling<T>(
  operation: () => Promise<T>,
  context: string,
  userId?: string
): Promise<ApiResult<T>> {
  try {
    const data = await operation()
    return {
      data,
      error: null,
      isSuccess: true,
    }
  } catch (error) {
    const appError = toAppError(error)
    const dbError = new DatabaseError(
      `Error en operación de base de datos: ${context}`,
      appError
    )

    logger.databaseError(context, dbError, {
      userId,
      originalError: appError.message,
    })

    return {
      data: null,
      error: dbError,
      isSuccess: false,
    }
  }
}

/**
 * Wrapper para operaciones de autenticación
 */
export async function withAuthErrorHandling<T>(
  operation: () => Promise<T>,
  context: string
): Promise<ApiResult<T>> {
  try {
    const data = await operation()
    return {
      data,
      error: null,
      isSuccess: true,
    }
  } catch (error) {
    const appError = toAppError(error)
    const authError = new AuthError(
      `Error de autenticación: ${context}`
    )

    logger.authError(context, appError)

    return {
      data: null,
      error: authError,
      isSuccess: false,
    }
  }
}

/**
 * Wrapper genérico para cualquier operación async
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string,
  logError: boolean = true
): Promise<ApiResult<T>> {
  try {
    const data = await operation()
    return {
      data,
      error: null,
      isSuccess: true,
    }
  } catch (error) {
    const appError = toAppError(error)

    if (logError) {
      logger.error(`Error en ${context}`, { context }, appError)
    }

    return {
      data: null,
      error: appError,
      isSuccess: false,
    }
  }
}

/**
 * Helper para extraer mensaje de error amigable para el usuario
 */
export function getUserErrorMessage(error: AppError | null): string {
  if (!error) return ''

  // Mapeo de códigos de error a mensajes amigables
  const errorMessages: Record<string, string> = {
    'DATABASE_ERROR': 'Error al acceder a la base de datos. Por favor, intenta de nuevo.',
    'AUTH_ERROR': 'Error de autenticación. Por favor, inicia sesión nuevamente.',
    'NOT_FOUND': 'El recurso solicitado no fue encontrado.',
    'VALIDATION_ERROR': 'Los datos ingresados no son válidos.',
  }

  return errorMessages[error.code] || error.message || 'Ha ocurrido un error inesperado'
}

/**
 * Helper para manejar resultados de API en componentes
 * Ejemplo de uso:
 * const { data, error } = await fetchAlumnos()
 * if (error) {
 *   handleApiError(error, setError)
 *   return
 * }
 * setAlumnos(data)
 */
export function handleApiError(
  error: AppError | null,
  setError?: (msg: string) => void
): void {
  if (!error) return

  const message = getUserErrorMessage(error)

  if (setError) {
    setError(message)
  }

  // Siempre logueamos el error real para debugging
  if (!error.isOperational) {
    logger.error('Error no operacional requiere atención', { errorCode: error.code }, error)
  }
}
