import { notFound, redirect } from "next/navigation";
import { cargarBitacora } from "@/lib/datos/cargarBitacora";
import { SinBitacora } from "@/components/bitacora/SinBitacora";
import { Bitacora } from "./Bitacora";

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

  return (
    <Bitacora
      bitacoraId={datos.bitacoraId}
      perfilId={perfilId}
      empresa={datos.empresa}
      moduloTitulo={datos.moduloTitulo}
      moduloSlug={datos.moduloSlug}
      talleres={datos.talleres}
      respuestas={Object.fromEntries(datos.respuestas)}
      filas={datos.filas}
    />
  );
}
