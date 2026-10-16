import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { cargarBitacoraPorId } from "@/lib/datos/cargarBitacora";
import { clienteServidor } from "@/lib/supabase/servidor";
import { BitacoraAjena } from "./BitacoraAjena";

/**
 * Una bitácora de la cohorte, en solo lectura.
 *
 * Quién puede abrirla lo decide RLS: si la consulta vuelve vacía es que esta
 * persona no facilita esa cohorte, y se responde 404 igual que si no
 * existiera. Decir «no tienes permiso» confirmaría que la bitácora existe.
 */
export default async function PaginaBitacoraAjena({
  params,
}: { params: Promise<{ bitacoraId: string }> }) {
  const { bitacoraId } = await params;
  const carga = await cargarBitacoraPorId(bitacoraId);

  if (carga.estado === "sin-sesion") redirect("/entrar");
  if (carga.estado !== "ok") notFound();

  const { datos, perfilId } = carga;

  // Ley 1581: la propuesta comercial le promete a la cámara que toda lectura
  // de la bitácora de una empresa por parte de un tutor queda registrada. Va
  // antes de pintar, para que quede constancia aunque la página falle luego.
  const supabase = await clienteServidor();
  const { error } = await supabase.from("auditoria_acceso").insert({
    actor_id: perfilId,
    accion: "leer_bitacora",
    recurso: `bitacora:${datos.bitacoraId}`,
    metadatos: { empresa: datos.empresa, modulo: datos.moduloSlug },
  });
  // Si la auditoría falla no se oculta: se deja rastro en el servidor. No se
  // bloquea la lectura, que es un permiso que la base ya concedió.
  if (error) console.error("auditoría · leer_bitacora", error.message);

  return (
    <>
      <div className="cohorte-cinta">
        <Link href={"/cohorte" as Route}>← Volver al panel</Link>
        <span>
          Bitácora de <b>{datos.empresa}</b> · {datos.moduloTitulo}
        </span>
      </div>
      <BitacoraAjena
        bitacoraId={datos.bitacoraId}
        perfilId={perfilId}
        empresa={datos.empresa}
        moduloTitulo={datos.moduloTitulo}
        moduloSlug={datos.moduloSlug}
        talleres={datos.talleres}
        respuestas={Object.fromEntries(datos.respuestas)}
        filas={datos.filas}
      />
    </>
  );
}
