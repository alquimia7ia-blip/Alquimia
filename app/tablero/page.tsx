"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Tablero } from "@/components/informe/Tablero";
import { cargarDatos, cargarEjemplo } from "./datos";

/**
 * Tablero de conclusiones, en modo prueba.
 *
 * La armazón de datos vive en `datos.ts` porque el archivo autónomo la
 * reutiliza: esta página usa `next/link`, que fuera de Next no existe, así
 * que el HTML suelto monta su propia cáscara sobre los mismos datos.
 */
export default function PaginaTablero() {
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
          <button className="btn" onClick={() => setEstado(cargarEjemplo())}>
            Cargar datos de ejemplo
          </button>
          <button className="btn" onClick={() => window.print()}>Imprimir</button>
          <Link className="btn" href="/estilos">← Volver al taller</Link>
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
