import { createClient } from '@/lib/supabase-server'
import { Users, GraduationCap, Calendar, DollarSign } from 'lucide-react'

async function getStats(userId: string) {
  const supabase = createClient()
  
  const [alumnos, profesores, clases, pagos] = await Promise.all([
    supabase.from('alumnos').select('id', { count: 'exact' }).eq('user_id', userId).eq('estado', 'activo'),
    supabase.from('profesores').select('id', { count: 'exact' }).eq('user_id', userId).eq('estado', 'activo'),
    supabase.from('clases').select('id', { count: 'exact' }).eq('user_id', userId).eq('estado', 'activa'),
    supabase.from('pagos').select('monto').eq('user_id', userId).eq('estado', 'pagado'),
  ])

  const totalIngresos = pagos.data?.reduce((sum, p) => sum + (p.monto || 0), 0) || 0

  return {
    alumnos: alumnos.count || 0,
    profesores: profesores.count || 0,
    clases: clases.count || 0,
    ingresos: totalIngresos,
  }
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const stats = await getStats(user.id)

  const cards = [
    { label: 'Alumnos Activos', value: stats.alumnos, icon: Users, color: 'bg-blue-500' },
    { label: 'Profesores', value: stats.profesores, icon: GraduationCap, color: 'bg-green-500' },
    { label: 'Clases', value: stats.clases, icon: Calendar, color: 'bg-purple-500' },
    { label: 'Ingresos Totales', value: `$${stats.ingresos.toLocaleString()}`, icon: DollarSign, color: 'bg-orange-500' },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
