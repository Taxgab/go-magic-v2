import { createClient } from '@/lib/supabase-server'
import { Users, GraduationCap, Calendar, DollarSign } from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import { fetchDashboardStats } from '@/api/stats'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

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
      color: 'primary' as const,
    },
    {
      label: 'Profesores',
      value: stats.profesores,
      icon: GraduationCap,
      color: 'secondary' as const,
    },
    {
      label: 'Clases',
      value: stats.clases,
      icon: Calendar,
      color: 'primary' as const,
    },
    {
      label: 'Ingresos Totales',
      value: `$${stats.ingresos.toLocaleString()}`,
      icon: DollarSign,
      color: 'tertiary' as const,
    },
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="font-serif text-4xl text-on-surface">Dashboard</h1>
        <p className="text-on-surface-variant mt-2">Bienvenido a Go Magic Gym</p>
      </div>

      {result.error && (
        <div className="mb-6 p-4 bg-tertiary/10 border border-tertiary/20 rounded-2xl text-tertiary">
          {result.error.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map(card => (
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
