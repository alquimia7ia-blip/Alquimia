import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  destinoDelEnlace, mensajeDeCanje, mensajeDeEnlace,
} from "@/lib/auth/recuperacion";

/**
 * Canje del enlace que llega por correo, en el servidor.
 *
 * Antes no existía: el enlace iba directo a una pantalla y el canje lo hacía
 * el cliente del navegador al cargarse. Eso funciona en un solo caso —que el
 * correo se abra en el mismo navegador que pidió el enlace— y falla en el
 * caso normal, que es pedir la recuperación en el computador y abrir el
 * correo en el celular. El cliente de `@supabase/ssr` usa PKCE: el
 * verificador queda guardado en el navegador que lo pidió, así que en el otro
 * dispositivo el canje devuelve error y la pantalla anunciaba «este enlace ya
 * no sirve» sobre un enlace perfectamente válido.
 *
 * Aquí se canjea de dos formas y por ese orden:
 *
 *  1. `token_hash` + `type` con `verifyOtp`. **No necesita verificador**, así
 *     que funciona desde cualquier dispositivo. Es la vía buena, y exige que
 *     la plantilla de correo de Supabase use `{{ .TokenHash }}`
 *     (ver `docs/DESPLIEGUE.md`).
 *  2. `code` con `exchangeCodeForSession`, para las plantillas que todavía
 *     mandan el código PKCE. Sigue atado al navegador de origen, pero al
 *     menos el error que produce se traduce a una instrucción útil.
 *
 * Si no llega ninguno de los dos, no es un fallo: la plantilla implícita
 * manda la sesión en el fragmento (`#access_token=…`), que nunca viaja al
 * servidor. En ese caso esta ruta solo redirige y la pantalla de destino lo
 * resuelve en el navegador, como antes.
 */
export async function GET(peticion: NextRequest) {
  const p = peticion.nextUrl.searchParams;
  const parametros = {
    token_hash: p.get("token_hash"),
    code: p.get("code"),
    type: p.get("type"),
    error: p.get("error"),
    error_code: p.get("error_code"),
    error_description: p.get("error_description"),
    siguiente: p.get("siguiente"),
  };

  const destino = peticion.nextUrl.clone();
  destino.search = "";
  destino.pathname = destinoDelEnlace(parametros);

  const fallar = (motivo: string) => {
    // El aviso se muestra donde se puede actuar sobre él: la pantalla que
    // vuelve a pedir el correo.
    const vuelta = peticion.nextUrl.clone();
    vuelta.search = "";
    vuelta.pathname = "/recuperar";
    vuelta.searchParams.set("aviso", motivo);
    return NextResponse.redirect(vuelta);
  };

  // Supabase ya rechazó el enlace antes de devolverlo: no hay nada que canjear.
  const yaFallo = mensajeDeEnlace(parametros);
  if (yaFallo) return fallar(yaFallo);

  if (!parametros.token_hash && !parametros.code) {
    return NextResponse.redirect(destino);
  }

  let respuesta = NextResponse.redirect(destino);
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => peticion.cookies.getAll(),
        setAll: (nuevas: { name: string; value: string; options: CookieOptions }[]) => {
          for (const { name, value, options } of nuevas) {
            respuesta.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const { error } = parametros.token_hash
    ? await supabase.auth.verifyOtp({
        token_hash: parametros.token_hash,
        // `verifyOtp` necesita el tipo; si el enlace no lo trae, el caso
        // abrumadoramente mayoritario de un correo con token es la
        // recuperación, y un tipo equivocado falla limpio sin abrir sesión.
        type: (parametros.type as "recovery" | "invite" | "signup" | "email") ?? "recovery",
      })
    : await supabase.auth.exchangeCodeForSession(parametros.code!);

  if (error) return fallar(mensajeDeCanje(error.message));

  // La sesión quedó abierta en las cookies de `respuesta`. Para una
  // recuperación eso es correcto y es lo que permite `updateUser`: la clave
  // nueva se escribe autenticado por el enlace.
  return respuesta;
}
