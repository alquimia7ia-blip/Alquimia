import { clienteServidor } from "@/lib/supabase/servidor";

/**
 * Datos del panel del facilitador.
 *
 * No filtra por cohorte a mano. RLS ya limita todo a las cohortes que esta
 * persona facilita —`app.empresas_de_mis_cohortes()`—, así que una consulta
 * sin `where` devuelve exactamente lo que puede ver y nada más. Filtrar
 * además en el código daría una falsa sensación de seguridad: si el filtro
 * de la aplicación fuera el que protege, olvidarlo una vez abriría la
 * cohorte entera.
 */

export type PersonaCohorte = {
  perfilId: string;
  nombre: string;
  empresa: string;
  empresaId: string;
  rol: string;
  /** Bitácora de su empresa en el módulo consultado. */
  bitacoraId: string | null;
  fraccion: number;
  /** Última vez que alguien de su empresa escribió algo. */
  ultimoMovimiento: string | null;
};

export type PanelCohorte =
  | { estado: "sin-sesion" }
  | { estado: "no-facilita" }
  | {
      estado: "ok";
      perfilId: string;
      cohortes: { id: string; nombre: string }[];
      modulos: { id: string; numero: number; slug: string; titulo: string }[];
      moduloActual: { id: string; numero: number; titulo: string };
      personas: PersonaCohorte[];
    };

export async function cargarCohorte(moduloSlug?: string): Promise<PanelCohorte> {
  const supabase = await clienteServidor();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { estado: "sin-sesion" };

  const { data: facilita } = await supabase
    .from("facilitadores_cohorte")
    .select("cohorte_id, cohortes(nombre)")
    .eq("perfil_id", user.id);
  if (!facilita?.length) return { estado: "no-facilita" };

  const { data: modulos } = await supabase
    .from("modulos")
    .select("id, numero, slug, titulo")
    .eq("publicado", true)
    .order("numero");
  if (!modulos?.length) return { estado: "no-facilita" };

  const modulo = modulos.find((m) => m.slug === moduloSlug) ?? modulos[0]!;

  // Las empresas de la cohorte, con su gente. RLS decide cuáles vuelven.
  const [{ data: membresias }, { data: avances }] = await Promise.all([
    supabase
      .from("membresias")
      .select("perfil_id, empresa_id, rol, estado, perfiles(nombre_completo), empresas(nombre)")
      .eq("estado", "activa"),
    supabase
      .from("vista_progreso_bitacora")
      .select("bitacora_id, empresa_id, fraccion, ultimo_movimiento")
      .eq("modulo_id", modulo.id),
  ]);

  const porEmpresa = new Map(
    (avances ?? []).map((a) => [a.empresa_id as string, a]),
  );

  type Cruda = {
    perfil_id: string; empresa_id: string; rol: string;
    perfiles: { nombre_completo: string | null } | null;
    empresas: { nombre: string } | null;
  };

  const personas: PersonaCohorte[] = ((membresias ?? []) as unknown as Cruda[])
    .map((m) => {
      const avance = porEmpresa.get(m.empresa_id);
      return {
        perfilId: m.perfil_id,
        nombre: m.perfiles?.nombre_completo?.trim() || "Sin nombre",
        empresa: m.empresas?.nombre ?? "—",
        empresaId: m.empresa_id,
        rol: m.rol,
        bitacoraId: (avance?.bitacora_id as string | undefined) ?? null,
        fraccion: Number(avance?.fraccion ?? 0),
        ultimoMovimiento: (avance?.ultimo_movimiento as string | null) ?? null,
      };
    })
    // Quien más tiempo lleva sin aparecer, primero: el panel existe para
    // encontrar a quien se quedó atrás, no para felicitar al que va bien.
    .sort((a, b) => {
      if (!a.ultimoMovimiento) return -1;
      if (!b.ultimoMovimiento) return 1;
      return a.ultimoMovimiento.localeCompare(b.ultimoMovimiento);
    });

  return {
    estado: "ok",
    perfilId: user.id,
    cohortes: facilita.map((f) => ({
      id: f.cohorte_id as string,
      nombre: (f.cohortes as unknown as { nombre: string } | null)?.nombre ?? "Cohorte",
    })),
    modulos,
    moduloActual: { id: modulo.id, numero: modulo.numero, titulo: modulo.titulo },
    personas,
  };
}
