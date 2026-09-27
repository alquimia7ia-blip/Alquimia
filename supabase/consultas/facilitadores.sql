-- Quién acompaña cada cohorte.
--
-- El panel `/cohorte` solo lo ve quien figure aquí. Sin una fila en esta
-- tabla nadie ve las bitácoras de las empresas, por mucho que sea dueño del
-- proyecto: el permiso vive en la base, no en el código.
--
-- Dar este permiso es dejar que alguien lea las finanzas de todas las
-- empresas de esa cohorte. No es un rol administrativo menor.

-- 0 · Cómo se crea un facilitador.
--
--    No hay «cuenta de facilitador»: es un permiso sobre una cuenta normal.
--    a) La persona se registra en /registro como cualquiera.
--    b) NO elige empresa. Si lo hiciera quedaría inscrita en la cohorte y
--       aparecería como participante de su propio programa.
--    c) Se le añade la fila de abajo. Desde ese momento /cohorte es su
--       pantalla de inicio.
--
--    Quien ya tiene empresa también puede facilitar: verá su bitácora y,
--    además, el panel. Es el caso de quien dirige el programa y participa.

-- 1 · Quién facilita hoy.
select p.nombre_completo, p.correo, c.nombre as cohorte, f.rol, f.creado_at
from facilitadores_cohorte f
join perfiles p on p.id = f.perfil_id
join cohortes c on c.id = f.cohorte_id
order by c.nombre, p.nombre_completo;

-- 2 · Nombrar facilitador. Reemplazar el correo y el nombre de la cohorte.
insert into facilitadores_cohorte (perfil_id, cohorte_id, rol)
select p.id, c.id, 'facilitador'
from perfiles p, cohortes c
where p.correo = 'PON_AQUI_EL_CORREO'
  and c.nombre = 'MEGA 2026-1'
on conflict (perfil_id, cohorte_id) do nothing;

-- 3 · Quitar el permiso. La persona deja de ver el panel de inmediato.
delete from facilitadores_cohorte f
using perfiles p, cohortes c
where f.perfil_id = p.id and f.cohorte_id = c.id
  and p.correo = 'PON_AQUI_EL_CORREO'
  and c.nombre = 'MEGA 2026-1';

-- 4 · Quién ha leído bitácoras ajenas. Solo un administrador de plataforma
--     puede consultarlo desde la aplicación; aquí se ve con acceso directo.
select a.ocurrido_at, p.nombre_completo as leyo, a.recurso, a.metadatos
from auditoria_acceso a
left join perfiles p on p.id = a.actor_id
where a.accion = 'leer_bitacora'
order by a.ocurrido_at desc
limit 50;
