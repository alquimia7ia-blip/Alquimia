import { NextResponse } from "next/server";
import { clienteServidor } from "@/lib/supabase/servidor";
import { informeHtml, nombreArchivo } from "@/lib/informe/html";
import { camposEsperados, progresoTaller, progresoModulo } from "@/lib/talleres/progreso";
import type { Definicion, Fila, ValorCampo } from "@/lib/talleres/tipos";

/**
 * Informe descargable de una bitácora.
 *
 * No filtra por empresa a mano: RLS decide qué bitácoras alcanza quien pide.
 * Si esta persona no debe verla, la consulta vuelve vacía y responde 404,
 * que además no revela si la bitácora existe.
 */
export async function GET(
  _peticion: Request,
  { params }: { params: Promise<{ bitacoraId: string }> },
) {
  const { bitacoraId } = await params;
  const supabase = await clienteServidor();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("No autorizado", { status: 401 });

  const { data: bitacora } = await supabase
    .from("bitacoras")
    .select("id, modulo_id, empresas(nombre), modulos(numero, pregunta, titulo)")
    .eq("id", bitacoraId)
    .maybeSingle();
  if (!bitacora) return new NextResponse("No encontrado", { status: 404 });

  const [{ data: talleres }, { data: respuestas }, { data: filas }] = await Promise.all([
    supabase.from("talleres")
      .select("id, numero, corto, titulo, definicion, campos_minimos")
      .eq("modulo_id", bitacora.modulo_id).order("numero"),
    supabase.from("respuestas").select("campo_id, valor").eq("bitacora_id", bitacoraId),
    supabase.from("filas").select("id, bloque_id, taller_id, orden")
      .eq("bitacora_id", bitacoraId).is("eliminada_at", null),
  ]);

  const empresa = (bitacora.empresas as unknown as { nombre: string } | null)?.nombre ?? "";
  const mod = bitacora.modulos as unknown as { numero: number; pregunta: string; titulo: string };
  const nombreModulo = `Módulo ${mod.numero} · ${mod.titulo}`;

  const mapaRespuestas = new Map<string, ValorCampo>(
    (respuestas ?? []).map((r) => [r.campo_id, r.valor as ValorCampo]),
  );
  const listaFilas: Fila[] = (filas ?? []).map((f) => ({
    id: f.id, bloqueId: f.bloque_id, tallerId: f.taller_id, orden: Number(f.orden),
  }));

  const lista = (talleres ?? []).map((t) => ({
    id: t.id, numero: t.numero, corto: t.corto, titulo: t.titulo,
    definicion: t.definicion as Definicion, camposMinimos: t.campos_minimos,
  }));

  const avance = progresoModulo(lista.map((t) =>
    progresoTaller(
      camposEsperados(t.definicion, listaFilas.filter((f) => f.tallerId === t.id)),
      mapaRespuestas,
      t.camposMinimos,
    )));

  // Queda registro de quién exportó qué: el facilitador puede leer bitácoras
  // ajenas de su cohorte y eso debe ser auditable.
  await supabase.from("auditoria_acceso").insert({
    actor_id: user.id, accion: "exportar_informe", recurso: `bitacora:${bitacoraId}`,
  });

  const html = informeHtml({
    empresa, modulo: nombreModulo, talleres: lista,
    respuestas: mapaRespuestas, filas: listaFilas, avance,
  });

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition":
        `attachment; filename="${nombreArchivo(`Modulo-${mod.numero}`, empresa)}"`,
      "Cache-Control": "no-store",
    },
  });
}
