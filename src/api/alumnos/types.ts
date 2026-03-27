import { Alumno, AlumnoInsert, AlumnoUpdate } from '@/types'

/**
 * Tipos específicos para operaciones de API de alumnos
 */

export interface FetchAlumnosParams {
  userId: string
  search?: string
  estado?: 'activo' | 'inactivo'
  limit?: number
  offset?: number
}

export interface FetchAlumnosResult {
  alumnos: Alumno[]
  total: number
}

export interface CreateAlumnoParams {
  userId: string
  data: AlumnoInsert
}

export interface UpdateAlumnoParams {
  alumnoId: string
  data: AlumnoUpdate
}

export interface DeleteAlumnoParams {
  alumnoId: string
}
