'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Clase, Profesor, ClaseInsert, FormErrors } from '@/types'
import { Plus, Search, Edit2, Trash2, X, AlertCircle } from 'lucide-react'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const TIPOS_CLASE = [
  { value: 'pilates', label: 'Pilates', icon: '🧘' },
  { value: 'zumba', label: 'Zumba', icon: '💃' },
]

// Funciones de validación
const validateClaseForm = (form: ClaseInsert): FormErrors => {
  const errors: FormErrors = {}

  if (!form.nombre || !form.nombre.trim()) {
    errors.nombre = 'El nombre es requerido'
  } else if (form.nombre.trim().length < 2) {
    errors.nombre = 'El nombre debe tener al menos 2 caracteres'
  }

  if (form.precio === undefined || form.precio === null) {
    errors.precio = 'El precio es requerido'
  } else if (form.precio < 0) {
    errors.precio = 'El precio no puede ser negativo'
  }

  if (form.cupos === undefined || form.cupos === null) {
    errors.cupos = 'Los cupos son requeridos'
  } else if (form.cupos < 1) {
    errors.cupos = 'Debe haber al menos 1 cupo'
  }

  return errors
}

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
          <span className="sm:hidden lg:inline"> Nueva Clase</span>
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar clases..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-8">Cargando...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(clase => (
              <div key={clase.id} className="border rounded-lg p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{clase.tipo === 'zumba' ? '💃' : '🧘'}</span>
                    <h3 className="font-bold text-lg">{clase.nombre}</h3>
                  </div>
                  <span className={clase.estado === 'activa' ? 'badge-success' : 'badge-neutral'}>
                    {clase.estado}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2">
                  {clase.dia} - {clase.hora} • {clase.tipo === 'zumba' ? 'Zumba' : 'Pilates'}
                </p>
                <p className="text-gray-600 text-sm mb-2">
                  Profesor: {clase.profesores?.nombre || '-'}
                </p>
                <p className="text-gray-600 text-sm mb-4">Precio: ${clase.precio}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(clase)
                      setShowModal(true)
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                  >
                    <Edit2 size={16} /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(clase.id)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50"
                  >
                    <Trash2 size={16} /> Eliminar
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full py-8 text-center text-gray-500">
                No hay clases registradas
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <ClaseModal
          clase={editing}
          profesores={profesores}
          onClose={() => setShowModal(false)}
          onSave={fetchData}
        />
      )}
    </div>
  )
}

function ClaseModal({
  clase,
  profesores,
  onClose,
  onSave,
}: {
  clase: Clase | null
  profesores: Profesor[]
  onClose: () => void
  onSave: () => void
}) {
  const [form, setForm] = useState<ClaseInsert>({
    nombre: '',
    dia: 'Lunes',
    hora: '09:00',
    profesor_id: null,
    tipo: 'pilates',
    precio: 0,
    cupos: 20,
    estado: 'activa',
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  // Sincronizar el formulario cuando cambia la clase (al editar)
  useEffect(() => {
    setForm({
      nombre: clase?.nombre || '',
      dia: clase?.dia || 'Lunes',
      hora: clase?.hora || '09:00',
      profesor_id: clase?.profesor_id || null,
      tipo: clase?.tipo || 'pilates',
      precio: clase?.precio ?? 0,
      cupos: clase?.cupos ?? 20,
      estado: clase?.estado || 'activa',
    })
  }, [clase])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleChange = (field: keyof ClaseInsert, value: string | number | null) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validar formulario
    const errors = validateClaseForm(form)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError('No hay usuario autenticado')
        setLoading(false)
        return
      }

      if (clase) {
        const { error: supabaseError } = await supabase
          .from('clases')
          .update({
            nombre: form.nombre.trim(),
            dia: form.dia,
            hora: form.hora,
            profesor_id: form.profesor_id,
            tipo: form.tipo,
            precio: form.precio,
            cupos: form.cupos,
          })
          .eq('id', clase.id)

        if (supabaseError) {
          console.error('Error updating clase:', supabaseError)
          setError(`Error al actualizar: ${supabaseError.message}`)
          setLoading(false)
          return
        }
      } else {
        const { error: supabaseError } = await supabase.from('clases').insert({
          ...form,
          user_id: user.id,
          nombre: form.nombre.trim(),
          profesor_id: form.profesor_id,
          tipo: form.tipo || 'pilates',
        })

        if (supabaseError) {
          console.error('Error inserting clase:', supabaseError)
          setError(`Error al crear: ${supabaseError.message}`)
          setLoading(false)
          return
        }
      }

      onSave()
      onClose()
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Error inesperado al guardar')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">{clase ? 'Editar' : 'Nueva'} Clase</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              type="text"
              value={form.nombre}
              onChange={e => handleChange('nombre', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg ${formErrors.nombre ? 'border-red-500 focus:ring-red-500' : ''}`}
            />
            {formErrors.nombre && <p className="mt-1 text-sm text-red-600">{formErrors.nombre}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de clase</label>
            <select
              value={form.tipo || 'pilates'}
              onChange={e => handleChange('tipo', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
            >
              {TIPOS_CLASE.map(t => (
                <option key={t.value} value={t.value}>
                  {t.icon} {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Día</label>
              <select
                value={form.dia}
                onChange={e => handleChange('dia', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
              >
                {DIAS.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
              <input
                type="time"
                value={form.hora}
                onChange={e => handleChange('hora', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profesor</label>
            <select
              value={form.profesor_id || ''}
              onChange={e => handleChange('profesor_id', e.target.value || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
            >
              <option value="">Seleccionar profesor</option>
              {profesores.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
              <input
                type="number"
                value={form.precio}
                onChange={e => handleChange('precio', Number(e.target.value))}
                className={`w-full px-4 py-2 border rounded-lg ${formErrors.precio ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {formErrors.precio && (
                <p className="mt-1 text-sm text-red-600">{formErrors.precio}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cupos *</label>
              <input
                type="number"
                value={form.cupos ?? 20}
                onChange={e => handleChange('cupos', e.target.value ? Number(e.target.value) : 20)}
                className={`w-full px-4 py-2 border rounded-lg ${formErrors.cupos ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {formErrors.cupos && <p className="mt-1 text-sm text-red-600">{formErrors.cupos}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
