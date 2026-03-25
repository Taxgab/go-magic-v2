'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Configuracion, ConfiguracionInsert, FormErrors, Moneda } from '@/types'
import { Save, AlertCircle, CheckCircle } from 'lucide-react'

// Funciones de validación
const validateConfiguracionForm = (form: ConfiguracionInsert): FormErrors => {
  const errors: FormErrors = {}
  
  if (!form.nombre_gym || !form.nombre_gym.trim()) {
    errors.nombre_gym = 'El nombre del gimnasio es requerido'
  } else if (form.nombre_gym.trim().length < 2) {
    errors.nombre_gym = 'El nombre debe tener al menos 2 caracteres'
  }
  
  if (form.cuota_social === undefined || form.cuota_social === null) {
    errors.cuota_social = 'La cuota social es requerida'
  } else if (form.cuota_social < 0) {
    errors.cuota_social = 'La cuota social no puede ser negativa'
  }
  
  if (!form.moneda) {
    errors.moneda = 'La moneda es requerida'
  } else if (!['ARS', 'USD', 'EUR'].includes(form.moneda)) {
    errors.moneda = 'Moneda no válida'
  }
  
  return errors
}

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<Configuracion | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [form, setForm] = useState<ConfiguracionInsert>({ 
    nombre_gym: 'Mi Gimnasio', 
    cuota_social: 0, 
    moneda: 'ARS' 
  })
  const supabase = createClient()

  const fetchConfig = async () => {
    try {
      setError(null)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('No hay usuario autenticado')
        setLoading(false)
        return
      }

      const { data, error: supabaseError } = await supabase
        .from('configuracion')
        .select('id, user_id, nombre_gym, cuota_social, moneda, updated_at')
        .eq('user_id', user.id)
        .single()

      if (supabaseError && supabaseError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching configuracion:', supabaseError)
        setError(`Error al cargar configuración: ${supabaseError.message}`)
      } else if (data) {
        setConfig(data)
        setForm({ 
          nombre_gym: data.nombre_gym, 
          cuota_social: data.cuota_social, 
          moneda: data.moneda 
        })
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Error inesperado al cargar configuración')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchConfig() }, [])

  const handleChange = (field: keyof ConfiguracionInsert, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
    // Limpiar mensajes al editar
    if (message) setMessage('')
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError(null)
    
    // Validar formulario
    const errors = validateConfiguracionForm(form)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    
    setSaving(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('No hay usuario autenticado')
        setSaving(false)
        return
      }

      if (config) {
        const { error: supabaseError } = await supabase
          .from('configuracion')
          .update({
            nombre_gym: form.nombre_gym.trim(),
            cuota_social: form.cuota_social,
            moneda: form.moneda,
          })
          .eq('id', config.id)
          
        if (supabaseError) {
          console.error('Error updating configuracion:', supabaseError)
          setError(`Error al guardar: ${supabaseError.message}`)
          setSaving(false)
          return
        }
      } else {
        const { error: supabaseError } = await supabase
          .from('configuracion')
          .insert({
            ...form,
            user_id: user.id,
            nombre_gym: form.nombre_gym.trim(),
          })
          
        if (supabaseError) {
          console.error('Error inserting configuracion:', supabaseError)
          setError(`Error al guardar: ${supabaseError.message}`)
          setSaving(false)
          return
        }
      }
      
      setMessage('Configuración guardada correctamente')
      fetchConfig()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Error inesperado al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-center text-gray-500 py-8">Cargando...</p>

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Configuración</h1>

      <div className="bg-white rounded-xl shadow p-6 max-w-xl">
        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
            <CheckCircle size={20} />
            <span>{message}</span>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Datos del Gimnasio</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Nombre del Gimnasio *</label>
              <input 
                type="text" 
                value={form.nombre_gym} 
                onChange={(e) => handleChange('nombre_gym', e.target.value)} 
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${formErrors.nombre_gym ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
              />
              {formErrors.nombre_gym && <p className="mt-1 text-sm text-red-600">{formErrors.nombre_gym}</p>}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Configuración de Cuotas</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cuota Social *</label>
                <input 
                  type="number" 
                  value={form.cuota_social} 
                  onChange={(e) => handleChange('cuota_social', Number(e.target.value))} 
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${formErrors.cuota_social ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                />
                {formErrors.cuota_social && <p className="mt-1 text-sm text-red-600">{formErrors.cuota_social}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Moneda *</label>
                <select 
                  value={form.moneda} 
                  onChange={(e) => handleChange('moneda', e.target.value as Moneda)} 
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${formErrors.moneda ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                >
                  <option value="ARS">ARS - Peso Argentino</option>
                  <option value="USD">USD - Dólar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
                {formErrors.moneda && <p className="mt-1 text-sm text-red-600">{formErrors.moneda}</p>}
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
