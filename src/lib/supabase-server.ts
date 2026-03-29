import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { env } from './env'
import { logger } from './logger'

/**
 * Crea un cliente de Supabase para el servidor
 * Usa variables de entorno validadas y manejo de errores apropiado
 */
export async function createClient() {
  const cookieStore = await cookies()

  try {
    const client = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options })
              logger.debug('Cookie set successfully', { cookieName: name })
            } catch (error) {
              logger.authError(
                'setCookie',
                error instanceof Error ? error : new Error('Unknown error setting cookie'),
                { cookieName: name, component: 'supabase-server' }
              )
              // No lanzamos error para permitir graceful degradation
              // El usuario puede seguir usando la app sin cookies en casos edge
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options })
              logger.debug('Cookie removed successfully', { cookieName: name })
            } catch (error) {
              logger.authError(
                'removeCookie',
                error instanceof Error ? error : new Error('Unknown error removing cookie'),
                { cookieName: name, component: 'supabase-server' }
              )
              // No lanzamos error para permitir graceful degradation
            }
          },
        },
      }
    )

    logger.debug('Supabase server client created successfully')
    return client
  } catch (error) {
    logger.authError(
      'createServerClient',
      error instanceof Error ? error : new Error('Unknown error creating Supabase server client'),
      { component: 'supabase-server' }
    )
    throw error
  }
}
