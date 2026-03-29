import { createClient } from '@/lib/supabase-client'
import { Inscripcion, InscripcionInsert } from '@/types'
import { withDatabaseErrorHandling, ApiResult } from '@/lib/api-wrapper'

/**
 * API para gestionar inscripciones de alumnos a clases
 */

/**
 * Obtiene las inscripciones de un alumno
 */
export async function fetchInscripcionesByAlumno(
  alumnoId: string
): Promise<ApiResult<Inscripcion[]>> {
  const supabase = createClient()

  return withDatabaseErrorHandling(
    async () => {
      const { data, error } = await supabase
        .from('inscripciones')
        .select('*, clase:clases(nombre, dia, hora)')
        .eq('alumno_id', alumnoId)

      if (error) throw error

      return data || []
    },
    'fetchInscripcionesByAlumno',
    alumnoId
  )
}

/**
 * Crea inscripciones para un alumno
 */
export async function createInscripciones(
  userId: string,
  alumnoId: string,
  claseIds: string[]
): Promise<ApiResult<void>> {
  const supabase = createClient()

  return withDatabaseErrorHandling(
    async () => {
      // Eliminar inscripciones existentes
      await supabase.from('inscripciones').delete().eq('alumno_id', alumnoId)

      // Crear nuevas inscripciones
      if (claseIds.length > 0) {
        const inscripciones: InscripcionInsert[] = claseIds.map(claseId => ({
          user_id: userId,
          alumno_id: alumnoId,
          clase_id: claseId,
        }))

        const { error } = await supabase.from('inscripciones').insert(inscripciones)

        if (error) throw error
      }
    },
    'createInscripciones',
    alumnoId
  )
}

/**
 * Elimina todas las inscripciones de un alumno
 */
export async function deleteInscripcionesByAlumno(alumnoId: string): Promise<ApiResult<void>> {
  const supabase = createClient()

  return withDatabaseErrorHandling(
    async () => {
      const { error } = await supabase.from('inscripciones').delete().eq('alumno_id', alumnoId)

      if (error) throw error
    },
    'deleteInscripcionesByAlumno',
    alumnoId
  )
}
