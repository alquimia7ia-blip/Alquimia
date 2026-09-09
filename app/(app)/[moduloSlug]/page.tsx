import { notFound, redirect } from "next/navigation";
import { clienteServidor } from "@/lib/supabase/servidor";
import type { Definicion, Fila, ValorCampo } from "@/lib/talleres/tipos";
import { Bitacora } from "./Bitacora";

/**
 * Carga la bitácora del módulo.
 *
 * Todo lo que se lee aquí pasa por RLS: si la consulta no trae una empresa,
 * es porque esta persona no tiene por qué verla. No hace falta filtrar a mano
 * por empresa_id, y de hecho es mejor no hacerlo: el filtro está en la base.
 */
export default async function PaginaModulo({
  params,
}: { params: Promise<{ moduloSlug: string }> }) {
  const { moduloSlug } = await params;
  const supabase = await clienteServidor();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: modulo } = await supabase
    .from("modulos")
    .select("id, numero, slug, titulo, pregunta")
    .eq("slug", moduloSlug)
    .maybeSingle();
  if (!modulo) notFound();

  const { data: bitacora } = await supabase
    .from("bitacoras")
    .select("id, empresa_id, estado, empresas(nombre)")
    .eq("modulo_id", modulo.id)
    .maybeSingle();

  if (!bitacora) {
    return (
      <div className="portada">
        <div className="tarjeta-sesion">
          <h1>Este módulo no está abierto para tu empresa</h1>
          <p className="sub">
            Puede que todavía no haya empezado, o que tu cuenta no esté vinculada a la
            cohorte. Quien coordina el programa puede revisarlo.
          </p>
        </div>
      </div>
    );
  }

  const [{ data: talleres }, { data: respuestas }, { data: filas }] = await Promise.all([
    supabase.from("talleres")
      .select("id, numero, slug, corto, titulo, lead, definicion, campos_minimos")
      .eq("modulo_id", modulo.id).order("numero"),
    supabase.from("respuestas").select("campo_id, valor").eq("bitacora_id", bitacora.id),
    supabase.from("filas").select("id, bloque_id, taller_id, orden")
      .eq("bitacora_id", bitacora.id).is("eliminada_at", null),
  ]);

  const empresa = bitacora.empresas as unknown as { nombre: string } | null;

  return (
    <Bitacora
      bitacoraId={bitacora.id}
      perfilId={user.id}
      empresa={empresa?.nombre ?? ""}
      moduloTitulo={`Módulo ${modulo.numero} · ${modulo.pregunta}`}
      talleres={(talleres ?? []).map((t) => ({
        id: t.id, numero: t.numero, slug: t.slug, corto: t.corto,
        titulo: t.titulo, lead: t.lead ?? "",
        definicion: t.definicion as Definicion,
        camposMinimos: t.campos_minimos,
      }))}
      respuestas={Object.fromEntries(
        (respuestas ?? []).map((r) => [r.campo_id, r.valor as ValorCampo]),
      )}
      filas={(filas ?? []).map((f): Fila => ({
        id: f.id, bloqueId: f.bloque_id, tallerId: f.taller_id, orden: Number(f.orden),
      }))}
    />
  );
}
