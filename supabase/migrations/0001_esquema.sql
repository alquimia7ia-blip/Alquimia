-- =====================================================================
-- Bitácora MEGA · esquema base
-- Jerarquía: organizaciones → programas → módulos → talleres
--            organizaciones → empresas, programas → cohortes
-- =====================================================================

create extension if not exists pgcrypto;
create schema if not exists app;

-- Marca de tiempo de modificación, compartida por todas las tablas.
create or replace function app.tocar_actualizado_at() returns trigger
language plpgsql as $$
begin
  new.actualizado_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Contenido y tenencia
-- ---------------------------------------------------------------------

-- Raíz multi-tenant. Hoy una sola fila: Cámara de Comercio del Aburrá Sur.
create table organizaciones (
  id             uuid primary key default gen_random_uuid(),
  nombre         text not null,
  slug           text not null unique,
  nit            text,
  logo_url       text,
  tema           jsonb not null default '{}'::jsonb,   -- sobrescritura de tokens CSS
  creado_at      timestamptz not null default now(),
  actualizado_at timestamptz not null default now()
);

create table programas (
  id              uuid primary key default gen_random_uuid(),
  organizacion_id uuid not null references organizaciones on delete cascade,
  nombre          text not null,
  slug            text not null,
  descripcion     text,
  creado_at       timestamptz not null default now(),
  actualizado_at  timestamptz not null default now(),
  unique (organizacion_id, slug)
);

create table modulos (
  id             uuid primary key default gen_random_uuid(),
  programa_id    uuid not null references programas on delete cascade,
  numero         int  not null check (numero between 1 and 99),
  slug           text not null,
  pregunta       text not null,          -- '¿Dónde?'
  titulo         text not null,          -- 'Análisis interno y externo'
  lead           text,
  publicado      boolean not null default false,
  creado_at      timestamptz not null default now(),
  actualizado_at timestamptz not null default now(),
  unique (programa_id, numero),
  unique (programa_id, slug)
);

create table talleres (
  id             uuid primary key default gen_random_uuid(),
  modulo_id      uuid not null references modulos on delete cascade,
  numero         int  not null,
  slug           text not null,
  corto          text not null,          -- etiqueta del riel lateral
  titulo         text not null,
  lead           text,
  definicion     jsonb not null,         -- documento de bloques (lib/talleres/tipos.ts)
  campos_minimos int  not null default 0 check (campos_minimos >= 0),
  version        int  not null default 1,
  publicado      boolean not null default false,
  creado_at      timestamptz not null default now(),
  actualizado_at timestamptz not null default now(),
  unique (modulo_id, numero),
  unique (modulo_id, slug)
);

create table cohortes (
  id             uuid primary key default gen_random_uuid(),
  programa_id    uuid not null references programas on delete cascade,
  nombre         text not null,          -- 'MEGA 2026-1'
  fecha_inicio   date,
  fecha_fin      date,
  estado         text not null default 'activa'
                 check (estado in ('borrador','activa','cerrada')),
  creado_at      timestamptz not null default now(),
  actualizado_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Personas, empresas y pertenencia
-- ---------------------------------------------------------------------

-- Espejo de auth.users. Se puebla con trigger (0002).
-- Minimización de datos (Ley 1581): ni cédula ni dirección de residencia.
create table perfiles (
  id                  uuid primary key references auth.users on delete cascade,
  nombre_completo     text,
  cargo               text,
  telefono            text,
  avatar_url          text,
  es_admin_plataforma boolean not null default false,
  creado_at           timestamptz not null default now(),
  actualizado_at      timestamptz not null default now()
);

create table empresas (
  id              uuid primary key default gen_random_uuid(),
  organizacion_id uuid not null references organizaciones on delete restrict,
  nombre          text not null,
  nit             text,
  sector          text,
  municipio       text,
  tamano          text,
  creado_at       timestamptz not null default now(),
  actualizado_at  timestamptz not null default now()
);

-- Una empresa puede repetir programa o pasar por varias cohortes.
create table inscripciones (
  id         uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas on delete cascade,
  cohorte_id uuid not null references cohortes on delete cascade,
  estado     text not null default 'activa'
             check (estado in ('activa','retirada','graduada')),
  creado_at  timestamptz not null default now(),
  unique (empresa_id, cohorte_id)
);

-- Quién puede editar la bitácora de qué empresa.
create table membresias (
  id            uuid primary key default gen_random_uuid(),
  perfil_id     uuid not null references perfiles on delete cascade,
  empresa_id    uuid not null references empresas on delete cascade,
  rol           text not null default 'miembro'
                check (rol in ('propietario','miembro','lector')),
  estado        text not null default 'activa'
                check (estado in ('activa','revocada')),
  invitado_por  uuid references perfiles on delete set null,
  creado_at     timestamptz not null default now(),
  unique (perfil_id, empresa_id)
);

-- Docentes del programa.
create table facilitadores_cohorte (
  id         uuid primary key default gen_random_uuid(),
  perfil_id  uuid not null references perfiles on delete cascade,
  cohorte_id uuid not null references cohortes on delete cascade,
  rol        text not null default 'facilitador'
             check (rol in ('facilitador','coordinador')),
  creado_at  timestamptz not null default now(),
  unique (perfil_id, cohorte_id)
);

-- Registro de a quién se invitó y si ya aceptó. El token lo emite y valida
-- Supabase Auth, que envía el correo: aquí no se guarda ningún secreto.
create table invitaciones (
  id           uuid primary key default gen_random_uuid(),
  empresa_id   uuid not null references empresas on delete cascade,
  correo       text not null,
  rol          text not null default 'miembro'
               check (rol in ('propietario','miembro','lector')),
  expira_at    timestamptz not null default now() + interval '14 days',
  aceptada_at  timestamptz,
  creada_por   uuid references perfiles on delete set null,
  creado_at    timestamptz not null default now()
);
create index on invitaciones (correo) where aceptada_at is null;

-- ---------------------------------------------------------------------
-- El trabajo de la empresa
-- ---------------------------------------------------------------------

create table bitacoras (
  id             uuid primary key default gen_random_uuid(),
  empresa_id     uuid not null references empresas on delete cascade,
  modulo_id      uuid not null references modulos on delete cascade,
  cohorte_id     uuid not null references cohortes on delete cascade,
  estado         text not null default 'en_curso'
                 check (estado in ('en_curso','entregada')),
  entregada_at   timestamptz,
  creado_at      timestamptz not null default now(),
  actualizado_at timestamptz not null default now(),
  unique (empresa_id, modulo_id, cohorte_id)
);

-- Filas dinámicas (competidores, indicadores, hitos, valores).
-- Existen como registro propio para que agregar y borrar sea colaborativo:
-- dos personas agregando a la vez generan uuid distintos y ambas sobreviven.
create table filas (
  id           uuid primary key default gen_random_uuid(),
  bitacora_id  uuid not null references bitacoras on delete cascade,
  taller_id    uuid not null references talleres on delete cascade,
  bloque_id    text not null,
  orden        numeric not null,          -- fraccionario: insertar entre 1 y 2 es 1.5
  eliminada_at timestamptz,
  creada_por   uuid references perfiles on delete set null,
  creado_at    timestamptz not null default now()
);
create index on filas (bitacora_id, bloque_id) where eliminada_at is null;

-- Una fila por campo. Nunca un blob: es lo que permite editar en equipo.
create table respuestas (
  id              uuid primary key default gen_random_uuid(),
  bitacora_id     uuid not null references bitacoras on delete cascade,
  taller_id       uuid not null references talleres on delete cascade,
  campo_id        text not null,          -- 'tend.esp.valoracion'
  valor           jsonb,
  version         int  not null default 1,
  actualizado_por uuid references perfiles on delete set null,
  actualizado_at  timestamptz not null default now(),
  creado_at       timestamptz not null default now(),
  unique (bitacora_id, campo_id)
);
create index on respuestas (bitacora_id, taller_id);

-- Append-only: "quién respondió qué" y recuperación de un valor desplazado.
create table respuestas_historial (
  id             bigserial primary key,
  respuesta_id   uuid,
  bitacora_id    uuid not null,
  campo_id       text not null,
  valor_anterior jsonb,
  valor_nuevo    jsonb,
  autor_id       uuid references perfiles on delete set null,
  ocurrido_at    timestamptz not null default now()
);
create index on respuestas_historial (bitacora_id, campo_id, ocurrido_at desc);

-- Retroalimentación del facilitador.
create table comentarios (
  id                   uuid primary key default gen_random_uuid(),
  bitacora_id          uuid not null references bitacoras on delete cascade,
  taller_id            uuid references talleres on delete cascade,  -- null = del módulo
  campo_id             text,                                        -- null = del taller
  autor_id             uuid not null references perfiles on delete cascade,
  cuerpo               text not null check (length(btrim(cuerpo)) > 0),
  visible_para_empresa boolean not null default true,
  resuelto             boolean not null default false,
  resuelto_por         uuid references perfiles on delete set null,
  creado_at            timestamptz not null default now(),
  actualizado_at       timestamptz not null default now()
);
create index on comentarios (bitacora_id, taller_id);

-- ---------------------------------------------------------------------
-- Cumplimiento (Ley 1581 de 2012)
-- ---------------------------------------------------------------------

-- La transferencia internacional se registra aparte del tratamiento general:
-- Colombia no reconoce a EE.UU. con nivel adecuado de protección
-- (Circular Externa 005 de 2017), así que exige autorización expresa propia.
create table consentimientos (
  id              uuid primary key default gen_random_uuid(),
  perfil_id       uuid not null references perfiles on delete cascade,
  tipo            text not null
                  check (tipo in ('tratamiento_datos',
                                  'transferencia_internacional',
                                  'comunicaciones')),
  version_politica text not null,
  aceptado        boolean not null,
  ip              inet,
  agente          text,
  ocurrido_at     timestamptz not null default now()
);
create index on consentimientos (perfil_id, tipo, ocurrido_at desc);

create table auditoria_acceso (
  id          bigserial primary key,
  actor_id    uuid references perfiles on delete set null,
  accion      text not null,      -- 'leer_bitacora','exportar_cohorte','comentar'
  recurso     text not null,      -- 'bitacora:<uuid>'
  metadatos   jsonb not null default '{}'::jsonb,
  ocurrido_at timestamptz not null default now()
);
create index on auditoria_acceso (actor_id, ocurrido_at desc);

-- ---------------------------------------------------------------------
-- Triggers de actualizado_at
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['organizaciones','programas','modulos','talleres','cohortes',
                           'perfiles','empresas','bitacoras','comentarios']
  loop
    execute format(
      'create trigger %I_tocar before update on %I
         for each row execute function app.tocar_actualizado_at()', t, t);
  end loop;
end $$;
