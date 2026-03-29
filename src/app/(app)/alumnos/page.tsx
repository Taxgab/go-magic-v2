'use client'

import { useState, useMemo } from 'react'
import { useAlumnos } from '@/hooks/useAlumnos'
import { AlumnoModal } from '@/components/modals/AlumnoModal'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { Plus, Search, Edit2, Trash2, AlertCircle } from 'lucide-react'
import { Alumno } from '@/types'
import { AlumnoFormData } from '@/lib/validation/alumno'

export default function AlumnosPage() {
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Alumno | null>(null)

  const {
    alumnos,
    total,
    loading,
    error,
    formErrors,
    create,
    update,
    remove,
    clearError,
    clearFormErrors,
  } = useAlumnos({ search })

  const filteredAlumnos = useMemo(() => {
    if (!search) return alumnos
    return alumnos.filter(a => a.nombre.toLowerCase().includes(search.toLowerCase()))
  }, [alumnos, search])

  const handleCreate = () => {
    setEditing(null)
    clearFormErrors()
    clearError()
    setShowModal(true)
  }

  const handleEdit = (alumno: Alumno) => {
    setEditing(alumno)
    clearFormErrors()
    clearError()
    setShowModal(true)
  }

  const handleDelete = async (alumno: Alumno) => {
    const success = await remove(alumno.id)
    if (success) {
      clearError()
    }
  }

  const handleSave = async (data: AlumnoFormData, alumnoId?: string): Promise<boolean> => {
    if (alumnoId) {
      const success = await update(alumnoId, data)
      if (success) {
        setShowModal(false)
      }
      return success
    } else {
      const success = await create(data)
      if (success) {
        setShowModal(false)
      }
      return success
    }
  }

  const columns = [
    {
      key: 'nombre',
      header: 'Nombre',
      render: (alumno: Alumno) => (
        <span className="font-medium text-on-surface">{alumno.nombre}</span>
      ),
    },
    {
      key: 'dni',
      header: 'DNI',
      render: (alumno: Alumno) => (
        <span className="text-on-surface-variant">{alumno.dni || '-'}</span>
      ),
    },
    {
      key: 'telefono',
      header: 'Teléfono',
      render: (alumno: Alumno) => (
        <span className="text-on-surface-variant">{alumno.telefono || '-'}</span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (alumno: Alumno) => (
        <span className="text-on-surface-variant">{alumno.email || '-'}</span>
      ),
    },
    {
      key: 'inscripciones',
      header: 'Actividades',
      render: (alumno: Alumno) => {
        const actividades = alumno.inscripciones?.map(i => i.clase?.nombre).filter(Boolean) || []
        return (
          <div className="flex flex-wrap gap-1">
            {actividades.length > 0 ? (
              actividades.map((nombre, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full"
                >
                  {nombre}
                </span>
              ))
            ) : (
              <span className="text-on-surface-variant text-sm">Sin actividades</span>
            )}
          </div>
        )
      },
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (alumno: Alumno) => (
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full ${
            alumno.estado === 'activo' ? 'badge-success' : 'badge-neutral'
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
            className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-colors"
            aria-label="Editar alumno"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => handleDelete(alumno)}
            className="p-2 text-tertiary hover:bg-tertiary/10 rounded-xl transition-colors"
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-4xl text-on-surface">Alumnos</h1>
          <p className="text-on-surface-variant mt-1">Gestiona los alumnos del gimnasio</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus size={20} /> Nuevo Alumno
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-tertiary/10 border border-tertiary/20 rounded-2xl flex items-center gap-3 text-tertiary">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="card p-6">
        <div className="mb-6 relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar alumnos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-12"
          />
        </div>

        <DataTable
          data={filteredAlumnos}
          columns={columns}
          loading={loading}
          emptyMessage="No hay alumnos registrados"
          keyExtractor={alumno => alumno.id}
        />

        {total > 0 && (
          <div className="mt-6 text-sm text-on-surface-variant text-right">
            Total: {total} alumnos
          </div>
        )}
      </div>

      <AlumnoModal
        alumno={editing}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        formErrors={formErrors}
        loading={loading}
        error={error}
      />
    </div>
  )
}
