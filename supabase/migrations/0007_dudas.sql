-- Registro de dudas.
--
-- Existe para decidir con evidencia si hace falta un asistente de IA en el
-- taller. Hoy la ayuda es un texto fijo por bloque; si a las dos sesiones
-- aquí hay cuarenta dudas repetidas sobre el mismo campo, la respuesta
-- correcta puede ser reescribir ese texto y no montar un asistente. Y si
-- las dudas son abiertas y distintas entre sí, ahí sí el asistente se
-- justifica — con la lista real de preguntas para construirlo bien.
--
-- Se guarda aparte de `comentarios` a propósito: un comentario es
-- retroalimentación sobre lo hecho, una duda es una pregunta sin responder.
-- Mezclarlas obligaría a filtrar por un campo de tipo en cada consulta y
-- haría ambigua la única métrica que importa aquí: cuántas siguen abiertas.

create table dudas (
  id          uuid primary key default gen_random_uuid(),
  bitacora_id uuid not null references bitacoras on delete cascade,
  -- Null cuando se anota desde el tablero, sin un taller abierto.
  taller_id   uuid references talleres on delete set null,
  -- El bloque donde se atascó, cuando se puede saber.
  bloque_id   text,
  cuerpo      text not null check (length(btrim(cuerpo)) > 0),
  autor_id    uuid not null references perfiles on delete cascade,
  estado      text not null default 'abierta' check (estado in ('abierta', 'resuelta')),
  creado_at   timestamptz not null default now()
);

create index on dudas (bitacora_id, taller_id);
create index on dudas (estado, creado_at);

alter table dudas enable row level security;

-- El equipo de la empresa ve y escribe las suyas.
create policy dudas_empresa_lee on dudas for select
  to authenticated using (
    exists (select 1 from bitacoras b
            where b.id = dudas.bitacora_id
              and b.empresa_id in (select app.empresas_del_usuario()))
  );

create policy dudas_empresa_escribe on dudas for insert
  to authenticated with check (
    autor_id = auth.uid()
    and exists (select 1 from bitacoras b
                where b.id = bitacora_id
                  and b.empresa_id in (select app.empresas_del_usuario()))
  );

-- Quien la escribió puede corregirla o borrarla; nadie más de la empresa.
create policy dudas_autor_edita on dudas for update
  to authenticated
  using  (autor_id = auth.uid())
  with check (autor_id = auth.uid());

create policy dudas_autor_borra on dudas for delete
  to authenticated using (autor_id = auth.uid());

-- El facilitador las lee: son el insumo de su sesión. No las escribe.
create policy dudas_facilitador_lee on dudas for select
  to authenticated using (
    exists (select 1 from bitacoras b
            where b.id = dudas.bitacora_id
              and b.empresa_id in (select app.empresas_de_mis_cohortes()))
  );
