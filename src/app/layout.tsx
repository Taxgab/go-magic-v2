import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Go Magic Gym',
  description: 'Sistema de gestión para gimnasios',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
