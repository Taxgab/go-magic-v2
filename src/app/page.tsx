'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, Users, Calendar, TrendingUp, ArrowRight, Dumbbell } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-surface relative overflow-hidden">
      {/* Subtle background texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2331332f' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Decorative orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-tertiary/5 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/3" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-outlineVariant/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif text-xl tracking-tight text-on-surface">Go Magic Gym</span>
          </div>
          <Link
            href="/login"
            className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
          >
            ACCEDER
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-8">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                  Sistema de Gestión
                </span>
              </div>

              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[0.95] mb-8 text-on-surface">
                Domina tu
                <br />
                <span className="text-gradient-editorial">Gimnasio</span>
              </h1>

              <p className="text-lg text-on-surface-variant max-w-md mb-10 leading-relaxed">
                Control total de alumnos, profesores, clases y pagos. La herramienta que tu gimnasio
                necesita para escalar.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/login"
                  className="btn-primary inline-flex items-center gap-2 px-8 py-4"
                >
                  COMENZAR AHORA
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login?signup=true"
                  className="btn-secondary inline-flex items-center gap-2 px-8 py-4"
                >
                  CREAR CUENTA
                </Link>
              </div>
            </motion.div>

            {/* Right visual - Editorial card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="relative bg-surface-lowest rounded-3xl p-8 lg:p-10 shadow-ambient">
                {/* Decorative corner */}
                <div className="absolute -top-px -left-px w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-3xl" />
                <div className="absolute -bottom-px -right-px w-12 h-12 border-b-4 border-r-4 border-tertiary rounded-br-3xl" />

                {/* Mock dashboard preview */}
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
                      Dashboard Overview
                    </span>
                    <div className="flex gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      <div className="w-2.5 h-2.5 rounded-full bg-surface-high" />
                      <div className="w-2.5 h-2.5 rounded-full bg-surface-high" />
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Alumnos Activos', value: '248', icon: Users },
                      { label: 'Clases Hoy', value: '12', icon: Calendar },
                      { label: 'Ingresos Mes', value: '$45.2K', icon: TrendingUp, accent: true },
                      { label: 'Profesores', value: '8', icon: Zap },
                    ].map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                        className="bg-surface-low p-5 rounded-2xl"
                      >
                        <stat.icon
                          className={`w-5 h-5 mb-3 ${stat.accent ? 'text-tertiary' : 'text-on-surface-variant'}`}
                        />
                        <div
                          className={`font-serif text-3xl ${stat.accent ? 'text-tertiary' : 'text-on-surface'}`}
                        >
                          {stat.value}
                        </div>
                        <div className="text-xs text-on-surface-variant font-medium uppercase tracking-wider mt-1">
                          {stat.label}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 lg:py-32 px-6 bg-surface-low">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold text-primary uppercase tracking-[0.2em] mb-4 block">
              Características
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-on-surface">
              Todo lo que necesitas
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                icon: Users,
                title: 'Gestión de Alumnos',
                desc: 'Base de datos completa con historial de pagos y asistencia',
              },
              {
                icon: Zap,
                title: 'Control de Profesores',
                desc: 'Comisiones automáticas y gestión de especialidades',
              },
              {
                icon: Calendar,
                title: 'Administración de Clases',
                desc: 'Horarios, cupos y asignación de instructores',
              },
              {
                icon: TrendingUp,
                title: 'Reportes en Tiempo Real',
                desc: 'Estadísticas de ingresos y métricas clave',
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group p-8 bg-surface-lowest rounded-3xl hover:shadow-float transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-serif text-xl text-on-surface mb-2">{feature.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-on-surface mb-8">
              ¿Listo para <span className="text-gradient-editorial">elevar</span> tu gimnasio?
            </h2>
            <p className="text-on-surface-variant mb-10 max-w-xl mx-auto leading-relaxed">
              Únete a cientos de gimnasios que ya gestionan su negocio con Go Magic Gym.
            </p>
            <Link
              href="/login"
              className="btn-primary inline-flex items-center gap-2 px-10 py-5 text-lg"
            >
              EMPEZAR AHORA
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-surface-high">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif text-sm text-on-surface-variant">Go Magic Gym</span>
          </div>
          <p className="text-xs text-on-surface-variant">© 2024 Todos los derechos reservados</p>
        </div>
      </footer>
    </main>
  )
}
