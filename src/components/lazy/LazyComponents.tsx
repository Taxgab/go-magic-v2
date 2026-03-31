'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Loading component para lazy loaded components
function LoadingModal() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )
}

// Lazy load del modal de alumnos
export const AlumnoModalLazy = dynamic(
  () => import('@/components/modals/AlumnoModal').then(mod => mod.AlumnoModal),
  {
    loading: LoadingModal,
    ssr: false, // No renderizar en servidor
  }
)

// Wrapper con Suspense para el lazy load
export function AlumnoModalWithSuspense(props: any) {
  return (
    <Suspense fallback={<LoadingModal />}>
      <AlumnoModalLazy {...props} />
    </Suspense>
  )
}
