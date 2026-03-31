# AGENTS.md - Go Magic Gym

Guidelines for AI agents working in this repository.

## Build & Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run typecheck

# Lint & Format
npm run lint          # Check lint errors
npm run lint:fix      # Fix lint errors
npm run format        # Format with Prettier
npm run format:check  # Check formatting
```

## Testing Commands

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run CI tests (optimized)
npm run test:ci

# Run a single test file
npm run test -- path/to/test.file.ts

# Run tests matching a pattern
npm run test -- --testNamePattern="describeName"
```

## Tech Stack

| Technology   | Version | Purpose                    |
| ------------ | ------- | -------------------------- |
| Next.js      | 14.x    | Framework (App Router)     |
| TypeScript   | 5.3     | Strict mode enabled        |
| Tailwind CSS | 3.4     | Styling                    |
| Supabase     | 2.39    | Database, Auth, SSR client |
| React Query  | 5.x     | Server state, caching      |
| Zod          | 4.x     | Schema validation          |
| Recharts     | 2.10    | Charts                     |
| Jest         | 30.x    | Testing                    |
| Lucide       | -       | Icons                      |

## Code Style

### Formatting (Prettier)

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "avoid"
}
```

### Imports (Ordered)

1. React/Next imports
2. Third-party libraries (zod, lucide-react, recharts)
3. Absolute imports (@/lib, @/types, @/api, @/hooks)
4. Relative imports

```typescript
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { Plus, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { Alumno, AlumnoInsert } from '@/types'
import { fetchAlumnos } from '@/api/alumnos/queries'
import { validateAlumno } from '@/lib/validation/alumno'
```

### Naming Conventions

| Type         | Convention       | Example                        |
| ------------ | ---------------- | ------------------------------ |
| Components   | PascalCase       | `AlumnoModal`, `Button`        |
| Functions    | camelCase        | `fetchAlumnos`, `handleSubmit` |
| Types        | PascalCase       | `Alumno`, `AlumnoInsert`       |
| Files (util) | kebab-case       | `api-wrapper.ts`               |
| Files (comp) | PascalCase       | `Button.tsx`                   |
| Hooks        | use + PascalCase | `useAlumnos`, `useStats`       |

### TypeScript

- Use `type` over `interface` for data models
- Use `interface` for component props
- Avoid `any` - use unknown with validation
- Explicit return types on exported functions
- Path alias: `@/*` → `./src/*`

```typescript
// Data model - use type
export type Alumno = {
  id: string
  user_id: string
  nombre: string
  estado: AlumnoEstado
}

// Component props - use interface
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  loading?: boolean
}
```

### Component Structure

```typescript
'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'

export default function PageName() {
  // 1. Hooks first
  const [data, setData] = useState()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  // 2. Callbacks/handlers
  const handleAction = useCallback(async () => {
    setLoading(true)
    // ...
    setLoading(false)
  }, [deps])

  // 3. Render
  return <div>...</div>
}
```

### Validation Pattern (Zod)

All form validation uses Zod schemas in `src/lib/validation/`:

```typescript
import { z } from 'zod'

export const alumnoSchema = z.object({
  nombre: z
    .string()
    .min(2)
    .max(100)
    .transform(v => v.trim()),
  dni: z
    .string()
    .regex(/^\d{7,8}$/)
    .optional()
    .nullable(),
  estado: z.enum(['activo', 'inactivo']).default('activo'),
})

export type AlumnoFormData = z.infer<typeof alumnoSchema>

// Validation function
export function validateAlumno(data: unknown) {
  const result = alumnoSchema.safeParse(data)
  if (result.success) return { success: true, data: result.data }
  const errors: Record<string, string> = {}
  result.error.issues.forEach(issue => {
    errors[issue.path[0] as string] = issue.message
  })
  return { success: false, errors }
}
```

### API Layer Pattern

API operations split into `queries.ts` (read) and `mutations.ts` (write):

```typescript
// src/api/alumnos/queries.ts
export async function fetchAlumnos(
  params: FetchAlumnosParams
): Promise<ApiResult<FetchAlumnosResult>> {
  const supabase = createClient()
  return withDatabaseErrorHandling(
    async () => {
      const { data, error, count } = await supabase
        .from('alumnos')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('nombre')
      if (error) throw error
      return { alumnos: data, total: count }
    },
    'fetchAlumnos',
    userId
  )
}

// src/api/alumnos/mutations.ts
export async function createAlumno(userId: string, data: AlumnoInsert): Promise<ApiResult<Alumno>> {
  return withDatabaseErrorHandling(
    async () => {
      const { data: result, error } = await supabase
        .from('alumnos')
        .insert({ ...data, user_id: userId })
        .select()
        .single()
      if (error) throw error
      return result
    },
    'createAlumno',
    userId
  )
}
```

### Error Handling (ApiResult Pattern)

Always use `ApiResult<T>` pattern - never throw to caller:

```typescript
import { ApiResult, handleApiError } from '@/lib/api-wrapper'

// In API functions
return { data, error: null, isSuccess: true }
return { data: null, error: appError, isSuccess: false }

// In hooks/components
const result = await fetchAlumnos({ userId })
if (result.error) {
  handleApiError(result.error, setError)
  return
}
setAlumnos(result.data.alumnos)
```

### Supabase Query Patterns

```typescript
// Always filter by user_id
.from('alumnos')
.select('*')
.eq('user_id', userId)

// Order for consistency
.order('nombre')

// Use count for pagination
.select('*', { count: 'exact' })

// Relations with select
.select('*, inscripciones(clase_id, clase:clases(nombre))')

// Single record
.select()
.single()
```

### Hook Pattern (Custom Hooks)

Hooks encapsulate state + actions + error handling:

```typescript
export interface UseAlumnosReturn {
  alumnos: Alumno[]
  loading: boolean
  error: string | null
  formErrors: Record<string, string>
  refresh: () => Promise<void>
  create: (data: AlumnoFormData) => Promise<boolean>
  update: (id: string, data: Partial<AlumnoFormData>) => Promise<boolean>
  remove: (id: string) => Promise<boolean>
}

export function useAlumnos(options?: UseAlumnosOptions): UseAlumnosReturn {
  // State
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [loading, setLoading] = useState(false)

  // Actions with validation + error handling
  const create = useCallback(
    async data => {
      const validation = validateAlumno(data)
      if (!validation.success) {
        setFormErrors(validation.errors)
        return false
      }
      // ... API call
      return true
    },
    [deps]
  )

  // Auto-load on mount
  useEffect(() => {
    refresh()
  }, [refresh])

  return { alumnos, loading, error, formErrors, refresh, create, update, remove }
}
```

## Testing Patterns

### Test File Location

Tests in `__tests__/` mirroring source structure:

```
__tests__/lib/api-wrapper.test.ts    → src/lib/api-wrapper.ts
__tests__/lib/validation/alumno.test.ts → src/lib/validation/alumno.ts
```

### Test Structure

```typescript
import { withErrorHandling, ApiResult } from '@/lib/api-wrapper'
import { AppError } from '@/lib/errors'

describe('withErrorHandling', () => {
  it('debe retornar éxito cuando la operación funciona', async () => {
    const operation = jest.fn().mockResolvedValue({ id: 1 })
    const result = await withErrorHandling(operation, 'test')
    expect(result.isSuccess).toBe(true)
    expect(result.data).toEqual({ id: 1 })
  })

  it('debe retornar error cuando la operación falla', async () => {
    const operation = jest.fn().mockRejectedValue(new Error('Test error'))
    const result = await withErrorHandling(operation, 'test')
    expect(result.isSuccess).toBe(false)
    expect(result.error).toBeInstanceOf(AppError)
  })
})
```

### Mocking Supabase

Use mocks from `__tests__/mocks/supabase.ts`:

```typescript
import { createMockSupabaseClient, mockSupabaseError } from '__tests__/mocks/supabase'

jest.mock('@/lib/supabase-client', () => ({
  createClient: jest.fn(() => createMockSupabaseClient()),
}))
```

## Project Structure

```
src/
  api/              # Data layer (queries/mutations per entity)
    alumnos/
      queries.ts
      mutations.ts
      types.ts
    inscripciones/
    stats.ts
  app/
    (app)/          # Protected routes (authenticated)
      dashboard/
      alumnos/
      profesores/
      clases/
      pagos/
      reportes/
      configuracion/
      notificaciones/
    api/            # API routes (public)
      asistencia/
        route.ts
    asistencia/     # Public page (no auth)
    login/
    layout.tsx
    globals.css
  components/
    ui/             # Base components (Button, Input, Modal)
    forms/          # Form components
    modals/         # Modal components
    lazy/           # Lazy-loaded components
  hooks/            # Custom hooks (useAlumnos, useStats)
  lib/
    supabase-client.ts   # Browser client
    supabase-server.ts   # Server client
    api-wrapper.ts       # Error handling wrapper
    errors.ts            # Error classes
    validation/          # Zod schemas
    logger.ts            # Structured logging
  types/            # TypeScript types
  providers/        # React Query provider
  middleware.ts     # Auth middleware
```

## Environment Variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # For public API routes
```

## Key Types

```typescript
// Entities
type Alumno = { id, user_id, nombre, estado, ... }
type Profesor = { id, user_id, nombre, porcentaje_comision, ... }
type Clase = { id, user_id, nombre, dia, hora, profesor_id, ... }
type Pago = { id, user_id, alumno_id, monto, metodo, estado, ... }
type Configuracion = { id, user_id, cuota_social, moneda, ... }
type Asistencia = { id, clase_id, alumno_id, nombre_alumno, estado, ... }

// Insert/Update (omit auto fields)
type AlumnoInsert = Omit<Alumno, 'id' | 'created_at' | 'updated_at' | 'user_id'>
type AlumnoUpdate = Partial<AlumnoInsert>

// Enums
type AlumnoEstado = 'activo' | 'inactivo'
type PagoEstado = 'pagado' | 'pendiente'
type MetodoPago = 'efectivo' | 'transferencia' | 'mercadopago' | 'tarjeta'
```

## Auth Flow

- Middleware protects routes in `src/middleware.ts`
- Server components use `createClient()` from `@/lib/supabase-server`
- Client components use `createClient()` from `@/lib/supabase-client`
- Always check `user` before database operations:

```typescript
const {
  data: { user },
} = await supabase.auth.getUser()
if (!user) {
  setError('No hay usuario autenticado')
  return
}
```

## Git Conventions

- Remote: `origin` → `https://github.com/Taxgab/go-magic-v2.git`
- Commits: conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`)
- Never push directly to main - use branches + PRs
