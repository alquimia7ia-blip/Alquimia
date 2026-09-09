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

  if (!modulo) {
    return (
      <div className="portada">
        <div className="tarjeta-sesion">
          <h1>Todavía no hay nada que diligenciar</h1>
          <p className="sub">
            Tu cuenta no está asociada a ninguna bitácora. Escríbele a quien coordina el
            programa para que te vincule a tu empresa y a la cohorte.
          </p>
        </div>
      </div>
    );
  }
  // El slug sale de la base y corresponde a /[moduloSlug].
  redirect(`/${modulo.slug}` as Route);
}
