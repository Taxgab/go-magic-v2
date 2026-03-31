'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Pago, Alumno, PagoEstado } from '@/types'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  Clock,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Receipt,
  User,
  CreditCard,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/ui/StatCard'
import { PagoModal } from '@/components/modals/PagoModal'

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

  const totalPagado = pagos.filter(p => p.estado === 'pagado').reduce((sum, p) => sum + p.monto, 0)
  const totalPendiente = pagos
    .filter(p => p.estado === 'pendiente')
    .reduce((sum, p) => sum + p.monto, 0)

  const metodosIcons: Record<string, string> = {
    efectivo: '💵',
    transferencia: '🏦',
    mercadopago: '📱',
    tarjeta: '💳',
  }

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
          <span className="sm:hidden lg:inline">Nuevo Pago</span>
          <span className="hidden sm:inline lg:hidden">Agregar</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-tertiary/10 border border-tertiary/20 rounded-2xl flex items-center gap-3 text-tertiary">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Total Cobrado"
          value={`$${totalPagado.toLocaleString()}`}
          icon={DollarSign}
          color="secondary"
        />
        <StatCard
          label="Total Pendiente"
          value={`$${totalPendiente.toLocaleString()}`}
          icon={TrendingUp}
          color="tertiary"
        />
        <StatCard label="Cantidad de Pagos" value={pagos.length} icon={Receipt} color="primary" />
      </div>

      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por alumno o concepto..."
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
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-primary text-white'
                    : 'bg-surface-low text-on-surface-variant hover:bg-surface-high'
                }`}
              >
                {f === 'all' ? 'Todos' : f === 'pagado' ? 'Pagados' : 'Pendientes'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(pago => (
              <div key={pago.id} className="card card-hover">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-lg">
                      {metodosIcons[pago.metodo] || '💰'}
                    </div>
                    <div>
                      <h3 className="font-serif text-lg text-on-surface">{pago.concepto}</h3>
                      <p className="text-sm text-on-surface-variant">
                        {pago.alumno?.nombre || '-'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleEstado(pago)}
                    className={pago.estado === 'pagado' ? 'badge-success' : 'badge-warning'}
                  >
                    {pago.estado === 'pagado' ? <Check size={14} /> : <Clock size={14} />}
                    {pago.estado}
                  </button>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <Calendar size={16} />
                    <span>{new Date(pago.fecha_pago).toLocaleDateString()}</span>
                  </div>
                  <span className="text-2xl font-serif text-on-surface">
                    ${pago.monto.toLocaleString()}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setEditing(pago)
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
                    onClick={() => handleDelete(pago.id)}
                  >
                    <Trash2 size={16} />
                    <span className="ml-1">Eliminar</span>
                  </Button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full py-8 text-center text-on-surface-variant">
                No hay pagos registrados
              </div>
            )}
          </div>
        )}
      </div>

      <PagoModal
        pago={editing}
        alumnos={alumnos}
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
