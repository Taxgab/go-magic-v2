import { createBrowserClient } from '@supabase/ssr'
import { env } from './env'
import { logger } from './logger'

/**
 * Crea un cliente de Supabase para el browser
 * Usa variables de entorno validadas
 */
export function createClient() {
  try {
    const client = createBrowserClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    logger.debug('Supabase browser client created successfully')
    return client
  } catch (error) {
    logger.authError(
      'createClient',
      error instanceof Error ? error : new Error('Unknown error creating Supabase client'),
      { component: 'supabase-client' }
    )
    throw error
  }
}
