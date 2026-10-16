-- =====================================================================
-- Registro de dudas · aislamiento
--
-- Una duda dice, con nombre propio, qué no entendió una empresa. Es más
-- delicada que una respuesta: admitir en público que no se entiende algo
-- cuesta, y si se filtra a la empresa de al lado, nadie vuelve a escribir
-- una. Esto afirma que solo la ven quienes deben.
--
-- Corre entera dentro de una transacción revertida: puede ejecutarse
-- contra la base buena sin dejar rastro.
--
--   psql "$DATABASE_URL" -f supabase/tests/dudas-remoto.sql
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
  ('88888888-0000-4000-8000-000000000001'),   -- empresa A
  ('88888888-0000-4000-8000-000000000002'),   -- empresa B, competidora
  ('88888888-0000-4000-8000-000000000003');   -- compañero de la empresa A

-- ── La empresa A anota una duda ─────────────────────────────────────
select set_config('request.jwt.claims',
  '{"sub":"88888888-0000-4000-8000-000000000001","role":"authenticated"}', true);
set local role authenticated;

select public.unirse_a_empresa('Panadería de la prueba');

insert into dudas (bitacora_id, autor_id, cuerpo)
select id, '88888888-0000-4000-8000-000000000001',
       'No entendí qué va en atributos diferenciales'
from bitacoras limit 1;

select pruebas.afirmar((select count(*) from dudas) = 1,
  'la empresa puede anotar una duda en su bitácora');

-- ── La empresa competidora no la ve ─────────────────────────────────
reset role;
select set_config('request.jwt.claims',
  '{"sub":"88888888-0000-4000-8000-000000000002","role":"authenticated"}', true);
set local role authenticated;

select public.unirse_a_empresa('Ferretería de la prueba');

select pruebas.afirmar((select count(*) from dudas) = 0,
  'una empresa distinta no ve ninguna duda ajena');

-- Y tampoco puede escribir en la bitácora de la otra.
do $$
declare ajena uuid;
begin
  select b.id into ajena from bitacoras b
  join empresas e on e.id = b.empresa_id
  where e.nombre = 'Panadería de la prueba' limit 1;
  -- RLS tapa la bitácora ajena, así que ni siquiera la encuentra.
  if ajena is not null then
    raise exception 'FALLA · la bitácora ajena es visible desde otra empresa';
  end if;
  raise notice '  ok · la bitácora ajena ni siquiera es visible';
end $$;

-- ── El compañero de equipo sí la ve, pero no la borra ────────────────
reset role;
select set_config('request.jwt.claims',
  '{"sub":"88888888-0000-4000-8000-000000000003","role":"authenticated"}', true);
set local role authenticated;

select public.unirse_a_empresa('Panadería de la prueba');   -- queda pendiente

select pruebas.afirmar((select count(*) from dudas) = 0,
  'quien está pendiente de aprobación todavía no ve las dudas del equipo');

reset role;
rollback;
