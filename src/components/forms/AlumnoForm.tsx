'use client'

import { useState, useCallback } from 'react'
import { Alumno } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { AlumnoFormData } from '@/lib/validation/alumno'

interface AlumnoFormProps {
  alumno?: Alumno | null
  formErrors: Record<string, string>
  loading?: boolean
  onSubmit: (data: AlumnoFormData) => void
  onCancel: () => void
}

/**
 * Formulario de alumno reutilizable
 * Separado del modal para poder usarse en diferentes contextos
 */
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
  })

  const handleChange = useCallback(
    (field: keyof AlumnoFormData, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      onSubmit(form)
    },
    [form, onSubmit]
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre"
        type="text"
        value={form.nombre}
        onChange={(e) => handleChange('nombre', e.target.value)}
        error={formErrors.nombre}
        placeholder="Nombre completo del alumno"
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="DNI"
          type="text"
          value={form.dni || ''}
          onChange={(e) => handleChange('dni', e.target.value)}
          error={formErrors.dni}
          placeholder="12345678"
        />

        <Input
          label="Teléfono"
          type="text"
          value={form.telefono || ''}
          onChange={(e) => handleChange('telefono', e.target.value)}
          error={formErrors.telefono}
          placeholder="11 1234-5678"
        />
      </div>

      <Input
        label="Email"
        type="email"
        value={form.email || ''}
        onChange={(e) => handleChange('email', e.target.value)}
        error={formErrors.email}
        placeholder="ejemplo@email.com"
      />

      <Input
        label="Dirección"
        type="text"
        value={form.direccion || ''}
        onChange={(e) => handleChange('direccion', e.target.value)}
        placeholder="Dirección completa"
      />

      <Input
        label="Contacto de Emergencia"
        type="text"
        value={form.contacto_emergencia || ''}
        onChange={(e) => handleChange('contacto_emergencia', e.target.value)}
        placeholder="Nombre y teléfono"
      />

      <Input
        label="Médico"
        type="text"
        value={form.medico || ''}
        onChange={(e) => handleChange('medico', e.target.value)}
        placeholder="Médico de cabecera"
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Alta
          </label>
          <input
            type="date"
            value={form.fecha_alta}
            onChange={(e) => handleChange('fecha_alta', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={form.estado}
            onChange={(e) => handleChange('estado', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
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
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          loading={loading}
        >
          {alumno ? 'Actualizar' : 'Crear'} Alumno
        </Button>
      </div>
    </form>
  )
}
