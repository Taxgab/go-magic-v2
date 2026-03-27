/**
 * Configuración centralizada de la aplicación
 * Define timeouts, retries, y otras constantes globales
 */

export const config = {
  /**
   * Configuración de timeouts para operaciones async
   */
  timeouts: {
    /** Timeout por defecto para queries de Supabase (ms) */
    databaseQuery: 10000,
    /** Timeout para operaciones de autenticación (ms) */
    auth: 15000,
    /** Timeout para operaciones de red (ms) */
    network: 30000,
  },

  /**
   * Configuración de reintentos
   */
  retries: {
    /** Número máximo de reintentos para operaciones de base de datos */
    database: 3,
    /** Delay entre reintentos (ms) */
    delay: 1000,
  },

  /**
   * Configuración de paginación
   */
  pagination: {
    /** Items por página por defecto */
    defaultPageSize: 20,
    /** Opciones de items por página */
    pageSizeOptions: [10, 20, 50, 100],
  },

  /**
   * Configuración de validación
   */
  validation: {
    /** Longitud mínima para nombres */
    minNameLength: 2,
    /** Longitud máxima para nombres */
    maxNameLength: 100,
    /** Regex para validar DNI argentino */
    dniRegex: /^\d{7,8}$/,
    /** Regex para validar teléfono */
    phoneRegex: /^[\d\s\-\+\(\)]{8,}$/,
    /** Regex para validar email */
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },

  /**
   * Configuración de caché (para implementar en Fase 4)
   */
  cache: {
    /** Tiempo de vida de caché para listados (ms) */
    listStaleTime: 5 * 60 * 1000, // 5 minutos
    /** Tiempo de vida de caché para datos de usuario (ms) */
    userStaleTime: 10 * 60 * 1000, // 10 minutos
    /** Tiempo de vida de caché para estadísticas (ms) */
    statsStaleTime: 2 * 60 * 1000, // 2 minutos
  },

  /**
   * Configuración de UI
   */
  ui: {
    /** Duración de animaciones (ms) */
    animationDuration: 300,
    /** Delay para debounce de búsqueda (ms) */
    searchDebounce: 300,
  },

  /**
   * Configuración de fechas
   */
  dates: {
    /** Formato de fecha por defecto */
    defaultFormat: 'dd/MM/yyyy',
    /** Zona horaria por defecto */
    timezone: 'America/Argentina/Buenos_Aires',
  },

  /**
   * Configuración de moneda
   */
  currency: {
    /** Moneda por defecto */
    default: 'ARS',
    /** Símbolo de moneda */
    symbol: '$',
    /** Separador de decimales */
    decimalSeparator: ',',
    /** Separador de miles */
    thousandsSeparator: '.',
    /** Cantidad de decimales */
    decimals: 2,
  },
} as const

/**
 * Type helper para obtener valores de config
 */
export type Config = typeof config
