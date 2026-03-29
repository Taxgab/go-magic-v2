'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Dumbbell,
  Bell,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/alumnos', icon: Users, label: 'Alumnos' },
  { href: '/profesores', icon: GraduationCap, label: 'Profesores' },
  { href: '/clases', icon: Calendar, label: 'Clases' },
  { href: '/pagos', icon: DollarSign, label: 'Pagos' },
  { href: '/notificaciones', icon: Bell, label: 'Notificaciones' },
  { href: '/reportes', icon: BarChart3, label: 'Reportes' },
  { href: '/configuracion', icon: Settings, label: 'Configuración' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-surface-lowest rounded-2xl shadow-float"
      >
        {sidebarOpen ? (
          <X size={24} className="text-on-surface" />
        ) : (
          <Menu size={24} className="text-on-surface" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-full bg-surface-lowest flex flex-col">
          {/* Logo */}
          <div className="p-8 pb-6">
            <Link
              href="/dashboard"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-serif text-xl text-on-surface">Go Magic</h1>
                <p className="text-xs text-on-surface-variant -mt-0.5">Gym Manager</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-primary' : ''} />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-on-surface-variant hover:bg-surface-low hover:text-on-surface transition-all duration-200"
            >
              <LogOut size={20} />
              <span className="font-medium text-sm">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-on-surface/20 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 p-6 lg:p-10 pt-20 lg:pt-10 w-full min-h-screen">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
