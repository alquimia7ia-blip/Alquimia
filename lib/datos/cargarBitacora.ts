import { clienteServidor } from "@/lib/supabase/servidor";
import type { TallerVista } from "@/components/bitacora/VistaModulo";
import { camposEsperados, progresoTaller, progresoModulo } from "@/lib/talleres/progreso";
import type { Definicion, Fila, ValorCampo } from "@/lib/talleres/tipos";
import { presentacionDe, type Presentacion } from "./presentacion";

export type { Presentacion };

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

export type ModuloAbierto = { numero: number; slug: string; titulo: string };

export type BitacoraCargada = {
  bitacoraId: string;
  empresa: string;
  moduloTitulo: string;
  moduloSlug: string;
  /** Cohorte de esta bitácora: el canal de presencia cuelga de ella. */
  cohorteId: string;
  /** Los módulos que esta persona puede abrir. Sale de sus bitácoras, no de
   *  `modulos`, para que la lista y el permiso no puedan discrepar. */
  modulos: ModuloAbierto[];
  /** Dónde presenta la cámara este módulo. Nulo si no configuró ninguna. */
  presentacion: Presentacion | null;
  talleres: TallerVista[];
  respuestas: Map<string, ValorCampo>;
  filas: Fila[];
};

export type Carga =
  | { estado: "sin-sesion" }
  | { estado: "sin-modulo" }
  | { estado: "sin-bitacora" }
  | { estado: "ok"; datos: BitacoraCargada; perfilId: string };

/**
 * La bitácora propia de un módulo.
 *
 * Filtra por las empresas de quien consulta y no solo por el módulo. Parece
 * redundante —RLS ya limita lo que se ve— pero no lo es: un facilitador ve
 * también las bitácoras de su cohorte, y entonces `maybeSingle()` recibiría
 * varias filas, devolvería error, y la página diría «sin bitácora». El tutor
 * perdería su propio taller el día que se le dieran permisos.
 */
export async function cargarBitacora(moduloSlug: string): Promise<Carga> {
  const supabase = await clienteServidor();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { estado: "sin-sesion" };

  const { data: modulo } = await supabase
    .from("modulos")
    .select(CAMPOS_MODULO)
    .eq("slug", moduloSlug)
    .maybeSingle();
  if (!modulo) return { estado: "sin-modulo" };

  const propias = await empresasPropias(supabase, user.id);
  if (propias.length === 0) return { estado: "sin-bitacora" };

  const { data: bitacora } = await supabase
    .from("bitacoras")
    .select(CAMPOS_BITACORA)
    .eq("modulo_id", modulo.id)
    .in("empresa_id", propias)
    .maybeSingle();
  if (!bitacora) return { estado: "sin-bitacora" };

  return armar(supabase, user.id, modulo, bitacora, propias);
}

/**
 * La bitácora de otra empresa, para el panel del facilitador.
 *
 * El módulo sale de la propia bitácora: quien abre el panel pincha una
 * empresa, no un módulo. Que se pueda o no leer lo decide RLS, no este
 * código: si la consulta vuelve vacía es que esta persona no facilita esa
 * cohorte, y el resultado es el mismo «sin bitácora» que si no existiera.
 */
export async function cargarBitacoraPorId(bitacoraId: string): Promise<Carga> {
  const supabase = await clienteServidor();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { estado: "sin-sesion" };

  const { data: bitacora } = await supabase
    .from("bitacoras")
    .select("id, empresa_id, cohorte_id, estado, modulo_id, empresas(nombre)")
    .eq("id", bitacoraId)
    .maybeSingle();
  if (!bitacora) return { estado: "sin-bitacora" };

  const { data: modulo } = await supabase
    .from("modulos")
    .select(CAMPOS_MODULO)
    .eq("id", bitacora.modulo_id)
    .maybeSingle();
  if (!modulo) return { estado: "sin-modulo" };

  return armar(supabase, user.id, modulo, bitacora, [bitacora.empresa_id]);
}

const CAMPOS_MODULO =
  "id, numero, slug, titulo, pregunta, presentacion_url, presentacion_etiqueta";
const CAMPOS_BITACORA = "id, empresa_id, cohorte_id, estado, empresas(nombre)";

type ModuloFila = {
  id: string; numero: number; slug: string; pregunta: string;
  presentacion_url: string | null; presentacion_etiqueta: string | null;
};
type BitacoraFila = {
  id: string; empresa_id: string; cohorte_id: string; empresas: unknown;
};

/** Empresas activas de una persona. RLS ya limita la consulta a las suyas. */
async function empresasPropias(
  supabase: Awaited<ReturnType<typeof clienteServidor>>, perfilId: string,
): Promise<string[]> {
  const { data } = await supabase
    .from("membresias")
    .select("empresa_id")
    .eq("perfil_id", perfilId)
    .eq("estado", "activa");
  return (data ?? []).map((m) => m.empresa_id as string);
}

/** El resto de la carga, común a la vista propia y a la del facilitador. */
async function armar(
  supabase: Awaited<ReturnType<typeof clienteServidor>>,
  perfilId: string,
  modulo: ModuloFila,
  bitacora: BitacoraFila,
  empresas: string[],
): Promise<Carga> {
  const [{ data: talleres }, { data: respuestas }, { data: filas }, { data: abiertos }] =
    await Promise.all([
      supabase.from("talleres")
        .select("id, numero, slug, corto, titulo, lead, definicion, campos_minimos")
        .eq("modulo_id", modulo.id).order("numero"),
      supabase.from("respuestas").select("campo_id, valor").eq("bitacora_id", bitacora.id),
      supabase.from("filas").select("id, bloque_id, taller_id, orden")
        .eq("bitacora_id", bitacora.id).is("eliminada_at", null),
      // Acotado a la misma empresa: sin esto, un facilitador vería los módulos
      // de toda la cohorte repetidos en el selector.
      supabase.from("bitacoras").select("modulos(numero, slug, titulo, publicado)")
        .in("empresa_id", empresas),
    ]);

  const empresa = bitacora.empresas as unknown as { nombre: string } | null;

  return {
    estado: "ok",
    perfilId,
    datos: {
      bitacoraId: bitacora.id,
      empresa: empresa?.nombre ?? "",
      moduloTitulo: `Módulo ${modulo.numero} · ${modulo.pregunta}`,
      moduloSlug: modulo.slug,
      cohorteId: bitacora.cohorte_id,
      presentacion: presentacionDe(modulo.presentacion_url, modulo.presentacion_etiqueta),
      modulos: (abiertos ?? [])
        .map((b) => b.modulos as unknown as ModuloAbierto & { publicado: boolean })
        .filter((m) => m?.publicado)
        .map(({ numero, slug, titulo }) => ({ numero, slug, titulo }))
        .sort((a, b) => a.numero - b.numero),
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
