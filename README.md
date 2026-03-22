# Go Magic Gym - Sistema de Gestión para Gimnasios

Sistema de gestión para gimnasios desarrollado con Next.js, Supabase y deployable en Vercel.

## Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js Server Actions, API Routes
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Gráficos**: Recharts
- **Deploy**: Vercel

## Requisitos Previos

1. Node.js 18+
2. Cuenta en [Supabase](https://supabase.com)
3. Cuenta en [Vercel](https://vercel.com)

## Instalación Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/taxgab/go-magic-gym.git
cd go-magic-gym
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

### 4. Configurar Supabase

1. Crea un nuevo proyecto en [Supabase](https://supabase.com)
2. Ve a Settings > API y copia la URL y las claves
3. En el SQL Editor de Supabase, ejecuta el schema ubicado en `supabase/schema.sql`
4. Habilita Row Level Security (RLS) en las tablas

### 5. Ejecutar localmente

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Deploy en Vercel

### 1. Preparar el proyecto

```bash
npm run build
```

### 2. Deploy

1. Sube tu código a GitHub
2. Conecta tu repositorio a Vercel
3. Agrega las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## Funcionalidades

- **Alumnos**: Registro completo con datos de contacto y emergencia
- **Profesores**: Gestión con comisión configurable
- **Clases**: Programación semanal con profesor asignado
- **Pagos**: Registro de pagos con métodos múltiples
- **Reportes**: Gráficos de ingresos por mes y método de pago
- **Configuración**: Personalización del gimnasio

## Licencia

MIT
