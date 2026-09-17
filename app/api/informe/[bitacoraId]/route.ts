import { NextResponse } from "next/server";
import { clienteServidor } from "@/lib/supabase/servidor";
import { documentoInforme } from "@/lib/informe/documento";
import { informePdf, nombreArchivo } from "@/lib/informe/pdf";
import { camposEsperados, progresoTaller, progresoModulo } from "@/lib/talleres/progreso";
import type { Definicion, Fila, ValorCampo } from "@/lib/talleres/tipos";

// El renderizador de PDF necesita Node, no el entorno de borde.
export const runtime = "nodejs";

// Nota: aquí había un `maxDuration = 60`. El plan Hobby no siempre lo admite
// y eso tumba la construcción entera, no solo esta ruta. No hace falta: armar
// el informe de un módulo lleno toma ~500 ms medidos, muy por debajo del
// límite por defecto.

/**
 * Informe descargable de una bitácora, en PDF.
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

  // Si el armado falla, lo que ve la empresa no puede ser la pantalla en
  // blanco del navegador: sin el mensaje no hay forma de saber qué pasó, y
  // los registros de la plataforma no siempre están a la mano.
  let pdf: Buffer;
  try {
    pdf = await informePdf(documentoInforme({
      empresa, modulo: nombreModulo, talleres: lista,
      respuestas: mapaRespuestas, filas: listaFilas, avance,
    }));
  } catch (error) {
    console.error("informe · falló el armado del PDF", error);
    const detalle = error instanceof Error
      ? `${error.name}: ${error.message}`
      : String(error);
    return new NextResponse(
      "No se pudo armar el informe de este módulo.\n\n" +
      `Detalle técnico: ${detalle}\n\n` +
      "Tu bitácora está intacta: esto falló al generar el archivo, no al " +
      "leer tus respuestas. Pásale este mensaje a quien mantiene la " +
      "plataforma y se corrige.",
      { status: 500, headers: { "Content-Type": "text/plain; charset=utf-8" } },
    );
  }

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        `attachment; filename="${nombreArchivo(`Modulo-${mod.numero}`, empresa)}"`,
      "Cache-Control": "no-store",
    },
  });
}
