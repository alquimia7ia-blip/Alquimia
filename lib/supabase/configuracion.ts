/**
 * Estado de la configuración de Supabase.
 *
 * Sin las variables de entorno la aplicación no puede funcionar, pero
 * fallar con un 500 sin explicación es la peor manera de decirlo: quien
 * despliega no sabe qué falta. Con esto, la aplicación dice exactamente qué
 * variable no está puesta y dónde ponerla.
 */
export const VARIABLES = [
  {
    nombre: "NEXT_PUBLIC_SUPABASE_URL",
    donde: "Supabase → Project Settings → Data API → Project URL",
    valor: () => process.env.NEXT_PUBLIC_SUPABASE_URL,
  },
  {
    nombre: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    donde: "Supabase → Project Settings → API Keys → anon public",
    valor: () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
] as const;

export function faltantes(): string[] {
  return VARIABLES.filter((v) => !v.valor()).map((v) => v.nombre);
}

export const hayConfiguracion = () => faltantes().length === 0;
