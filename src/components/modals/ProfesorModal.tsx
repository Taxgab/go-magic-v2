'use client'

import { Profesor, ProfesorInsert, FormErrors } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { ProfesorForm } from '@/components/forms/ProfesorForm'
import { AlertCircle } from 'lucide-react'

interface ProfesorModalProps {
  profesor: Profesor | null
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function ProfesorModal({ profesor, isOpen, onClose, onSave }: ProfesorModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSubmit = async (data: ProfesorInsert, formErrors: FormErrors): Promise<boolean> => {
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

      if (profesor) {
        const { error: supabaseError } = await supabase
          .from('profesores')
          .update({
            nombre: data.nombre.trim(),
            especialidad: data.especialidad?.trim() || null,
            porcentaje_comision: data.porcentaje_comision,
            cbu: data.cbu?.trim() || null,
            telefono: data.telefono?.trim() || null,
            email: data.email?.trim() || null,
          })
          .eq('id', profesor.id)

        if (supabaseError) {
          console.error('Error updating profesor:', supabaseError)
          setError(`Error al actualizar: ${supabaseError.message}`)
          setLoading(false)
          return false
        }
      } else {
        const { error: supabaseError } = await supabase.from('profesores').insert({
          ...data,
          user_id: user.id,
          nombre: data.nombre.trim(),
          especialidad: data.especialidad?.trim() || null,
          cbu: data.cbu?.trim() || null,
          telefono: data.telefono?.trim() || null,
          email: data.email?.trim() || null,
        })

        if (supabaseError) {
          console.error('Error inserting profesor:', supabaseError)
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
      title={profesor ? 'Editar Profesor' : 'Nuevo Profesor'}
      maxWidth="md"
    >
      {error && (
        <div className="mb-6 p-4 bg-tertiary/10 border border-tertiary/20 rounded-2xl flex items-center gap-3 text-tertiary">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}
      <ProfesorForm
        profesor={profesor}
        onSubmit={handleSubmit}
        onCancel={onClose}
        loading={loading}
      />
    </Modal>
  )
}

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
