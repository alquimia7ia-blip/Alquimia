-- Abrir el Módulo 5 · Profundización al resto de la cohorte.
--
-- Antes de correr el paso 2, una advertencia que no es técnica: este módulo
-- es contenido de ALQUIMIA, no del programa MEGA de la Cámara. Abrirlo a las
-- empresas de una cohorte de la Cámara es entregarles material propio, y
-- conviene que sea una decisión comercial consciente y no un efecto
-- secundario de correr un script.
--
-- El módulo se sembró publicado pero con bitácora solo para ALQUIMIA, para
-- poder revisarlo con una empresa antes de que lo vean las demás. El selector
-- de módulos del taller sale de las bitácoras propias, no de `modulos`: sin
-- fila en `bitacoras` la empresa no lo ve, aunque el módulo esté publicado.
--
-- Esto es lo que falta para abrirlo a todos. Es lo mismo que hace
-- `0005_bitacoras_de_modulos_nuevos.sql`, y es idempotente.

-- 1 · Quién ve hoy el Módulo 5.
select e.nombre as empresa, b.creado_at
from bitacoras b
join modulos m on m.id = b.modulo_id and m.numero = 5
join empresas e on e.id = b.empresa_id
order by e.nombre;

-- 2 · Abrirlo a todas las empresas inscritas y activas.
insert into bitacoras (empresa_id, modulo_id, cohorte_id)
select i.empresa_id, m.id, i.cohorte_id
from inscripciones i
join cohortes c on c.id = i.cohorte_id
join programas p on p.id = c.programa_id
join modulos m on m.programa_id = p.id and m.numero = 5 and m.publicado
where i.estado = 'activa'
on conflict (empresa_id, modulo_id, cohorte_id) do nothing;

-- 3 · Las filas que la definición pide al abrir. Sin esto las tablas salen
--     sin ninguna fila y la empresa tiene que crearlas a mano.
insert into filas (bitacora_id, taller_id, bloque_id, orden, creada_por)
select b.id, t.id, bl->>'id', g.i,
       (select mb.perfil_id from membresias mb
        where mb.empresa_id = b.empresa_id and mb.rol = 'propietario' and mb.estado = 'activa'
        limit 1)
from bitacoras b
join modulos m on m.id = b.modulo_id and m.numero = 5
join talleres t on t.modulo_id = b.modulo_id and t.publicado
cross join lateral jsonb_array_elements(t.definicion->'secciones') s
cross join lateral jsonb_array_elements(s->'bloques') bl
cross join lateral generate_series(0, (bl->>'filasIniciales')::int - 1) g(i)
where bl ? 'filasIniciales'
  and not exists (
    select 1 from filas f
    where f.bitacora_id = b.id and f.taller_id = t.id and f.bloque_id = bl->>'id'
  );

-- 4 · Cerrarlo otra vez, si hiciera falta. Borra también las respuestas que
--     la empresa haya escrito en ese módulo: no se usa a la ligera.
-- delete from bitacoras b
-- using modulos m, empresas e
-- where b.modulo_id = m.id and m.numero = 5
--   and b.empresa_id = e.id and e.nombre <> 'ALQUIMIA';
