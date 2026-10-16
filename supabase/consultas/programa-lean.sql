-- Abrir el programa Fábrica Lean a una empresa.
--
-- Fábrica Lean es el segundo programa de la plataforma y vive bajo su propia
-- organización, ALQUIMIA, no bajo la Cámara de Comercio del Aburrá Sur. Esa
-- separación no es cosmética: el contenido del programa MEGA es de la Cámara
-- y no es revendible; el de Fábrica Lean sale de una conferencia de ALQUIMIA
-- sobre herramientas de dominio público, así que se puede vender a cualquier
-- empresa de manufactura. Abrirlo a una cohorte de la Cámara es entregar
-- material propio y conviene que sea una decisión comercial consciente, no el
-- efecto secundario de correr un script.
--
-- Publicar no es abrir. Los cinco módulos se siembran publicados, pero el
-- selector del taller sale de las bitácoras propias y no de `modulos`: sin
-- fila en `bitacoras`, la empresa no ve el programa aunque esté publicado.
--
-- Todo lo de aquí es idempotente.

-- ---------------------------------------------------------------------
-- 1 · Qué hay sembrado
-- ---------------------------------------------------------------------
select o.nombre as organizacion, p.nombre as programa,
       m.numero, m.slug, m.titulo, m.publicado,
       count(t.id) as talleres
from organizaciones o
join programas p on p.organizacion_id = o.id and p.slug = 'fabrica-lean'
join modulos m on m.programa_id = p.id
left join talleres t on t.modulo_id = m.id
group by o.nombre, p.nombre, m.numero, m.slug, m.titulo, m.publicado
order by m.numero;

-- ---------------------------------------------------------------------
-- 2 · La cohorte del programa
-- ---------------------------------------------------------------------
-- Una cohorte por grupo que haga el taller. La bitácora cuelga de la cohorte,
-- así que sin cohorte no hay dónde poner el trabajo de nadie.
insert into cohortes (programa_id, nombre, estado)
select p.id, 'Lean 2026-1', 'activa'
from programas p
join organizaciones o on o.id = p.organizacion_id
where o.slug = 'alquimia' and p.slug = 'fabrica-lean'
  and not exists (
    select 1 from cohortes c where c.programa_id = p.id and c.nombre = 'Lean 2026-1'
  );

-- ---------------------------------------------------------------------
-- 3 · Inscribir una empresa
-- ---------------------------------------------------------------------
-- Cambiar el nombre de la empresa. Una empresa puede estar en los dos
-- programas a la vez: `inscripciones` no exige que la empresa y el programa
-- sean de la misma organización, y el aislamiento entre empresas lo sigue
-- decidiendo RLS, que no mira el programa.
insert into inscripciones (empresa_id, cohorte_id, estado)
select e.id, c.id, 'activa'
from empresas e
join cohortes c on c.nombre = 'Lean 2026-1'
join programas p on p.id = c.programa_id and p.slug = 'fabrica-lean'
where e.nombre = 'ALQUIMIA'
on conflict (empresa_id, cohorte_id) do nothing;

-- ---------------------------------------------------------------------
-- 4 · Crear las bitácoras
-- ---------------------------------------------------------------------
-- Una por (empresa, módulo). Para abrir solo el núcleo y dejar fuera la
-- profundización, agregar `and m.numero <= 4`.
insert into bitacoras (empresa_id, modulo_id, cohorte_id)
select i.empresa_id, m.id, i.cohorte_id
from inscripciones i
join cohortes c on c.id = i.cohorte_id
join programas p on p.id = c.programa_id and p.slug = 'fabrica-lean'
join modulos m on m.programa_id = p.id and m.publicado
where i.estado = 'activa'
on conflict (empresa_id, modulo_id, cohorte_id) do nothing;

-- ---------------------------------------------------------------------
-- 5 · Las filas iniciales de cada tabla
-- ---------------------------------------------------------------------
-- Sin esto las tablas salen sin ninguna fila y la empresa tiene que crearlas
-- a mano antes de poder escribir. Es lo mismo que hace `sembrarBitacora.ts`
-- cuando se carga una cohorte por el importador.
insert into filas (bitacora_id, taller_id, bloque_id, orden, creada_por)
select b.id, t.id, bl->>'id', g.i,
       (select mb.perfil_id from membresias mb
        where mb.empresa_id = b.empresa_id and mb.rol = 'propietario' and mb.estado = 'activa'
        limit 1)
from bitacoras b
join modulos m on m.id = b.modulo_id
join programas p on p.id = m.programa_id and p.slug = 'fabrica-lean'
join talleres t on t.modulo_id = b.modulo_id and t.publicado
cross join lateral jsonb_array_elements(t.definicion->'secciones') s
cross join lateral jsonb_array_elements(s->'bloques') bl
cross join lateral generate_series(0, (bl->>'filasIniciales')::int - 1) g(i)
where bl ? 'filasIniciales'
  and not exists (
    select 1 from filas f
    where f.bitacora_id = b.id and f.taller_id = t.id and f.bloque_id = bl->>'id'
  );

-- ---------------------------------------------------------------------
-- 6 · Quién facilita
-- ---------------------------------------------------------------------
-- El panel de cohorte funciona igual en los dos programas. El correo vive en
-- `auth.users`, no en `perfiles`: `perfiles` no guarda correo a propósito
-- (minimización de datos, Ley 1581).
insert into facilitadores_cohorte (perfil_id, cohorte_id, rol)
select u.id, c.id, 'facilitador'
from auth.users u
join cohortes c on c.nombre = 'Lean 2026-1'
join programas p on p.id = c.programa_id and p.slug = 'fabrica-lean'
where u.email = 'PON_AQUI_EL_CORREO'
on conflict (perfil_id, cohorte_id) do nothing;

-- ---------------------------------------------------------------------
-- 7 · Comprobar
-- ---------------------------------------------------------------------
-- Lo que verá el selector de módulos de cada empresa, por programa. Con dos
-- programas hay dos «Módulo 1», y el selector los agrupa por programa: si
-- esta consulta devuelve los módulos de los dos, es que están bien abiertos.
select e.nombre as empresa, p.nombre as programa, m.numero, m.titulo
from bitacoras b
join empresas e on e.id = b.empresa_id
join modulos m on m.id = b.modulo_id
join programas p on p.id = m.programa_id
order by e.nombre, p.nombre, m.numero;

-- ---------------------------------------------------------------------
-- 8 · Cerrarlo
-- ---------------------------------------------------------------------
-- Borra también las respuestas que se hayan escrito en esos módulos. No se
-- usa a la ligera.
-- delete from bitacoras b
-- using modulos m, programas p
-- where b.modulo_id = m.id and m.programa_id = p.id and p.slug = 'fabrica-lean';
