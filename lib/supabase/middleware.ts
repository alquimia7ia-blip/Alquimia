import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hayConfiguracion } from "./configuracion";

const PUBLICAS = ["/entrar", "/recuperar", "/invitacion", "/estilos",
                  "/politica-de-datos", "/configuracion"];

// Rutas que ni siquiera necesitan Supabase: el taller sobre bitácora local,
// el texto de la política y la propia pantalla de configuración. Mandarlas a
// /configuracion dejaba su enlace «Ver el taller funcionando» dando vueltas
// sobre sí mismo, que es justo lo que se ve al abrir un despliegue recién
// hecho y todavía sin base de datos.
const SIN_BASE = ["/configuracion", "/estilos", "/politica-de-datos"];

/** Refresca la sesión y protege las rutas de la aplicación. */
export async function actualizarSesion(peticion: NextRequest) {
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
