-- Valoración del módulo por parte de la empresa.
--
-- Tres preguntas al cerrar: qué funcionó, qué no, qué mejorarían. Es la
-- contraparte de `dudas`: aquella mide qué no se entendió del contenido,
-- esta mide qué tal estuvo el taller como experiencia. Separadas porque se
-- responden en momentos distintos y las lee gente distinta — la duda la
-- atiende el profesor en la próxima sesión, la valoración la usa quien
-- rediseña el programa para la siguiente cohorte.
--
-- Una por bitácora y por persona: el cierre se responde una vez, pero cada
-- integrante del equipo tiene su propia opinión y ninguna debe pisar la otra.

create table valoraciones (
  id          uuid primary key default gen_random_uuid(),
  bitacora_id uuid not null references bitacoras on delete cascade,
  autor_id    uuid not null references perfiles on delete cascade,
  -- Las tres preguntas. Ninguna obligatoria: media respuesta sincera vale
  -- más que tres campos llenados por salir del paso.
  gusto       text,
  falto       text,
  mejoraria   text,
  creado_at   timestamptz not null default now(),
  unique (bitacora_id, autor_id)
);

create index on valoraciones (bitacora_id);

alter table valoraciones enable row level security;

-- El equipo de la empresa ve las de su bitácora.
create policy valoraciones_empresa_lee on valoraciones for select
  to authenticated using (
    exists (select 1 from bitacoras b
            where b.id = valoraciones.bitacora_id
              and b.empresa_id in (select app.empresas_del_usuario()))
  );

-- Cada quien escribe y corrige la suya, nadie la de otro.
create policy valoraciones_autor_escribe on valoraciones for insert
  to authenticated with check (
    autor_id = auth.uid()
    and exists (select 1 from bitacoras b
                where b.id = bitacora_id
                  and b.empresa_id in (select app.empresas_del_usuario()))
  );

create policy valoraciones_autor_edita on valoraciones for update
  to authenticated
  using  (autor_id = auth.uid())
  with check (autor_id = auth.uid());

-- El facilitador las lee: son el insumo para rediseñar el módulo.
create policy valoraciones_facilitador_lee on valoraciones for select
  to authenticated using (
    exists (select 1 from bitacoras b
            where b.id = valoraciones.bitacora_id
              and b.empresa_id in (select app.empresas_de_mis_cohortes()))
  );
