'use client'

import { useState } from 'react'
import { Alumno } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { AlumnoForm } from '@/components/forms/AlumnoForm'
import { AlertCircle } from 'lucide-react'
import { AlumnoFormData } from '@/lib/validation/alumno'

interface AlumnoModalProps {
  alumno?: Alumno | null
  isOpen: boolean
  onClose: () => void
  onSave: (data: AlumnoFormData, alumnoId?: string) => Promise<boolean>
  formErrors: Record<string, string>
  loading?: boolean
  error?: string | null
}

/**
 * Modal para crear/editar alumno
 * Usa AlumnoForm separado para mantener responsabilidades claras
 */
export function AlumnoModal({
  alumno,
  isOpen,
  onClose,
  onSave,
  formErrors,
  loading = false,
  error,
}: AlumnoModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (data: AlumnoFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const success = await onSave(data, alumno?.id)
      if (!success) {
        setSubmitError('Error al guardar el alumno')
      }
    } catch (err) {
      setSubmitError('Error inesperado al guardar')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={alumno ? 'Editar Alumno' : 'Nuevo Alumno'}
      maxWidth="md"
    >
      {(error || submitError) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={16} />
          <span>{error || submitError}</span>
        </div>
      )}

      <AlumnoForm
        alumno={alumno}
        formErrors={formErrors}
        loading={loading || isSubmitting}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Modal>
  )
}
