'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Pago, Alumno, PagoInsert, FormErrors, MetodoPago, PagoEstado } from '@/types'
import { Plus, Search, Edit2, Trash2, X, Check, Clock, AlertCircle } from 'lucide-react'
import { DataTable } from '@/components/ui/DataTable'

// Funciones de validación
const validatePagoForm = (form: PagoInsert): FormErrors => {
  const errors: FormErrors = {}

  if (!form.alumno_id) {
    errors.alumno_id = 'Debe seleccionar un alumno'
  }

  if (!form.concepto || !form.concepto.trim()) {
    errors.concepto = 'El concepto es requerido'
  } else if (form.concepto.trim().length < 2) {
    errors.concepto = 'El concepto debe tener al menos 2 caracteres'
  }

  if (form.monto === undefined || form.monto === null) {
    errors.monto = 'El monto es requerido'
  } else if (form.monto <= 0) {
    errors.monto = 'El monto debe ser mayor a 0'
  }

  const selectedDate = new Date(form.fecha_pago)
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  if (selectedDate > today) {
    errors.fecha_pago = 'La fecha no puede ser futura'
  }

  return errors
}

export default function PagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([])
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'pagado' | 'pendiente'>('all')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Pago | null>(null)
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

      const { data: pagosData, error: pagosError } = await supabase
        .from('pagos')
        .select('*, alumno:alumnos(nombre)')
        .eq('user_id', user.id)
        .order('fecha_pago', { ascending: false })

      const { data: alumnosData, error: alumnosError } = await supabase
        .from('alumnos')
        .select('*')
        .eq('user_id', user.id)
        .eq('estado', 'activo')

      if (pagosError) {
        console.error('Error fetching pagos:', pagosError)
        setError(`Error al cargar pagos: ${pagosError.message}`)
        setPagos([])
      } else {
        // Transformar el resultado para que alumno sea un objeto, no un array
        const transformedPagos = (pagosData || []).map((p: any) => ({
          ...p,
          alumno: p.alumno?.[0] || null,
        }))
        setPagos(transformedPagos)
      }

      if (alumnosError) {
        console.error('Error fetching alumnos:', alumnosError)
        setError(`Error al cargar alumnos: ${alumnosError.message}`)
        setAlumnos([])
      } else {
        setAlumnos(alumnosData || [])
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Error inesperado al cargar datos')
      setPagos([])
      setAlumnos([])
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este pago?')) return

    try {
      setError(null)
      const { error: supabaseError } = await supabase.from('pagos').delete().eq('id', id)

      if (supabaseError) {
        console.error('Error deleting pago:', supabaseError)
        setError(`Error al eliminar: ${supabaseError.message}`)
        return
      }

      fetchData()
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Error inesperado al eliminar pago')
    }
  }

  const toggleEstado = async (pago: Pago) => {
    try {
      setError(null)
      const nuevoEstado: PagoEstado = pago.estado === 'pagado' ? 'pendiente' : 'pagado'
      const { error: supabaseError } = await supabase
        .from('pagos')
        .update({ estado: nuevoEstado })
        .eq('id', pago.id)

      if (supabaseError) {
        console.error('Error updating pago estado:', supabaseError)
        setError(`Error al actualizar estado: ${supabaseError.message}`)
        return
      }

      fetchData()
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Error inesperado al cambiar estado')
    }
  }

  const filtered = pagos.filter(p => {
    const matchSearch =
      p.alumno?.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.concepto.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || p.estado === filter
    return matchSearch && matchFilter
  })

  const columns = [
    {
      key: 'fecha',
      header: 'Fecha',
      render: (pago: Pago) => new Date(pago.fecha_pago).toLocaleDateString(),
    },
    {
      key: 'alumno',
      header: 'Alumno',
      render: (pago: Pago) => <span className="font-medium">{pago.alumno?.nombre || '-'}</span>,
    },
    {
      key: 'concepto',
      header: 'Concepto',
      render: (pago: Pago) => <span className="text-gray-600">{pago.concepto}</span>,
    },
    {
      key: 'monto',
      header: 'Monto',
      render: (pago: Pago) => <span className="font-medium">${pago.monto.toLocaleString()}</span>,
    },
    {
      key: 'metodo',
      header: 'Método',
      render: (pago: Pago) => <span className="text-gray-600">{pago.metodo}</span>,
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (pago: Pago) => (
        <button
          onClick={() => toggleEstado(pago)}
          className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full cursor-pointer ${pago.estado === 'pagado' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}
        >
          {pago.estado === 'pagado' ? <Check size={14} /> : <Clock size={14} />}
          {pago.estado}
        </button>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (pago: Pago) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditing(pago)
              setShowModal(true)
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => handleDelete(pago.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ]

  const totalPagado = pagos.filter(p => p.estado === 'pagado').reduce((sum, p) => sum + p.monto, 0)
  const totalPendiente = pagos
    .filter(p => p.estado === 'pendiente')
    .reduce((sum, p) => sum + p.monto, 0)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div className="sm:flex-1">
          <h1 className="font-serif text-4xl text-on-surface">Pagos</h1>
          <p className="text-on-surface-variant mt-1">Registra y gestiona los pagos</p>
        </div>
        <button
          onClick={() => {
            setEditing(null)
            setShowModal(true)
          }}
          className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Plus size={20} />
          <span className="sm:hidden lg:inline"> Nuevo Pago</span>
          <span className="hidden sm:inline lg:hidden">Agregar</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-tertiary/10 border border-tertiary/20 rounded-2xl flex items-center gap-3 text-tertiary">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-6">
          <p className="text-gray-500 text-sm">Total Cobrado</p>
          <p className="text-2xl font-bold text-green-600">${totalPagado.toLocaleString()}</p>
        </div>
        <div className="card p-6">
          <p className="text-gray-500 text-sm">Total Pendiente</p>
          <p className="text-2xl font-bold text-orange-600">${totalPendiente.toLocaleString()}</p>
        </div>
        <div className="card p-6">
          <p className="text-gray-500 text-sm">Cantidad de Pagos</p>
          <p className="text-2xl font-bold text-blue-600">{pagos.length}</p>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'pagado', 'pendiente'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {f === 'all' ? 'Todos' : f === 'pagado' ? 'Pagados' : 'Pendientes'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-8">Cargando...</p>
        ) : (
          <DataTable
            data={filtered}
            columns={columns}
            loading={loading}
            emptyMessage="No hay pagos registrados"
            keyExtractor={pago => pago.id}
            cardBreakpoint="md"
          />
        )}
      </div>

      {showModal && (
        <PagoModal
          pago={editing}
          alumnos={alumnos}
          onClose={() => setShowModal(false)}
          onSave={fetchData}
        />
      )}
    </div>
  )
}

function PagoModal({
  pago,
  alumnos,
  onClose,
  onSave,
}: {
  pago: Pago | null
  alumnos: Alumno[]
  onClose: () => void
  onSave: () => void
}) {
  const [form, setForm] = useState<PagoInsert>({
    alumno_id: pago?.alumno_id || '',
    concepto: pago?.concepto || '',
    monto: pago?.monto ?? 0,
    metodo: pago?.metodo || 'efectivo',
    fecha_pago: pago?.fecha_pago || new Date().toISOString().split('T')[0],
    estado: pago?.estado || 'pagado',
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleChange = (
    field: keyof PagoInsert,
    value: string | number | MetodoPago | PagoEstado
  ) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validar formulario
    const errors = validatePagoForm(form)
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

      if (pago) {
        const { error: supabaseError } = await supabase
          .from('pagos')
          .update({
            alumno_id: form.alumno_id,
            concepto: form.concepto.trim(),
            monto: form.monto,
            metodo: form.metodo,
            fecha_pago: form.fecha_pago,
            estado: form.estado,
          })
          .eq('id', pago.id)

        if (supabaseError) {
          console.error('Error updating pago:', supabaseError)
          setError(`Error al actualizar: ${supabaseError.message}`)
          setLoading(false)
          return
        }
      } else {
        const { error: supabaseError } = await supabase.from('pagos').insert({
          ...form,
          user_id: user.id,
          concepto: form.concepto.trim(),
        })

        if (supabaseError) {
          console.error('Error inserting pago:', supabaseError)
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
          <h2 className="text-xl font-bold">{pago ? 'Editar' : 'Nuevo'} Pago</h2>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Alumno *</label>
            <select
              value={form.alumno_id}
              onChange={e => handleChange('alumno_id', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg ${formErrors.alumno_id ? 'border-red-500 focus:ring-red-500' : ''}`}
            >
              <option value="">Seleccionar alumno</option>
              {alumnos.map(a => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </select>
            {formErrors.alumno_id && (
              <p className="mt-1 text-sm text-red-600">{formErrors.alumno_id}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Concepto *</label>
            <input
              type="text"
              value={form.concepto}
              onChange={e => handleChange('concepto', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg ${formErrors.concepto ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="Ej: Cuota Marzo"
            />
            {formErrors.concepto && (
              <p className="mt-1 text-sm text-red-600">{formErrors.concepto}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
              <input
                type="number"
                value={form.monto}
                onChange={e => handleChange('monto', Number(e.target.value))}
                className={`w-full px-4 py-2 border rounded-lg ${formErrors.monto ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {formErrors.monto && <p className="mt-1 text-sm text-red-600">{formErrors.monto}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Método</label>
              <select
                value={form.metodo}
                onChange={e => handleChange('metodo', e.target.value as MetodoPago)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
              >
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="mercadopago">MercadoPago</option>
                <option value="tarjeta">Tarjeta</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input
                type="date"
                value={form.fecha_pago}
                onChange={e => handleChange('fecha_pago', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg ${formErrors.fecha_pago ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {formErrors.fecha_pago && (
                <p className="mt-1 text-sm text-red-600">{formErrors.fecha_pago}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={form.estado}
                onChange={e => handleChange('estado', e.target.value as PagoEstado)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
              >
                <option value="pagado">Pagado</option>
                <option value="pendiente">Pendiente</option>
              </select>
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
