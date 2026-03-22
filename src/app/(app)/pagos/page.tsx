'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Pago, Alumno } from '@/types'
import { Plus, Search, Edit2, Trash2, X, Check, Clock } from 'lucide-react'

export default function PagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([])
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'pagado' | 'pendiente'>('all')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Pago | null>(null)
  const supabase = createClient()

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [pagosData, alumnosData] = await Promise.all([
      supabase.from('pagos').select('*, alumno:alumnos(nombre)').eq('user_id', user.id).order('fecha_pago', { ascending: false }),
      supabase.from('alumnos').select('*').eq('user_id', user.id).eq('estado', 'activo'),
    ])

    setPagos(pagosData.data || [])
    setAlumnos(alumnosData.data || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este pago?')) return
    await supabase.from('pagos').delete().eq('id', id)
    fetchData()
  }

  const toggleEstado = async (pago: Pago) => {
    const nuevoEstado = pago.estado === 'pagado' ? 'pendiente' : 'pagado'
    await supabase.from('pagos').update({ estado: nuevoEstado }).eq('id', pago.id)
    fetchData()
  }

  const filtered = pagos.filter(p => {
    const matchSearch = p.alumno?.nombre.toLowerCase().includes(search.toLowerCase()) || p.concepto.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || p.estado === filter
    return matchSearch && matchFilter
  })

  const totalPagado = pagos.filter(p => p.estado === 'pagado').reduce((sum, p) => sum + p.monto, 0)
  const totalPendiente = pagos.filter(p => p.estado === 'pendiente').reduce((sum, p) => sum + p.monto, 0)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Pagos</h1>
        <button onClick={() => { setEditing(null); setShowModal(true) }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus size={20} /> Nuevo Pago
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">Total Cobrado</p>
          <p className="text-2xl font-bold text-green-600">${totalPagado.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">Total Pendiente</p>
          <p className="text-2xl font-bold text-orange-600">${totalPendiente.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">Cantidad de Pagos</p>
          <p className="text-2xl font-bold text-blue-600">{pagos.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-2">
            {(['all', 'pagado', 'pendiente'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {f === 'all' ? 'Todos' : f === 'pagado' ? 'Pagados' : 'Pendientes'}
              </button>
            ))}
          </div>
        </div>

        {loading ? <p className="text-center text-gray-500 py-8">Cargando...</p> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-gray-500">
                  <th className="pb-3 font-medium">Fecha</th>
                  <th className="pb-3 font-medium">Alumno</th>
                  <th className="pb-3 font-medium">Concepto</th>
                  <th className="pb-3 font-medium">Monto</th>
                  <th className="pb-3 font-medium">Método</th>
                  <th className="pb-3 font-medium">Estado</th>
                  <th className="pb-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((pago) => (
                  <tr key={pago.id} className="border-b last:border-0">
                    <td className="py-4">{new Date(pago.fecha_pago).toLocaleDateString()}</td>
                    <td className="py-4 font-medium">{pago.alumno?.nombre || '-'}</td>
                    <td className="py-4 text-gray-600">{pago.concepto}</td>
                    <td className="py-4 font-medium">${pago.monto.toLocaleString()}</td>
                    <td className="py-4 text-gray-600">{pago.metodo}</td>
                    <td className="py-4">
                      <button onClick={() => toggleEstado(pago)} className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full cursor-pointer ${pago.estado === 'pagado' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {pago.estado === 'pagado' ? <Check size={14} /> : <Clock size={14} />}
                        {pago.estado}
                      </button>
                    </td>
                    <td className="py-4">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditing(pago); setShowModal(true) }} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={18} /></button>
                        <button onClick={() => handleDelete(pago.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-gray-500">No hay pagos registrados</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && <PagoModal pago={editing} alumnos={alumnos} onClose={() => setShowModal(false)} onSave={fetchData} />}
    </div>
  )
}

function PagoModal({ pago, alumnos, onClose, onSave }: { pago: Pago | null, alumnos: Alumno[], onClose: () => void, onSave: () => void }) {
  const [form, setForm] = useState({
    alumno_id: pago?.alumno_id || '',
    concepto: pago?.concepto || '',
    monto: pago?.monto || 0,
    metodo: pago?.metodo || 'efectivo',
    fecha_pago: pago?.fecha_pago || new Date().toISOString().split('T')[0],
    estado: pago?.estado || 'pagado',
  })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (pago) {
      await supabase.from('pagos').update(form).eq('id', pago.id)
    } else {
      await supabase.from('pagos').insert({ ...form, user_id: user.id })
    }
    setLoading(false)
    onSave()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">{pago ? 'Editar' : 'Nuevo'} Pago</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div><label className="block text-sm font-medium mb-1">Alumno *</label><select value={form.alumno_id} onChange={(e) => setForm({ ...form, alumno_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required><option value="">Seleccionar alumno</option>{alumnos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}</select></div>
          <div><label className="block text-sm font-medium mb-1">Concepto *</label><input type="text" value={form.concepto} onChange={(e) => setForm({ ...form, concepto: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="Ej: Cuota Marzo" required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Monto</label><input type="number" value={form.monto} onChange={(e) => setForm({ ...form, monto: Number(e.target.value) })} className="w-full px-4 py-2 border rounded-lg" required /></div>
            <div><label className="block text-sm font-medium mb-1">Método</label><select value={form.metodo} onChange={(e) => setForm({ ...form, metodo: e.target.value as 'efectivo' | 'transferencia' | 'mercadopago' | 'tarjeta' })} className="w-full px-4 py-2 border rounded-lg"><option value="efectivo">Efectivo</option><option value="transferencia">Transferencia</option><option value="mercadopago">MercadoPago</option><option value="tarjeta">Tarjeta</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Fecha</label><input type="date" value={form.fecha_pago} onChange={(e) => setForm({ ...form, fecha_pago: e.target.value })} className="w-full px-4 py-2 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium mb-1">Estado</label><select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as 'pagado' | 'pendiente' })} className="w-full px-4 py-2 border rounded-lg"><option value="pagado">Pagado</option><option value="pendiente">Pendiente</option></select></div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{loading ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
