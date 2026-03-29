'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Pago } from '@/types'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { AlertCircle } from 'lucide-react'

const METRICAS = [
  { name: 'Ene', ingresos: 0 },
  { name: 'Feb', ingresos: 0 },
  { name: 'Mar', ingresos: 0 },
  { name: 'Abr', ingresos: 0 },
  { name: 'May', ingresos: 0 },
  { name: 'Jun', ingresos: 0 },
  { name: 'Jul', ingresos: 0 },
  { name: 'Ago', ingresos: 0 },
  { name: 'Sep', ingresos: 0 },
  { name: 'Oct', ingresos: 0 },
  { name: 'Nov', ingresos: 0 },
  { name: 'Dic', ingresos: 0 },
]

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function ReportesPage() {
  const [pagos, setPagos] = useState<Pago[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

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

      const { data, error: supabaseError } = await supabase
        .from('pagos')
        .select('*, alumno:alumnos(nombre)')
        .eq('user_id', user.id)
        .eq('estado', 'pagado')

      if (supabaseError) {
        console.error('Error fetching pagos:', supabaseError)
        setError(`Error al cargar pagos: ${supabaseError.message}`)
        setPagos([])
      } else {
        // Transformar el resultado para que alumno sea un objeto, no un array
        const transformedPagos = (data || []).map((p: any) => ({
          ...p,
          alumno: p.alumno?.[0] || null,
        }))
        setPagos(transformedPagos)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Error inesperado al cargar pagos')
      setPagos([])
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const getMonthlyData = () => {
    const meses = [...METRICAS]
    pagos.forEach(pago => {
      const mes = new Date(pago.fecha_pago).getMonth()
      if (mes >= 0 && mes <= 11) meses[mes].ingresos += pago.monto
    })
    return meses
  }

  const getMetodosData = () => {
    const metodos: Record<string, number> = {}
    pagos.forEach(pago => {
      metodos[pago.metodo] = (metodos[pago.metodo] || 0) + pago.monto
    })
    return Object.entries(metodos).map(([name, value]) => ({ name, value }))
  }

  const totalIngresos = pagos.reduce((sum, p) => sum + p.monto, 0)
  const promedioMensual = totalIngresos / 12

  return (
    <div>
      <h1 className="font-serif text-4xl text-on-surface mb-2">Reportes</h1>
      <p className="text-on-surface-variant mb-8">Estadísticas y métricas del gimnasio</p>

      {error && (
        <div className="mb-6 p-4 bg-tertiary/10 border border-tertiary/20 rounded-2xl flex items-center gap-3 text-tertiary">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-500 py-8">Cargando...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-gray-500 text-sm">Ingresos Totales</p>
              <p className="text-3xl font-bold text-green-600">${totalIngresos.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-gray-500 text-sm">Promedio Mensual</p>
              <p className="text-3xl font-bold text-blue-600">
                ${promedioMensual.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-gray-500 text-sm">Cantidad de Pagos</p>
              <p className="text-3xl font-bold text-purple-600">{pagos.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-4">Ingresos por Mes</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getMonthlyData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Ingresos']}
                    />
                    <Bar dataKey="ingresos" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-4">Ingresos por Método de Pago</h2>
              {getMetodosData().length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getMetodosData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getMetodosData().map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Ingresos']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-16">No hay datos disponibles</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
