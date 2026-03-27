import { createClient } from '@/lib/supabase-server'
import { Users, GraduationCap, Calendar, DollarSign } from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import { fetchDashboardStats } from '@/api/stats'

/**
 * Dashboard refactorizado
 * Usa API centralizada y componente StatCard reutilizable
 * Más limpio y mantenible
 */
export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const result = await fetchDashboardStats(user.id)

  const stats = result.data || {
    alumnos: 0,
    profesores: 0,
    clases: 0,
    ingresos: 0,
  }

  const cards = [
    {
      label: 'Alumnos Activos',
      value: stats.alumnos,
      icon: Users,
      color: 'blue' as const,
    },
    {
      label: 'Profesores',
      value: stats.profesores,
      icon: GraduationCap,
      color: 'green' as const,
    },
    {
      label: 'Clases',
      value: stats.clases,
      icon: Calendar,
      color: 'purple' as const,
    },
    {
      label: 'Ingresos Totales',
      value: `$${stats.ingresos.toLocaleString()}`,
      icon: DollarSign,
      color: 'orange' as const,
    },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {result.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {result.error.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
            color={card.color}
          />
        ))}
      </div>
    </div>
  )
}
