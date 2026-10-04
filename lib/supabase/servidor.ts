import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Cliente de servidor, atado a las cookies de sesión de la petición. */
export async function clienteServidor() {
  const almacen = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => almacen.getAll(),
        setAll: (nuevas: { name: string; value: string; options: CookieOptions }[]) => {
          try {
            for (const { name, value, options } of nuevas) almacen.set(name, value, options);
          } catch {
            // Llamado desde un Server Component: el middleware ya refresca la
            // sesión, así que no pasa nada.
          }
        },
      },
    },
  );
}

/**
 * Cliente con la clave de servicio: SALTA RLS.
 *
 * Solo para scripts y rutas de servidor que deban actuar por encima de las
 * políticas (crear cuentas de una cohorte, aceptar una invitación). Nunca
 * debe alcanzar el navegador.
 */
export function clienteServicio() {
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!clave) throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY");
  const { createClient } = require("@supabase/supabase-js") as typeof import("@supabase/supabase-js");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, clave, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
