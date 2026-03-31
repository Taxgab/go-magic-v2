'use client'

import { useState, useCallback, Suspense } from 'react'
import {
  useAlumnosQuery,
  useCreateAlumnoMutation,
  useUpdateAlumnoMutation,
  useDeleteAlumnoMutation,
} from '@/hooks/useAlumnosQuery'
import { AlumnoModal } from '@/components/modals/AlumnoModal'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { Plus, Search, Edit2, Trash2, AlertCircle } from 'lucide-react'
import { Alumno } from '@/types'
import { AlumnoFormData } from '@/lib/validation/alumno'
import { createClient } from '@/lib/supabase-client'

// Loading skeleton para la tabla
function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 bg-gray-100 rounded animate-pulse" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-50 rounded animate-pulse" />
      ))}
    </div>
  )
}

/**
 * Página de Alumnos optimizada con React Query
 * - Caché automática
 * - Optimistic updates
 * - Memoización
 * - Suspense
 */
export default function AlumnosPage() {
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Alumno | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const supabase = createClient()

  // Obtener userId (en una app real, esto vendría de un contexto o hook)
  const userId = 'test-user-id' // Placeholder

  // React Query hooks
  const { alumnos, total, isLoading, isError, error, refetch } = useAlumnosQuery({
    userId,
    search,
  })

  const createMutation = useCreateAlumnoMutation(userId)
  const updateMutation = useUpdateAlumnoMutation(userId)
  const deleteMutation = useDeleteAlumnoMutation(userId)

  const handleCreate = () => {
    setEditing(null)
    setFormErrors({})
    setShowModal(true)
  }

  const handleEdit = useCallback((alumno: Alumno) => {
    setEditing(alumno)
    setFormErrors({})
    setShowModal(true)
  }, [])

  const handleDelete = useCallback(
    async (alumno: Alumno) => {
      if (!confirm('¿Eliminar este alumno?')) return
      await deleteMutation.mutateAsync(alumno.id)
    },
    [deleteMutation]
  )

  const handleSave = async (data: AlumnoFormData, alumnoId?: string): Promise<boolean> => {
    try {
      if (alumnoId) {
        await updateMutation.mutateAsync({ id: alumnoId, data })
      } else {
        await createMutation.mutateAsync(data)
      }
      setShowModal(false)
      return true
    } catch (err) {
      // El error ya se maneja en el modal
      return false
    }
  }

  const columns = [
    {
      key: 'nombre',
      header: 'Nombre',
      render: (alumno: Alumno) => <span className="font-medium">{alumno.nombre}</span>,
    },
    {
      key: 'dni',
      header: 'DNI',
      render: (alumno: Alumno) => <span className="text-gray-600">{alumno.dni || '-'}</span>,
    },
    {
      key: 'telefono',
      header: 'Teléfono',
      render: (alumno: Alumno) => <span className="text-gray-600">{alumno.telefono || '-'}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (alumno: Alumno) => <span className="text-gray-600">{alumno.email || '-'}</span>,
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (alumno: Alumno) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            alumno.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}
        >
          {alumno.estado}
        </span>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (alumno: Alumno) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(alumno)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
            aria-label="Editar alumno"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => handleDelete(alumno)}
            className="p-2 text-red-600 hover:bg-red-50 rounded"
            aria-label="Eliminar alumno"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Alumnos</h1>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus size={20} /> Nuevo Alumno
        </Button>
      </div>

      {isError && error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle size={20} />
          <span>{error.message}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-6">
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar alumnos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <Suspense fallback={<TableSkeleton />}>
          <DataTable
            data={alumnos}
            columns={columns}
            loading={isLoading}
            emptyMessage="No hay alumnos registrados"
            keyExtractor={alumno => alumno.id}
          />
        </Suspense>

        {total > 0 && (
          <div className="mt-4 text-sm text-gray-500 text-right">Total: {total} alumnos</div>
        )}
      </div>

      <AlumnoModal
        alumno={editing}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        formErrors={formErrors}
        loading={createMutation.isPending || updateMutation.isPending}
        error={null}
      />
    </div>
  )
}
