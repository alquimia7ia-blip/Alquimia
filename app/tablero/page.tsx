"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MODULO_1 } from "@/supabase/seed/modulo-1";
import { lecturas as calcular, type Lectura } from "@/lib/informe/lecturas";
import { Tablero } from "@/components/informe/Tablero";
import { camposEsperados, progresoTaller, progresoModulo, type Avance } from "@/lib/talleres/progreso";
import type { DatosInforme } from "@/lib/informe/cuerpo";
import type { Fila, ValorCampo } from "@/lib/talleres/tipos";
import { EJEMPLO } from "./ejemplo";

/**
 * Tablero de conclusiones, en modo prueba.
 *
 * Lee la misma bitácora local que /estilos, así que se responde el taller
 * allá y se ven aquí las conclusiones. Sin base de datos: sirve para
 * enseñar el tablero antes de que exista una cohorte real.
 */

const CLAVE = "bitacora-mega-estilos";

function leer(): { respuestas: Map<string, ValorCampo>; filas: Fila[] } {
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    if (crudo) {
      const d = JSON.parse(crudo) as { respuestas?: Record<string, ValorCampo>; filas?: Fila[] };
      return { respuestas: new Map(Object.entries(d.respuestas ?? {})), filas: d.filas ?? [] };
    }
  } catch {
    // Respaldo ilegible: se muestra el tablero vacío, no una pantalla rota.
  }
  return { respuestas: new Map(), filas: [] };
}

function armar(respuestas: Map<string, ValorCampo>, filas: Fila[]) {
  const talleres = MODULO_1.talleres.map((t) => ({
    id: t.slug, numero: t.numero, corto: t.corto, titulo: t.titulo,
    definicion: t.definicion,
  }));

  const avances: Avance[] = MODULO_1.talleres.map((t) =>
    progresoTaller(
      camposEsperados(t.definicion, filas.filter((f) => f.tallerId === t.slug)),
      respuestas,
      t.camposMinimos ?? 0,
    ));

  const datos: DatosInforme = {
    empresa: "", modulo: `Módulo ${MODULO_1.numero} · ${MODULO_1.titulo}`,
    talleres, respuestas, filas, avance: progresoModulo(avances),
  };
  return datos;
}

export default function PaginaTablero() {
  const [datos, setDatos] = useState<DatosInforme | null>(null);
  const [lecturas, setLecturas] = useState<Lectura[]>([]);

  function cargar(fuente?: { respuestas: Map<string, ValorCampo>; filas: Fila[] }) {
    const { respuestas, filas } = fuente ?? leer();
    const d = armar(respuestas, filas);
    setDatos(d);
    setLecturas(calcular(d));
  }

  useEffect(() => { cargar(); }, []);

  function cargarEjemplo() {
    const respuestas = new Map(Object.entries(EJEMPLO.respuestas)) as Map<string, ValorCampo>;
    const filas = EJEMPLO.filas as Fila[];
    try {
      window.localStorage.setItem(CLAVE, JSON.stringify({
        respuestas: EJEMPLO.respuestas, filas: EJEMPLO.filas,
      }));
    } catch {
      // Sin almacenamiento el ejemplo igual se ve; solo no sobrevive a recargar.
    }
    cargar({ respuestas, filas });
  }

  if (!datos) return null;

  return (
    <div className="app" style={{ gridTemplateColumns: "1fr" }}>
      <div className="main">
        <header className="top">
          <div className="ident" style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 16 }}>
            Tablero de conclusiones
          </div>
          <button className="btn" onClick={cargarEjemplo}>Cargar datos de ejemplo</button>
          <button className="btn" onClick={() => window.print()}>Imprimir</button>
          <Link className="btn" href="/estilos">← Volver al taller</Link>
        </header>
        <Tablero
          lecturas={lecturas}
          empresa={datos.empresa}
          modulo={datos.modulo}
          avance={datos.avance}
        />
      </div>
    </div>
  );
}
