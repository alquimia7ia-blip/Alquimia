/**
 * Recuperación de contraseña: lo que se puede decidir sin navegador ni red.
 *
 * Vive aparte de las pantallas por dos razones. La primera es que se puede
 * probar: el recorrido completo —pedir el correo, abrir el enlace, escribir
 * la clave nueva— solo se ejerce de verdad con un buzón y un servidor, y lo
 * que sí se puede fijar en una prueba son las decisiones, que es donde
 * estaban los errores.
 *
 * La segunda es que **el mensaje de error es la función**. Un enlace de
 * recuperación falla por media docena de causas distintas y cada una pide una
 * acción distinta de quien lo abrió: pedir otro correo, abrirlo en el mismo
 * navegador, o escribir una contraseña diferente. Decirle «este enlace ya no
 * sirve» a quien abrió un enlace perfectamente válido en el celular lo deja
 * pidiendo correos nuevos que fallarán igual.
 */

/** Lo que trae la URL a la que Supabase devuelve al navegador. */
export type ParametrosEnlace = {
  /** Token de un solo uso, con `type`. Funciona desde cualquier dispositivo. */
  token_hash?: string | null;
  /** Código PKCE. Solo sirve en el navegador que pidió el correo. */
  code?: string | null;
  /** `recovery`, `invite`, `signup`, `email_change`… */
  type?: string | null;
  error?: string | null;
  error_code?: string | null;
  error_description?: string | null;
  /** A dónde seguir después de canjear. Se valida: solo rutas internas. */
  siguiente?: string | null;
};

/** Pantalla donde termina cada clase de enlace. */
export const DESTINOS = {
  recuperacion: "/clave-nueva",
  invitacion: "/invitacion",
  entrar: "/entrar",
} as const;

/**
 * A dónde mandar el navegador según el tipo de enlace.
 *
 * `siguiente` se acepta solo si es una ruta interna: con `//` o con esquema
 * sería una redirección abierta, y un enlace de confirmación es justo el
 * sitio donde una redirección abierta se puede usar para robar la sesión.
 */
export function destinoDelEnlace(p: ParametrosEnlace): string {
  const propuesto = p.siguiente ?? "";
  if (propuesto.startsWith("/") && !propuesto.startsWith("//")) return propuesto;
  if (p.type === "recovery") return DESTINOS.recuperacion;
  if (p.type === "invite" || p.type === "signup") return DESTINOS.invitacion;
  return DESTINOS.entrar;
}

/** Códigos que Supabase usa cuando el enlace ya no vale. */
const CADUCADO = ["otp_expired", "token_expired", "flow_state_expired"];

/**
 * Lo mismo, dicho en prosa. Supabase no siempre manda código: `verifyOtp`
 * responde «Token has expired or is invalid» y la plantilla de correo pone
 * «Email link is invalid or has expired» en la descripción. Sin esto, un
 * enlace vencido caía en el mensaje genérico.
 */
const CADUCADO_EN_PROSA = /expired|has expired|caduc/;

/**
 * Por qué no se pudo abrir el enlace, en palabras y con la salida.
 *
 * Devuelve `null` cuando no hay nada que reportar, para que la pantalla no
 * tenga que distinguir entre «sin error» y «error vacío».
 */
export function mensajeDeEnlace(p: ParametrosEnlace): string | null {
  const codigo = (p.error_code ?? p.error ?? "").toLowerCase();
  const detalle = (p.error_description ?? "").toLowerCase();
  if (!codigo && !detalle) return null;

  if (CADUCADO.some((c) => codigo.includes(c)) || CADUCADO_EN_PROSA.test(detalle)) {
    return "El enlace ya caducó o se usó. Pide uno nuevo y ábrelo dentro de la hora siguiente.";
  }
  if (codigo.includes("access_denied")) {
    return "El enlace no es válido. Pide uno nuevo desde «¿Olvidaste la contraseña?».";
  }
  return "No se pudo abrir el enlace. Pide uno nuevo y, si vuelve a fallar, avísanos.";
}

/**
 * Por qué falló el canje en el servidor.
 *
 * El caso que importa es el del verificador PKCE ausente: el enlace es bueno,
 * pero se abrió en un navegador distinto al que pidió el correo —lo normal,
 * porque el correo se lee en el celular y la clave se pidió en el
 * computador—. Llamarlo «enlace vencido» manda a repetir lo que ya falló.
 */
export function mensajeDeCanje(mensaje: string): string {
  const m = mensaje.toLowerCase();
  if (/code verifier|flow state|pkce/.test(m)) {
    return "Este enlace solo funciona en el mismo navegador donde pediste el correo. "
      + "Pide uno nuevo desde el dispositivo en el que vas a abrirlo, o copia el enlace "
      + "del correo y pégalo en ese navegador.";
  }
  if (CADUCADO.some((c) => m.includes(c)) || CADUCADO_EN_PROSA.test(m)) {
    return "El enlace ya caducó o se usó. Pide uno nuevo y ábrelo dentro de la hora siguiente.";
  }
  return "No se pudo validar el enlace. Pide uno nuevo desde «¿Olvidaste la contraseña?».";
}

/**
 * Por qué no se pudo enviar el correo, cuando hay que decirlo.
 *
 * Devuelve `null` cuando lo correcto es responder «revisa tu correo» aunque
 * haya error: si la cuenta no existe, decirlo revelaría quién participa en el
 * programa. El límite de envíos es la excepción —el correo no va a llegar y
 * callarlo deja a la persona esperando— y también el error de red, porque
 * reintentar sí cambia el resultado.
 */
export function mensajeDeEnvio(error: { code?: string; status?: number; message: string }): string | null {
  const codigo = (error.code ?? "").toLowerCase();
  const m = error.message.toLowerCase();

  if (codigo.includes("rate_limit") || error.status === 429 || /rate limit|too many/.test(m)) {
    return "Ya se enviaron varios enlaces a ese correo. Espera unos minutos antes de pedir otro; "
      + "el último que recibiste sigue sirviendo.";
  }
  if (/failed to fetch|network|load failed/.test(m)) {
    return "No hay conexión con el servidor. Revisa tu red y vuelve a intentarlo.";
  }
  return null;
}

/** Mínimo de caracteres. El mismo que exige el registro. */
export const MINIMO_CLAVE = 8;

/**
 * Qué le falta a la contraseña nueva, antes de molestar al servidor.
 *
 * Devuelve `null` cuando está bien. Comprobarlo aquí no es cosmético: el
 * viaje de ida y vuelta para oír «muy corta» tarda y, si la sesión del
 * enlace venció mientras tanto, el error que llega es otro y confunde.
 */
export function problemaDeClave(clave: string, repetida: string): string | null {
  if (clave.length < MINIMO_CLAVE) {
    return `La contraseña necesita al menos ${MINIMO_CLAVE} caracteres.`;
  }
  if (clave !== repetida) return "Las dos contraseñas no coinciden.";
  return null;
}

/** Por qué el servidor rechazó la contraseña nueva. */
export function mensajeDeGuardado(error: { code?: string; message: string }): string {
  const codigo = (error.code ?? "").toLowerCase();
  const m = error.message.toLowerCase();

  if (codigo === "same_password" || /different from the old password/.test(m)) {
    return "Esa es la contraseña que ya tenías. Escribe una distinta.";
  }
  if (codigo === "weak_password" || /weak|pwned|password should/.test(m)) {
    return "Esa contraseña es demasiado fácil de adivinar. Usa una más larga o con más variedad.";
  }
  // Sin sesión no hay a quién cambiarle la clave: el enlace expiró mientras
  // la persona escribía, y el remedio es pedir otro, no escribir otra clave.
  if (codigo === "session_not_found" || /jwt|session|not authenticated|auth session/.test(m)) {
    return "La sesión del enlace venció mientras escribías. Pide un enlace nuevo.";
  }
  return `No se pudo guardar la contraseña: ${error.message}`;
}
