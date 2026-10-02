-- =====================================================================
-- Pruebas de aislamiento (RLS)
--
-- Se ejecutan ANTES de escribir interfaz. Si esto no pasa, nada más
-- importa: son las que garantizan que dos empresas competidoras de la
-- misma cohorte no se vean las cifras del Taller 8.
--
-- Local:     psql -d bitacora -f supabase/tests/rls.test.sql
-- Supabase:  supabase db reset && psql "$DB_URL" -f supabase/tests/rls.test.sql
-- =====================================================================
\set ON_ERROR_STOP on
\set QUIET on
set client_min_messages to notice;

create schema if not exists pruebas;

create or replace function pruebas.afirmar(condicion boolean, mensaje text)
returns void language plpgsql as $$
begin
  if condicion is not true then
    raise exception 'FALLA · %', mensaje;
  end if;
  raise notice '  ok · %', mensaje;
end $$;

-- Afirma que una sentencia es RECHAZADA por las políticas.
create or replace function pruebas.afirmar_rechazo(sentencia text, mensaje text)
returns void language plpgsql as $$
begin
  execute sentencia;
  raise exception 'FALLA · se permitió lo que debía rechazarse: %', mensaje;
exception
  when insufficient_privilege then
    raise notice '  ok · %', mensaje;
end $$;

grant usage on schema pruebas to authenticated;
grant execute on all functions in schema pruebas to authenticated;

-- ---------------------------------------------------------------------
-- Semilla: un programa, dos cohortes, tres empresas, cinco personas.
--   Cohorte 1: empresa A (Ana) y empresa B (Beto)  — competidoras
--   Cohorte 2: empresa C (Caro)
--   Facilitadores: Hernando (cohorte 1), Luis (cohorte 2)
-- ---------------------------------------------------------------------
truncate organizaciones, auth.users restart identity cascade;

insert into organizaciones (id, nombre, slug) values
  ('00000000-0000-4000-8000-000000000001','Cámara de Comercio del Aburrá Sur','ccas');
insert into programas (id, organizacion_id, nombre, slug) values
  ('00000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001',
   'Empresas con Propósito MEGA','mega');
insert into modulos (id, programa_id, numero, slug, pregunta, titulo, publicado) values
  ('00000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000002',
   1,'donde','¿Dónde?','Análisis interno y externo', true);
insert into talleres (id, modulo_id, numero, slug, corto, titulo, definicion, campos_minimos, publicado) values
  ('00000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000003',
   1,'grandes-tendencias','Grandes tendencias','¿Qué olas del entorno van a mover tu empresa?',
   '{"version":1,"secciones":[]}'::jsonb, 4, true);
insert into cohortes (id, programa_id, nombre) values
  ('00000000-0000-4000-8000-000000000011','00000000-0000-4000-8000-000000000002','MEGA 2026-1'),
  ('00000000-0000-4000-8000-000000000012','00000000-0000-4000-8000-000000000002','MEGA 2026-2');

insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-4000-8000-0000000000b1','ana@empresa-a.co',  '{"nombre_completo":"Ana"}'),
  ('00000000-0000-4000-8000-0000000000b2','beto@empresa-b.co', '{"nombre_completo":"Beto"}'),
  ('00000000-0000-4000-8000-0000000000b3','caro@empresa-c.co', '{"nombre_completo":"Caro"}'),
  ('00000000-0000-4000-8000-0000000000c1','hernando@esumer.co','{"nombre_completo":"Hernando"}'),
  ('00000000-0000-4000-8000-0000000000c2','luis@esumer.co',    '{"nombre_completo":"Luis"}');

insert into empresas (id, organizacion_id, nombre) values
  ('00000000-0000-4000-8000-0000000000a1','00000000-0000-4000-8000-000000000001','Empresa A'),
  ('00000000-0000-4000-8000-0000000000a2','00000000-0000-4000-8000-000000000001','Empresa B'),
  ('00000000-0000-4000-8000-0000000000a3','00000000-0000-4000-8000-000000000001','Empresa C');

insert into membresias (perfil_id, empresa_id, rol) values
  ('00000000-0000-4000-8000-0000000000b1','00000000-0000-4000-8000-0000000000a1','propietario'),
  ('00000000-0000-4000-8000-0000000000b2','00000000-0000-4000-8000-0000000000a2','propietario'),
  ('00000000-0000-4000-8000-0000000000b3','00000000-0000-4000-8000-0000000000a3','propietario');

insert into inscripciones (empresa_id, cohorte_id) values
  ('00000000-0000-4000-8000-0000000000a1','00000000-0000-4000-8000-000000000011'),
  ('00000000-0000-4000-8000-0000000000a2','00000000-0000-4000-8000-000000000011'),
  ('00000000-0000-4000-8000-0000000000a3','00000000-0000-4000-8000-000000000012');

insert into facilitadores_cohorte (perfil_id, cohorte_id) values
  ('00000000-0000-4000-8000-0000000000c1','00000000-0000-4000-8000-000000000011'),
  ('00000000-0000-4000-8000-0000000000c2','00000000-0000-4000-8000-000000000012');

insert into bitacoras (id, empresa_id, modulo_id, cohorte_id) values
  ('00000000-0000-4000-8000-0000000000d1','00000000-0000-4000-8000-0000000000a1',
   '00000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000011'),
  ('00000000-0000-4000-8000-0000000000d2','00000000-0000-4000-8000-0000000000a2',
   '00000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000011'),
  ('00000000-0000-4000-8000-0000000000d3','00000000-0000-4000-8000-0000000000a3',
   '00000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000012');

-- Cifras del Taller 8: exactamente lo que no debe filtrarse.
insert into respuestas (bitacora_id, taller_id, campo_id, valor, actualizado_por) values
  ('00000000-0000-4000-8000-0000000000d1','00000000-0000-4000-8000-000000000004',
   'indicadores.f1.ventas','"820000000"','00000000-0000-4000-8000-0000000000b1'),
  ('00000000-0000-4000-8000-0000000000d1','00000000-0000-4000-8000-000000000004',
   'tend.esp.valoracion','"fav"','00000000-0000-4000-8000-0000000000b1'),
  ('00000000-0000-4000-8000-0000000000d2','00000000-0000-4000-8000-000000000004',
   'indicadores.f1.ventas','"1340000000"','00000000-0000-4000-8000-0000000000b2'),
  ('00000000-0000-4000-8000-0000000000d3','00000000-0000-4000-8000-000000000004',
   'indicadores.f1.ventas','"95000000"','00000000-0000-4000-8000-0000000000b3');

insert into comentarios (bitacora_id, taller_id, autor_id, cuerpo, visible_para_empresa) values
  ('00000000-0000-4000-8000-0000000000d1','00000000-0000-4000-8000-000000000004',
   '00000000-0000-4000-8000-0000000000c1','Falta cuantificar el tamaño del mercado.', true),
  ('00000000-0000-4000-8000-0000000000d1','00000000-0000-4000-8000-000000000004',
   '00000000-0000-4000-8000-0000000000c1','Nota interna: esta empresa va rezagada.', false);

\echo ''
\echo '── Ana · empresa A, cohorte 1 ──────────────────────────────'
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-0000000000b1","role":"authenticated"}', false);
set role authenticated;

select pruebas.afirmar((select count(*) from respuestas) = 2,
  'Ana ve sus 2 respuestas y nada más');
select pruebas.afirmar((select count(*) from respuestas
  where bitacora_id = '00000000-0000-4000-8000-0000000000d2') = 0,
  'Ana NO ve ninguna respuesta de la Empresa B');
select pruebas.afirmar((select count(*) from empresas) = 1,
  'Ana solo ve su propia empresa');
select pruebas.afirmar((select count(*) from bitacoras) = 1,
  'Ana solo ve su propia bitácora');
select pruebas.afirmar((select count(*) from perfiles) = 1,
  'Ana no ve el perfil de nadie de otra empresa');
select pruebas.afirmar((select count(*) from vista_progreso_taller) = 1,
  'La vista de progreso también respeta el aislamiento');
select pruebas.afirmar((select count(*) from respuestas_historial) = 2,
  'Ana ve su historial y no el ajeno');

insert into respuestas (bitacora_id, taller_id, campo_id, valor, actualizado_por)
values ('00000000-0000-4000-8000-0000000000d1','00000000-0000-4000-8000-000000000004',
        'tend.dig.valoracion','"des"','00000000-0000-4000-8000-0000000000b1');
select pruebas.afirmar((select count(*) from respuestas) = 3,
  'Ana puede escribir en su propia bitácora');

select pruebas.afirmar_rechazo($$
  insert into respuestas (bitacora_id, taller_id, campo_id, valor, actualizado_por)
  values ('00000000-0000-4000-8000-0000000000d2','00000000-0000-4000-8000-000000000004',
          'infiltrado','"x"','00000000-0000-4000-8000-0000000000b1') $$,
  'Ana NO puede escribir en la bitácora de la Empresa B');

select pruebas.afirmar_rechazo($$
  insert into respuestas (bitacora_id, taller_id, campo_id, valor, actualizado_por)
  values ('00000000-0000-4000-8000-0000000000d1','00000000-0000-4000-8000-000000000004',
          'suplantado','"x"','00000000-0000-4000-8000-0000000000b2') $$,
  'Ana NO puede firmar una respuesta como si fuera Beto');

select pruebas.afirmar((select count(*) from comentarios) = 1,
  'Ana ve la retroalimentación visible, no la nota privada del docente');

reset role;

\echo ''
\echo '── Beto · empresa B, misma cohorte que Ana ─────────────────'
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-0000000000b2","role":"authenticated"}', false);
set role authenticated;

select pruebas.afirmar((select count(*) from respuestas
  where bitacora_id = '00000000-0000-4000-8000-0000000000d1') = 0,
  'Beto NO ve las ventas de la Empresa A aunque compartan cohorte');
select pruebas.afirmar((select count(*) from comentarios) = 0,
  'Beto no ve la retroalimentación dirigida a la Empresa A');

reset role;

\echo ''
\echo '── Hernando · facilitador de la cohorte 1 ──────────────────'
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-0000000000c1","role":"authenticated"}', false);
set role authenticated;

select pruebas.afirmar((select count(distinct bitacora_id) from respuestas) = 2,
  'Hernando lee las bitácoras de A y B, que son su cohorte');
select pruebas.afirmar((select count(*) from respuestas
  where bitacora_id = '00000000-0000-4000-8000-0000000000d3') = 0,
  'Hernando NO alcanza la cohorte 2');
select pruebas.afirmar((select count(*) from comentarios) = 2,
  'Hernando ve sus propias notas privadas');

insert into comentarios (bitacora_id, taller_id, autor_id, cuerpo)
values ('00000000-0000-4000-8000-0000000000d2','00000000-0000-4000-8000-000000000004',
        '00000000-0000-4000-8000-0000000000c1','Buen avance en las cinco fuerzas.');
select pruebas.afirmar((select count(*) from comentarios) = 3,
  'Hernando puede dejar retroalimentación en su cohorte');

select pruebas.afirmar_rechazo($$
  insert into comentarios (bitacora_id, taller_id, autor_id, cuerpo)
  values ('00000000-0000-4000-8000-0000000000d3','00000000-0000-4000-8000-000000000004',
          '00000000-0000-4000-8000-0000000000c1','fuera de mi cohorte') $$,
  'Hernando NO puede comentar en la cohorte 2');

select pruebas.afirmar_rechazo($$
  insert into respuestas (bitacora_id, taller_id, campo_id, valor, actualizado_por)
  values ('00000000-0000-4000-8000-0000000000d1','00000000-0000-4000-8000-000000000004',
          'docente.escribe','"x"','00000000-0000-4000-8000-0000000000c1') $$,
  'El facilitador lee y comenta, pero NO responde por la empresa');

reset role;

\echo ''
\echo '── Luis · facilitador de la cohorte 2 ──────────────────────'
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-0000000000c2","role":"authenticated"}', false);
set role authenticated;

select pruebas.afirmar((select count(*) from respuestas) = 1,
  'Luis solo ve la Empresa C, que es su cohorte');
select pruebas.afirmar((select count(*) from comentarios) = 0,
  'Luis no ve la retroalimentación de la cohorte de Hernando');

reset role;

\echo ''
\echo '═══ Aislamiento verificado ═══'
