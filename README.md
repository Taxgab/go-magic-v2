# Go Magic Gym - Sistema de Gestión para Gimnasios

Sistema completo de gestión para gimnasios desarrollado con **Next.js 14**, **TypeScript**, **Supabase** y **Tailwind CSS**. Optimizado para producción con testing, caché inteligente y arquitectura limpia.

## 🚀 Demo en Vercel

[https://go-magic-gym.vercel.app](https://go-magic-gym.vercel.app) *(reemplazar con tu URL)*

## ✨ Características

- **⚡ Alto Rendimiento**: React Query para caché inteligente y optimistic updates
- **🎨 UI Moderna**: Diseño industrial/brutalista con Tailwind CSS
- **🔒 Seguridad**: Autenticación con Supabase Auth y RLS
- **📊 Dashboard**: Estadísticas en tiempo real con gráficos
- **🧪 Testing**: 65+ tests unitarios con Jest
- **📱 Responsive**: Funciona en desktop, tablet y móvil

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Next.js | 14.1.0 | Framework React con App Router |
| TypeScript | 5.3.0 | Tipado estático |
| Tailwind CSS | 3.4.0 | Estilos utilitarios |
| Supabase | 2.39.0 | Base de datos y auth |
| TanStack Query | 5.x | Caché y estado del servidor |
| Zod | 4.x | Validación de esquemas |
| Jest | 30.x | Testing unitario |
| Recharts | 2.10.0 | Gráficos y estadísticas |

## 📋 Requisitos Previos

- Node.js 18+ (recomendado 20+)
- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Vercel](https://vercel.com) (para deploy)

## 🚀 Instalación Rápida

```bash
# 1. Clonar repositorio
git clone https://github.com/taxgab/go-magic-gym.git
cd go-magic-gym

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# 4. Ejecutar en desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## ⚙️ Configuración de Supabase

### 1. Crear Proyecto
1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Crea nuevo proyecto
3. Espera a que se complete el provisioning

### 2. Obtener Credenciales
1. Ve a **Settings > API**
2. Copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Configurar Base de Datos
Ejecuta el schema SQL ubicado en `supabase/schema.sql` en el SQL Editor.

### 4. Habilitar RLS
Asegúrate de que todas las tablas tengan Row Level Security (RLS) habilitado para seguridad multi-tenant.

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch

# Tests con cobertura
npm run test:coverage

# Tests en CI
npm run test:ci
```

**Estado actual**: ✅ 65 tests pasando

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Iniciar servidor de producción

# Calidad de código
npm run lint         # ESLint
npm run lint:fix     # ESLint + fix
npm run format       # Prettier
npm run format:check # Verificar formato
npm run typecheck    # TypeScript

# Testing
npm test             # Tests unitarios
npm run test:watch   # Watch mode
npm run test:coverage # Con cobertura
```

## 📁 Estructura del Proyecto

```
go-magic-gym/
├── src/
│   ├── api/              # Capa de datos (queries/mutations)
│   │   ├── alumnos/
│   │   └── stats.ts
│   ├── app/              # Next.js App Router
│   │   ├── (app)/        # Rutas protegidas
│   │   └── login/        # Auth
│   ├── components/       # Componentes React
│   │   ├── forms/        # Formularios
│   │   ├── modals/       # Modales
│   │   └── ui/           # UI base (Button, Input, etc.)
│   ├── config/           # Configuración app
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilidades
│   │   ├── validation/   # Validación Zod
│   │   └── errors.ts     # Clases de error
│   ├── providers/        # React providers
│   └── types/            # TypeScript types
├── __tests__/            # Tests
├── .env.example          # Variables de entorno
└── README.md
```

## 🏗️ Arquitectura

### Patrones Implementados

1. **Separation of Concerns**
   - API layer: `src/api/`
   - Hooks: `src/hooks/`
   - Components: `src/components/`

2. **Caché Inteligente**
   - TanStack Query con stale time
   - Optimistic updates
   - Prefetching

3. **Manejo de Errores**
   - Clases de error personalizadas
   - Wrapper DRY para operaciones async
   - Logging estructurado

4. **Validación**
   - Zod para validación de esquemas
   - Validación en tiempo real
   - Mensajes de error amigables

## 🚀 Deploy en Vercel

### Opción 1: Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Opción 2: GitHub Integration

1. Push tu código a GitHub
2. Conecta el repo en [Vercel Dashboard](https://vercel.com/dashboard)
3. Agrega variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy automático en cada push a `main`

### Variables de Entorno en Vercel

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## 🔧 Configuración Avanzada

### Feature Flags (Opcional)

Para migraciones graduales, crea `src/config/features.ts`:

```typescript
export const features = {
  useNewAlumnos: process.env.NEXT_PUBLIC_FF_ALUMNOS === 'true',
}
```

### Monitoreo

Recomendado agregar:
- **Sentry**: Para tracking de errores
- **LogRocket**: Para session replay
- **Vercel Analytics**: Para performance

## 🎨 Personalización

### Tema
Los colores están definidos en `src/app/globals.css`:

```css
:root {
  --energy-orange: #ff4500;
  --toxic-yellow: #ccff00;
  --void-black: #0a0a0a;
  /* ... */
}
```

### Componentes UI
Todos los componentes base están en `src/components/ui/`:
- `Button` - Botones con variantes
- `Input` - Inputs con labels y errores
- `Modal` - Modales accesibles
- `DataTable` - Tablas con paginación

## 📊 Funcionalidades

| Módulo | Descripción | Estado |
|--------|-------------|--------|
| **Alumnos** | CRUD completo, búsqueda, filtros | ✅ |
| **Profesores** | Gestión con comisión configurable | ✅ |
| **Clases** | Programación semanal, asignación | ✅ |
| **Pagos** | Registro, múltiples métodos | ✅ |
| **Dashboard** | Estadísticas, gráficos | ✅ |
| **Reportes** | Análisis de ingresos | ✅ |
| **Configuración** | Personalización del gimnasio | ✅ |

## 🐛 Solución de Problemas

### Error: "Cannot find module '@/...'"
Asegúrate de que `tsconfig.json` tenga el path alias configurado:
```json
"paths": {
  "@/*": ["./src/*"]
}
```

### Error de autenticación en producción
Verifica que las variables de entorno estén configuradas en Vercel y que el dominio esté permitido en Supabase Auth.

### Build falla
```bash
# Limpiar caché
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commitea tus cambios: `git commit -m 'feat: agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

### Convenciones

- **Commits**: Usar conventional commits
  - `feat:` nueva funcionalidad
  - `fix:` corrección de bug
  - `docs:` documentación
  - `refactor:` refactoring
  - `test:` tests

## 📄 Licencia

MIT © [Tu Nombre](https://github.com/taxgab)

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TanStack Query](https://tanstack.com/query)

---

¿Preguntas? Abre un [issue](https://github.com/taxgab/go-magic-gym/issues) o contactame.
