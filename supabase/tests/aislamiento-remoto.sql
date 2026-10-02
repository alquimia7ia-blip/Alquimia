-- =====================================================================
-- Aislamiento verificado contra un proyecto Supabase real
--
-- Hermana de rls.test.sql, con dos diferencias que importan:
--
--   · rls.test.sql hace `truncate` y arrasa con el contenido sembrado.
--     Sirve para una base de desarrollo, no para una donde ya hay trabajo.
--   · Esta corre entera dentro de una transacción que se revierte, así que
--     puede ejecutarse contra la base buena sin dejar rastro.
--
-- Además prueba lo que el atajo local no puede: el esquema `auth` de verdad,
-- el rol `authenticated` de verdad y la auth.uid() de Supabase leyendo el JWT.
-- El atajo de supabase/tests/00_shim_local.sql los imita, y un atajo que se
-- comporta distinto al original es exactamente la clase de error que no se ve.
--
-- Requiere el contenido ya sembrado (11 talleres del Módulo 1).
--
--   psql "$DATABASE_URL" -f supabase/tests/aislamiento-remoto.sql
--
-- Cualquier afirmación que falle aborta el lote: si termina, pasó todo.
-- =====================================================================
begin;

create schema pruebas;
create function pruebas.afirmar(condicion boolean, mensaje text)
returns text language plpgsql as $$
begin
  if condicion is not true then
    raise exception 'FALLA · %', mensaje;
  end if;
  return 'ok · ' || mensaje;
end $$;
grant usage on schema pruebas to authenticated;
grant execute on all functions in schema pruebas to authenticated;

-- Cinco personas; el trigger crear_perfil las refleja en `perfiles`.
--   Cohorte 1: Empresa 1 (Ana) y Empresa 2 (Beto) — competidoras
--   Cohorte 2: Empresa 3 (Caro)
--   Facilitadores: Hernando (cohorte 1), Luis (cohorte 2)
insert into auth.users (id) values
  ('aaaaaaaa-0000-4000-8000-000000000001'),
  ('bbbbbbbb-0000-4000-8000-000000000002'),
  ('cccccccc-0000-4000-8000-000000000003'),
  ('dddddddd-0000-4000-8000-000000000004'),
  ('eeeeeeee-0000-4000-8000-000000000005');

insert into cohortes (id, programa_id, nombre)
  select '11111111-0000-4000-8000-000000000001', id, 'Cohorte 1' from programas limit 1;
insert into cohortes (id, programa_id, nombre)
  select '11111111-0000-4000-8000-000000000002', id, 'Cohorte 2' from programas limit 1;

insert into empresas (id, organizacion_id, nombre)
  select ('22222222-0000-4000-8000-00000000000' || n)::uuid, o.id, 'Empresa ' || n
  from organizaciones o, unnest(array['1','2','3']) as n;

insert into inscripciones (empresa_id, cohorte_id) values
  ('22222222-0000-4000-8000-000000000001','11111111-0000-4000-8000-000000000001'),
  ('22222222-0000-4000-8000-000000000002','11111111-0000-4000-8000-000000000001'),
  ('22222222-0000-4000-8000-000000000003','11111111-0000-4000-8000-000000000002');

insert into membresias (perfil_id, empresa_id, rol) values
  ('aaaaaaaa-0000-4000-8000-000000000001','22222222-0000-4000-8000-000000000001','propietario'),
  ('bbbbbbbb-0000-4000-8000-000000000002','22222222-0000-4000-8000-000000000002','propietario'),
  ('eeeeeeee-0000-4000-8000-000000000005','22222222-0000-4000-8000-000000000003','propietario');

insert into facilitadores_cohorte (perfil_id, cohorte_id) values
  ('cccccccc-0000-4000-8000-000000000003','11111111-0000-4000-8000-000000000001'),
  ('dddddddd-0000-4000-8000-000000000004','11111111-0000-4000-8000-000000000002');

insert into bitacoras (id, empresa_id, modulo_id, cohorte_id)
  select ('33333333-0000-4000-8000-00000000000' || n.i)::uuid,
         ('22222222-0000-4000-8000-00000000000' || n.i)::uuid,
         (select id from modulos where numero = 1),
         (case when n.i in ('1','2') then '11111111-0000-4000-8000-000000000001'
               else '11111111-0000-4000-8000-000000000002' end)::uuid
  from unnest(array['1','2','3']) as n(i);

-- Cifras del Taller 8: exactamente lo que no puede filtrarse entre competidoras.
insert into respuestas (bitacora_id, taller_id, campo_id, valor, actualizado_por) values
  ('33333333-0000-4000-8000-000000000001',(select id from talleres where slug='indicadores'),
   'indicadores.f1.nombre','"Ventas empresa A"','aaaaaaaa-0000-4000-8000-000000000001'),
  ('33333333-0000-4000-8000-000000000002',(select id from talleres where slug='indicadores'),
   'indicadores.f1.nombre','"Ventas empresa B"','bbbbbbbb-0000-4000-8000-000000000002'),
  ('33333333-0000-4000-8000-000000000003',(select id from talleres where slug='indicadores'),
   'indicadores.f1.nombre','"Ventas empresa C"','eeeeeeee-0000-4000-8000-000000000005');

-- ===== Ana: solo lo suyo =====
select set_config('request.jwt.claims',
  '{"sub":"aaaaaaaa-0000-4000-8000-000000000001","role":"authenticated"}', true);
set local role authenticated;

select pruebas.afirmar((select count(*) from respuestas) = 1,
  'Ana ve solo la respuesta de su empresa');
select pruebas.afirmar((select count(*) from respuestas
   where valor::text like '%empresa B%') = 0,
  'Ana NO ve las cifras de su competidora de la misma cohorte');
select pruebas.afirmar((select count(*) from empresas) = 1,
  'Ana ve una sola empresa');
select pruebas.afirmar((select count(*) from vista_progreso_taller) = 11,
  'Ana ve el progreso de sus 11 talleres y de ninguna otra bitacora');

reset role;

-- ===== Hernando: su cohorte entera, y nada más =====
select set_config('request.jwt.claims',
  '{"sub":"cccccccc-0000-4000-8000-000000000003","role":"authenticated"}', true);
set local role authenticated;

select pruebas.afirmar((select count(*) from respuestas) = 2,
  'el facilitador de la cohorte 1 lee las dos empresas de su cohorte');
select pruebas.afirmar((select count(*) from respuestas
   where valor::text like '%empresa C%') = 0,
  'el facilitador de la cohorte 1 NO alcanza la cohorte 2');

reset role;

-- ===== Luis: la otra cohorte =====
select set_config('request.jwt.claims',
  '{"sub":"dddddddd-0000-4000-8000-000000000004","role":"authenticated"}', true);
set local role authenticated;

select pruebas.afirmar((select count(*) from respuestas) = 1,
  'el facilitador de la cohorte 2 lee solo su cohorte');

reset role;
rollback;
