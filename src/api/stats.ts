import { createClient } from '@/lib/supabase-server'
import { withDatabaseErrorHandling, ApiResult } from '@/lib/api-wrapper'

/**
 * API para estadísticas del dashboard
 */

export interface DashboardStats {
  alumnos: number
  profesores: number
  clases: number
  ingresos: number
}

/**
 * Obtiene todas las estadísticas del dashboard en paralelo
 */
export async function fetchDashboardStats(userId: string): Promise<ApiResult<DashboardStats>> {
  const supabase = createClient()

  return withDatabaseErrorHandling(async () => {
    // Ejecutar todas las queries en paralelo
    const [alumnosResult, profesoresResult, clasesResult, pagosResult] = await Promise.all([
      // Contar alumnos activos
      supabase
        .from('alumnos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('estado', 'activo'),

      // Contar profesores activos
      supabase
        .from('profesores')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('estado', 'activo'),

      // Contar clases activas
      supabase
        .from('clases')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('estado', 'activa'),

      // Sumar ingresos de pagos
      supabase
        .from('pagos')
        .select('monto')
        .eq('user_id', userId)
        .eq('estado', 'pagado'),
    ])

    // Verificar errores
    if (alumnosResult.error) throw alumnosResult.error
    if (profesoresResult.error) throw profesoresResult.error
    if (clasesResult.error) throw clasesResult.error
    if (pagosResult.error) throw pagosResult.error

    // Calcular total de ingresos
    const totalIngresos = (pagosResult.data || []).reduce(
      (sum, pago) => sum + (pago.monto || 0),
      0
    )

    return {
      alumnos: alumnosResult.count || 0,
      profesores: profesoresResult.count || 0,
      clases: clasesResult.count || 0,
      ingresos: totalIngresos,
    }
  }, 'fetchDashboardStats', userId)
}
