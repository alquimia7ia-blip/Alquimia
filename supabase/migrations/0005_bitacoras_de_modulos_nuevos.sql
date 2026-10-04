-- Bitácoras para módulos publicados después de que la empresa ya se inscribió.
--
-- `app.unirse_a_empresa` crea una bitácora por módulo publicado, pero solo en
-- el momento de crear la empresa. Cuando se publica un módulo nuevo —el 2 con
-- «Dirección estratégica», mañana el 3 y el 4— las empresas que ya estaban
-- dentro se quedarían sin bitácora y verían el módulo vacío.
--
-- Esto rellena lo que falte. Es idempotente: se puede volver a correr después
-- de publicar cada módulo sin duplicar nada.

-- 1. Una bitácora por empresa inscrita y módulo publicado.
insert into bitacoras (empresa_id, modulo_id, cohorte_id)
select i.empresa_id, m.id, i.cohorte_id
from inscripciones i
join cohortes c on c.id = i.cohorte_id
join programas p on p.id = c.programa_id
join modulos m on m.programa_id = p.id and m.publicado
on conflict (empresa_id, modulo_id, cohorte_id) do nothing;

-- 2. Las filas que la definición pide al abrir (las tablas con filasIniciales).
--    El `not exists` mira por bloque, no por fila: si la empresa ya trabajó
--    ese bloque no se le agrega nada.
insert into filas (bitacora_id, taller_id, bloque_id, orden, creada_por)
select b.id, t.id, bl->>'id', g.i,
       (select mb.perfil_id from membresias mb
        where mb.empresa_id = b.empresa_id and mb.rol = 'propietario' and mb.estado = 'activa'
        limit 1)
from bitacoras b
join talleres t on t.modulo_id = b.modulo_id and t.publicado
cross join lateral jsonb_array_elements(t.definicion->'secciones') s
cross join lateral jsonb_array_elements(s->'bloques') bl
cross join lateral generate_series(0, (bl->>'filasIniciales')::int - 1) g(i)
where bl ? 'filasIniciales'
  and not exists (
    select 1 from filas f
    where f.bitacora_id = b.id and f.taller_id = t.id and f.bloque_id = bl->>'id'
  );

-- 3. Encabezados de columna editables (los años del Taller 8 del Módulo 1).
insert into respuestas (bitacora_id, taller_id, campo_id, valor, actualizado_por)
select b.id, t.id, (bl->>'id') || '.encabezados.' || (col->>'id'),
       to_jsonb(col->>'valorPorDefecto'),
       (select mb.perfil_id from membresias mb
        where mb.empresa_id = b.empresa_id and mb.rol = 'propietario' and mb.estado = 'activa'
        limit 1)
from bitacoras b
join talleres t on t.modulo_id = b.modulo_id and t.publicado
cross join lateral jsonb_array_elements(t.definicion->'secciones') s
cross join lateral jsonb_array_elements(s->'bloques') bl
cross join lateral jsonb_array_elements(coalesce(bl->'columnasEditables', '[]'::jsonb)) col
on conflict (bitacora_id, campo_id) do nothing;
