-- Enlace a la presentación del módulo.
--
-- Cada cámara presenta su programa donde ya lo tiene: una carpeta de Drive,
-- un video de YouTube, un diseño de Canva, su propio sitio. En vez de
-- adivinar el proveedor, se guarda la dirección y el taller abre un botón.
--
-- La restricción no es decorativa. Esta dirección termina en el `href` de un
-- enlace, y un `javascript:` ahí dentro se ejecuta con la sesión de quien lo
-- pulse. Que el esquema solo acepte http o https significa que ningún código
-- de la aplicación puede olvidarse de comprobarlo: no hay forma de guardar
-- algo peligroso, aunque alguien escriba directo contra la tabla.
alter table modulos
  add column if not exists presentacion_url text,
  add column if not exists presentacion_etiqueta text;

alter table modulos
  drop constraint if exists modulos_presentacion_url_http;

alter table modulos
  add constraint modulos_presentacion_url_http
  check (presentacion_url is null or presentacion_url ~* '^https?://[^[:space:]]+$');

comment on column modulos.presentacion_url is
  'Dirección de la presentación del módulo. Solo http o https, por seguridad.';
comment on column modulos.presentacion_etiqueta is
  'Texto del botón. Si está vacío, el taller muestra «Ver presentación».';
