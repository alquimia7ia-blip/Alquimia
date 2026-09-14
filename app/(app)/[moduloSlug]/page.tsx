import { notFound, redirect } from "next/navigation";
import { cargarBitacora } from "@/lib/datos/cargarBitacora";
import { SinBitacora } from "@/components/bitacora/SinBitacora";
import { Bitacora } from "./Bitacora";
import type { Duda } from "@/components/dudas/Dudas";
import { clienteServidor } from "@/lib/supabase/servidor";

/** El taller. La carga vive en cargarBitacora para no divergir del tablero. */
export default async function PaginaModulo({
  params,
}: { params: Promise<{ moduloSlug: string }> }) {
  const { moduloSlug } = await params;
  const carga = await cargarBitacora(moduloSlug);

  if (carga.estado === "sin-sesion") redirect("/entrar");
  if (carga.estado === "sin-modulo") notFound();
  if (carga.estado === "sin-bitacora") return <SinBitacora />;

  const { datos, perfilId } = carga;

  // RLS ya limita las dudas a esta bitácora; no hace falta filtrar por empresa.
  const supabase = await clienteServidor();
  const { data: crudas } = await supabase
    .from("dudas")
    .select("id, cuerpo, taller_id, estado, creado_at, autor_id")
    .eq("bitacora_id", datos.bitacoraId)
    .order("creado_at");

  const dudas: Duda[] = (crudas ?? []).map((d) => ({
    id: d.id, cuerpo: d.cuerpo, tallerId: d.taller_id,
    estado: d.estado === "resuelta" ? "resuelta" : "abierta",
    fecha: d.creado_at, mia: d.autor_id === perfilId,
  }));

  return (
    <Bitacora
      bitacoraId={datos.bitacoraId}
      perfilId={perfilId}
      empresa={datos.empresa}
      moduloTitulo={datos.moduloTitulo}
      moduloSlug={datos.moduloSlug}
      modulos={datos.modulos}
      dudas={dudas}
      talleres={datos.talleres}
      respuestas={Object.fromEntries(datos.respuestas)}
      filas={datos.filas}
    />
  );
}
