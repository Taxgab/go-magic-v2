import { LucideIcon } from 'lucide-react'
import { clsx } from 'clsx'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color: 'primary' | 'secondary' | 'tertiary'
}

export function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    tertiary: 'bg-tertiary/10 text-tertiary',
  }

  return (
    <div className="card card-hover">
      <div className="flex items-start gap-4">
        <div className={clsx('stat-icon', colorClasses[color])}>
          <Icon size={24} />
        </div>
        <div>
          <p className="stat-value">{value}</p>
          <p className="stat-label">{label}</p>
        </div>
      </div>
    </div>
  )
}
