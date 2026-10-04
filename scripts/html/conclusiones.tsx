/**
 * Entrada del archivo autónomo del tablero.
 *
 * No monta `app/tablero/page.tsx` porque esa página usa `next/link`, que
 * fuera de Next revienta al primer render. Monta la misma vista sobre los
 * mismos datos, con una cáscara de enlaces normales.
 */
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Tablero } from "@/components/informe/Tablero";
import { cargarDatos, cargarEjemplo } from "@/app/tablero/datos";

function Pagina() {
  const [estado, setEstado] = useState<ReturnType<typeof cargarDatos> | null>(null);
  useEffect(() => { setEstado(cargarDatos()); }, []);
  if (!estado) return null;

  return (
    <div className="app" style={{ gridTemplateColumns: "1fr" }}>
      <div className="main">
        <header className="top">
          <div className="ident" style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 18 }}>
            Tablero de conclusiones
          </div>
          <button className="btn" type="button" onClick={() => setEstado(cargarEjemplo())}>
            Cargar datos de ejemplo
          </button>
          <button className="btn" type="button" onClick={() => window.print()}>Imprimir</button>
        </header>
        <Tablero
          lecturas={estado.lecturas}
          empresa={estado.datos.empresa}
          modulo={estado.datos.modulo}
          avance={estado.datos.avance}
          claveFoco="brujula-foco-prueba"
        />
      </div>
    </div>
  );
}

const raiz = document.getElementById("raiz");
if (raiz) createRoot(raiz).render(<Pagina />);
