export type Alumno = {
  id: string
  user_id: string
  nombre: string
  dni?: string
  telefono?: string
  email?: string
  direccion?: string
  contacto_emergencia?: string
  medico?: string
  fecha_alta: string
  estado: 'activo' | 'inactivo'
  created_at: string
  updated_at: string
}

export type Profesor = {
  id: string
  user_id: string
  nombre: string
  especialidad?: string
  porcentaje_comision: number
  cbu?: string
  telefono?: string
  email?: string
  fecha_alta: string
  estado: 'activo' | 'inactivo'
  created_at: string
  updated_at: string
}

export type Clase = {
  id: string
  user_id: string
  nombre: string
  dia: string
  hora: string
  profesor_id?: string
  profesor?: { nombre: string }
  precio: number
  cupos?: number
  estado: 'activa' | 'cancelada'
  created_at: string
  updated_at: string
  alumnos?: Alumno[]
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
  alumno?: { nombre: string }
  concepto: string
  monto: number
  metodo: 'efectivo' | 'transferencia' | 'mercadopago' | 'tarjeta'
  fecha_pago: string
  estado: 'pagado' | 'pendiente'
  created_at: string
  updated_at: string
}

export type Configuracion = {
  id: string
  user_id: string
  cuota_social: number
  moneda: string
  nombre_gym: string
  updated_at: string
}
