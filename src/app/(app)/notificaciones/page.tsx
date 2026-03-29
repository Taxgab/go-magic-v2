'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Clase, Asistencia } from '@/types'
import { Send, Users, Calendar, CheckCircle, AlertCircle, Phone, MessageSquare } from 'lucide-react'

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export default function NotificacionesPage() {
  const [clasesHoy, setClasesHoy] = useState<Clase[]>([])
  const [asistenciasHoy, setAsistenciasHoy] = useState<Record<string, Asistencia[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedClase, setSelectedClase] = useState<string | null>(null)
  const [messageTemplate, setMessageTemplate] = useState('')
  const [copiedList, setCopiedList] = useState<string | null>(null)
  const [originUrl, setOriginUrl] = useState<string>('')
  const supabase = createClient()

  const today = new Date()
  const todayName = DIAS[today.getDay()]
  const todayLabel = DIAS[today.getDay()]
  const todayISO = today.toISOString().split('T')[0]

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError('No hay usuario autenticado')
        setLoading(false)
        return
      }

      // Obtener clases de hoy
      const { data: clasesData, error: clasesError } = await supabase
        .from('clases')
        .select('*, profesores(nombre)')
        .eq('user_id', user.id)
        .eq('dia', todayName)
        .eq('estado', 'activa')
        .order('hora')

      if (clasesError) throw clasesError

      // Obtener asistencias de hoy (de las clases del usuario)
      const claseIds = (clasesData || []).map(c => c.id)
      console.log('Clase IDs:', claseIds)
      console.log('Today ISO:', todayISO)

      let asistenciasData: any[] = []
      if (claseIds.length > 0) {
        // Obtener todas las asistencias de hoy y filtrar manualmente
        const { data, error: asistError } = await supabase
          .from('asistencias')
          .select('*')
          .eq('fecha_clase', todayISO)
          .eq('estado', 'confirmado')

        if (asistError) {
          console.error('Error asistencias:', asistError)
          throw asistError
        }

        console.log('Todas las asistencias:', data)

        // Filtrar solo las asistencias de las clases del usuario
        asistenciasData = (data || []).filter(a => claseIds.includes(a.clase_id))
        console.log('Asistencias filtradas:', asistenciasData)
      }

      // Agrupar asistencias por clase
      const asistenciasPorClase: Record<string, Asistencia[]> = {}
      asistenciasData.forEach((a: Asistencia) => {
        if (!asistenciasPorClase[a.clase_id]) {
          asistenciasPorClase[a.clase_id] = []
        }
        asistenciasPorClase[a.clase_id].push(a)
      })

      setClasesHoy(clasesData || [])
      setAsistenciasHoy(asistenciasPorClase)

      // Pre-seleccionar primera clase
      if ((clasesData?.length || 0) > 0 && !selectedClase) {
        setSelectedClase(clasesData![0].id)
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [supabase, selectedClase, todayISO, todayName])

  useEffect(() => {
    fetchData()

    // Suscribirse a cambios en asistencias en tiempo real
    const channel = supabase
      .channel('asistencias-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'asistencias',
          filter: `fecha_clase=eq.${todayISO}`,
        },
        payload => {
          console.log('Asistencia actualizada:', payload)
          fetchData()
        }
      )
      .subscribe()

    // Refrescar cada 10 segundos como respaldo
    const interval = setInterval(fetchData, 10000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [fetchData])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOriginUrl(window.location.origin)
    }
  }, [])

  const generateMessage = (clase: Clase) => {
    const asistencias = asistenciasHoy[clase.id] || []
    const confirmados = asistencias.length
    const cupos = clase.cupos || 20
    const disponibles = cupos - confirmados
    const tipo = clase.tipo === 'zumba' ? 'Zumba' : 'Pilates'

    return `¡Hola! 👋

Te recordamos que mañana ${todayLabel.toLowerCase()} tenés clase de ${tipo}:

📅 ${todayLabel} ${clase.hora} hs
🏋️ ${clase.nombre}
👤 Profesor: ${clase.profesores?.nombre || 'A definir'}

${disponibles > 0 ? `✅ Hay ${disponibles} lugares disponibles` : '⚠️ La clase está completa'}

Para confirmar tu asistencia, entrá acá:
👉 ${originUrl}/asistencia

¡Te esperamos! 🤸‍♀️`
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopiedList(type)
    setTimeout(() => setCopiedList(null), 2000)
  }

  const getPhoneNumbers = (claseId: string) => {
    const asistencias = asistenciasHoy[claseId] || []
    return asistencias
      .filter(a => a.telefono)
      .map(a => `${a.nombre_alumno}: ${a.telefono}`)
      .join('\n')
  }

  const exportToWhatsApp = (claseId: string) => {
    const asistencias = asistenciasHoy[claseId] || []
    const phones = asistencias
      .filter(a => a.telefono)
      .map(a => a.telefono?.replace(/\D/g, ''))
      .join(',')

    if (phones) {
      window.open(`https://web.whatsapp.com/send?phone=${phones}`, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notificaciones</h1>
          <p className="text-gray-600 mt-1">Gestiona las confirmaciones de asistencia del día</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg flex items-center gap-2">
          <Calendar size={20} />
          <span className="font-medium">
            {todayLabel} {today.getDate()}/{today.getMonth() + 1}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {clasesHoy.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="text-6xl mb-4">🌙</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No hay clases hoy</h3>
          <p className="text-gray-600">Descansá y volvé mañana</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de clases */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar size={20} />
              Clases del día
            </h2>

            {clasesHoy.map(clase => {
              const asistencias = asistenciasHoy[clase.id] || []
              const confirmados = asistencias.length
              const cupos = clase.cupos || 20
              const disponibles = cupos - confirmados
              const isFull = disponibles <= 0
              const isSelected = selectedClase === clase.id

              return (
                <div
                  key={clase.id}
                  onClick={() => setSelectedClase(clase.id)}
                  className={`bg-white rounded-xl p-5 cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'shadow hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{clase.tipo === 'zumba' ? '💃' : '🧘'}</span>
                      <div>
                        <h3 className="font-bold text-gray-900">{clase.nombre}</h3>
                        <p className="text-sm text-gray-600">
                          {clase.hora} hs • {clase.profesores?.nombre || 'Sin instructor'}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isFull
                          ? 'bg-red-100 text-red-700'
                          : disponibles <= 3
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {isFull ? 'Completa' : `${disponibles} libres`}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      <span>{confirmados} confirmados</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle size={16} />
                      <span>Cupos: {cupos}</span>
                    </div>
                  </div>

                  {asistencias.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs font-medium text-gray-500 mb-2">Alumnos confirmados:</p>
                      <div className="flex flex-wrap gap-2">
                        {asistencias.slice(0, 5).map((a, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700"
                          >
                            {a.nombre_alumno.split(' ')[0]}
                          </span>
                        ))}
                        {asistencias.length > 5 && (
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-500">
                            +{asistencias.length - 5} más
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Panel de acciones */}
          <div className="space-y-6">
            {selectedClase &&
              (() => {
                const clase = clasesHoy.find(c => c.id === selectedClase)
                if (!clase) return null

                const asistencias = asistenciasHoy[clase.id] || []
                const phones = getPhoneNumbers(clase.id)

                return (
                  <>
                    {/* Mensaje para enviar */}
                    <div className="bg-white rounded-xl shadow p-5">
                      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <MessageSquare size={20} />
                        Mensaje para alumnos
                      </h2>

                      <textarea
                        value={messageTemplate || generateMessage(clase)}
                        onChange={e => setMessageTemplate(e.target.value)}
                        className="w-full h-48 p-4 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Escribí el mensaje..."
                      />

                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() =>
                            copyToClipboard(messageTemplate || generateMessage(clase), 'message')
                          }
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          {copiedList === 'message' ? '✓ Copiado' : 'Copiar mensaje'}
                        </button>
                      </div>
                    </div>

                    {/* Lista de contactos */}
                    <div className="bg-white rounded-xl shadow p-5">
                      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <Phone size={20} />
                        Contactos ({asistencias.filter(a => a.telefono).length})
                      </h2>

                      {asistencias.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                          Todavía no hay confirmaciones
                        </p>
                      ) : (
                        <>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {asistencias.map((a, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div>
                                  <p className="font-medium text-gray-900">{a.nombre_alumno}</p>
                                  {a.telefono && (
                                    <p className="text-sm text-gray-600">{a.telefono}</p>
                                  )}
                                </div>
                                {!a.telefono && (
                                  <span className="text-xs text-gray-400">Sin teléfono</span>
                                )}
                              </div>
                            ))}
                          </div>

                          {phones && (
                            <div className="flex gap-3 mt-4">
                              <button
                                onClick={() => copyToClipboard(phones, 'phones')}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                              >
                                {copiedList === 'phones' ? '✓ Copiado' : 'Copiar números'}
                              </button>
                              <button
                                onClick={() => exportToWhatsApp(clase.id)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                              >
                                <Send size={16} />
                                WhatsApp
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Link para compartir */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                      <h3 className="font-semibold text-gray-900 mb-2">Link de confirmación</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Compartí este link con tus alumnos para que confirmen asistencia
                      </p>
                      <div className="flex gap-2">
                        <code className="flex-1 p-3 bg-white rounded-lg text-sm text-gray-700 overflow-x-auto">
                          {originUrl}/asistencia
                        </code>
                        <button
                          onClick={() => copyToClipboard(`${originUrl}/asistencia`, 'link')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
                        >
                          {copiedList === 'link' ? '✓' : 'Copiar'}
                        </button>
                      </div>
                    </div>
                  </>
                )
              })()}
          </div>
        </div>
      )}
    </div>
  )
}
