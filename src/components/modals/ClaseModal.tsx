'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Clase, Profesor, ClaseInsert, FormErrors } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { ClaseForm } from '@/components/forms/ClaseForm'
import { AlertCircle } from 'lucide-react'

interface ClaseModalProps {
  clase: Clase | null
  profesores: Profesor[]
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function ClaseModal({ clase, profesores, isOpen, onClose, onSave }: ClaseModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSubmit = async (data: ClaseInsert, formErrors: FormErrors): Promise<boolean> => {
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

      if (clase) {
        const { error: supabaseError } = await supabase
          .from('clases')
          .update({
            nombre: data.nombre.trim(),
            dia: data.dia,
            hora: data.hora,
            profesor_id: data.profesor_id,
            tipo: data.tipo,
            precio: data.precio,
            cupos: data.cupos,
          })
          .eq('id', clase.id)

        if (supabaseError) {
          console.error('Error updating clase:', supabaseError)
          setError(`Error al actualizar: ${supabaseError.message}`)
          setLoading(false)
          return false
        }
      } else {
        const { error: supabaseError } = await supabase.from('clases').insert({
          ...data,
          user_id: user.id,
          nombre: data.nombre.trim(),
          profesor_id: data.profesor_id,
          tipo: data.tipo || 'pilates',
        })

        if (supabaseError) {
          console.error('Error inserting clase:', supabaseError)
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
      title={clase ? 'Editar Clase' : 'Nueva Clase'}
      maxWidth="md"
    >
      {error && (
        <div className="mb-6 p-4 bg-tertiary/10 border border-tertiary/20 rounded-2xl flex items-center gap-3 text-tertiary">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}
      <ClaseForm
        clase={clase}
        profesores={profesores}
        onSubmit={handleSubmit}
        onCancel={onClose}
        loading={loading}
      />
    </Modal>
  )
}
