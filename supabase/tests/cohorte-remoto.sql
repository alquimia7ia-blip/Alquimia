-- Prueba del panel del facilitador contra la base real.
--
-- Lo que se comprueba aquí no es la interfaz: es que darle a alguien el
-- permiso de facilitador no abra ninguna puerta que no deba. El aislamiento
-- entre empresas es la propiedad sobre la que se vende la plataforma, y una
-- regresión ahí no daría ningún error visible: simplemente una empresa vería
-- las cifras de otra.
--
-- Todo ocurre dentro de un bloque que se revierte. No deja facilitadores ni
-- filas de auditoría.
do $$
declare
  yo        uuid;
  otra_pers uuid;
  coh       uuid;
  mi_emp    uuid;
  otra_emp  uuid;
  bit_ajena uuid;
  n         int;
  fallos    text := '';
begin
  select id into yo from perfiles order by creado_at limit 1;
  select id into otra_pers from perfiles where id <> yo limit 1;
  select id into coh from cohortes limit 1;
  select empresa_id into mi_emp from membresias
   where perfil_id = yo and estado = 'activa' limit 1;
  select e.id into otra_emp from empresas e where e.id <> mi_emp limit 1;
  select id into bit_ajena from bitacoras
   where empresa_id = otra_emp and modulo_id = (select id from modulos where numero = 1);

  -- ============ 1 · SIN ser facilitador, no se ve nada ajeno ============
  perform set_config('request.jwt.claims',
    json_build_object('sub', yo, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);

  select count(*) into n from bitacoras where empresa_id = otra_emp;
  if n <> 0 then
    fallos := fallos || format('· sin permiso ya se veían %s bitácoras ajenas%s', n, chr(10));
  end if;

  select count(*) into n from respuestas where bitacora_id = bit_ajena;
  if n <> 0 then
    fallos := fallos || format('· sin permiso ya se veían %s respuestas ajenas%s', n, chr(10));
  end if;

  reset role;

  -- ============ 2 · COMO facilitador, se lee la cohorte ============
  insert into facilitadores_cohorte (perfil_id, cohorte_id) values (yo, coh)
    on conflict do nothing;

  perform set_config('request.jwt.claims',
    json_build_object('sub', yo, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);

  select count(*) into n from bitacoras where empresa_id = otra_emp;
  if n = 0 then
    fallos := fallos || '· el facilitador no ve las bitácoras de su cohorte' || chr(10);
  end if;

  select count(*) into n from respuestas where bitacora_id = bit_ajena;
  if n = 0 then
    fallos := fallos || '· el facilitador no ve las respuestas de su cohorte' || chr(10);
  end if;

  -- La vista que alimenta el panel hereda RLS (security_invoker).
  select count(*) into n from vista_progreso_bitacora where empresa_id = otra_emp;
  if n = 0 then
    fallos := fallos || '· vista_progreso_bitacora no devuelve la empresa de la cohorte' || chr(10);
  end if;

  -- ============ 3 · Pero NO puede escribir. Solo lectura de verdad ======
  begin
    update respuestas set valor = to_jsonb('manipulado'::text)
     where bitacora_id = bit_ajena;
    get diagnostics n = row_count;
    if n > 0 then
      fallos := fallos || format('· ¡EL FACILITADOR MODIFICÓ %s respuestas ajenas!%s', n, chr(10));
    end if;
  exception when insufficient_privilege then
    null;  -- rechazo correcto
  end;

  begin
    delete from respuestas where bitacora_id = bit_ajena;
    get diagnostics n = row_count;
    if n > 0 then
      fallos := fallos || format('· ¡EL FACILITADOR BORRÓ %s respuestas ajenas!%s', n, chr(10));
    end if;
  exception when insufficient_privilege then
    null;
  end;

  -- ============ 4 · Deja rastro y no puede taparlo ======================
  -- El tutor escribe en la auditoría pero no la lee ni la borra: la lectura
  -- está reservada al administrador de plataforma. Es deliberado — quien es
  -- auditado no debe poder revisar ni limpiar su propio registro.
  insert into auditoria_acceso (actor_id, accion, recurso)
  values (yo, 'leer_bitacora', 'bitacora:' || bit_ajena);

  select count(*) into n from auditoria_acceso;
  if n <> 0 then
    fallos := fallos || '· el facilitador puede LEER la auditoría' || chr(10);
  end if;

  begin
    delete from auditoria_acceso;
    get diagnostics n = row_count;
    if n > 0 then
      fallos := fallos || '· el facilitador BORRÓ su rastro de auditoría' || chr(10);
    end if;
  exception when insufficient_privilege then
    null;
  end;

  -- ============ 5 · Y no puede firmar la lectura con otro nombre =======
  begin
    insert into auditoria_acceso (actor_id, accion, recurso)
    values (otra_pers, 'leer_bitacora', 'bitacora:suplantada');
    fallos := fallos || '· se pudo registrar auditoría a nombre de otra persona' || chr(10);
  exception when insufficient_privilege then
    null;
  end;

  reset role;

  -- ============ 6 · Desde fuera de RLS, la fila sí quedó escrita =========
  select count(*) into n from auditoria_acceso
   where actor_id = yo and recurso = 'bitacora:' || bit_ajena;
  if n <> 1 then
    fallos := fallos || format('· la auditoría no guardó la lectura (%s filas)%s', n, chr(10));
  end if;

  if fallos <> '' then
    raise exception E'FALLOS DE AISLAMIENTO:\n%', fallos;
  end if;
  raise exception 'ok' using errcode = 'triggered_action_exception';
exception
  when triggered_action_exception then
    raise notice 'todas las comprobaciones pasaron; cambios revertidos';
end $$;

-- Nada debe quedar.
select (select count(*) from facilitadores_cohorte) as facilitadores,
       (select count(*) from auditoria_acceso)      as auditoria;
