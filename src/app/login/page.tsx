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
    <main className="min-h-screen bg-surface relative overflow-hidden flex items-center justify-center">
      {/* Background effects */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2331332f' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-tertiary/5 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/3" />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <span className="font-serif text-2xl tracking-tight text-on-surface">Go Magic Gym</span>
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-surface-lowest rounded-3xl shadow-ambient relative"
        >
          {/* Decorative corners */}
          <div className="absolute -top-px -left-px w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-3xl" />
          <div className="absolute -top-px -right-px w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-3xl" />
          <div className="absolute -bottom-px -left-px w-8 h-8 border-b-4 border-l-4 border-tertiary rounded-bl-3xl" />
          <div className="absolute -bottom-px -right-px w-8 h-8 border-b-4 border-r-4 border-tertiary rounded-br-3xl" />

          <div className="p-8">
            <h1 className="font-serif text-3xl text-on-surface text-center mb-2">
              {isSignup ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </h1>
            <p className="text-on-surface-variant text-center text-sm mb-8">
              {isSignup ? 'Regístrate para comenzar' : 'Ingresa tus credenciales'}
            </p>

            {error && (
              <div className="mb-6 p-4 bg-tertiary/10 border border-tertiary/20 rounded-2xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-tertiary flex-shrink-0" />
                <p className="text-sm text-tertiary">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div>
                <label className="label">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input-field pr-12"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="animate-pulse">Procesando...</span>
                ) : (
                  <>
                    {isSignup ? 'Crear Cuenta' : 'Ingresar'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-surface-high text-center">
              <p className="text-on-surface-variant text-sm mb-2">
                {isSignup ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
              </p>
              <button
                onClick={() => setIsSignup(!isSignup)}
                className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
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
            className="text-on-surface-variant hover:text-on-surface text-sm transition-colors inline-flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Volver al inicio
          </Link>
        </motion.div>
      </div>
    </main>
  )
}
