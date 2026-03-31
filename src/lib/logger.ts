/**
 * Logger estructurado para la aplicación
 * Proporciona logging consistente con contexto
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  error?: Error
}

/**
 * Determina si estamos en modo desarrollo
 */
const isDev = process.env.NODE_ENV === 'development'

/**
 * Formatea una entrada de log para consola
 */
function formatLogEntry(entry: LogEntry): string {
  const parts: string[] = [`[${entry.timestamp}]`, `[${entry.level.toUpperCase()}]`, entry.message]

  if (entry.context && Object.keys(entry.context).length > 0) {
    parts.push(`| Context: ${JSON.stringify(entry.context)}`)
  }

  return parts.join(' ')
}

/**
 * Logger principal
 */
class Logger {
  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
    }

    const formattedMessage = formatLogEntry(entry)

    switch (level) {
      case 'debug':
        if (isDev) {
          console.debug(formattedMessage)
          if (error) console.debug(error)
        }
        break
      case 'info':
        console.info(formattedMessage)
        break
      case 'warn':
        console.warn(formattedMessage)
        if (error) console.warn(error)
        break
      case 'error':
        console.error(formattedMessage)
        if (error) console.error(error)
        break
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context)
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext, error?: Error): void {
    this.log('warn', message, context, error)
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.log('error', message, context, error)
  }

  /**
   * Log específico para errores de Supabase/Database
   */
  databaseError(operation: string, error: Error, context?: LogContext): void {
    this.error(
      `Database error in ${operation}`,
      {
        operation,
        ...context,
      },
      error
    )
  }

  /**
   * Log específico para errores de autenticación
   */
  authError(operation: string, error: Error, context?: LogContext): void {
    this.error(
      `Auth error in ${operation}`,
      {
        operation,
        ...context,
      },
      error
    )
  }

  /**
   * Log específico para errores de API/Server Actions
   */
  apiError(operation: string, error: Error, context?: LogContext): void {
    this.error(
      `API error in ${operation}`,
      {
        operation,
        ...context,
      },
      error
    )
  }
}

/**
 * Instancia singleton del logger
 */
export const logger = new Logger()

/**
 * Hook para crear un logger con contexto predefinido
 * Útil para componentes o módulos específicos
 */
export function createLogger(defaultContext: LogContext) {
  return {
    debug: (message: string, context?: LogContext) =>
      logger.debug(message, { ...defaultContext, ...context }),
    info: (message: string, context?: LogContext) =>
      logger.info(message, { ...defaultContext, ...context }),
    warn: (message: string, context?: LogContext, error?: Error) =>
      logger.warn(message, { ...defaultContext, ...context }, error),
    error: (message: string, context?: LogContext, error?: Error) =>
      logger.error(message, { ...defaultContext, ...context }, error),
  }
}
