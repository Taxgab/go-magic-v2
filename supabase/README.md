# Setup de Supabase

## 1. Crear Proyecto

1. Ir a [supabase.com](https://supabase.com) y crear cuenta
2. Crear nuevo proyecto
3. Esperar a que termine el setup (2-3 minutos)

## 2. Obtener Credenciales

Ir a **Settings > API** y copiar:

- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon/public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 3. Ejecutar Schema

1. Ir a **SQL Editor** en Supabase
2. Crear nueva query
3. Copiar todo el contenido de `schema.sql`
4. Ejecutar (botón **Run**)

## 4. Configurar Auth (opcional)

En **Authentication > Providers**:

- Email: habilitá el proveedor de email
- Configurá redirects si es necesario

## 5. Verificar

Ejecutá esta query para verificar que todo está ok:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Deberías ver:

- alumnos
- clases
- configuracion
- inscripciones
- pagos
- profesores

## Troubleshooting

### Error de permisos

Si hay errores de permisos, ejecutá:

```sql
GRANT all on schema public to postgres, anon, authenticated, service_role;
GRANT all privileges on all tables in schema public to postgres, anon, authenticated, service_role;
GRANT all privileges on all sequences in schema public to postgres, anon, authenticated, service_role;
```

### RLS no funciona

Verificá que RLS esté habilitado:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

Todas las tablas deben tener `rowsecurity = true`.
