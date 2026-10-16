-- =====================================================================
-- Vistas de progreso
--
-- security_invoker: la vista se evalúa con los permisos de quien la
-- consulta, de modo que hereda las políticas RLS de las tablas base.
-- Sin esto, la vista sería un agujero por el que se vería toda la base.
-- =====================================================================

-- Avance de una bitácora en un taller.
--   resueltos = campos con valor no vacío
--   total     = max(campos_minimos del taller, campos efectivamente creados)
-- Ese max() replica el Math.max(t, 12) que ya usan los talleres 8, 9 y 10
-- del prototipo: una tabla de filas dinámicas tiene un piso de campos
-- esperados aunque el usuario todavía no haya creado las filas.
create view vista_progreso_taller with (security_invoker = on) as
select
  b.id                                                          as bitacora_id,
  b.empresa_id,
  b.cohorte_id,
  b.modulo_id,
  t.id                                                          as taller_id,
  t.numero                                                      as taller_numero,
  t.corto                                                       as taller_corto,
  count(r.*) filter (where app.valor_lleno(r.valor))            as resueltos,
  greatest(t.campos_minimos, count(r.*))                        as total,
  case when greatest(t.campos_minimos, count(r.*)) = 0 then 0
       else round(count(r.*) filter (where app.valor_lleno(r.valor))::numeric
                  / greatest(t.campos_minimos, count(r.*)), 4)
  end                                                           as fraccion,
  max(r.actualizado_at)                                         as ultimo_movimiento
from bitacoras b
join talleres t on t.modulo_id = b.modulo_id and t.publicado
left join respuestas r on r.bitacora_id = b.id and r.taller_id = t.id
group by b.id, b.empresa_id, b.cohorte_id, b.modulo_id,
         t.id, t.numero, t.corto, t.campos_minimos;

-- Avance de una bitácora completa. Alimenta el panel del facilitador.
create view vista_progreso_bitacora with (security_invoker = on) as
select
  bitacora_id,
  empresa_id,
  cohorte_id,
  modulo_id,
  sum(resueltos)                                                as resueltos,
  sum(total)                                                    as total,
  case when sum(total) = 0 then 0
       else round(sum(resueltos)::numeric / sum(total), 4) end  as fraccion,
  count(*) filter (where resueltos >= total and total > 0)       as talleres_completos,
  count(*)                                                       as talleres_totales,
  max(ultimo_movimiento)                                         as ultimo_movimiento
from vista_progreso_taller
group by bitacora_id, empresa_id, cohorte_id, modulo_id;

grant select on vista_progreso_taller, vista_progreso_bitacora to authenticated;
