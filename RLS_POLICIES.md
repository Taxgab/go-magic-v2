# Supabase RLS Policies

Este archivo contiene las políticas de seguridad a nivel de fila (Row Level Security) necesarias para la aplicación Go Magic Gym.

## Tablas y Políticas

### 1. Tabla: `alumnos`

```sql
-- Habilitar RLS
ALTER TABLE alumnos ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios solo pueden ver sus propios alumnos
CREATE POLICY "Users can view own alumnos" ON alumnos
  FOR SELECT USING (auth.uid() = user_id);

-- Política: Usuarios solo pueden insertar alumnos para ellos mismos
CREATE POLICY "Users can insert own alumnos" ON alumnos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política: Usuarios solo pueden actualizar sus propios alumnos
CREATE POLICY "Users can update own alumnos" ON alumnos
  FOR UPDATE USING (auth.uid() = user_id);

-- Política: Usuarios solo pueden eliminar sus propios alumnos
CREATE POLICY "Users can delete own alumnos" ON alumnos
  FOR DELETE USING (auth.uid() = user_id);
```

### 2. Tabla: `profesores`

```sql
-- Habilitar RLS
ALTER TABLE profesores ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Users can view own profesores" ON profesores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profesores" ON profesores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profesores" ON profesores
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profesores" ON profesores
  FOR DELETE USING (auth.uid() = user_id);
```

### 3. Tabla: `clases`

```sql
-- Habilitar RLS
ALTER TABLE clases ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Users can view own clases" ON clases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clases" ON clases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clases" ON clases
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clases" ON clases
  FOR DELETE USING (auth.uid() = user_id);
```

### 4. Tabla: `pagos`

```sql
-- Habilitar RLS
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Users can view own pagos" ON pagos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pagos" ON pagos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pagos" ON pagos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pagos" ON pagos
  FOR DELETE USING (auth.uid() = user_id);
```

### 5. Tabla: `configuracion`

```sql
-- Habilitar RLS
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Users can view own configuracion" ON configuracion
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own configuracion" ON configuracion
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own configuracion" ON configuracion
  FOR UPDATE USING (auth.uid() = user_id);
```

### 6. Tabla: `inscripciones`

```sql
-- Habilitar RLS
ALTER TABLE inscripciones ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Users can view own inscripciones" ON inscripciones
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inscripciones" ON inscripciones
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inscripciones" ON inscripciones
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own inscripciones" ON inscripciones
  FOR DELETE USING (auth.uid() = user_id);
```

## Instrucciones de Instalación

1. Accede al Dashboard de Supabase
2. Ve a la sección "Database" > "Policies"
3. Para cada tabla:
   - Habilita RLS si no está habilitado
   - Crea las políticas correspondientes ejecutando los comandos SQL anteriores

## Notas Importantes

- **user_id**: Todas las tablas deben tener una columna `user_id` de tipo `uuid` que referencie al usuario autenticado
- **auth.uid()**: Esta función devuelve el ID del usuario actualmente autenticado
- **Las políticas se aplican automáticamente**: Una vez creadas, Supabase filtrará automáticamente los resultados según el usuario autenticado

## Validaciones del Cliente vs RLS

Aunque las RLS policies protegen la base de datos, el código del cliente también:
1. Filtra por `user_id` en las queries (redundante pero explícito)
2. Muestra mensajes de error amigables cuando ocurren errores de Supabase
3. Valida los datos antes de enviarlos al servidor

Esta doble protección (RLS + validación cliente) proporciona la máxima seguridad y mejor experiencia de usuario.
