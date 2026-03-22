-- Go Magic Gym - Supabase Schema (Optimizado con Best Practices)
-- https://github.com/supabase/agent-skills

-- ============================================
-- EXTENSIONES
-- ============================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================
-- TIPOS ENUM
-- ============================================

create type estado_alumno as enum ('activo', 'inactivo');
create type estado_profesor as enum ('activo', 'inactivo');
create type estado_clase as enum ('activa', 'cancelada');
create type estado_pago as enum ('pagado', 'pendiente');
create type metodo_pago as enum ('efectivo', 'transferencia', 'mercadopago', 'tarjeta');

-- ============================================
-- TABLA: alumnos
-- ============================================

create table alumnos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  nombre text not null,
  dni text,
  telefono text,
  email text,
  direccion text,
  contacto_emergencia text,
  medico text,
  fecha_alta timestamptz default now() not null,
  estado estado_alumno default 'activo' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Índices para queries frecuentes
create index alumnos_user_id_idx on alumnos (user_id);
create index alumnos_user_id_estado_idx on alumnos (user_id, estado);
create index alumnos_nombre_idx on alumnos using gin (to_tsvector('spanish', nombre));

-- ============================================
-- TABLA: profesores
-- ============================================

create table profesores (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  nombre text not null,
  especialidad text,
  porcentaje_comision numeric(5,2) default 0 not null,
  cbu text,
  telefono text,
  email text,
  fecha_alta timestamptz default now() not null,
  estado estado_profesor default 'activo' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  constraint profesores_comision_check check (porcentaje_comision >= 0 and porcentaje_comision <= 100)
);

-- Índices
create index profesores_user_id_idx on profesores (user_id);
create index profesores_user_id_estado_idx on profesores (user_id, estado);

-- ============================================
-- TABLA: clases
-- ============================================

create table clases (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  nombre text not null,
  dia text not null,
  hora text not null,
  profesor_id uuid references profesores(id) on delete set null,
  precio numeric(10,2) default 0 not null,
  cupos integer default 20,
  estado estado_clase default 'activa' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  constraint clases_precio_check check (precio >= 0),
  constraint clases_cupos_check check (cupos > 0)
);

-- Índices
create index clases_user_id_idx on clases (user_id);
create index clases_profesor_id_idx on clases (profesor_id);
create index clases_user_id_estado_idx on clases (user_id, estado);
create index clases_dia_hora_idx on clases (user_id, dia, hora);

-- ============================================
-- TABLA: inscripciones
-- ============================================

create table inscripciones (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  clase_id uuid references clases(id) on delete cascade not null,
  alumno_id uuid references alumnos(id) on delete cascade not null,
  fecha_inscripcion timestamptz default now() not null,
  
  constraint inscripciones_unique unique (clase_id, alumno_id)
);

-- Índices
create index inscripciones_user_id_idx on inscripciones (user_id);
create index inscripciones_clase_id_idx on inscripciones (clase_id);
create index inscripciones_alumno_id_idx on inscripciones (alumno_id);

-- ============================================
-- TABLA: pagos
-- ============================================

create table pagos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  alumno_id uuid references alumnos(id) on delete cascade not null,
  concepto text not null,
  monto numeric(10,2) not null,
  metodo metodo_pago default 'efectivo' not null,
  fecha_pago date default current_date not null,
  estado estado_pago default 'pagado' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  constraint pagos_monto_check check (monto > 0)
);

-- Índices para reportes y queries frecuentes
create index pagos_user_id_idx on pagos (user_id);
create index pagos_alumno_id_idx on pagos (alumno_id);
create index pagos_user_id_estado_idx on pagos (user_id, estado);
create index pagos_user_id_fecha_pago_idx on pagos (user_id, fecha_pago);
create index pagos_metodo_idx on pagos (metodo);

-- ============================================
-- TABLA: configuracion
-- ============================================

create table configuracion (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  cuota_social numeric(10,2) default 0 not null,
  moneda text default 'ARS' not null,
  nombre_gym text default 'Mi Gimnasio' not null,
  updated_at timestamptz default now() not null,
  
  constraint configuracion_moneda_check check (moneda in ('ARS', 'USD', 'EUR'))
);

-- Índice
create index configuracion_user_id_idx on configuracion (user_id);

-- ============================================
-- FUNCIONES AUXILIARES
-- ============================================

-- Función para actualizar updated_at automáticamente
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger para updated_at en todas las tablas
create trigger update_alumnos_updated_at
  before update on alumnos
  for each row execute function update_updated_at_column();

create trigger update_profesores_updated_at
  before update on profesores
  for each row execute function update_updated_at_column();

create trigger update_clases_updated_at
  before update on clases
  for each row execute function update_updated_at_column();

create trigger update_pagos_updated_at
  before update on pagos
  for each row execute function update_updated_at_column();

create trigger update_configuracion_updated_at
  before update on configuracion
  for each row execute function update_updated_at_column();

-- Función para inicializar configuración de usuario
create or replace function init_user_config()
returns trigger as $$
begin
  insert into configuracion (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function init_user_config();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

alter table alumnos enable row level security;
alter table profesores enable row level security;
alter table clases enable row level security;
alter table inscripciones enable row level security;
alter table pagos enable row level security;
alter table configuracion enable row level security;

-- Policies optimizadas: usar SELECT para cachear auth.uid()
create policy "alumnos_select" on alumnos
  for select using ((select auth.uid()) = user_id);

create policy "alumnos_insert" on alumnos
  for insert with check ((select auth.uid()) = user_id);

create policy "alumnos_update" on alumnos
  for update using ((select auth.uid()) = user_id);

create policy "alumnos_delete" on alumnos
  for delete using ((select auth.uid()) = user_id);

create policy "profesores_select" on profesores
  for select using ((select auth.uid()) = user_id);

create policy "profesores_insert" on profesores
  for insert with check ((select auth.uid()) = user_id);

create policy "profesores_update" on profesores
  for update using ((select auth.uid()) = user_id);

create policy "profesores_delete" on profesores
  for delete using ((select auth.uid()) = user_id);

create policy "clases_select" on clases
  for select using ((select auth.uid()) = user_id);

create policy "clases_insert" on clases
  for insert with check ((select auth.uid()) = user_id);

create policy "clases_update" on clases
  for update using ((select auth.uid()) = user_id);

create policy "clases_delete" on clases
  for delete using ((select auth.uid()) = user_id);

create policy "inscripciones_select" on inscripciones
  for select using ((select auth.uid()) = user_id);

create policy "inscripciones_insert" on inscripciones
  for insert with check ((select auth.uid()) = user_id);

create policy "inscripciones_delete" on inscripciones
  for delete using ((select auth.uid()) = user_id);

create policy "pagos_select" on pagos
  for select using ((select auth.uid()) = user_id);

create policy "pagos_insert" on pagos
  for insert with check ((select auth.uid()) = user_id);

create policy "pagos_update" on pagos
  for update using ((select auth.uid()) = user_id);

create policy "pagos_delete" on pagos
  for delete using ((select auth.uid()) = user_id);

create policy "configuracion_select" on configuracion
  for select using ((select auth.uid()) = user_id);

create policy "configuracion_insert" on configuracion
  for insert with check ((select auth.uid()) = user_id);

create policy "configuracion_update" on configuracion
  for update using ((select auth.uid()) = user_id);

-- Forzar RLS para el owner (importante para Supabase)
alter table alumnos force row level security;
alter table profesores force row level security;
alter table clases force row level security;
alter table inscripciones force row level security;
alter table pagos force row level security;
alter table configuracion force row level security;

-- ============================================
-- GRANTS
-- ============================================

grant usage on schema public to authenticated, anon;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;
