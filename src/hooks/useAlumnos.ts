'use client'

import { useState, useCallback, useEffect } from 'react'
import { Alumno, AlumnoInsert, AlumnoUpdate } from '@/types'
import { fetchAlumnos, FetchAlumnosResult } from '@/api/alumnos/queries'
import { createAlumno, updateAlumno, deleteAlumno } from '@/api/alumnos/mutations'
import { validateAlumno, validateAlumnoUpdate, AlumnoFormData } from '@/lib/validation/alumno'
import { handleApiError } from '@/lib/api-wrapper'
import { createClient } from '@/lib/supabase-client'

export interface UseAlumnosOptions {
  search?: string
  estado?: 'activo' | 'inactivo'
  limit?: number
}

export interface UseAlumnosReturn {
  // Estado
  alumnos: Alumno[]
  total: number
  loading: boolean
  error: string | null
  formErrors: Record<string, string>

  // Acciones
  refresh: () => Promise<void>
  create: (data: AlumnoFormData) => Promise<boolean>
  update: (id: string, data: Partial<AlumnoFormData>) => Promise<boolean>
  remove: (id: string) => Promise<boolean>

  // Helpers
  clearError: () => void
  clearFormErrors: () => void
}

/**
 * Hook para gestionar alumnos
 * Proporciona estado y operaciones CRUD con manejo de errores integrado
 */
export function useAlumnos(options: UseAlumnosOptions = {}): UseAlumnosReturn {
  const { search, estado, limit = 100 } = options

  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const supabase = createClient()

  /**
   * Obtiene el usuario actual
   */
  const getCurrentUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }, [supabase])

  /**
   * Carga la lista de alumnos
   */
  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const user = await getCurrentUser()
      if (!user) {
        setError('No hay usuario autenticado')
        setLoading(false)
        return
      }

      const result = await fetchAlumnos({
        userId: user.id,
        search,
        estado,
        limit,
      })

      if (result.error) {
        handleApiError(result.error, setError)
        setAlumnos([])
        setTotal(0)
      } else if (result.data) {
        setAlumnos(result.data.alumnos)
        setTotal(result.data.total)
      }
    } catch (err) {
      setError('Error inesperado al cargar alumnos')
      setAlumnos([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [getCurrentUser, search, estado, limit])

  /**
   * Crea un nuevo alumno
   */
  const create = useCallback(async (data: AlumnoFormData): Promise<boolean> => {
    setError(null)
    setFormErrors({})

    // Validar datos
    const validation = validateAlumno(data)
    if (!validation.success) {
      setFormErrors(validation.errors)
      return false
    }

    setLoading(true)

    try {
      const user = await getCurrentUser()
      if (!user) {
        setError('No hay usuario autenticado')
        setLoading(false)
        return false
      }

      const result = await createAlumno(user.id, validation.data as AlumnoInsert)

      if (result.error) {
        handleApiError(result.error, setError)
        setLoading(false)
        return false
      }

      // Refrescar lista
      await refresh()
      setLoading(false)
      return true
    } catch (err) {
      setError('Error inesperado al crear alumno')
      setLoading(false)
      return false
    }
  }, [getCurrentUser, refresh])

  /**
   * Actualiza un alumno existente
   */
  const update = useCallback(async (
    id: string,
    data: Partial<AlumnoFormData>
  ): Promise<boolean> => {
    setError(null)
    setFormErrors({})

    // Validar datos
    const validation = validateAlumnoUpdate(data)
    if (!validation.success) {
      setFormErrors(validation.errors)
      return false
    }

    setLoading(true)

    try {
      const user = await getCurrentUser()
      if (!user) {
        setError('No hay usuario autenticado')
        setLoading(false)
        return false
      }

      const result = await updateAlumno(id, user.id, validation.data as AlumnoUpdate)

      if (result.error) {
        handleApiError(result.error, setError)
        setLoading(false)
        return false
      }

      // Refrescar lista
      await refresh()
      setLoading(false)
      return true
    } catch (err) {
      setError('Error inesperado al actualizar alumno')
      setLoading(false)
      return false
    }
  }, [getCurrentUser, refresh])

  /**
   * Elimina un alumno
   */
  const remove = useCallback(async (id: string): Promise<boolean> => {
    if (!confirm('¿Eliminar este alumno?')) {
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const user = await getCurrentUser()
      if (!user) {
        setError('No hay usuario autenticado')
        setLoading(false)
        return false
      }

      const result = await deleteAlumno(id, user.id)

      if (result.error) {
        handleApiError(result.error, setError)
        setLoading(false)
        return false
      }

      // Refrescar lista
      await refresh()
      setLoading(false)
      return true
    } catch (err) {
      setError('Error inesperado al eliminar alumno')
      setLoading(false)
      return false
    }
  }, [getCurrentUser, refresh])

  /**
   * Limpia los errores
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const clearFormErrors = useCallback(() => {
    setFormErrors({})
  }, [])

  // Cargar datos iniciales
  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    alumnos,
    total,
    loading,
    error,
    formErrors,
    refresh,
    create,
    update,
    remove,
    clearError,
    clearFormErrors,
  }
}
