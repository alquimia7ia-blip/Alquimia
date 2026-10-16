import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { mensajeDeEnlace } from "@/lib/auth/recuperacion";
import { hayConfiguracion } from "./configuracion";

// `/auth` es el canje del enlace del correo y `/clave-nueva` la pantalla a la
// que lleva: las dos tienen que ser públicas o el enlace de recuperación
// rebotaría a `/entrar` justo antes de abrir la sesión que trae.
const PUBLICAS = ["/entrar", "/registro", "/recuperar", "/invitacion", "/estilos",
                  "/auth", "/clave-nueva",
                  "/tablero", "/politica-de-datos", "/configuracion"];

// Rutas que ni siquiera necesitan Supabase: el taller sobre bitácora local,
// el texto de la política y la propia pantalla de configuración. Mandarlas a
// /configuracion dejaba su enlace «Ver el taller funcionando» dando vueltas
// sobre sí mismo, que es justo lo que se ve al abrir un despliegue recién
// hecho y todavía sin base de datos.
const SIN_BASE = ["/configuracion", "/estilos", "/tablero", "/politica-de-datos"];

/**
 * Un enlace de correo que Supabase ya rechazó, aterrice donde aterrice.
 *
 * Cuando el `redirectTo` que pide la aplicación no está en los Redirect URLs
 * autorizados, Supabase lo descarta y manda al **Site URL** del proyecto, con
 * el error en la URL. Si ese Site URL quedó en `localhost:3000`, el enlace
 * cae en una pantalla de «no se puede acceder a este sitio» y la persona no
 * tiene forma de saber por qué.
 *
 * Eso es configuración y se arregla en Supabase (ver `docs/DESPLIEGUE.md`).
 * Lo que sí puede hacer la aplicación es que, si el enlace llega a cualquier
 * ruta suya con el error a cuestas, no se pierda: se recoge y se lleva a la
 * pantalla donde se pide otro.
 */
function avisoDeEnlaceFallido(peticion: NextRequest) {
  const p = peticion.nextUrl.searchParams;
  if (!p.has("error") && !p.has("error_code")) return null;
  if (peticion.nextUrl.pathname.startsWith("/recuperar")) return null;
  return mensajeDeEnlace({
    error: p.get("error"),
    error_code: p.get("error_code"),
    error_description: p.get("error_description"),
  });
}

/** Refresca la sesión y protege las rutas de la aplicación. */
export async function actualizarSesion(peticion: NextRequest) {
  const aviso = avisoDeEnlaceFallido(peticion);
  if (aviso) {
    const destino = peticion.nextUrl.clone();
    destino.search = "";
    destino.pathname = "/recuperar";
    destino.searchParams.set("aviso", aviso);
    return NextResponse.redirect(destino);
  }

  // Sin credenciales no hay sesión que refrescar. En vez de reventar con un
  // 500 opaco, se lleva a la página que dice qué variable falta.
  if (!hayConfiguracion()) {
    if (SIN_BASE.some((r) => peticion.nextUrl.pathname.startsWith(r))) {
      return NextResponse.next({ request: peticion });
    }
    const destino = peticion.nextUrl.clone();
    destino.pathname = "/configuracion";
    return NextResponse.redirect(destino);
  }

  let respuesta = NextResponse.next({ request: peticion });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => peticion.cookies.getAll(),
        setAll: (nuevas: { name: string; value: string; options: CookieOptions }[]) => {
          for (const { name, value } of nuevas) peticion.cookies.set(name, value);
          respuesta = NextResponse.next({ request: peticion });
          for (const { name, value, options } of nuevas) respuesta.cookies.set(name, value, options);
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const ruta = peticion.nextUrl.pathname;
  const esPublica = PUBLICAS.some((p) => ruta.startsWith(p));

  if (!user && !esPublica) {
    const destino = peticion.nextUrl.clone();
    destino.pathname = "/entrar";
    destino.searchParams.set("volver", ruta);
    return NextResponse.redirect(destino);
  }

  return respuesta;
}
