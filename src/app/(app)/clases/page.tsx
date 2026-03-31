'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Clase, Profesor } from '@/types'
import { Plus, Search, Edit2, Trash2, AlertCircle } from 'lucide-react'
import { ClaseModal } from '@/components/modals/ClaseModal'
import { Button } from '@/components/ui/Button'

export default function ClasesPage() {
  const [clases, setClases] = useState<Clase[]>([])
  const [profesores, setProfesores] = useState<Profesor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Clase | null>(null)
  const supabase = createClient()

  const fetchData = useCallback(async () => {
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

      const { data: clasesData, error: clasesError } = await supabase
        .from('clases')
        .select('*, profesores(nombre)')
        .eq('user_id', user.id)
        .order('dia')

      const { data: profesoresData, error: profesoresError } = await supabase
        .from('profesores')
        .select('*')
        .eq('user_id', user.id)
        .eq('estado', 'activo')

      if (clasesError) {
        console.error('Error fetching clases:', clasesError)
        setError(`Error al cargar clases: ${clasesError.message}`)
        setClases([])
      } else {
        setClases(clasesData || [])
      }

      if (profesoresError) {
        console.error('Error fetching profesores:', profesoresError)
        setError(`Error al cargar profesores: ${profesoresError.message}`)
        setProfesores([])
      } else {
        setProfesores(profesoresData || [])
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Error inesperado al cargar datos')
      setClases([])
      setProfesores([])
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta clase?')) return

    try {
      setError(null)
      const { error: supabaseError } = await supabase.from('clases').delete().eq('id', id)

      if (supabaseError) {
        console.error('Error deleting clase:', supabaseError)
        setError(`Error al eliminar: ${supabaseError.message}`)
        return
      }

      fetchData()
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Error inesperado al eliminar clase')
    }
  }

  const filtered = clases.filter(c => c.nombre.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div className="sm:flex-1">
          <h1 className="font-serif text-4xl text-on-surface">Clases</h1>
          <p className="text-on-surface-variant mt-1">Administra las clases del gimnasio</p>
        </div>
        <button
          onClick={() => {
            setEditing(null)
            setShowModal(true)
          }}
          className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Plus size={20} />
          <span className="sm:hidden lg:inline">Nueva Clase</span>
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
            placeholder="Buscar clases..."
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
            {filtered.map(clase => (
              <div key={clase.id} className="card card-hover">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{clase.tipo === 'zumba' ? '💃' : '🧘'}</span>
                    <h3 className="font-serif text-lg text-on-surface">{clase.nombre}</h3>
                  </div>
                  <span className={clase.estado === 'activa' ? 'badge-success' : 'badge-neutral'}>
                    {clase.estado}
                  </span>
                </div>
                <p className="text-on-surface-variant text-sm mb-2">
                  {clase.dia} - {clase.hora} • {clase.tipo === 'zumba' ? 'Zumba' : 'Pilates'}
                </p>
                <p className="text-on-surface-variant text-sm mb-2">
                  Profesor: {clase.profesores?.nombre || '-'}
                </p>
                <p className="text-on-surface-variant text-sm mb-4">Precio: ${clase.precio}</p>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setEditing(clase)
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
                    onClick={() => handleDelete(clase.id)}
                  >
                    <Trash2 size={16} />
                    <span className="ml-1">Eliminar</span>
                  </Button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full py-8 text-center text-on-surface-variant">
                No hay clases registradas
              </div>
            )}
          </div>
        )}
      </div>

      <ClaseModal
        clase={editing}
        profesores={profesores}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditing(null)
        }}
        onSave={fetchData}
      />
    </div>
  )
}
