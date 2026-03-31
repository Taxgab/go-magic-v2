'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Alumno, AlumnoInsert, AlumnoUpdate } from '@/types'
import { fetchAlumnos, fetchAlumnoById } from '@/api/alumnos/queries'
import { createAlumno, updateAlumno, deleteAlumno } from '@/api/alumnos/mutations'
import { AlumnoFormData } from '@/lib/validation/alumno'

// Keys para React Query
const ALUMNOS_KEY = 'alumnos'
const ALUMNO_DETAIL_KEY = 'alumno'

interface UseAlumnosQueryOptions {
  userId: string
  search?: string
  estado?: 'activo' | 'inactivo'
}

interface AlumnosData {
  alumnos: Alumno[]
  total: number
}

interface UseAlumnosQueryReturn {
  alumnos: Alumno[]
  total: number
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Hook optimizado con React Query para obtener alumnos
 * Incluye caché automática, revalidación y prefetching
 */
export function useAlumnosQuery({
  userId,
  search,
  estado,
}: UseAlumnosQueryOptions): UseAlumnosQueryReturn {
  const { data, isLoading, isError, error, refetch } = useQuery<AlumnosData>({
    queryKey: [ALUMNOS_KEY, { userId, search, estado }],
    queryFn: async () => {
      const result = await fetchAlumnos({ userId, search, estado })
      if (result.error) {
        throw result.error
      }
      return result.data || { alumnos: [], total: 0 }
    },
    // Opciones específicas para esta query
    staleTime: 2 * 60 * 1000, // 2 minutos
  })

  return {
    alumnos: data?.alumnos || [],
    total: data?.total || 0,
    isLoading,
    isError,
    error,
    refetch,
  }
}

/**
 * Hook para obtener un alumno específico
 * Útil para páginas de detalle o edición
 */
export function useAlumnoQuery(alumnoId: string, userId: string) {
  return useQuery<Alumno | null>({
    queryKey: [ALUMNO_DETAIL_KEY, alumnoId],
    queryFn: async () => {
      const result = await fetchAlumnoById(alumnoId, userId)
      if (result.error) {
        throw result.error
      }
      return result.data
    },
    enabled: !!alumnoId && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

/**
 * Hook para crear alumnos con optimistic updates
 */
export function useCreateAlumnoMutation(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: AlumnoFormData) => {
      const result = await createAlumno(userId, data as AlumnoInsert)
      if (result.error) {
        throw result.error
      }
      return result.data
    },
    // Optimistic Update: actualizar UI antes de confirmar servidor
    onMutate: async newAlumno => {
      // Cancelar re-fetches en curso
      await queryClient.cancelQueries({ queryKey: [ALUMNOS_KEY] })

      // Snapshot del estado anterior
      const previousAlumnos = queryClient.getQueryData<AlumnosData>([ALUMNOS_KEY])

      // Optimisticamente agregar el nuevo alumno
      queryClient.setQueryData<AlumnosData>([ALUMNOS_KEY], old => {
        if (!old) return { alumnos: [], total: 0 }
        return {
          ...old,
          alumnos: [
            ...old.alumnos,
            { ...newAlumno, id: 'temp-id', created_at: new Date().toISOString() } as Alumno,
          ],
          total: old.total + 1,
        }
      })

      // Retornar contexto para rollback
      return { previousAlumnos }
    },
    onError: (err, newAlumno, context) => {
      // Rollback en caso de error
      if (context?.previousAlumnos) {
        queryClient.setQueryData([ALUMNOS_KEY], context.previousAlumnos)
      }
    },
    onSettled: () => {
      // Revalidar después de completar (éxito o error)
      queryClient.invalidateQueries({ queryKey: [ALUMNOS_KEY] })
    },
  })
}

/**
 * Hook para actualizar alumnos con optimistic updates
 */
export function useUpdateAlumnoMutation(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AlumnoFormData> }) => {
      const result = await updateAlumno(id, userId, data as AlumnoUpdate)
      if (result.error) {
        throw result.error
      }
      return result.data
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: [ALUMNOS_KEY] })
      await queryClient.cancelQueries({ queryKey: [ALUMNO_DETAIL_KEY, id] })

      const previousAlumnos = queryClient.getQueryData<AlumnosData>([ALUMNOS_KEY])
      const previousAlumno = queryClient.getQueryData<Alumno>([ALUMNO_DETAIL_KEY, id])

      // Optimistic update en lista
      queryClient.setQueryData<AlumnosData>([ALUMNOS_KEY], old => {
        if (!old) return { alumnos: [], total: 0 }
        return {
          ...old,
          alumnos: old.alumnos.map((a: Alumno) =>
            a.id === id ? ({ ...a, ...data } as Alumno) : a
          ),
        }
      })

      // Optimistic update en detalle
      queryClient.setQueryData<Alumno>([ALUMNO_DETAIL_KEY, id], old => {
        if (!old) return old
        return { ...old, ...data } as Alumno
      })

      return { previousAlumnos, previousAlumno }
    },
    onError: (err, variables, context) => {
      if (context?.previousAlumnos) {
        queryClient.setQueryData([ALUMNOS_KEY], context.previousAlumnos)
      }
      if (context?.previousAlumno) {
        queryClient.setQueryData([ALUMNO_DETAIL_KEY, variables.id], context.previousAlumno)
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: [ALUMNOS_KEY] })
      queryClient.invalidateQueries({ queryKey: [ALUMNO_DETAIL_KEY, variables.id] })
    },
  })
}

/**
 * Hook para eliminar alumnos con optimistic updates
 */
export function useDeleteAlumnoMutation(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (alumnoId: string) => {
      const result = await deleteAlumno(alumnoId, userId)
      if (result.error) {
        throw result.error
      }
      return alumnoId
    },
    onMutate: async alumnoId => {
      await queryClient.cancelQueries({ queryKey: [ALUMNOS_KEY] })

      const previousAlumnos = queryClient.getQueryData<AlumnosData>([ALUMNOS_KEY])

      // Optimistic delete
      queryClient.setQueryData<AlumnosData>([ALUMNOS_KEY], old => {
        if (!old) return { alumnos: [], total: 0 }
        return {
          ...old,
          alumnos: old.alumnos.filter((a: Alumno) => a.id !== alumnoId),
          total: old.total - 1,
        }
      })

      return { previousAlumnos }
    },
    onError: (err, alumnoId, context) => {
      if (context?.previousAlumnos) {
        queryClient.setQueryData([ALUMNOS_KEY], context.previousAlumnos)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [ALUMNOS_KEY] })
    },
  })
}

/**
 * Hook para prefetching de datos
 * Útil para precargar datos antes de navegar
 */
export function usePrefetchAlumnos() {
  const queryClient = useQueryClient()

  return {
    prefetch: (userId: string) => {
      queryClient.prefetchQuery({
        queryKey: [ALUMNOS_KEY, { userId }],
        queryFn: async () => {
          const result = await fetchAlumnos({ userId })
          if (result.error) {
            throw result.error
          }
          return result.data || { alumnos: [], total: 0 }
        },
        staleTime: 5 * 60 * 1000,
      })
    },
  }
}
