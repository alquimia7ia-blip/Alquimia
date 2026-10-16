import type { SupabaseClient } from "@supabase/supabase-js";
import { campo } from "@/lib/talleres/rutas";
import type { Definicion } from "@/lib/talleres/tipos";

type TallerFila = { id: string; definicion: Definicion };

/**
 * Crea las filas y los valores que una bitácora necesita al abrirse.
 *
 * Se hace una sola vez, con la clave de servicio, cuando se da de alta la
 * cohorte: así la empresa encuentra las tres filas de competidores y los
 * años del Taller 8 ya puestos, y no hay dos caminos distintos para crear
 * lo mismo.
 */
export async function sembrarBitacora(
  db: SupabaseClient,
  bitacoraId: string,
  talleres: TallerFila[],
) {
  const filas: { bitacora_id: string; taller_id: string; bloque_id: string; orden: number }[] = [];
  const respuestas: { bitacora_id: string; taller_id: string; campo_id: string; valor: unknown }[] = [];

  for (const t of talleres) {
    for (const seccion of t.definicion.secciones) {
      for (const b of seccion.bloques) {
        const n = "filasIniciales" in b ? (b.filasIniciales ?? 0) : 0;
        for (let i = 0; i < n; i++) {
          filas.push({ bitacora_id: bitacoraId, taller_id: t.id, bloque_id: b.id, orden: i });
        }
        if (b.tipo === "tabla") {
          for (const col of b.columnasEditables ?? []) {
            respuestas.push({
              bitacora_id: bitacoraId,
              taller_id: t.id,
              campo_id: campo.encabezado(b.id, col.id),
              valor: col.valorPorDefecto,
            });
          }
        }
      }
    }
  }

  if (filas.length) {
    const { error } = await db.from("filas").insert(filas);
    if (error) throw new Error(`No se pudieron crear las filas iniciales: ${error.message}`);
  }
  if (respuestas.length) {
    const { error } = await db.from("respuestas")
      .upsert(respuestas, { onConflict: "bitacora_id,campo_id" });
    if (error) throw new Error(`No se pudieron sembrar los encabezados: ${error.message}`);
  }
  return { filas: filas.length, respuestas: respuestas.length };
}
