-- =====================================================================
-- Registro sin invitación · aislamiento del alta de empresa
--
-- Quitar la invitación abre la puerta a que cualquiera cree una cuenta.
-- Lo que NO puede abrirse es que, con solo adivinar el nombre de una
-- empresa, alguien alcance sus cifras del Taller 8.
--
-- Corre entera dentro de una transacción revertida: puede ejecutarse
-- contra la base buena sin dejar rastro.
--
--   psql "$DATABASE_URL" -f supabase/tests/registro-remoto.sql
-- =====================================================================
begin;
create schema pruebas;
create function pruebas.afirmar(condicion boolean, mensaje text)
returns text language plpgsql as $$
begin
  if condicion is not true then raise exception 'FALLA · %', mensaje; end if;
  raise notice '  ok · %', mensaje;
  return 'ok';
end $$;
grant usage on schema pruebas to authenticated;
grant execute on all functions in schema pruebas to authenticated;

insert into auth.users (id) values
  ('99999999-0000-4000-8000-000000000001'),   -- Sofía, funda una empresa nueva
  ('99999999-0000-4000-8000-000000000002');   -- alguien que adivina un nombre ajeno

-- ── Quien nombra una empresa nueva la crea y la administra ──────────
select set_config('request.jwt.claims',
  '{"sub":"99999999-0000-4000-8000-000000000001","role":"authenticated"}', true);
set local role authenticated;

select pruebas.afirmar(public.unirse_a_empresa('  Panadería La Espiga  ') = 'creada',
  'quien nombra una empresa nueva la crea');
select pruebas.afirmar((select count(*) from bitacoras) = 1,
  'y recibe su bitácora del módulo publicado');
select pruebas.afirmar((select count(*) from filas) = 15,
  'con las filas iniciales que la definición pide');
select pruebas.afirmar((select count(*) from respuestas where campo_id like '%encabezados%') = 3,
  'y los años del Taller 8 ya puestos');
select pruebas.afirmar((select count(*) from empresas) = 1,
  've su empresa y ninguna otra');
select pruebas.afirmar(public.unirse_a_empresa('Otra cosa') like 'ya_pertenece:%',
  'no puede quedarse con dos empresas');
reset role;

-- ── Adivinar el nombre de una empresa ajena no da acceso ────────────
select set_config('request.jwt.claims',
  '{"sub":"99999999-0000-4000-8000-000000000002","role":"authenticated"}', true);
set local role authenticated;

select pruebas.afirmar(public.unirse_a_empresa('alquimia') = 'pendiente',
  'unirse a una empresa existente queda pendiente, no activo');
select pruebas.afirmar((select count(*) from respuestas) = 0,
  'estando pendiente NO ve ni una respuesta de esa empresa');
select pruebas.afirmar((select count(*) from bitacoras) = 0, 'ni su bitácora');
select pruebas.afirmar((select count(*) from vista_progreso_taller) = 0, 'ni su progreso');
reset role;

rollback;
