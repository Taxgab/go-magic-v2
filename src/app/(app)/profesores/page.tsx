'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Profesor, ProfesorInsert, ProfesorUpdate, FormErrors } from '@/types'
import { Plus, Search, Edit2, Trash2, X, AlertCircle } from 'lucide-react'
import { DataTable } from '@/components/ui/DataTable'

// Funciones de validación
const validateProfesorForm = (form: ProfesorInsert | ProfesorUpdate): FormErrors => {
  const errors: FormErrors = {}

  if (!form.nombre || !form.nombre.trim()) {
    errors.nombre = 'El nombre es requerido'
  } else if (form.nombre.trim().length < 2) {
    errors.nombre = 'El nombre debe tener al menos 2 caracteres'
  }

  if (form.porcentaje_comision === undefined || form.porcentaje_comision === null) {
    errors.porcentaje_comision = 'La comisión es requerida'
  } else if (form.porcentaje_comision < 0 || form.porcentaje_comision > 100) {
    errors.porcentaje_comision = 'La comisión debe estar entre 0 y 100'
  }

  if (form.cbu && form.cbu.trim() && !/^\d{22}$/.test(form.cbu.trim().replace(/\s/g, ''))) {
    errors.cbu = 'El CBU debe tener 22 dígitos'
  }

  if (form.email && form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Formato de email inválido'
  }

  if (form.telefono && form.telefono.trim() && !/^[\d\s\-\+\(\)]{8,}$/.test(form.telefono.trim())) {
    errors.telefono = 'Formato de teléfono inválido'
  }

  return errors
}

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

  const columns = [
    {
      key: 'nombre',
      header: 'Nombre',
      render: (profesor: Profesor) => <span className="font-medium">{profesor.nombre}</span>,
    },
    {
      key: 'especialidad',
      header: 'Especialidad',
      render: (profesor: Profesor) => (
        <span className="text-gray-600">{profesor.especialidad || '-'}</span>
      ),
    },
    {
      key: 'comision',
      header: 'Comisión',
      render: (profesor: Profesor) => (
        <span className="text-gray-600">{profesor.porcentaje_comision}%</span>
      ),
    },
    {
      key: 'telefono',
      header: 'Teléfono',
      render: (profesor: Profesor) => (
        <span className="text-gray-600">{profesor.telefono || '-'}</span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (profesor: Profesor) => (
        <span className={profesor.estado === 'activo' ? 'badge-success' : 'badge-neutral'}>
          {profesor.estado}
        </span>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (profesor: Profesor) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditing(profesor)
              setShowModal(true)
            }}
            className="p-2 text-primary hover:bg-primary/10 rounded-xl"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => handleDelete(profesor.id)}
            className="p-2 text-tertiary hover:bg-tertiary/10 rounded-xl"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ]

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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar profesores..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-8">Cargando...</p>
        ) : (
          <DataTable
            data={filtered}
            columns={columns}
            loading={loading}
            emptyMessage="No hay profesores registrados"
            keyExtractor={profesor => profesor.id}
            cardBreakpoint="md"
          />
        )}
      </div>

      {showModal && (
        <ProfesorModal
          profesor={editing}
          onClose={() => setShowModal(false)}
          onSave={fetchProfesores}
        />
      )}
    </div>
  )
}

function ProfesorModal({
  profesor,
  onClose,
  onSave,
}: {
  profesor: Profesor | null
  onClose: () => void
  onSave: () => void
}) {
  const [form, setForm] = useState<ProfesorInsert>({
    nombre: profesor?.nombre || '',
    especialidad: profesor?.especialidad || '',
    porcentaje_comision: profesor?.porcentaje_comision ?? 0,
    cbu: profesor?.cbu || '',
    telefono: profesor?.telefono || '',
    email: profesor?.email || '',
    fecha_alta: profesor?.fecha_alta || new Date().toISOString().split('T')[0],
    estado: profesor?.estado || 'activo',
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleChange = (field: keyof ProfesorInsert, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validar formulario
    const errors = validateProfesorForm(form)
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

      if (profesor) {
        const { error: supabaseError } = await supabase
          .from('profesores')
          .update({
            nombre: form.nombre.trim(),
            especialidad: form.especialidad?.trim() || null,
            porcentaje_comision: form.porcentaje_comision,
            cbu: form.cbu?.trim() || null,
            telefono: form.telefono?.trim() || null,
            email: form.email?.trim() || null,
          })
          .eq('id', profesor.id)

        if (supabaseError) {
          console.error('Error updating profesor:', supabaseError)
          setError(`Error al actualizar: ${supabaseError.message}`)
          setLoading(false)
          return
        }
      } else {
        const { error: supabaseError } = await supabase.from('profesores').insert({
          ...form,
          user_id: user.id,
          nombre: form.nombre.trim(),
          especialidad: form.especialidad?.trim() || null,
          porcentaje_comision: form.porcentaje_comision,
          cbu: form.cbu?.trim() || null,
          telefono: form.telefono?.trim() || null,
          email: form.email?.trim() || null,
        })

        if (supabaseError) {
          console.error('Error inserting profesor:', supabaseError)
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
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto text-gray-900">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {profesor ? 'Editar' : 'Nuevo'} Profesor
          </h2>
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
              className={`w-full px-4 py-2 border rounded-lg text-gray-900 ${formErrors.nombre ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
            />
            {formErrors.nombre && <p className="mt-1 text-sm text-red-600">{formErrors.nombre}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
              <input
                type="text"
                value={form.especialidad || ''}
                onChange={e => handleChange('especialidad', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">% Comisión *</label>
              <input
                type="number"
                step="0.01"
                value={form.porcentaje_comision}
                onChange={e => handleChange('porcentaje_comision', Number(e.target.value))}
                className={`w-full px-4 py-2 border rounded-lg text-gray-900 ${formErrors.porcentaje_comision ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
              />
              {formErrors.porcentaje_comision && (
                <p className="mt-1 text-sm text-red-600">{formErrors.porcentaje_comision}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CBU/CVU</label>
            <input
              type="text"
              value={form.cbu || ''}
              onChange={e => handleChange('cbu', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg text-gray-900 ${formErrors.cbu ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
              placeholder="22 dígitos"
            />
            {formErrors.cbu && <p className="mt-1 text-sm text-red-600">{formErrors.cbu}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="text"
                value={form.telefono || ''}
                onChange={e => handleChange('telefono', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg text-gray-900 ${formErrors.telefono ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                placeholder="11 1234-5678"
              />
              {formErrors.telefono && (
                <p className="mt-1 text-sm text-red-600">{formErrors.telefono}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email || ''}
                onChange={e => handleChange('email', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg text-gray-900 ${formErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                placeholder="ejemplo@email.com"
              />
              {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
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
