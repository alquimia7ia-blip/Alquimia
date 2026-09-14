"use client";

import { MODULO_1 } from "@/supabase/seed/modulo-1";
import { lecturas as calcular } from "@/lib/informe/lecturas";
import { camposEsperados, progresoTaller, progresoModulo, type Avance } from "@/lib/talleres/progreso";
import type { DatosInforme } from "@/lib/informe/cuerpo";
import type { Fila, ValorCampo } from "@/lib/talleres/tipos";
import { EJEMPLO } from "./ejemplo";

/**
 * Los datos del tablero de prueba.
 *
 * Lee la misma bitácora local que /estilos, así que se responde el taller
 * allá y se ven aquí las conclusiones. Sin base de datos: sirve para
 * enseñar el tablero antes de que exista una cohorte real.
 *
 * Las lecturas de este tablero son las del Módulo 1, así que lee su clave.
 * Desde que /estilos lleva dos módulos, cada uno guarda en la suya.
 */

export const CLAVE = "bitacora-mega-estilos-donde";

export function leer(): { respuestas: Map<string, ValorCampo>; filas: Fila[] } {
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

export function armar(respuestas: Map<string, ValorCampo>, filas: Fila[]) {
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


/** Todo junto: lo guardado en el navegador, o el ejemplo si se pide. */
export function cargarDatos(fuente?: { respuestas: Map<string, ValorCampo>; filas: Fila[] }) {
  const { respuestas, filas } = fuente ?? leer();
  const d = armar(respuestas, filas);
  return { datos: d, lecturas: calcular(d) };
}

/** Siembra el ejemplo en el navegador y lo devuelve armado. */
export function cargarEjemplo() {
  const respuestas = new Map(Object.entries(EJEMPLO.respuestas)) as Map<string, ValorCampo>;
  const filas = EJEMPLO.filas as Fila[];
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify({
      respuestas: EJEMPLO.respuestas, filas: EJEMPLO.filas,
    }));
  } catch {
    // Sin almacenamiento el ejemplo igual se ve; solo no sobrevive a recargar.
  }
  return cargarDatos({ respuestas, filas });
}
