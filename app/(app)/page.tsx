import { redirect } from "next/navigation";
import type { Route } from "next";
import { clienteServidor } from "@/lib/supabase/servidor";

/** Lleva a la persona a su módulo en curso, o al primero publicado. */
export default async function Inicio() {
  const supabase = await clienteServidor();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: bitacoras } = await supabase
    .from("bitacoras")
    .select("modulo_id, estado, modulos(slug, numero)")
    .order("creado_at", { ascending: true });

  const enCurso = bitacoras?.find((b) => b.estado === "en_curso") ?? bitacoras?.[0];
  const modulo = enCurso?.modulos as unknown as { slug: string } | undefined;

  // Sin bitácora visible hay dos casos: quien todavía no dijo a qué empresa
  // pertenece, y quien lo dijo pero espera que lo acepten. La pantalla de
  // empresa distingue los dos; mandar a ambos allí evita el callejón sin
  // salida que había antes.
  if (!modulo) redirect("/empresa" as Route);
  // El slug sale de la base y corresponde a /[moduloSlug].
  redirect(`/${modulo.slug}` as Route);
}
