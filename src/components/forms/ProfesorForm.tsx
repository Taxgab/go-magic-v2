'use client'

import { useState, useCallback } from 'react'
import { Profesor, ProfesorInsert, FormErrors } from '@/types'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

const validateProfesorForm = (form: ProfesorInsert): FormErrors => {
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

interface ProfesorFormProps {
  profesor?: Profesor | null
  onSubmit: (data: ProfesorInsert, errors: FormErrors) => Promise<boolean>
  onCancel: () => void
  loading?: boolean
}

export function ProfesorForm({ profesor, onSubmit, onCancel, loading = false }: ProfesorFormProps) {
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

  const handleChange = useCallback(
    (field: keyof ProfesorInsert, value: string | number) => {
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
      const errors = validateProfesorForm(form)
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Especialidad"
          type="text"
          value={form.especialidad || ''}
          onChange={e => handleChange('especialidad', e.target.value)}
          placeholder="Ej: Pilates, Zumba"
        />
        <Input
          label="% Comisión"
          type="number"
          step="0.01"
          min="0"
          max="100"
          value={form.porcentaje_comision}
          onChange={e => handleChange('porcentaje_comision', Number(e.target.value))}
          error={formErrors.porcentaje_comision}
          required
        />
      </div>

      <Input
        label="CBU/CVU"
        type="text"
        value={form.cbu || ''}
        onChange={e => handleChange('cbu', e.target.value)}
        error={formErrors.cbu}
        placeholder="22 dígitos"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Teléfono"
          type="text"
          value={form.telefono || ''}
          onChange={e => handleChange('telefono', e.target.value)}
          error={formErrors.telefono}
          placeholder="11 1234-5678"
        />
        <Input
          label="Email"
          type="email"
          value={form.email || ''}
          onChange={e => handleChange('email', e.target.value)}
          error={formErrors.email}
          placeholder="ejemplo@email.com"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Fecha de Alta"
          type="date"
          value={form.fecha_alta}
          onChange={e => handleChange('fecha_alta', e.target.value)}
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
          {profesor ? 'Actualizar' : 'Crear'} Profesor
        </Button>
      </div>
    </form>
  )
}
