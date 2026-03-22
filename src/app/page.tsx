import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-2xl px-6">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Go Magic Gym
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Sistema de gestión para gimnasios. Controla alumnos, profesores,
          clases y pagos en un solo lugar.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/login?signup=true"
            className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg font-medium hover:bg-blue-50 transition"
          >
            Crear Cuenta
          </Link>
        </div>
      </div>
    </main>
  )
}
