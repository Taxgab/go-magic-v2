# AGENTS.md - Go Magic Gym

This file contains guidelines for AI agents working in this repository.

## Build & Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS 3.4
- **Auth & DB**: Supabase (SSR client)
- **UI Icons**: Lucide React
- **Charts**: Recharts

## Code Style Guidelines

### Imports (Ordered)
1. React/Next imports
2. Third-party libraries (lucide-react, recharts)
3. Absolute imports (@/lib, @/types)
4. Relative imports

```typescript
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { Alumno } from '@/types'
```

### Naming Conventions
- **Components**: PascalCase (`AlumnoModal`, `DashboardPage`)
- **Functions**: camelCase (`fetchAlumnos`, `handleSubmit`)
- **Types/Interfaces**: PascalCase (`Alumno`, `Configuracion`)
- **Files**: kebab-case for utils, PascalCase for components
- **Constants**: UPPER_SNAKE_CASE for true constants

### TypeScript
- Use strict types - avoid `any`
- Prefer `type` over `interface` for data models
- Use explicit return types on exported functions
- Leverage path aliases (`@/*` maps to `./src/*`)

### Component Structure
- Use `'use client'` for client components
- Server components by default for data fetching
- Co-locate modals within page files

```typescript
'use client'

import { useState } from 'react'

export default function PageName() {
  // hooks first
  const [data, setData] = useState()
  
  // handlers
  const handleAction = () => {}
  
  // render
  return <div>...</div>
}
```

### Error Handling
Always handle Supabase errors with try-catch and proper user feedback:

```typescript
const [error, setError] = useState<string | null>(null)

const fetchData = async () => {
  try {
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('No hay usuario autenticado')
      return
    }

    const { data, error: supabaseError } = await supabase
      .from('table')
      .select()
      .eq('user_id', user.id)
    
    if (supabaseError) {
      console.error('Error:', supabaseError)
      setError(`Error al cargar: ${supabaseError.message}`)
      return
    }
    
    setData(data || [])
  } catch (err) {
    console.error('Unexpected error:', err)
    setError('Error inesperado')
  }
}
```

### Form Validation
Validate forms before submission with specific error messages:

```typescript
import { FormErrors } from '@/types'

const validateForm = (form: FormType): FormErrors => {
  const errors: FormErrors = {}
  
  if (!form.nombre?.trim()) {
    errors.nombre = 'El nombre es requerido'
  }
  
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Email inválido'
  }
  
  return errors
}

// En el submit:
const errors = validateForm(form)
if (Object.keys(errors).length > 0) {
  setFormErrors(errors)
  return
}
```

### Tailwind Classes
- Use consistent spacing (multiples of 4)
- Group related classes
- Use custom colors from theme (`primary-600`)
- Standard patterns: `bg-white rounded-xl shadow p-6`

### Form Patterns
- Use controlled inputs
- Validate on submit
- Show loading state on buttons
- Clear errors on new actions

```typescript
const [form, setForm] = useState({ name: '' })
const [loading, setLoading] = useState(false)

<button disabled={loading}>
  {loading ? 'Guardando...' : 'Guardar'}
</button>
```

### Database Patterns
- Filter by `user_id` in queries
- Use `order()` for consistent sorting
- Handle optional relations with `?`

## Project Structure

```
src/
  app/
    (app)/           # Protected routes with sidebar
      dashboard/
      alumnos/
      profesores/
      clases/
      pagos/
      reportes/
      configuracion/
    login/           # Auth page
    page.tsx         # Landing
    layout.tsx       # Root layout
  lib/
    supabase-client.ts   # Browser client
    supabase-server.ts   # Server client
    middleware.ts        # Auth middleware
  types/
    index.ts         # TypeScript types
  middleware.ts      # Next.js middleware
```

## Key Types

```typescript
// From src/types/index.ts
Alumno, Profesor, Clase, Pago, Configuracion
```

## Auth Flow
- Middleware (`src/middleware.ts`) protects routes
- Supabase SSR handles session cookies
- Client components use `createClient()` from `@/lib/supabase-client`
- Server components use `createClient()` from `@/lib/supabase-server`

## Testing

No test framework configured. To add tests:
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
