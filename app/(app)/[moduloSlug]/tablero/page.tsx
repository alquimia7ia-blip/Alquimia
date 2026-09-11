import Link from "next/link";
import type { Route } from "next";
import { notFound, redirect } from "next/navigation";
import { cargarBitacora, avanceDe } from "@/lib/datos/cargarBitacora";
import { SinBitacora } from "@/components/bitacora/SinBitacora";
import { Tablero } from "@/components/informe/Tablero";
import { lecturas } from "@/lib/informe/lecturas";
import type { DatosInforme } from "@/lib/informe/cuerpo";

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

  const { datos } = carga;
  const avance = avanceDe(datos);

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
        />
      </div>
    </div>
  );
}
