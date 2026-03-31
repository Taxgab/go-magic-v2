'use client'

import { useState, useCallback } from 'react'
import { Clase, Profesor, ClaseInsert, FormErrors } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const TIPOS_CLASE = [
  { value: 'pilates', label: 'Pilates', icon: '🧘' },
  { value: 'zumba', label: 'Zumba', icon: '💃' },
]

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

interface ClaseFormProps {
  clase?: Clase | null
  profesores: Profesor[]
  onSubmit: (data: ClaseInsert, errors: FormErrors) => Promise<boolean>
  onCancel: () => void
  loading?: boolean
}

export function ClaseForm({
  clase,
  profesores,
  onSubmit,
  onCancel,
  loading = false,
}: ClaseFormProps) {
  const [form, setForm] = useState<ClaseInsert>({
    nombre: clase?.nombre || '',
    dia: clase?.dia || 'Lunes',
    hora: clase?.hora || '09:00',
    profesor_id: clase?.profesor_id || null,
    tipo: clase?.tipo || 'pilates',
    precio: clase?.precio ?? 0,
    cupos: clase?.cupos ?? 20,
    estado: clase?.estado || 'activa',
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const handleChange = useCallback(
    (field: keyof ClaseInsert, value: string | number | null) => {
      setForm(prev => ({ ...prev, [field]: value }))
      if (formErrors[field]) {
        setFormErrors(prev => ({ ...prev, [field]: '' }))
      }
    },
    [formErrors]
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const errors = validateClaseForm(form)
      setFormErrors(errors)
      await onSubmit(form, errors)
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
        required
      />

      <div>
        <label className="label">Tipo de clase</label>
        <select
          value={form.tipo || 'pilates'}
          onChange={e => handleChange('tipo', e.target.value)}
          className="input-field w-full"
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
          <label className="label">Día</label>
          <select
            value={form.dia}
            onChange={e => handleChange('dia', e.target.value)}
            className="input-field w-full"
          >
            {DIAS.map(d => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Hora</label>
          <input
            type="time"
            value={form.hora}
            onChange={e => handleChange('hora', e.target.value)}
            className="input-field w-full"
          />
        </div>
      </div>

      <div>
        <label className="label">Profesor</label>
        <select
          value={form.profesor_id || ''}
          onChange={e => handleChange('profesor_id', e.target.value || null)}
          className="input-field w-full"
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
        <Input
          label="Precio"
          type="number"
          min="0"
          value={form.precio}
          onChange={e => handleChange('precio', Number(e.target.value))}
          error={formErrors.precio}
          required
        />
        <Input
          label="Cupos"
          type="number"
          min="1"
          value={form.cupos ?? 20}
          onChange={e => handleChange('cupos', e.target.value ? Number(e.target.value) : 20)}
          error={formErrors.cupos}
          required
        />
      </div>

      <div>
        <label className="label">Estado</label>
        <select
          value={form.estado}
          onChange={e => handleChange('estado', e.target.value)}
          className="input-field w-full"
        >
          <option value="activa">Activa</option>
          <option value="cancelada">Cancelada</option>
        </select>
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
          {clase ? 'Actualizar' : 'Crear'} Clase
        </Button>
      </div>
    </form>
  )
}
