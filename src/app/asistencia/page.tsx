'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users, CheckCircle } from 'lucide-react'

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

type ClasePublica = {
  id: string
  nombre: string
  dia: string
  hora: string
  tipo?: string
  cupos?: number
  estado: string
}

export default function AsistenciaPage() {
  const [clases, setClases] = useState<ClasePublica[]>([])
  const [asistencias, setAsistencias] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedClase, setSelectedClase] = useState<ClasePublica | null>(null)
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null)
  const [confirmedToday, setConfirmedToday] = useState<string[]>([])

  const today = new Date()
  const todayName = DIAS[today.getDay()]
  const todayISO = today.toISOString().split('T')[0]

  useEffect(() => {
    const savedName = localStorage.getItem('userName')
    const savedPhone = localStorage.getItem('userPhone')
    const savedConfirmed = localStorage.getItem(`confirmed_${todayISO}`)
    if (savedName) setNombre(savedName)
    if (savedPhone) setTelefono(savedPhone)
    if (savedConfirmed) setConfirmedToday(JSON.parse(savedConfirmed))
  }, [todayISO])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [clasesRes, asistenciasRes] = await Promise.all([
        fetch(`/api/asistencia?action=clases`),
        fetch(`/api/asistencia?action=asistencias`),
      ])

      const clasesData = await clasesRes.json()
      const asistenciasData = await asistenciasRes.json()

      if (clasesData.error) throw new Error(clasesData.error)
      if (asistenciasData.error) throw new Error(asistenciasData.error)

      setClases(clasesData.clases || [])
      setAsistencias(asistenciasData.asistencias || {})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleConfirm = async () => {
    if (!nombre.trim()) {
      setToast({ message: 'El nombre es requerido', type: 'error' })
      return
    }

    if (!selectedClase) return

    setSubmitting(true)

    try {
      const res = await fetch('/api/asistencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clase_id: selectedClase.id,
          nombre: nombre.trim(),
          telefono: telefono.trim() || null,
        }),
      })

      const data = await res.json()

      if (data.error) {
        setToast({ message: data.error, type: 'error' })
        return
      }

      localStorage.setItem('userName', nombre.trim())
      if (telefono.trim()) localStorage.setItem('userPhone', telefono.trim())

      const newConfirmed = [...confirmedToday, selectedClase.id]
      setConfirmedToday(newConfirmed)
      localStorage.setItem(`confirmed_${todayISO}`, JSON.stringify(newConfirmed))

      setShowModal(false)
      setToast({ message: 'Asistencia confirmada', type: 'success' })
      fetchData()
    } catch (err) {
      setToast({ message: 'Error al confirmar', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf6f0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c4704a] mx-auto mb-4" />
          <p className="text-[#8a7570]">Cargando clases...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf6f0] relative overflow-x-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_0%_0%,rgba(232,196,176,0.35)_0%,transparent_50%),radial-gradient(ellipse_at_100%_100%,rgba(122,158,126,0.25)_0%,transparent_50%)] pointer-events-none" />

      <div className="max-w-md mx-auto px-5 py-6 relative z-10">
        <header className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-[#2c1f1a] text-[#faf6f0] px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase mb-4">
            <span>🤸</span>
            <span>Mi Estudio</span>
          </div>
          <h1 className="font-serif text-2xl text-[#2c1f1a]">
            Clases de <em className="text-[#c4704a]">hoy</em>
          </h1>
          <p className="text-[#8a7570] text-sm mt-1">Confirma tu asistencia</p>
        </header>

        <div className="bg-[#2c1f1a] rounded-2xl p-5 flex justify-between items-center mb-6">
          <div>
            <h2 className="font-serif text-xl text-[#faf6f0]">{todayName}</h2>
            <p className="text-[#e8c4b0] text-sm">{formatDate(today)}</p>
          </div>
          <Calendar className="text-[#faf6f0] w-6 h-6" />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 mb-4">
            {error}
          </div>
        )}

        {clases.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🌙</div>
            <h3 className="font-serif text-xl text-[#2c1f1a] mb-2">No hay clases hoy</h3>
            <p className="text-[#8a7570]">Descansa y volvé mañana</p>
          </div>
        ) : (
          <div className="space-y-4">
            {clases.map(clase => {
              const confirmed = asistencias[clase.id] || 0
              const cupos = clase.cupos || 20
              const disponibles = cupos - confirmed
              const isFull = disponibles <= 0
              const isConfirmed = confirmedToday.includes(clase.id)
              const tipo = clase.tipo || 'pilates'

              return (
                <div
                  key={clase.id}
                  className={`bg-white rounded-xl p-5 shadow-sm border-l-4 ${
                    tipo === 'zumba' ? 'border-[#7a9e7e]' : 'border-[#c4704a]'
                  } ${isConfirmed ? 'bg-[#f4faf5] border-2 border-[#7a9e7e]' : ''}`}
                >
                  {isConfirmed && (
                    <div className="absolute top-3 right-3 bg-[#7a9e7e] text-white px-3 py-1 rounded-full text-xs font-semibold">
                      ✓ Confirmada
                    </div>
                  )}

                  <div className="flex gap-3 mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                        tipo === 'zumba' ? 'bg-[#edf5ee]' : 'bg-[#fdf0ea]'
                      }`}
                    >
                      {tipo === 'zumba' ? '💃' : '🧘'}
                    </div>
                    <div>
                      <h3 className="font-serif text-lg text-[#2c1f1a]">{clase.nombre}</h3>
                      <p className="text-[#8a7570] text-sm">{clase.hora} hs</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <span className="bg-[#faf6f0] text-[#8a7570] px-3 py-1 rounded-full text-xs font-medium">
                      {tipo === 'zumba' ? 'Zumba' : 'Pilates'}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isFull ? 'bg-[#8a7570]/10 text-[#8a7570]' : 'bg-[#c4704a]/10 text-[#c4704a]'
                      }`}
                    >
                      {isFull ? 'Sin cupos' : `${disponibles} lugares`}
                    </span>
                    <span className="bg-[#faf6f0] text-[#8a7570] px-3 py-1 rounded-full text-xs font-medium">
                      {confirmed} confirmados
                    </span>
                  </div>

                  <button
                    disabled={isConfirmed || isFull}
                    onClick={() => {
                      setSelectedClase(clase)
                      setShowModal(true)
                    }}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition ${
                      isConfirmed || isFull
                        ? 'bg-[#faf6f0] text-[#8a7570] border border-[#e0d8d2] cursor-not-allowed'
                        : tipo === 'zumba'
                          ? 'bg-[#7a9e7e] text-white hover:opacity-90'
                          : 'bg-[#c4704a] text-white hover:opacity-90'
                    }`}
                  >
                    {isConfirmed
                      ? 'Ya confirmaste'
                      : isFull
                        ? 'Clase completa'
                        : 'Confirmar asistencia'}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {showModal && (
          <div
            className="fixed inset-0 bg-[#2c1f1a]/50 backdrop-blur-sm flex items-end justify-center z-50"
            onClick={e => {
              if (e.target === e.currentTarget) setShowModal(false)
            }}
          >
            <div className="bg-white w-full max-w-md rounded-t-3xl p-6 animate-slide-up">
              <div className="w-10 h-1 bg-[#e0d8d2] rounded mx-auto mb-6" />

              <h2 className="font-serif text-xl text-[#2c1f1a] mb-2">Confirmar asistencia</h2>
              <p className="text-[#8a7570] text-sm mb-5">
                {selectedClase?.nombre} - {selectedClase?.hora} hs
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#2c1f1a] mb-2">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    className="w-full px-4 py-3 bg-[#faf6f0] border border-[#e0d8d2] rounded-xl text-[#2c1f1a] focus:outline-none focus:border-[#c4704a] focus:bg-white"
                    placeholder="Tu nombre"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#2c1f1a] mb-2">
                    WhatsApp <span className="text-[#8a7570]">(opcional)</span>
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={e => setTelefono(e.target.value)}
                    className="w-full px-4 py-3 bg-[#faf6f0] border border-[#e0d8d2] rounded-xl text-[#2c1f1a] focus:outline-none focus:border-[#c4704a] focus:bg-white"
                    placeholder="11 1234-5678"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl font-semibold text-[#8a7570] hover:bg-[#faf6f0]"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="flex-1 py-3 bg-[#2c1f1a] text-white rounded-xl font-semibold hover:bg-[#c4704a] disabled:opacity-60"
                >
                  {submitting ? 'Confirmando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {toast && (
          <div
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-full text-sm font-medium z-50 ${
              toast.type === 'success' ? 'bg-[#7a9e7e] text-white' : 'bg-red-600 text-white'
            }`}
          >
            {toast.message}
          </div>
        )}
      </div>
    </div>
  )
}
