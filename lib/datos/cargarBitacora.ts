import { clienteServidor } from "@/lib/supabase/servidor";
import type { TallerVista } from "@/components/bitacora/VistaModulo";
import { camposEsperados, progresoTaller, progresoModulo } from "@/lib/talleres/progreso";
import type { Definicion, Fila, ValorCampo } from "@/lib/talleres/tipos";

/**
 * Carga la bitácora de un módulo para quien esté en sesión.
 *
 * Vive aparte porque la usan el taller y el tablero de conclusiones. Si cada
 * uno hiciera sus propias consultas, bastaría con que una olvidara un campo
 * para que el tablero concluyera sobre datos distintos a los que la empresa
 * ve en pantalla — y esa discrepancia no daría ningún error, solo
 * conclusiones equivocadas.
 *
 * Todo pasa por RLS: si la consulta no devuelve bitácora es porque esta
 * persona no tiene por qué verla. No se filtra a mano por empresa_id, y es
 * mejor así: el filtro vive en la base y no en cada consulta.
 */

export type BitacoraCargada = {
  bitacoraId: string;
  empresa: string;
  moduloTitulo: string;
  moduloSlug: string;
  talleres: TallerVista[];
  respuestas: Map<string, ValorCampo>;
  filas: Fila[];
};

export type Carga =
  | { estado: "sin-sesion" }
  | { estado: "sin-modulo" }
  | { estado: "sin-bitacora" }
  | { estado: "ok"; datos: BitacoraCargada; perfilId: string };

export async function cargarBitacora(moduloSlug: string): Promise<Carga> {
  const supabase = await clienteServidor();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { estado: "sin-sesion" };

  const { data: modulo } = await supabase
    .from("modulos")
    .select("id, numero, slug, titulo, pregunta")
    .eq("slug", moduloSlug)
    .maybeSingle();
  if (!modulo) return { estado: "sin-modulo" };

  const { data: bitacora } = await supabase
    .from("bitacoras")
    .select("id, empresa_id, estado, empresas(nombre)")
    .eq("modulo_id", modulo.id)
    .maybeSingle();
  if (!bitacora) return { estado: "sin-bitacora" };

  const [{ data: talleres }, { data: respuestas }, { data: filas }] = await Promise.all([
    supabase.from("talleres")
      .select("id, numero, slug, corto, titulo, lead, definicion, campos_minimos")
      .eq("modulo_id", modulo.id).order("numero"),
    supabase.from("respuestas").select("campo_id, valor").eq("bitacora_id", bitacora.id),
    supabase.from("filas").select("id, bloque_id, taller_id, orden")
      .eq("bitacora_id", bitacora.id).is("eliminada_at", null),
  ]);

  const empresa = bitacora.empresas as unknown as { nombre: string } | null;

  return {
    estado: "ok",
    perfilId: user.id,
    datos: {
      bitacoraId: bitacora.id,
      empresa: empresa?.nombre ?? "",
      moduloTitulo: `Módulo ${modulo.numero} · ${modulo.pregunta}`,
      moduloSlug: modulo.slug,
      talleres: (talleres ?? []).map((t): TallerVista => ({
        id: t.id, numero: t.numero, slug: t.slug, corto: t.corto,
        titulo: t.titulo, lead: t.lead ?? "",
        definicion: t.definicion as Definicion,
        camposMinimos: t.campos_minimos,
      })),
      respuestas: new Map((respuestas ?? []).map((r) => [r.campo_id, r.valor as ValorCampo])),
      filas: (filas ?? []).map((f): Fila => ({
        id: f.id, bloqueId: f.bloque_id, tallerId: f.taller_id, orden: Number(f.orden),
      })),
    },
  };
}

/** Avance del módulo a partir de una bitácora ya cargada. */
export function avanceDe(datos: BitacoraCargada) {
  return progresoModulo(datos.talleres.map((t) =>
    progresoTaller(
      camposEsperados(t.definicion, datos.filas.filter((f) => f.tallerId === t.id)),
      datos.respuestas,
      t.camposMinimos,
    )));
}
