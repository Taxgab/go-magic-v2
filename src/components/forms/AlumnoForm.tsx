'use client'

import { useState, useCallback, useEffect } from 'react'
import { Alumno, Clase } from '@/types'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { AlumnoFormData } from '@/lib/validation/alumno'
import { createClient } from '@/lib/supabase-client'

interface AlumnoFormProps {
  alumno?: Alumno | null
  formErrors: Record<string, string>
  loading?: boolean
  onSubmit: (data: AlumnoFormData) => void
  onCancel: () => void
}

export function AlumnoForm({
  alumno,
  formErrors,
  loading = false,
  onSubmit,
  onCancel,
}: AlumnoFormProps) {
  const [form, setForm] = useState<AlumnoFormData>({
    nombre: alumno?.nombre || '',
    dni: alumno?.dni || '',
    telefono: alumno?.telefono || '',
    email: alumno?.email || '',
    direccion: alumno?.direccion || '',
    contacto_emergencia: alumno?.contacto_emergencia || '',
    medico: alumno?.medico || '',
    fecha_alta: alumno?.fecha_alta || new Date().toISOString().split('T')[0],
    estado: alumno?.estado || 'activo',
    clase_ids: alumno?.inscripciones?.map(i => i.clase_id) || [],
  })

  const [clases, setClases] = useState<Clase[]>([])
  const [loadingClases, setLoadingClases] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const fetchClases = async () => {
      setLoadingClases(true)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from('clases')
          .select('id, nombre, dia, hora, user_id, precio, estado, created_at, updated_at')
          .eq('user_id', user.id)
          .eq('estado', 'activa')
          .order('nombre')

        setClases((data as Clase[]) || [])
      } catch (err) {
        console.error('Error cargando clases:', err)
      } finally {
        setLoadingClases(false)
      }
    }

    fetchClases()
  }, [supabase])

  const handleChange = useCallback((field: keyof AlumnoFormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleClaseToggle = useCallback((claseId: string) => {
    setForm(prev => {
      const currentIds = prev.clase_ids || []
      const newIds = currentIds.includes(claseId)
        ? currentIds.filter(id => id !== claseId)
        : [...currentIds, claseId]
      return { ...prev, clase_ids: newIds }
    })
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      onSubmit(form)
    },
    [form, onSubmit]
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Nombre"
        type="text"
        value={form.nombre}
        onChange={e => handleChange('nombre', e.target.value)}
        error={formErrors.nombre}
        placeholder="Nombre completo del alumno"
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="DNI"
          type="text"
          value={form.dni || ''}
          onChange={e => handleChange('dni', e.target.value)}
          error={formErrors.dni}
          placeholder="12345678"
        />
        <Input
          label="Teléfono"
          type="text"
          value={form.telefono || ''}
          onChange={e => handleChange('telefono', e.target.value)}
          error={formErrors.telefono}
          placeholder="11 1234-5678"
        />
      </div>

      <Input
        label="Email"
        type="email"
        value={form.email || ''}
        onChange={e => handleChange('email', e.target.value)}
        error={formErrors.email}
        placeholder="ejemplo@email.com"
      />

      <Input
        label="Dirección"
        type="text"
        value={form.direccion || ''}
        onChange={e => handleChange('direccion', e.target.value)}
        placeholder="Dirección completa"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Contacto de Emergencia"
          type="text"
          value={form.contacto_emergencia || ''}
          onChange={e => handleChange('contacto_emergencia', e.target.value)}
          placeholder="Nombre y teléfono"
        />
        <Input
          label="Médico"
          type="text"
          value={form.medico || ''}
          onChange={e => handleChange('medico', e.target.value)}
          placeholder="Médico de cabecera"
        />
      </div>

      <div>
        <label className="label">Actividades/Clases</label>
        {loadingClases ? (
          <div className="text-sm text-on-surface-variant">Cargando clases...</div>
        ) : clases.length === 0 ? (
          <div className="text-sm text-on-surface-variant">No hay clases disponibles</div>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto bg-surface-low rounded-2xl p-3">
            {clases.map(clase => (
              <div key={clase.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`clase-${clase.id}`}
                  checked={form.clase_ids?.includes(clase.id) || false}
                  onChange={() => handleClaseToggle(clase.id)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label
                  htmlFor={`clase-${clase.id}`}
                  className="text-sm text-on-surface cursor-pointer"
                >
                  {clase.nombre} - {clase.dia} {clase.hora} hs
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Fecha de Alta"
          type="date"
          value={form.fecha_alta}
          onChange={e => handleChange('fecha_alta', e.target.value)}
          required
        />
        <Select
          label="Estado"
          value={form.estado}
          onChange={e => handleChange('estado', e.target.value)}
        >
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </Select>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="primary" className="flex-1" loading={loading}>
          {alumno ? 'Actualizar' : 'Crear'} Alumno
        </Button>
      </div>
    </form>
  )
}
