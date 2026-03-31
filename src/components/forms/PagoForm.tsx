'use client'

import { useState, useCallback } from 'react'
import { Pago, Alumno, PagoInsert, FormErrors, MetodoPago, PagoEstado } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

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

interface PagoFormProps {
  pago?: Pago | null
  alumnos: Alumno[]
  onSubmit: (data: PagoInsert, errors: FormErrors) => Promise<boolean>
  onCancel: () => void
  loading?: boolean
}

export function PagoForm({ pago, alumnos, onSubmit, onCancel, loading = false }: PagoFormProps) {
  const [form, setForm] = useState<PagoInsert>({
    alumno_id: pago?.alumno_id || '',
    concepto: pago?.concepto || '',
    monto: pago?.monto ?? 0,
    metodo: pago?.metodo || 'efectivo',
    fecha_pago: pago?.fecha_pago || new Date().toISOString().split('T')[0],
    estado: pago?.estado || 'pagado',
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const handleChange = useCallback(
    (field: keyof PagoInsert, value: string | number | MetodoPago | PagoEstado) => {
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
      const errors = validatePagoForm(form)
      setFormErrors(errors)
      await onSubmit(form, errors)
    },
    [form, onSubmit]
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="label">Alumno</label>
        <select
          value={form.alumno_id}
          onChange={e => handleChange('alumno_id', e.target.value)}
          className={`input-field w-full ${formErrors.alumno_id ? 'ring-2 ring-tertiary/30' : ''}`}
        >
          <option value="">Seleccionar alumno</option>
          {alumnos.map(a => (
            <option key={a.id} value={a.id}>
              {a.nombre}
            </option>
          ))}
        </select>
        {formErrors.alumno_id && (
          <p className="mt-2 text-sm text-tertiary">{formErrors.alumno_id}</p>
        )}
      </div>

      <Input
        label="Concepto"
        type="text"
        value={form.concepto}
        onChange={e => handleChange('concepto', e.target.value)}
        error={formErrors.concepto}
        placeholder="Ej: Cuota Marzo"
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Monto"
          type="number"
          min="0"
          value={form.monto}
          onChange={e => handleChange('monto', Number(e.target.value))}
          error={formErrors.monto}
          required
        />
        <div>
          <label className="label">Método</label>
          <select
            value={form.metodo}
            onChange={e => handleChange('metodo', e.target.value as MetodoPago)}
            className="input-field w-full"
          >
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="mercadopago">MercadoPago</option>
            <option value="tarjeta">Tarjeta</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Fecha</label>
          <input
            type="date"
            value={form.fecha_pago}
            onChange={e => handleChange('fecha_pago', e.target.value)}
            className={`input-field w-full ${formErrors.fecha_pago ? 'ring-2 ring-tertiary/30' : ''}`}
          />
          {formErrors.fecha_pago && (
            <p className="mt-2 text-sm text-tertiary">{formErrors.fecha_pago}</p>
          )}
        </div>
        <div>
          <label className="label">Estado</label>
          <select
            value={form.estado}
            onChange={e => handleChange('estado', e.target.value as PagoEstado)}
            className="input-field w-full"
          >
            <option value="pagado">Pagado</option>
            <option value="pendiente">Pendiente</option>
          </select>
        </div>
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
          {pago ? 'Actualizar' : 'Crear'} Pago
        </Button>
      </div>
    </form>
  )
}
