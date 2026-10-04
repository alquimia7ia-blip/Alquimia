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

-- El correo no está en `perfiles`: lo guarda `auth.users`, y `perfiles.id`
-- es la misma clave. De ahí el join con auth.users en todo este archivo.
-- Estas consultas piden acceso directo a la base (editor SQL de Supabase);
-- el esquema `auth` no se expone por la API.

-- 1 · Quién facilita hoy.
select p.nombre_completo, u.email, c.nombre as cohorte, f.rol, f.creado_at
from facilitadores_cohorte f
join perfiles p on p.id = f.perfil_id
join auth.users u on u.id = p.id
join cohortes c on c.id = f.cohorte_id
order by c.nombre, u.email;

-- 2 · Nombrar facilitador. Reemplazar el correo y el nombre de la cohorte.
insert into facilitadores_cohorte (perfil_id, cohorte_id, rol)
select u.id, c.id, 'facilitador'
from auth.users u, cohortes c
where u.email = 'PON_AQUI_EL_CORREO'
  and c.nombre = 'MEGA 2026-1'
on conflict (perfil_id, cohorte_id) do nothing;

-- 3 · Quitar el permiso. La persona deja de ver el panel de inmediato.
delete from facilitadores_cohorte f
using auth.users u, cohortes c
where f.perfil_id = u.id and f.cohorte_id = c.id
  and u.email = 'PON_AQUI_EL_CORREO'
  and c.nombre = 'MEGA 2026-1';

-- 4 · Quién ha leído bitácoras ajenas. Solo un administrador de plataforma
--     puede consultarlo desde la aplicación; aquí se ve con acceso directo.
select a.ocurrido_at, p.nombre_completo as leyo, a.recurso, a.metadatos
from auditoria_acceso a
left join perfiles p on p.id = a.actor_id
where a.accion = 'leer_bitacora'
order by a.ocurrido_at desc
limit 50;

-- 5 · Lo que se hizo en la cohorte piloto (27 de septiembre de 2026).
--     alquimia7.ia@gmail.com dirige el programa y además participa con
--     ALQUIMIA, así que ve su propio taller y, aparte, el panel con las dos
--     empresas. Aparece en su propia lista de participantes: es correcto,
--     porque su empresa está inscrita.
--
--     insert into facilitadores_cohorte (perfil_id, cohorte_id, rol)
--     select u.id, c.id, 'coordinador'
--     from auth.users u, cohortes c
--     where u.email = 'alquimia7.ia@gmail.com'
--       and c.nombre = 'Piloto ALQUIMIA'
--     on conflict (perfil_id, cohorte_id) do nothing;
