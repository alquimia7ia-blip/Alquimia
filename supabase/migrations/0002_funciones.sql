-- =====================================================================
-- Funciones auxiliares, triggers de dominio y ayudas de autorización
-- =====================================================================

-- ---------------------------------------------------------------------
-- Perfil automático al crear un usuario de auth
-- ---------------------------------------------------------------------
create or replace function app.crear_perfil_desde_auth() returns trigger
language plpgsql security definer set search_path = public, auth as $$
begin
  insert into perfiles (id, nombre_completo)
  values (new.id, nullif(new.raw_user_meta_data ->> 'nombre_completo', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists crear_perfil on auth.users;
create trigger crear_perfil
  after insert on auth.users
  for each row execute function app.crear_perfil_desde_auth();

-- ---------------------------------------------------------------------
-- Historial de respuestas y control de versión
-- ---------------------------------------------------------------------
-- Se guarda el valor desplazado para poder ofrecer "recuperar versión
-- anterior" cuando dos personas escriben el mismo campo a la vez.
create or replace function app.registrar_historial_respuesta() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' then
    if new.valor is not distinct from old.valor then
      return new;                       -- nada cambió: no se ensucia el historial
    end if;
    new.version        := old.version + 1;
    new.actualizado_at := now();
  end if;

  insert into respuestas_historial
    (respuesta_id, bitacora_id, campo_id, valor_anterior, valor_nuevo, autor_id)
  values
    (new.id, new.bitacora_id, new.campo_id,
     case when tg_op = 'UPDATE' then old.valor else null end,
     new.valor, new.actualizado_por);

  return new;
end;
$$;

create trigger respuestas_historial_trg
  before insert or update on respuestas
  for each row execute function app.registrar_historial_respuesta();

-- ---------------------------------------------------------------------
-- Semántica de "campo resuelto"
-- ---------------------------------------------------------------------
-- Debe coincidir exactamente con lleno() de lib/talleres/progreso.ts:
-- una cadena en blanco no cuenta, un arreglo vacío tampoco.
create or replace function app.valor_lleno(v jsonb) returns boolean
language sql immutable set search_path = '' as $$
  select case
    when v is null                    then false
    when jsonb_typeof(v) = 'null'     then false
    when jsonb_typeof(v) = 'string'   then length(btrim(v #>> '{}')) > 0
    when jsonb_typeof(v) = 'array'    then jsonb_array_length(v) > 0
    when jsonb_typeof(v) = 'object'   then v <> '{}'::jsonb
    else true
  end;
$$;

-- ---------------------------------------------------------------------
-- Ayudas de autorización
-- ---------------------------------------------------------------------
-- Van en funciones SECURITY DEFINER porque una política sobre membresias
-- que consultara membresias entraría en recursión infinita de RLS.

create or replace function app.empresas_del_usuario() returns setof uuid
language sql stable security definer set search_path = public as $$
  select empresa_id from membresias
  where perfil_id = auth.uid() and estado = 'activa';
$$;

create or replace function app.empresas_editables_del_usuario() returns setof uuid
language sql stable security definer set search_path = public as $$
  select empresa_id from membresias
  where perfil_id = auth.uid()
    and estado = 'activa'
    and rol in ('propietario','miembro');
$$;

create or replace function app.empresas_administradas_del_usuario() returns setof uuid
language sql stable security definer set search_path = public as $$
  select empresa_id from membresias
  where perfil_id = auth.uid() and estado = 'activa' and rol = 'propietario';
$$;

create or replace function app.cohortes_del_facilitador() returns setof uuid
language sql stable security definer set search_path = public as $$
  select cohorte_id from facilitadores_cohorte where perfil_id = auth.uid();
$$;

-- Un facilitador solo alcanza las empresas inscritas en SUS cohortes.
-- De aquí sale, sin más código, que nadie vea otra cohorte.
create or replace function app.empresas_de_mis_cohortes() returns setof uuid
language sql stable security definer set search_path = public as $$
  select i.empresa_id from inscripciones i
  where i.cohorte_id in (select app.cohortes_del_facilitador())
    and i.estado = 'activa';
$$;

create or replace function app.es_admin_plataforma() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select es_admin_plataforma from perfiles where id = auth.uid()), false);
$$;

-- Bitácoras que el usuario puede leer, por cualquiera de las dos vías.
create or replace function app.bitacoras_legibles() returns setof uuid
language sql stable security definer set search_path = public as $$
  select b.id from bitacoras b
  where b.empresa_id in (select app.empresas_del_usuario())
     or b.empresa_id in (select app.empresas_de_mis_cohortes());
$$;

-- Bitácoras que el usuario puede escribir: solo su propia empresa.
-- El facilitador lee y comenta; nunca escribe respuestas ajenas.
create or replace function app.bitacoras_editables() returns setof uuid
language sql stable security definer set search_path = public as $$
  select b.id from bitacoras b
  where b.empresa_id in (select app.empresas_editables_del_usuario());
$$;

grant usage on schema app to authenticated;
grant execute on all functions in schema app to authenticated;
