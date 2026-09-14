import Link from "next/link";
import type { Route } from "next";
import { notFound, redirect } from "next/navigation";
import { cargarBitacora, avanceDe } from "@/lib/datos/cargarBitacora";
import { SinBitacora } from "@/components/bitacora/SinBitacora";
import { Tablero } from "@/components/informe/Tablero";
import { Observaciones, type Observacion } from "@/components/informe/Observaciones";
import { Dudas, type Duda } from "@/components/dudas/Dudas";
import { clienteServidor } from "@/lib/supabase/servidor";
import { lecturas } from "@/lib/informe/lecturas";
import type { DatosInforme } from "@/lib/informe/documento";

export const metadata = { title: "Conclusiones · Brújula empresarial" };

/**
 * Conclusiones de la bitácora real de la empresa.
 *
 * Se calcula en el servidor: las lecturas son funciones puras sobre lo que
 * ya está cargado, así que no hay razón para mandarle al navegador ni el
 * motor de conclusiones ni las respuestas completas.
 */
export default async function PaginaTableroModulo({
  params,
}: { params: Promise<{ moduloSlug: string }> }) {
  const { moduloSlug } = await params;
  const carga = await cargarBitacora(moduloSlug);

  if (carga.estado === "sin-sesion") redirect("/entrar");
  if (carga.estado === "sin-modulo") notFound();
  if (carga.estado === "sin-bitacora") return <SinBitacora />;

  const { datos, perfilId } = carga;
  const avance = avanceDe(datos);

  // Las observaciones salen de `comentarios`, que RLS ya limita a esta
  // bitácora: lo que llegue aquí es lo que esta persona puede ver.
  const supabase = await clienteServidor();
  const { data: notas } = await supabase
    .from("comentarios")
    .select("id, cuerpo, origen, creado_at, autor_id, perfiles(nombre)")
    .eq("bitacora_id", datos.bitacoraId)
    .order("creado_at");

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

  const nombreTaller = (id: string | null) =>
    datos.talleres.find((t) => t.id === id)?.corto ?? "Del módulo";

  const observaciones: Observacion[] = (notas ?? []).map((n) => ({
    id: n.id,
    cuerpo: n.cuerpo,
    origen: n.origen === "facilitador" ? "facilitador" : "empresa",
    autor: n.autor_id === perfilId
      ? "Tú"
      : (n.perfiles as unknown as { nombre: string } | null)?.nombre ?? "Tu equipo",
    fecha: n.creado_at,
    mia: n.autor_id === perfilId,
  }));

  const paraInforme: DatosInforme = {
    empresa: datos.empresa,
    modulo: datos.moduloTitulo,
    talleres: datos.talleres.map((t) => ({
      id: t.id, numero: t.numero, corto: t.corto, titulo: t.titulo, definicion: t.definicion,
    })),
    respuestas: datos.respuestas,
    filas: datos.filas,
    avance,
  };

  return (
    <div className="app" style={{ gridTemplateColumns: "1fr" }}>
      <div className="main">
        <header className="top">
          <div className="ident" style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 16 }}>
            Conclusiones del módulo
          </div>
          <a className="btn" href={`/api/informe/${datos.bitacoraId}`}>Descargar informe</a>
          <Link className="btn" href={`/${datos.moduloSlug}` as Route}>← Volver al taller</Link>
        </header>
        <Tablero
          lecturas={lecturas(paraInforme)}
          empresa={datos.empresa}
          modulo={datos.moduloTitulo}
          avance={avance}
          claveFoco={`brujula-foco-${datos.bitacoraId}`}
          observaciones={
            <>
              <Dudas
                bitacoraId={datos.bitacoraId}
                perfilId={perfilId}
                iniciales={dudas}
                nombreTaller={nombreTaller}
              />
              <Observaciones
                bitacoraId={datos.bitacoraId}
                perfilId={perfilId}
                iniciales={observaciones}
              />
            </>
          }
        />
      </div>
    </div>
  );
}
