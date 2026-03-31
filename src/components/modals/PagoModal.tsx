'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Pago, Alumno, PagoInsert, FormErrors } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { PagoForm } from '@/components/forms/PagoForm'
import { AlertCircle } from 'lucide-react'

interface PagoModalProps {
  pago: Pago | null
  alumnos: Alumno[]
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function PagoModal({ pago, alumnos, isOpen, onClose, onSave }: PagoModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSubmit = async (data: PagoInsert, formErrors: FormErrors): Promise<boolean> => {
    if (Object.keys(formErrors).length > 0) return false

    setLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError('No hay usuario autenticado')
        setLoading(false)
        return false
      }

      if (pago) {
        const { error: supabaseError } = await supabase
          .from('pagos')
          .update({
            alumno_id: data.alumno_id,
            concepto: data.concepto.trim(),
            monto: data.monto,
            metodo: data.metodo,
            fecha_pago: data.fecha_pago,
            estado: data.estado,
          })
          .eq('id', pago.id)

        if (supabaseError) {
          console.error('Error updating pago:', supabaseError)
          setError(`Error al actualizar: ${supabaseError.message}`)
          setLoading(false)
          return false
        }
      } else {
        const { error: supabaseError } = await supabase.from('pagos').insert({
          ...data,
          user_id: user.id,
          concepto: data.concepto.trim(),
        })

        if (supabaseError) {
          console.error('Error inserting pago:', supabaseError)
          setError(`Error al crear: ${supabaseError.message}`)
          setLoading(false)
          return false
        }
      }

      onSave()
      onClose()
      return true
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Error inesperado al guardar')
      setLoading(false)
      return false
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={pago ? 'Editar Pago' : 'Nuevo Pago'}
      maxWidth="md"
    >
      {error && (
        <div className="mb-6 p-4 bg-tertiary/10 border border-tertiary/20 rounded-2xl flex items-center gap-3 text-tertiary">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}
      <PagoForm
        pago={pago}
        alumnos={alumnos}
        onSubmit={handleSubmit}
        onCancel={onClose}
        loading={loading}
      />
    </Modal>
  )
}
