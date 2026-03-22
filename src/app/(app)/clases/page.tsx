'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Clase, Profesor } from '@/types'
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function ClasesPage() {
  const [clases, setClases] = useState<Clase[]>([])
  const [profesores, setProfesores] = useState<Profesor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Clase | null>(null)
  const supabase = createClient()

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [clasesData, profesoresData] = await Promise.all([
      supabase.from('clases').select('*, profesor:profesores(nombre)').eq('user_id', user.id).order('dia'),
      supabase.from('profesores').select('*').eq('user_id', user.id).eq('estado', 'activo'),
    ])

    setClases(clasesData.data || [])
    setProfesores(profesoresData.data || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta clase?')) return
    await supabase.from('clases').delete().eq('id', id)
    fetchData()
  }

  const filtered = clases.filter(c => c.nombre.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Clases</h1>
        <button onClick={() => { setEditing(null); setShowModal(true) }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus size={20} /> Nueva Clase
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Buscar clases..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-8">Cargando...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((clase) => (
              <div key={clase.id} className="border rounded-lg p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{clase.nombre}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${clase.estado === 'activa' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{clase.estado}</span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{clase.dia} - {clase.hora}</p>
                <p className="text-gray-600 text-sm mb-2">Profesor: {clase.profesor?.nombre || '-'}</p>
                <p className="text-gray-600 text-sm mb-4">Precio: ${clase.precio}</p>
                <div className="flex gap-2">
                  <button onClick={() => { setEditing(clase); setShowModal(true) }} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"><Edit2 size={16} /> Editar</button>
                  <button onClick={() => handleDelete(clase.id)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50"><Trash2 size={16} /> Eliminar</button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="col-span-full py-8 text-center text-gray-500">No hay clases registradas</div>}
          </div>
        )}
      </div>

      {showModal && <ClaseModal clase={editing} profesores={profesores} onClose={() => setShowModal(false)} onSave={fetchData} />}
    </div>
  )
}

function ClaseModal({ clase, profesores, onClose, onSave }: { clase: Clase | null, profesores: Profesor[], onClose: () => void, onSave: () => void }) {
  const [form, setForm] = useState({
    nombre: clase?.nombre || '',
    dia: clase?.dia || 'Lunes',
    hora: clase?.hora || '09:00',
    profesor_id: clase?.profesor_id || '',
    precio: clase?.precio || 0,
    cupos: clase?.cupos || 20,
  })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (clase) {
      await supabase.from('clases').update(form).eq('id', clase.id)
    } else {
      await supabase.from('clases').insert({ ...form, user_id: user.id })
    }
    setLoading(false)
    onSave()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">{clase ? 'Editar' : 'Nueva'} Clase</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div><label className="block text-sm font-medium mb-1">Nombre *</label><input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Día</label><select value={form.dia} onChange={(e) => setForm({ ...form, dia: e.target.value })} className="w-full px-4 py-2 border rounded-lg">{DIAS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
            <div><label className="block text-sm font-medium mb-1">Hora</label><input type="time" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} className="w-full px-4 py-2 border rounded-lg" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Profesor</label><select value={form.profesor_id} onChange={(e) => setForm({ ...form, profesor_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg"><option value="">Seleccionar profesor</option>{profesores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Precio</label><input type="number" value={form.precio} onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })} className="w-full px-4 py-2 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium mb-1">Cupos</label><input type="number" value={form.cupos} onChange={(e) => setForm({ ...form, cupos: Number(e.target.value) })} className="w-full px-4 py-2 border rounded-lg" /></div>
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
