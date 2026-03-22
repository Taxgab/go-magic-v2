'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Alumno } from '@/types'
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react'

export default function AlumnosPage() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Alumno | null>(null)
  const supabase = createClient()

  const fetchAlumnos = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('alumnos')
      .select('*')
      .eq('user_id', user.id)
      .order('nombre')

    setAlumnos(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchAlumnos() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este alumno?')) return
    await supabase.from('alumnos').delete().eq('id', id)
    fetchAlumnos()
  }

  const filtered = alumnos.filter(a => a.nombre.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Alumnos</h1>
        <button
          onClick={() => { setEditing(null); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} /> Nuevo Alumno
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar alumnos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-8">Cargando...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-gray-500">
                  <th className="pb-3 font-medium">Nombre</th>
                  <th className="pb-3 font-medium">DNI</th>
                  <th className="pb-3 font-medium">Teléfono</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Estado</th>
                  <th className="pb-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((alumno) => (
                  <tr key={alumno.id} className="border-b last:border-0">
                    <td className="py-4 font-medium">{alumno.nombre}</td>
                    <td className="py-4 text-gray-600">{alumno.dni || '-'}</td>
                    <td className="py-4 text-gray-600">{alumno.telefono || '-'}</td>
                    <td className="py-4 text-gray-600">{alumno.email || '-'}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        alumno.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {alumno.estado}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditing(alumno); setShowModal(true) }} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(alumno.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-500">No hay alumnos registrados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && <AlumnoModal alumno={editing} onClose={() => setShowModal(false)} onSave={fetchAlumnos} />}
    </div>
  )
}

function AlumnoModal({ alumno, onClose, onSave }: { alumno: Alumno | null, onClose: () => void, onSave: () => void }) {
  const [form, setForm] = useState({
    nombre: alumno?.nombre || '',
    dni: alumno?.dni || '',
    telefono: alumno?.telefono || '',
    email: alumno?.email || '',
    direccion: alumno?.direccion || '',
    contacto_emergencia: alumno?.contacto_emergencia || '',
    medico: alumno?.medico || '',
  })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (alumno) {
      await supabase.from('alumnos').update(form).eq('id', alumno.id)
    } else {
      await supabase.from('alumnos').insert({ ...form, user_id: user.id })
    }
    setLoading(false)
    onSave()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">{alumno ? 'Editar' : 'Nuevo'} Alumno</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre *</label>
            <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">DNI</label>
              <input type="text" value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Teléfono</label>
              <input type="text" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Dirección</label>
            <input type="text" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contacto de Emergencia</label>
            <input type="text" value={form.contacto_emergencia} onChange={(e) => setForm({ ...form, contacto_emergencia: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Médico</label>
            <input type="text" value={form.medico} onChange={(e) => setForm({ ...form, medico: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
