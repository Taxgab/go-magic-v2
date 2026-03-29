import { fetchDashboardStats, DashboardStats } from '@/api/stats'

/**
 * Hook server-side para obtener estadísticas del dashboard
 * Se usa en Server Components
 */
export async function useStats(userId: string): Promise<{
  stats: DashboardStats
  error: string | null
}> {
  const result = await fetchDashboardStats(userId)

  if (result.error || !result.data) {
    return {
      stats: {
        alumnos: 0,
        profesores: 0,
        clases: 0,
        ingresos: 0,
      },
      error: result.error?.message || 'Error al cargar estadísticas',
    }
  }

  return {
    stats: result.data,
    error: null,
  }
}
