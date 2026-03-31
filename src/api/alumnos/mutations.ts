import { createClient } from '@/lib/supabase-client'
import { AlumnoInsert, AlumnoUpdate, Alumno } from '@/types'
import { withDatabaseErrorHandling, ApiResult } from '@/lib/api-wrapper'

/**
 * Mutations de alumnos - operaciones de escritura
 */

/**
 * Crea un nuevo alumno
 */
export async function createAlumno(userId: string, data: AlumnoInsert): Promise<ApiResult<Alumno>> {
  const supabase = createClient()

  return withDatabaseErrorHandling(
    async () => {
      const { data: result, error } = await supabase
        .from('alumnos')
        .insert({
          ...data,
          user_id: userId,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return result as Alumno
    },
    'createAlumno',
    userId
  )
}

/**
 * Actualiza un alumno existente
 */
export async function updateAlumno(
  alumnoId: string,
  userId: string,
  data: AlumnoUpdate
): Promise<ApiResult<Alumno>> {
  const supabase = createClient()

  return withDatabaseErrorHandling(
    async () => {
      const { data: result, error } = await supabase
        .from('alumnos')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', alumnoId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return result as Alumno
    },
    'updateAlumno',
    userId
  )
}

/**
 * Elimina un alumno
 */
export async function deleteAlumno(alumnoId: string, userId: string): Promise<ApiResult<void>> {
  const supabase = createClient()

  return withDatabaseErrorHandling(
    async () => {
      const { error } = await supabase
        .from('alumnos')
        .delete()
        .eq('id', alumnoId)
        .eq('user_id', userId)

      if (error) {
        throw error
      }
    },
    'deleteAlumno',
    userId
  )
}
