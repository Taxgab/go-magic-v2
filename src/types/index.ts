// Enums para estados y tipos
export type AlumnoEstado = 'activo' | 'inactivo'
export type ClaseEstado = 'activa' | 'cancelada'
export type PagoEstado = 'pagado' | 'pendiente'
export type MetodoPago = 'efectivo' | 'transferencia' | 'mercadopago' | 'tarjeta'
export type Moneda = 'ARS' | 'USD' | 'EUR'

// Tipos principales
export type Alumno = {
  id: string
  user_id: string
  nombre: string
  dni?: string | null
  telefono?: string | null
  email?: string | null
  direccion?: string | null
  contacto_emergencia?: string | null
  medico?: string | null
  fecha_alta: string
  estado: AlumnoEstado
  created_at: string
  updated_at: string
}

export type Profesor = {
  id: string
  user_id: string
  nombre: string
  especialidad?: string | null
  porcentaje_comision: number
  cbu?: string | null
  telefono?: string | null
  email?: string | null
  fecha_alta: string
  estado: AlumnoEstado
  created_at: string
  updated_at: string
}

export type ClaseTipo = 'pilates' | 'zumba'

export type Clase = {
  id: string
  user_id: string
  nombre: string
  dia: string
  hora: string
  profesor_id?: string | null
  profesor?: { nombre: string } | null
  profesores?: { nombre: string } | null
  tipo?: ClaseTipo | null
  precio: number
  cupos?: number | null
  estado: ClaseEstado
  created_at: string
  updated_at: string
  alumnos?: Alumno[]
}

export type Asistencia = {
  id: string
  user_id: string
  clase_id: string
  alumno_id?: string | null
  nombre_alumno: string
  telefono?: string | null
  fecha_clase: string
  hora_clase: string
  confirmado_en: string
  estado: 'confirmado' | 'cancelado' | 'asistio' | 'no_asistio'
  created_at: string
  updated_at: string
  clase?: { nombre: string; hora: string; profesores?: { nombre: string } | null }
}

export type Inscripcion = {
  id: string
  user_id: string
  clase_id: string
  alumno_id: string
  fecha_inscripcion: string
}

export type Pago = {
  id: string
  user_id: string
  alumno_id: string
  alumno?: { nombre: string } | null
  concepto: string
  monto: number
  metodo: MetodoPago
  fecha_pago: string
  estado: PagoEstado
  created_at: string
  updated_at: string
}

export type Configuracion = {
  id: string
  user_id: string
  cuota_social: number
  moneda: Moneda
  nombre_gym: string
  updated_at: string
}

// Utility types para operaciones CRUD
export type AlumnoInsert = Omit<Alumno, 'id' | 'created_at' | 'updated_at' | 'user_id'>
export type AlumnoUpdate = Partial<Omit<Alumno, 'id' | 'created_at' | 'updated_at' | 'user_id'>>

export type ProfesorInsert = Omit<Profesor, 'id' | 'created_at' | 'updated_at' | 'user_id'>
export type ProfesorUpdate = Partial<Omit<Profesor, 'id' | 'created_at' | 'updated_at' | 'user_id'>>

export type ClaseInsert = Omit<
  Clase,
  'id' | 'created_at' | 'updated_at' | 'user_id' | 'profesor' | 'profesores' | 'alumnos'
>
export type ClaseUpdate = Partial<
  Omit<Clase, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'profesor' | 'alumnos'>
>

export type PagoInsert = Omit<Pago, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'alumno'>
export type PagoUpdate = Partial<
  Omit<Pago, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'alumno'>
>

export type ConfiguracionInsert = Omit<Configuracion, 'id' | 'updated_at' | 'user_id'>
export type ConfiguracionUpdate = Partial<Omit<Configuracion, 'id' | 'updated_at' | 'user_id'>>

export type AsistenciaInsert = Omit<
  Asistencia,
  'id' | 'created_at' | 'updated_at' | 'user_id' | 'clase'
>
export type AsistenciaUpdate = Partial<
  Omit<Asistencia, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'clase'>
>

// Tipos para errores de formulario
export type FormErrors = Record<string, string>

// Tipos para respuestas de Supabase
export type SupabaseError = {
  message: string
  code?: string
}
