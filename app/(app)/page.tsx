import { redirect } from "next/navigation";
import type { Route } from "next";
import { clienteServidor } from "@/lib/supabase/servidor";

/**
 * Lleva a cada quien a donde le sirve entrar.
 *
 * Son tres caminos, y distinguirlos importa: quien tiene bitácora va a su
 * módulo; quien solo acompaña el programa va al panel de la cohorte; quien
 * todavía no dijo a qué empresa pertenece va a decirlo.
 */
export default async function Inicio() {
  const supabase = await clienteServidor();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  // Las bitácoras propias, no las que se pueden leer. Un facilitador ve
  // también las de su cohorte, y sin este filtro acabaría redirigido al
  // módulo de otra empresa —y allí, en una pantalla de «sin bitácora»—.
  const { data: mias } = await supabase
    .from("membresias")
    .select("empresa_id")
    .eq("perfil_id", user.id)
    .eq("estado", "activa");
  const propias = (mias ?? []).map((m) => m.empresa_id as string);

  if (propias.length > 0) {
    const { data: bitacoras } = await supabase
      .from("bitacoras")
      .select("modulo_id, estado, modulos(slug, numero)")
      .in("empresa_id", propias)
      .order("creado_at", { ascending: true });

    const enCurso = bitacoras?.find((b) => b.estado === "en_curso") ?? bitacoras?.[0];
    const modulo = enCurso?.modulos as unknown as { slug: string } | undefined;
    // El slug sale de la base y corresponde a /[moduloSlug].
    if (modulo) redirect(`/${modulo.slug}` as Route);
  }

  // Sin bitácora propia, pero acompañando el programa: el panel es su casa.
  // Mandar a un tutor a «di a qué empresa perteneces» lo empujaría a crear
  // una empresa falsa y a aparecer como participante de su propia cohorte.
  const { count: facilita } = await supabase
    .from("facilitadores_cohorte")
    .select("id", { count: "exact", head: true })
    .eq("perfil_id", user.id);
  if ((facilita ?? 0) > 0) redirect("/cohorte" as Route);

  // Quedan dos casos y la pantalla de empresa los distingue: quien todavía no
  // dijo a qué empresa pertenece, y quien lo dijo y espera que lo acepten.
  redirect("/empresa" as Route);
}
