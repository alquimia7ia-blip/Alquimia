-- Las dudas de la cohorte, agrupadas.
--
-- Es la consulta que decide si hace falta un asistente de IA en el taller:
-- si las mismas tres preguntas se repiten sobre el mismo bloque, lo que hay
-- que arreglar es el texto de ayuda de ese bloque. Si son muchas y todas
-- distintas, el asistente se justifica — y esta lista es su material.
--
-- Se pega en el editor SQL del panel de Supabase.

-- 1 · Dónde se atasca la gente, de mayor a menor.
select m.numero              as modulo,
       t.numero              as taller,
       t.corto,
       count(*)              as dudas,
       count(*) filter (where d.estado = 'abierta') as abiertas,
       count(distinct d.bitacora_id)                as empresas
from dudas d
left join talleres t on t.id = d.taller_id
left join modulos  m on m.id = t.modulo_id
group by m.numero, t.numero, t.corto
order by dudas desc;

-- 2 · Las dudas en crudo, que es lo que un profesor necesita leer.
select coalesce(t.corto, 'Del módulo') as taller,
       e.nombre                        as empresa,
       d.cuerpo,
       d.estado,
       d.creado_at::date               as fecha
from dudas d
join bitacoras b on b.id = d.bitacora_id
join empresas  e on e.id = b.empresa_id
left join talleres t on t.id = d.taller_id
order by d.creado_at desc;
