import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const today = new Date().toISOString().split('T')[0]
  const todayName = DIAS[new Date().getDay()]

  try {
    if (action === 'clases') {
      const { data, error } = await supabaseAdmin
        .from('clases')
        .select('id, nombre, dia, hora, tipo, cupos, estado')
        .eq('dia', todayName)
        .eq('estado', 'activa')
        .order('hora')

      if (error) throw error
      return NextResponse.json({ clases: data })
    }

    if (action === 'asistencias') {
      const { data, error } = await supabaseAdmin
        .from('asistencias')
        .select('clase_id, nombre_alumno')
        .eq('fecha_clase', today)
        .eq('estado', 'confirmado')

      if (error) throw error

      const countByClass: Record<string, number> = {}
      data?.forEach(a => {
        countByClass[a.clase_id] = (countByClass[a.clase_id] || 0) + 1
      })

      return NextResponse.json({ asistencias: countByClass, detalles: data })
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { clase_id, nombre, telefono } = body

    if (!clase_id || !nombre) {
      return NextResponse.json({ error: 'Clase y nombre son requeridos' }, { status: 400 })
    }

    const today = new Date().toISOString().split('T')[0]

    const { data: clase } = await supabaseAdmin
      .from('clases')
      .select('hora')
      .eq('id', clase_id)
      .single()

    const { error } = await supabaseAdmin.from('asistencias').insert({
      clase_id,
      nombre_alumno: nombre,
      telefono: telefono || null,
      fecha_clase: today,
      hora_clase: clase?.hora || '00:00',
      estado: 'confirmado',
      confirmado_en: new Date().toISOString(),
      user_id: null,
    })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Ya confirmaste esta clase' }, { status: 400 })
      }
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error al confirmar asistencia' }, { status: 500 })
  }
}
