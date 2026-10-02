import { notFound, redirect } from "next/navigation";
import { cargarBitacora, avanceDe } from "@/lib/datos/cargarBitacora";
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
  const [{ data: crudas }, { data: mia }, { data: yo }, { count: facilita }] =
    await Promise.all([
    supabase
      .from("dudas")
      .select("id, cuerpo, taller_id, estado, creado_at, autor_id")
      .eq("bitacora_id", datos.bitacoraId)
      .order("creado_at"),
    // La valoración es de cada persona, no de la empresa: se pide la propia.
    supabase
      .from("valoraciones")
      .select("gusto, falto, mejoraria")
      .eq("bitacora_id", datos.bitacoraId)
      .eq("autor_id", perfilId)
      .maybeSingle(),
    supabase.from("perfiles").select("nombre_completo").eq("id", perfilId).maybeSingle(),
    // Solo quien facilita ve la puerta al panel. Mostrársela a todos
    // invitaría a pulsarla y encontrar una negativa.
    supabase.from("facilitadores_cohorte")
      .select("id", { count: "exact", head: true }).eq("perfil_id", perfilId),
  ]);

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
      presentacion={datos.presentacion}
      facilita={(facilita ?? 0) > 0}
      presencia={{
        cohorteId: datos.cohorteId,
        nombre: yo?.nombre_completo?.trim() || "Alguien del equipo",
        empresa: datos.empresa,
      }}
      dudas={dudas}
      avance={avanceDe(datos)}
      valoracion={mia
        ? { gusto: mia.gusto ?? "", falto: mia.falto ?? "", mejoraria: mia.mejoraria ?? "" }
        : undefined}
      talleres={datos.talleres}
      respuestas={Object.fromEntries(datos.respuestas)}
      filas={datos.filas}
    />
  );
}
