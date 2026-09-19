/**
 * Enlace a la presentación del módulo.
 *
 * Vive en su propio archivo, sin depender de Next ni de Supabase, para que
 * la comprobación se pueda probar sola: `scripts/verificar-presentacion.mts`.
 */

export type Presentacion = { url: string; etiqueta: string };

const ESQUEMA_SEGURO = /^https?:\/\//i;

/**
 * Deja pasar solo direcciones que un navegador abra como página.
 *
 * La dirección termina en el `href` de un enlace, y un `javascript:` ahí
 * dentro se ejecuta con la sesión de quien lo pulse. La tabla `modulos` ya lo
 * impide con una restricción, y aun así se comprueba aquí: esta es la única
 * puerta por la que el dato entra a la aplicación, así que ningún componente
 * puede saltársela, y si mañana alguien quitara la restricción de la base, el
 * agujero no se abriría solo.
 *
 * Se normaliza con `new URL` para que un `java\nscript:` o un `JavaScript:`
 * —trucos viejos para colarse por una expresión regular— no pasen: si el
 * navegador no lo entiende como dirección, aquí tampoco.
 */
export function presentacionDe(url: unknown, etiqueta: unknown): Presentacion | null {
  if (typeof url !== "string") return null;
  const limpia = url.trim();
  if (!ESQUEMA_SEGURO.test(limpia)) return null;

  let normalizada: URL;
  try {
    normalizada = new URL(limpia);
  } catch {
    return null;
  }
  if (normalizada.protocol !== "http:" && normalizada.protocol !== "https:") return null;

  const texto = typeof etiqueta === "string" ? etiqueta.trim() : "";
  return { url: normalizada.href, etiqueta: texto || "Ver presentación" };
}
