-- =====================================================================
-- Row Level Security
--
-- El aislamiento entre empresas competidoras de la misma cohorte vive
-- aquí, en Postgres, y no en el código de la aplicación: aunque una
-- consulta olvide un filtro, la base no devuelve la fila. El Taller 8
-- guarda ventas, márgenes y utilidades por línea de producto.
--
-- Reglas de fondo:
--   · El equipo de la empresa lee y escribe lo suyo.
--   · El facilitador LEE su cohorte y escribe solo en comentarios.
--   · Nadie alcanza otra cohorte.
-- =====================================================================

alter table organizaciones        enable row level security;
alter table programas             enable row level security;
alter table modulos               enable row level security;
alter table talleres              enable row level security;
alter table cohortes              enable row level security;
alter table perfiles              enable row level security;
alter table empresas              enable row level security;
alter table inscripciones         enable row level security;
alter table membresias            enable row level security;
alter table facilitadores_cohorte enable row level security;
alter table invitaciones          enable row level security;
alter table bitacoras             enable row level security;
alter table filas                 enable row level security;
alter table respuestas            enable row level security;
alter table respuestas_historial  enable row level security;
alter table comentarios           enable row level security;
alter table consentimientos       enable row level security;
alter table auditoria_acceso      enable row level security;

-- ---------------------------------------------------------------------
-- Contenido del programa: legible por cualquier autenticado si está publicado
-- ---------------------------------------------------------------------
create policy organizaciones_lectura on organizaciones for select
  to authenticated using (true);

create policy programas_lectura on programas for select
  to authenticated using (true);

create policy modulos_lectura on modulos for select
  to authenticated using (publicado or app.es_admin_plataforma());

create policy talleres_lectura on talleres for select
  to authenticated using (publicado or app.es_admin_plataforma());

-- Solo las cohortes con las que el usuario tiene relación real.
create policy cohortes_lectura on cohortes for select
  to authenticated using (
    id in (select app.cohortes_del_facilitador())
    or exists (select 1 from inscripciones i
               where i.cohorte_id = cohortes.id
                 and i.empresa_id in (select app.empresas_del_usuario()))
    or app.es_admin_plataforma()
  );

-- ---------------------------------------------------------------------
-- Perfiles: uno mismo, los compañeros de empresa, y los de la cohorte
-- que uno facilita. Nada más — el directorio no es público.
-- ---------------------------------------------------------------------
create policy perfiles_lectura on perfiles for select
  to authenticated using (
    id = auth.uid()
    or exists (select 1 from membresias m
               where m.perfil_id = perfiles.id
                 and m.estado = 'activa'
                 and (m.empresa_id in (select app.empresas_del_usuario())
                   or m.empresa_id in (select app.empresas_de_mis_cohortes())))
    or app.es_admin_plataforma()
  );

create policy perfiles_actualiza_propio on perfiles for update
  to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- ---------------------------------------------------------------------
-- Empresas, inscripciones y membresías
-- ---------------------------------------------------------------------
create policy empresas_lectura on empresas for select
  to authenticated using (
    id in (select app.empresas_del_usuario())
    or id in (select app.empresas_de_mis_cohortes())
    or app.es_admin_plataforma()
  );

create policy empresas_actualiza on empresas for update
  to authenticated
  using  (id in (select app.empresas_administradas_del_usuario()))
  with check (id in (select app.empresas_administradas_del_usuario()));

create policy inscripciones_lectura on inscripciones for select
  to authenticated using (
    empresa_id in (select app.empresas_del_usuario())
    or cohorte_id in (select app.cohortes_del_facilitador())
    or app.es_admin_plataforma()
  );

create policy membresias_lectura on membresias for select
  to authenticated using (
    perfil_id = auth.uid()
    or empresa_id in (select app.empresas_del_usuario())
    or empresa_id in (select app.empresas_de_mis_cohortes())
    or app.es_admin_plataforma()
  );

-- Solo el propietario de la empresa gestiona a su equipo.
create policy membresias_gestiona on membresias for all
  to authenticated
  using  (empresa_id in (select app.empresas_administradas_del_usuario()))
  with check (empresa_id in (select app.empresas_administradas_del_usuario()));

create policy facilitadores_lectura on facilitadores_cohorte for select
  to authenticated using (
    perfil_id = auth.uid()
    or cohorte_id in (select app.cohortes_del_facilitador())
    or app.es_admin_plataforma()
  );

-- El token viaja por correo; la aceptación la resuelve el servidor con
-- la clave de servicio. Aquí solo se ve quién tiene invitación pendiente.
create policy invitaciones_lectura on invitaciones for select
  to authenticated using (
    empresa_id in (select app.empresas_administradas_del_usuario())
    or empresa_id in (select app.empresas_de_mis_cohortes())
    or app.es_admin_plataforma()
  );

create policy invitaciones_crea on invitaciones for insert
  to authenticated
  with check (empresa_id in (select app.empresas_administradas_del_usuario()));

-- ---------------------------------------------------------------------
-- Bitácoras
-- ---------------------------------------------------------------------
create policy bitacoras_lectura on bitacoras for select
  to authenticated using (
    empresa_id in (select app.empresas_del_usuario())
    or empresa_id in (select app.empresas_de_mis_cohortes())
    or app.es_admin_plataforma()
  );

create policy bitacoras_actualiza on bitacoras for update
  to authenticated
  using  (empresa_id in (select app.empresas_editables_del_usuario()))
  with check (empresa_id in (select app.empresas_editables_del_usuario()));

-- ---------------------------------------------------------------------
-- Respuestas: el corazón del aislamiento
-- ---------------------------------------------------------------------
create policy respuestas_lectura on respuestas for select
  to authenticated using (bitacora_id in (select app.bitacoras_legibles()));

create policy respuestas_inserta on respuestas for insert
  to authenticated with check (
    bitacora_id in (select app.bitacoras_editables())
    and actualizado_por = auth.uid()
  );

create policy respuestas_actualiza on respuestas for update
  to authenticated
  using  (bitacora_id in (select app.bitacoras_editables()))
  with check (bitacora_id in (select app.bitacoras_editables())
              and actualizado_por = auth.uid());

create policy respuestas_borra on respuestas for delete
  to authenticated using (bitacora_id in (select app.bitacoras_editables()));

-- ---------------------------------------------------------------------
-- Filas dinámicas: mismas reglas que las respuestas
-- ---------------------------------------------------------------------
create policy filas_lectura on filas for select
  to authenticated using (bitacora_id in (select app.bitacoras_legibles()));

create policy filas_escribe on filas for insert
  to authenticated with check (bitacora_id in (select app.bitacoras_editables()));

create policy filas_actualiza on filas for update
  to authenticated
  using  (bitacora_id in (select app.bitacoras_editables()))
  with check (bitacora_id in (select app.bitacoras_editables()));

-- ---------------------------------------------------------------------
-- Historial: se lee con la bitácora, nunca se escribe a mano
-- (lo escribe el trigger, que corre como definidor)
-- ---------------------------------------------------------------------
create policy historial_lectura on respuestas_historial for select
  to authenticated using (bitacora_id in (select app.bitacoras_legibles()));

-- ---------------------------------------------------------------------
-- Comentarios: la empresa lee lo que le dejaron visible;
-- el facilitador escribe sobre su cohorte y puede guardar notas privadas.
-- ---------------------------------------------------------------------
create policy comentarios_empresa_lee on comentarios for select
  to authenticated using (
    visible_para_empresa
    and exists (select 1 from bitacoras b
                where b.id = comentarios.bitacora_id
                  and b.empresa_id in (select app.empresas_del_usuario()))
  );

create policy comentarios_facilitador_lee on comentarios for select
  to authenticated using (
    exists (select 1 from bitacoras b
            where b.id = comentarios.bitacora_id
              and b.empresa_id in (select app.empresas_de_mis_cohortes()))
  );

create policy comentarios_facilitador_escribe on comentarios for insert
  to authenticated with check (
    autor_id = auth.uid()
    and exists (select 1 from bitacoras b
                where b.id = bitacora_id
                  and b.empresa_id in (select app.empresas_de_mis_cohortes()))
  );

create policy comentarios_facilitador_edita on comentarios for update
  to authenticated
  using  (autor_id = auth.uid()
          and exists (select 1 from bitacoras b
                      where b.id = comentarios.bitacora_id
                        and b.empresa_id in (select app.empresas_de_mis_cohortes())))
  with check (autor_id = auth.uid());

-- ---------------------------------------------------------------------
-- Cumplimiento: cada quien ve y firma lo suyo (habeas data)
-- ---------------------------------------------------------------------
create policy consentimientos_propios on consentimientos for select
  to authenticated using (perfil_id = auth.uid());

create policy consentimientos_firma on consentimientos for insert
  to authenticated with check (perfil_id = auth.uid());

-- La auditoría es de solo escritura para el usuario: se registra su paso,
-- pero no puede leerla ni alterarla. La lee el administrador de plataforma.
create policy auditoria_escribe on auditoria_acceso for insert
  to authenticated with check (actor_id = auth.uid());

create policy auditoria_lectura_admin on auditoria_acceso for select
  to authenticated using (app.es_admin_plataforma());

-- ---------------------------------------------------------------------
-- Permisos de tabla. RLS filtra filas; GRANT decide qué verbos existen.
-- Ninguno permite borrar contenido del programa ni bitácoras.
-- ---------------------------------------------------------------------
grant select on organizaciones, programas, modulos, talleres, cohortes,
                inscripciones, facilitadores_cohorte, respuestas_historial
  to authenticated;

grant select, update on perfiles, empresas, bitacoras to authenticated;
grant select, insert, update, delete on membresias to authenticated;
grant select, insert on invitaciones, consentimientos to authenticated;
grant insert, select on auditoria_acceso to authenticated;
grant select, insert, update, delete on respuestas to authenticated;
grant select, insert, update on filas, comentarios to authenticated;
grant usage, select on all sequences in schema public to authenticated;
