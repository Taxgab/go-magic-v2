'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Profesor } from '@/types'
import { Plus, Search, Edit2, Trash2, AlertCircle, User, Percent, Phone } from 'lucide-react'
import { ProfesorModal } from '@/components/modals/ProfesorModal'
import { Button } from '@/components/ui/Button'

export default function ProfesoresPage() {
  const [profesores, setProfesores] = useState<Profesor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Profesor | null>(null)
  const supabase = createClient()

  const fetchProfesores = useCallback(async () => {
    try {
      setError(null)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError('No hay usuario autenticado')
        setLoading(false)
        return
      }

      const { data, error: supabaseError } = await supabase
        .from('profesores')
        .select(
          'id, user_id, nombre, especialidad, porcentaje_comision, cbu, telefono, email, fecha_alta, estado, created_at, updated_at'
        )
        .eq('user_id', user.id)
        .order('nombre')

      if (supabaseError) {
        console.error('Error fetching profesores:', supabaseError)
        setError(`Error al cargar profesores: ${supabaseError.message}`)
        setProfesores([])
      } else {
        setProfesores(data || [])
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Error inesperado al cargar profesores')
      setProfesores([])
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchProfesores()
  }, [fetchProfesores])

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este profesor?')) return

    try {
      setError(null)
      const { error: supabaseError } = await supabase.from('profesores').delete().eq('id', id)

      if (supabaseError) {
        console.error('Error deleting profesor:', supabaseError)
        setError(`Error al eliminar: ${supabaseError.message}`)
        return
      }

      fetchProfesores()
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Error inesperado al eliminar profesor')
    }
  }

  const filtered = profesores.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div className="sm:flex-1">
          <h1 className="font-serif text-4xl text-on-surface">Profesores</h1>
          <p className="text-on-surface-variant mt-1">Gestiona los profesores del gimnasio</p>
        </div>
        <button
          onClick={() => {
            setEditing(null)
            setShowModal(true)
          }}
          className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Plus size={20} />
          <span className="sm:hidden lg:inline">Nuevo Profesor</span>
          <span className="hidden sm:inline lg:hidden">Agregar</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-tertiary/10 border border-tertiary/20 rounded-2xl flex items-center gap-3 text-tertiary">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="card p-6">
        <div className="mb-4 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar profesores..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(profesor => (
              <div key={profesor.id} className="card card-hover">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <User size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg text-on-surface">{profesor.nombre}</h3>
                      <p className="text-sm text-on-surface-variant">
                        {profesor.especialidad || 'Sin especialidad'}
                      </p>
                    </div>
                  </div>
                  <span className={profesor.estado === 'activo' ? 'badge-success' : 'badge-neutral'}>
                    {profesor.estado}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <Percent size={16} />
                    <span>Comisión: {profesor.porcentaje_comision}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <Phone size={16} />
                    <span>{profesor.telefono || 'Sin teléfono'}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setEditing(profesor)
                      setShowModal(true)
                    }}
                  >
                    <Edit2 size={16} />
                    <span className="ml-1">Editar</span>
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDelete(profesor.id)}
                  >
                    <Trash2 size={16} />
                    <span className="ml-1">Eliminar</span>
                  </Button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full py-8 text-center text-on-surface-variant">
                No hay profesores registrados
              </div>
            )}
          </div>
        )}
      </div>

      <ProfesorModal
        profesor={editing}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditing(null)
        }}
        onSave={fetchProfesores}
      />
    </div>
  )
}