'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { Dumbbell, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setError('Revisa tu email para confirmar tu cuenta')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] relative overflow-hidden flex items-center justify-center">
      {/* Background effects */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ff4500]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#ff4500]/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-[#ff4500] flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-black" />
            </div>
            <span className="font-display text-2xl tracking-wider text-white">GO MAGIC GYM</span>
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-[#141414] border border-white/[0.08] relative"
        >
          {/* Decorative corners */}
          <div className="absolute -top-px -left-px w-6 h-6 border-t-2 border-l-2 border-[#ff4500]" />
          <div className="absolute -top-px -right-px w-6 h-6 border-t-2 border-r-2 border-[#ff4500]" />
          <div className="absolute -bottom-px -left-px w-6 h-6 border-b-2 border-l-2 border-[#ff4500]" />
          <div className="absolute -bottom-px -right-px w-6 h-6 border-b-2 border-r-2 border-[#ff4500]" />

          <div className="p-8">
            <h1 className="font-display text-3xl text-white text-center mb-2">
              {isSignup ? 'CREAR CUENTA' : 'INICIAR SESIÓN'}
            </h1>
            <p className="text-white/50 text-center text-sm mb-8 font-mono uppercase tracking-wider">
              {isSignup ? 'Regístrate para comenzar' : 'Ingresa tus credenciales'}
            </p>

            {error && (
              <div className="mb-6 p-4 bg-[#ff4500]/10 border border-[#ff4500]/30 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-[#ff4500] flex-shrink-0" />
                <p className="text-sm text-[#ff4500]">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-mono text-white/60 uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/[0.08] text-white placeholder-white/30 focus:outline-none focus:border-[#ff4500] transition-colors"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/60 uppercase tracking-wider mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/[0.08] text-white placeholder-white/30 focus:outline-none focus:border-[#ff4500] transition-colors pr-12"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group w-full py-4 bg-[#ff4500] text-black font-semibold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#ff6b35] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="animate-pulse">PROCESANDO...</span>
                ) : (
                  <>
                    {isSignup ? 'CREAR CUENTA' : 'INGRESAR'}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/[0.08] text-center">
              <p className="text-white/50 text-sm mb-2">
                {isSignup ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
              </p>
              <button
                onClick={() => setIsSignup(!isSignup)}
                className="text-[#ff4500] hover:text-[#ff6b35] text-sm font-medium uppercase tracking-wider transition-colors"
              >
                {isSignup ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 text-center"
        >
          <Link
            href="/"
            className="text-white/40 hover:text-white text-sm transition-colors inline-flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Volver al inicio
          </Link>
        </motion.div>
      </div>
    </main>
  )
}
