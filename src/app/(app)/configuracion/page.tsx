'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Configuracion } from '@/types'
import { Save } from 'lucide-react'

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<Configuracion | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ nombre_gym: 'Mi Gimnasio', cuota_social: 0, moneda: 'ARS' })
  const supabase = createClient()

  const fetchConfig = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase.from('configuracion').select('*').eq('user_id', user.id).single()
    if (data) {
      setConfig(data)
      setForm({ nombre_gym: data.nombre_gym, cuota_social: data.cuota_social, moneda: data.moneda })
    }
    setLoading(false)
  }

  useEffect(() => { fetchConfig() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (config) {
      await supabase.from('configuracion').update(form).eq('id', config.id)
    } else {
      await supabase.from('configuracion').insert({ ...form, user_id: user.id })
    }
    setMessage('Configuración guardada correctamente')
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  if (loading) return <p className="text-center text-gray-500 py-8">Cargando...</p>

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Configuración</h1>

      <div className="bg-white rounded-xl shadow p-6 max-w-xl">
        {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Datos del Gimnasio</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Nombre del Gimnasio</label>
              <input type="text" value={form.nombre_gym} onChange={(e) => setForm({ ...form, nombre_gym: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Configuración de Cuotas</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cuota Social</label>
                <input type="number" value={form.cuota_social} onChange={(e) => setForm({ ...form, cuota_social: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Moneda</label>
                <select value={form.moneda} onChange={(e) => setForm({ ...form, moneda: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="ARS">ARS - Peso Argentino</option>
                  <option value="USD">USD - Dólar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            <Save size={20} />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    </div>
  )
}
