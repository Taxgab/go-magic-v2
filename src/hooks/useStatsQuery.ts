'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchDashboardStats, DashboardStats } from '@/api/stats'

const STATS_KEY = 'dashboard-stats'

/**
 * Hook con React Query para estadísticas del dashboard
 * Caché de 2 minutos, revalidación automática
 */
export function useStatsQuery(userId: string) {
  return useQuery<DashboardStats>({
    queryKey: [STATS_KEY, userId],
    queryFn: async () => {
      const result = await fetchDashboardStats(userId)
      if (result.error) {
        throw result.error
      }
      return (
        result.data || {
          alumnos: 0,
          profesores: 0,
          clases: 0,
          ingresos: 0,
        }
      )
    },
    // Refetch cada 2 minutos para mantener datos frescos
    staleTime: 2 * 60 * 1000,
    // Revalidar cada 5 minutos automáticamente
    refetchInterval: 5 * 60 * 1000,
    // Solo ejecutar si hay userId
    enabled: !!userId,
  })
}

/**
 * Hook para prefetch de estadísticas
 * Útil para cargar datos en segundo plano
 */
export function usePrefetchStats() {
  const queryClient = useQueryClient()

  return {
    prefetch: (userId: string) => {
      queryClient.prefetchQuery({
        queryKey: [STATS_KEY, userId],
        queryFn: async () => {
          const result = await fetchDashboardStats(userId)
          if (result.error) {
            throw result.error
          }
          return (
            result.data || {
              alumnos: 0,
              profesores: 0,
              clases: 0,
              ingresos: 0,
            }
          )
        },
        staleTime: 5 * 60 * 1000,
      })
    },
  }
}
