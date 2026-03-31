'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, ReactNode } from 'react'

interface QueryProviderProps {
  children: ReactNode
}

/**
 * Provider de React Query con configuración optimizada
 * Envuelve toda la aplicación para proporcionar caché global
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Tiempo que los datos se consideran "frescos" (no se re-fetch)
            staleTime: 5 * 60 * 1000, // 5 minutos

            // Tiempo que los datos permanecen en caché después de no usarse
            gcTime: 10 * 60 * 1000, // 10 minutos

            // Reintentos automáticos
            retry: 3,
            retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),

            // Refetch en background cuando la ventana vuelve a foco
            refetchOnWindowFocus: true,

            // Refetch cuando se reconecta la red
            refetchOnReconnect: true,

            // No refetch en error por defecto
            refetchOnMount: false,
          },
          mutations: {
            // Reintentos para mutaciones
            retry: 1,
            retryDelay: 1000,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Devtools solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
