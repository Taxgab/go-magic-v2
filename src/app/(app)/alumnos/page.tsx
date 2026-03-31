'use client'

import { useState, useMemo } from 'react'
import { useAlumnos } from '@/hooks/useAlumnos'
import { AlumnoModal } from '@/components/modals/AlumnoModal'
import { Button } from '@/components/ui/Button'
import { Plus, Search, Edit2, Trash2, AlertCircle, User, Phone, Mail, Calendar } from 'lucide-react'
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

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
        <div className="sm:flex-1">
          <h1 className="font-serif text-4xl text-on-surface">Alumnos</h1>
          <p className="text-on-surface-variant mt-1">Gestiona los alumnos del gimnasio</p>
        </div>
        <Button onClick={handleCreate} className="whitespace-nowrap">
          <Plus size={20} />
          <span className="sm:hidden lg:inline">Nuevo Alumno</span>
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

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAlumnos.map(alumno => {
              const actividades =
                alumno.inscripciones?.map(i => i.clase?.nombre).filter(Boolean) || []
              return (
                <div key={alumno.id} className="card card-hover">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center">
                        <User size={20} className="text-secondary" />
                      </div>
                      <div>
                        <h3 className="font-serif text-lg text-on-surface">{alumno.nombre}</h3>
                        <p className="text-sm text-on-surface-variant">{alumno.dni || 'Sin DNI'}</p>
                      </div>
                    </div>
                    <span
                      className={alumno.estado === 'activo' ? 'badge-success' : 'badge-neutral'}
                    >
                      {alumno.estado}
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                      <Phone size={16} />
                      <span>{alumno.telefono || 'Sin teléfono'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                      <Mail size={16} />
                      <span className="truncate">{alumno.email || 'Sin email'}</span>
                    </div>
                  </div>

                  {actividades.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {actividades.slice(0, 3).map((nombre, idx) => (
                        <span key={idx} className="chip chip-primary">
                          {nombre}
                        </span>
                      ))}
                      {actividades.length > 3 && (
                        <span className="chip chip-primary">+{actividades.length - 3}</span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(alumno)}
                    >
                      <Edit2 size={16} />
                      <span className="ml-1">Editar</span>
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDelete(alumno)}
                    >
                      <Trash2 size={16} />
                      <span className="ml-1">Eliminar</span>
                    </Button>
                  </div>
                </div>
              )
            })}
            {filteredAlumnos.length === 0 && (
              <div className="col-span-full py-8 text-center text-on-surface-variant">
                No hay alumnos registrados
              </div>
            )}
          </div>
        )}

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
