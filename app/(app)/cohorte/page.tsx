import { redirect } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { cargarCohorte } from "@/lib/datos/cohorte";
import { ListaCohorte } from "@/components/cohorte/ListaCohorte";
import { CerrarSesion } from "@/components/ui/CerrarSesion";

/**
 * Panel del facilitador: cómo va su cohorte.
 *
 * Solo lectura. Quien no facilite ninguna cohorte no ve una tabla vacía sino
 * una explicación: una pantalla en blanco parece una falla del sistema y hace
 * que la gente escriba a soporte en vez de pedir el permiso que le falta.
 */
export default async function PaginaCohorte({
  searchParams,
}: { searchParams: Promise<{ modulo?: string }> }) {
  const { modulo } = await searchParams;
  const panel = await cargarCohorte(modulo);

  if (panel.estado === "sin-sesion") redirect("/entrar");

  if (panel.estado === "no-facilita") {
    return (
      <div className="portada">
        <div className="tarjeta-sesion">
          <h1>Panel de la cohorte</h1>
          <p className="sub">
            Este panel es para quien acompaña el programa: muestra el avance de cada
            empresa y permite leer sus bitácoras.
          </p>
          <p style={{ fontSize: 15.4, color: "var(--muted)", lineHeight: 1.55 }}>
            Tu cuenta no está registrada como facilitadora de ninguna cohorte, así que
            no hay nada que mostrar. Quien administre el programa puede darte ese
            permiso.
          </p>
          <div className="pie-sesion"><Link href={"/" as Route}>Volver a mi bitácora</Link></div>
          <div style={{ marginTop: 12 }}><CerrarSesion /></div>
        </div>
      </div>
    );
  }

  const { personas, cohortes, modulos, moduloActual } = panel;
  const slug = modulos.find((m) => m.numero === moduloActual.numero)?.slug ?? modulos[0]!.slug;

  return (
    <div className="app" style={{ gridTemplateColumns: "1fr" }}>
      <div className="main">
        <header className="top">
          <div className="ident" style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 16 }}>
            Cohorte · {cohortes.map((c) => c.nombre).join(" · ")}
          </div>
          <Link className="btn" href={"/" as Route}>← Mi bitácora</Link>
          <CerrarSesion clase="btn" />
        </header>

        <main className="stage">
          <div className="head">
            <span className="eyebrow">Acompañamiento</span>
            <h1 className="h-taller">Cómo va tu cohorte</h1>
            <p className="lead">
              Quien lleva más tiempo sin avanzar aparece primero. Todo es de solo
              lectura: puedes leer las bitácoras, no modificarlas.
            </p>
          </div>

          <ListaCohorte
            personas={personas}
            cohorteId={cohortes[0]?.id ?? null}
            modulos={modulos}
            moduloSlug={slug}
          />
        </main>
      </div>
    </div>
  );
}
