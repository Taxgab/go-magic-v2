import { z } from 'zod'
import { config } from '@/config/app'

/**
 * Esquemas de validación para alumnos usando Zod
 * Centraliza todas las reglas de validación
 */

export const alumnoSchema = z.object({
  nombre: z
    .string()
    .min(config.validation.minNameLength, `El nombre debe tener al menos ${config.validation.minNameLength} caracteres`)
    .max(config.validation.maxNameLength, `El nombre no puede exceder ${config.validation.maxNameLength} caracteres`)
    .transform((val) => val.trim()),

  dni: z
    .string()
    .regex(config.validation.dniRegex, 'El DNI debe tener 7-8 dígitos numéricos')
    .optional()
    .nullable()
    .transform((val) => (val ? val.trim() : null)),

  telefono: z
    .string()
    .regex(config.validation.phoneRegex, 'El teléfono debe tener al menos 8 caracteres')
    .optional()
    .nullable()
    .transform((val) => (val ? val.trim() : null)),

  email: z
    .string()
    .email('El formato del email es inválido')
    .optional()
    .nullable()
    .transform((val) => (val ? val.trim() : null)),

  direccion: z
    .string()
    .max(200, 'La dirección no puede exceder 200 caracteres')
    .optional()
    .nullable()
    .transform((val) => (val ? val.trim() : null)),

  contacto_emergencia: z
    .string()
    .max(200, 'El contacto de emergencia no puede exceder 200 caracteres')
    .optional()
    .nullable()
    .transform((val) => (val ? val.trim() : null)),

  medico: z
    .string()
    .max(200, 'La información médica no puede exceder 200 caracteres')
    .optional()
    .nullable()
    .transform((val) => (val ? val.trim() : null)),

  fecha_alta: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato YYYY-MM-DD'),

  estado: z
    .enum(['activo', 'inactivo'])
    .default('activo'),
})

export const alumnoInsertSchema = alumnoSchema

export const alumnoUpdateSchema = alumnoSchema.partial()

/**
 * Tipos inferidos de los esquemas
 */
export type AlumnoFormData = z.infer<typeof alumnoSchema>
export type AlumnoInsertData = z.infer<typeof alumnoInsertSchema>
export type AlumnoUpdateData = z.infer<typeof alumnoUpdateSchema>

/**
 * Función para validar datos de alumno
 * Retorna objeto con datos validados y errores
 */
export function validateAlumno(
  data: unknown
): { success: true; data: AlumnoFormData } | { success: false; errors: Record<string, string> } {
  const result = alumnoSchema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  // Convertir errores de Zod a formato simple
  const errors: Record<string, string> = {}
  result.error.issues.forEach((issue) => {
    const field = issue.path[0] as string
    errors[field] = issue.message
  })

  return { success: false, errors }
}

/**
 * Función para validar actualización parcial
 */
export function validateAlumnoUpdate(
  data: unknown
): { success: true; data: AlumnoUpdateData } | { success: false; errors: Record<string, string> } {
  const result = alumnoUpdateSchema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  const errors: Record<string, string> = {}
  result.error.issues.forEach((issue) => {
    const field = issue.path[0] as string
    errors[field] = issue.message
  })

  return { success: false, errors }
}
