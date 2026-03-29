# Go Magic Gym - Sistema de Gestión para Gimnasios

Sistema completo de gestión para gimnasios desarrollado con **Next.js 14**, **TypeScript**, **Supabase** y **Tailwind CSS**. Optimizado para producción con testing, caché inteligente y arquitectura limpia.

## 🚀 Demo en Vercel

[https://go-magic-gym.vercel.app](https://go-magic-gym.vercel.app)

## ✨ Características

- **⚡ Alto Rendimiento**: React Query para caché inteligente y optimistic updates
- **🎨 UI Moderna**: Diseño elegante con Tailwind CSS
- **🔒 Seguridad**: Autenticación con Supabase Auth y RLS
- **📊 Dashboard**: Estadísticas en tiempo real con gráficos
- **📱 Responsive**: Funciona en desktop, tablet y móvil
- **🔗 Asistencia Pública**: Página para alumnos sin login

## 🛠️ Stack Tecnológico

| Tecnología   | Versión | Uso                            |
| ------------ | ------- | ------------------------------ |
| Next.js      | 14.1.0  | Framework React con App Router |
| TypeScript   | 5.3.0   | Tipado estático                |
| Tailwind CSS | 3.4.0   | Estilos utilitarios            |
| Supabase     | 2.39.0  | Base de datos y auth           |
| Zod          | 4.x     | Validación de esquemas         |
| Recharts     | 2.10.0  | Gráficos y estadísticas        |
| Lucide React | -       | Iconos                         |

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
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (para API pública)

### 3. Configurar Base de Datos

Ejecuta el schema SQL ubicado en `supabase/schema.sql` en el SQL Editor.

### 4. Habilitar RLS

Asegúrate de que todas las tablas tengan Row Level Security (RLS) habilitado para seguridad multi-tenant.

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Iniciar servidor de producción
npm run lint         # ESLint
```

## 📁 Estructura del Proyecto

```
go-magic-gym/
├── src/
│   ├── api/              # Capa de datos (queries/mutations)
│   ├── app/              # Next.js App Router
│   │   ├── (app)/        # Rutas protegidas con sidebar
│   │   │   ├── dashboard/
│   │   │   ├── alumnos/
│   │   │   ├── profesores/
│   │   │   ├── clases/
│   │   │   ├── pagos/
│   │   │   ├── reportes/
│   │   │   ├── configuracion/
│   │   │   └── notificaciones/
│   │   ├── api/          # API Routes
│   │   │   └── asistencia/  # API pública para confirmaciones
│   │   ├── asistencia/   # Página pública de asistencia
│   │   └── login/        # Autenticación
│   ├── components/       # Componentes React
│   │   ├── forms/        # Formularios
│   │   ├── modals/       # Modales
│   │   └── ui/           # UI base (Button, Input, etc.)
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilidades y clientes Supabase
│   └── types/            # TypeScript types
├── public/               # Assets públicos
└── README.md
```

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
3. Agrega variables de entorno
4. Deploy automático en cada push a `main`

### Variables de Entorno en Vercel

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Requerido para API pública
```

**⚠️ IMPORTANTE**: La variable `SUPABASE_SERVICE_ROLE_KEY` es necesaria para que la página de asistencia pública funcione. Puedes obtenerla desde Supabase Dashboard → Settings → API → service_role key.

## 📊 Funcionalidades

| Módulo                 | Descripción                                  | Estado |
| ---------------------- | -------------------------------------------- | ------ |
| **Alumnos**            | CRUD completo, búsqueda, filtros             | ✅     |
| **Profesores**         | Gestión con comisión configurable            | ✅     |
| **Clases**             | Programación semanal, asignación de profesor | ✅     |
| **Pagos**              | Registro, múltiples métodos                  | ✅     |
| **Dashboard**          | Estadísticas, gráficos                       | ✅     |
| **Reportes**           | Análisis de ingresos                         | ✅     |
| **Configuración**      | Personalización del gimnasio                 | ✅     |
| **Notificaciones**     | Gestión de confirmaciones, WhatsApp          | ✅     |
| **Asistencia Pública** | Confirmación sin login para alumnos          | ✅     |

## 🔗 Página de Asistencia Pública

Los alumnos pueden confirmar su asistencia sin necesidad de login:

- URL: `https://tu-dominio.vercel.app/asistencia`
- Muestra clases del día actual
- Permite confirmar con nombre y teléfono (opcional)
- Guarda confirmaciones en localStorage
- Diseño mobile-first elegante

Para compartir con alumnos, usa el link generado en la página de Notificaciones.

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

### Página de asistencia no funciona

Verifica que `SUPABASE_SERVICE_ROLE_KEY` esté configurada en Vercel.

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

## 📄 Licencia

MIT © [Gabi](https://github.com/taxgab)

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---

¿Preguntas? Abre un [issue](https://github.com/taxgab/go-magic-gym/issues).
