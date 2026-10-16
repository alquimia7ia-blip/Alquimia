-- Enlace a la presentación de cada módulo.
--
-- El botón «Ver presentación» aparece en el taller y en las conclusiones solo
-- si el módulo tiene dirección. Sin dirección, no hay botón: ningún módulo
-- queda con un enlace roto.
--
-- La dirección puede ser la que sea —Drive, YouTube, Canva, el sitio de la
-- cámara— con una única condición: que empiece por http o https. La tabla
-- rechaza cualquier otra cosa, y no es un capricho: un `javascript:` en ese
-- campo se ejecutaría con la sesión de quien pulsara el botón.

-- 1 · Ver cómo está hoy.
select numero, slug, titulo,
       coalesce(presentacion_url, '— sin presentación —') as presentacion,
       coalesce(presentacion_etiqueta, 'Ver presentación') as boton
from modulos
order by numero;

-- 2 · Poner la presentación de un módulo.
--     La etiqueta es opcional: si se deja nula, el botón dice «Ver presentación».
update modulos
   set presentacion_url = 'https://docs.google.com/presentation/d/PON_AQUI_EL_ID/edit',
       presentacion_etiqueta = null
 where slug = 'donde';

-- Con un texto propio, cuando ayuda a saber qué se va a abrir:
--   set presentacion_etiqueta = 'Ver el video del módulo'
--   set presentacion_etiqueta = 'Diapositivas de la sesión'

-- 3 · Quitarla. El botón desaparece.
update modulos set presentacion_url = null, presentacion_etiqueta = null
 where slug = 'donde';

-- 4 · Comprobar que la tabla rechaza lo peligroso. Debe fallar con
--     «violates check constraint "modulos_presentacion_url_http"».
-- update modulos set presentacion_url = 'javascript:alert(1)' where slug = 'donde';
