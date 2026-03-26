'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, Users, Calendar, TrendingUp, ArrowRight, Dumbbell } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-50" />
      
      {/* Gradient orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-yellow-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08] bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-[#ff4500]" />
            <span className="font-display text-xl tracking-wider text-white">GO MAGIC GYM</span>
          </div>
          <Link
            href="/login"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            ACCEDER
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#ff4500]/10 border border-[#ff4500]/30 mb-6">
                <Zap className="w-4 h-4 text-[#ff4500]" />
                <span className="text-xs font-mono text-[#ff4500] uppercase tracking-widest">Sistema de Gestión</span>
              </div>
              
              <h1 className="font-display text-6xl md:text-7xl lg:text-8xl leading-[0.9] mb-6">
                <span className="text-white">DOMINA TU</span>
                <br />
                <span className="text-gradient">GIMNASIO</span>
              </h1>
              
              <p className="text-lg text-white/60 max-w-md mb-8 leading-relaxed">
                Control total de alumnos, profesores, clases y pagos. 
                La herramienta que tu gimnasio necesita para escalar.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/login"
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-[#ff4500] text-black font-semibold uppercase tracking-wider hover:bg-[#ff6b35] transition-all duration-300"
                >
                  COMENZAR AHORA
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/login?signup=true"
                  className="inline-flex items-center gap-2 px-8 py-4 border border-white/20 text-white font-medium uppercase tracking-wider hover:border-[#ff4500] hover:text-[#ff4500] transition-all duration-300"
                >
                  CREAR CUENTA
                </Link>
              </div>
            </motion.div>

            {/* Right visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="relative bg-[#141414] border border-white/[0.08] p-8">
                {/* Decorative corner */}
                <div className="absolute -top-px -left-px w-8 h-8 border-t-2 border-l-2 border-[#ff4500]" />
                <div className="absolute -bottom-px -right-px w-8 h-8 border-b-2 border-r-2 border-[#ff4500]" />
                
                {/* Mock dashboard preview */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-xs text-white/40 uppercase tracking-widest">Dashboard Overview</span>
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#ff4500]" />
                      <div className="w-2 h-2 rounded-full bg-white/20" />
                      <div className="w-2 h-2 rounded-full bg-white/20" />
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
                        className="bg-[#1a1a1a] p-4 border border-white/[0.06]"
                      >
                        <stat.icon className={`w-5 h-5 mb-3 ${stat.accent ? 'text-[#ff4500]' : 'text-white/40'}`} />
                        <div className={`font-display text-3xl ${stat.accent ? 'text-[#ff4500]' : 'text-white'}`}>
                          {stat.value}
                        </div>
                        <div className="text-xs text-white/40 font-mono uppercase tracking-wider mt-1">
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
      <section className="py-20 px-6 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-xs font-mono text-[#ff4500] uppercase tracking-[0.2em] mb-4 block">Características</span>
            <h2 className="font-display text-4xl md:text-5xl text-white">TODO LO QUE NECESITAS</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Users, title: 'Gestión de Alumnos', desc: 'Base de datos completa con historial de pagos y asistencia' },
              { icon: Zap, title: 'Control de Profesores', desc: 'Comisiones automáticas y gestión de especialidades' },
              { icon: Calendar, title: 'Administración de Clases', desc: 'Horarios, cupos y asignación de instructores' },
              { icon: TrendingUp, title: 'Reportes en Tiempo Real', desc: 'Estadísticas de ingresos y métricas clave' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group p-6 bg-[#141414] border border-white/[0.06] hover:border-[#ff4500]/30 transition-all duration-300"
              >
                <feature.icon className="w-8 h-8 text-[#ff4500] mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-white/50">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-5xl md:text-6xl text-white mb-6">
              ¿LISTO PARA <span className="text-gradient">ELEVAR</span> TU GIMNASIO?
            </h2>
            <p className="text-white/60 mb-8 max-w-xl mx-auto">
              Únete a cientos de gimnasios que ya gestionan su negocio con Go Magic Gym.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-10 py-5 bg-[#ff4500] text-black font-bold uppercase tracking-wider hover:bg-[#ff6b35] transition-all duration-300 text-lg"
            >
              EMPEZAR GRATIS
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-[#ff4500]" />
            <span className="font-display text-sm tracking-wider text-white/60">GO MAGIC GYM</span>
          </div>
          <p className="text-xs text-white/40 font-mono">
            © 2024 TODOS LOS DERECHOS RESERVADOS
          </p>
        </div>
      </footer>
    </main>
  )
}
