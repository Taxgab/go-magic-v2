import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { QueryProvider } from '@/providers/QueryProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Go Magic Gym',
  description: 'Sistema de gestión para gimnasios',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">
        <QueryProvider>{children}</QueryProvider>
        <Analytics />
      </body>
    </html>
  )
}
