import { z } from 'zod'

/**
 * Validación de variables de entorno usando Zod
 * Falla rápido en build time si faltan variables requeridas
 */

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('La URL de Supabase debe ser una URL válida'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'La clave anónima de Supabase es requerida'),
})

/**
 * Variables de entorno validadas
 * Se ejecuta al importar el módulo, fallando inmediatamente si hay errores
 */
export const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
})

/**
 * Tipo inferido del schema de env
 */
export type Env = z.infer<typeof envSchema>
