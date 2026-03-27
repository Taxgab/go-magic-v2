import { createClient } from '@/lib/supabase-client'
import { Alumno } from '@/types'
import { FetchAlumnosParams } from './types'
import { withDatabaseErrorHandling, ApiResult } from '@/lib/api-wrapper'

/**
 * Queries de alumnos - operaciones de lectura
 */

export interface FetchAlumnosResult {
  alumnos: Alumno[]
  total: number
}

/**
 * Obtiene todos los alumnos de un usuario con filtros opcionales
 */
export async function fetchAlumnos({
  userId,
  search,
  estado,
  limit = 100,
  offset = 0,
}: FetchAlumnosParams): Promise<ApiResult<FetchAlumnosResult>> {
  const supabase = createClient()

  return withDatabaseErrorHandling(async () => {
    let query = supabase
      .from('alumnos')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('nombre')
      .range(offset, offset + limit - 1)

    if (estado) {
      query = query.eq('estado', estado)
    }

    if (search) {
      query = query.ilike('nombre', `%${search}%`)
    }

    const { data, error, count } = await query

    if (error) {
      throw error
    }

    return {
      alumnos: data as Alumno[],
      total: count || 0,
    }
  }, 'fetchAlumnos', userId)
}

/**
 * Obtiene un alumno por su ID
 */
export async function fetchAlumnoById(
  alumnoId: string,
  userId: string
): Promise<ApiResult<Alumno | null>> {
  const supabase = createClient()

  return withDatabaseErrorHandling(async () => {
    const { data, error } = await supabase
      .from('alumnos')
      .select('*')
      .eq('id', alumnoId)
      .eq('user_id', userId)
      .single()

    if (error) {
      throw error
    }

    return data as Alumno | null
  }, 'fetchAlumnoById', userId)
}

/**
 * Obtiene el conteo total de alumnos activos
 */
export async function countAlumnosActivos(
  userId: string
): Promise<ApiResult<number>> {
  const supabase = createClient()

  return withDatabaseErrorHandling(async () => {
    const { count, error } = await supabase
      .from('alumnos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('estado', 'activo')

    if (error) {
      throw error
    }

    return count || 0
  }, 'countAlumnosActivos', userId)
}
