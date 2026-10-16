import type { CriterioPriorizacion } from "./tipos";

/**
 * Puntaje y orden de la matriz de priorización.
 *
 * Vive aparte y sin dependencias por la misma razón que `presentacion.ts`:
 * así se puede probar sin montar React, y la pantalla, el informe y la
 * prueba comparten una sola aritmética. Si el puntaje se calculara dentro
 * del componente, el informe tendría que reimplementarlo y bastaría con que
 * uno de los dos cambiara para que la empresa viera un orden en el taller y
 * otro en su informe final.
 */

export type NotasFila = Record<string, number | null>;

/** Lo que vale una nota dentro del puntaje, ya invertida si corresponde. */
export function aporte(
  criterio: CriterioPriorizacion, nota: number, maximo: number,
): number {
  return criterio.invertido ? maximo + 1 - nota : nota;
}

/**
 * Suma los criterios de una fila. `null` si falta alguna nota.
 *
 * Se exige que estén todas a propósito: un proyecto calificado a medias
 * sumaría menos y aparecería abajo en el orden, que es peor que no
 * aparecer — la empresa leería como «poco prioritario» lo que en realidad
 * es «sin calificar».
 */
export function puntaje(
  notas: NotasFila, criterios: CriterioPriorizacion[], maximo: number,
): number | null {
  let suma = 0;
  for (const cr of criterios) {
    const n = notas[cr.id];
    if (n == null || !Number.isFinite(n)) return null;
    suma += aporte(cr, n, maximo);
  }
  return suma;
}

/** Puntaje máximo posible: sirve para dibujar la barra en proporción. */
export function puntajeMaximo(criterios: CriterioPriorizacion[], maximo: number): number {
  return criterios.length * maximo;
}

/**
 * Orden de ejecución: 1 es el primero.
 *
 * Empate con el mismo puntaje, mismo puesto —no habría forma honesta de
 * desempatar—, y las filas sin calificar quedan sin puesto en vez de al
 * final. Devuelve un mapa por id de fila para no reordenar la tabla en
 * pantalla: mover de sitio la fila que alguien está escribiendo le quita el
 * campo de debajo del cursor.
 */
export function puestos(
  puntajes: { filaId: string; puntaje: number | null }[],
): Map<string, number> {
  const ordenados = puntajes
    .filter((p): p is { filaId: string; puntaje: number } => p.puntaje != null)
    .sort((a, b) => b.puntaje - a.puntaje);

  const salida = new Map<string, number>();
  let puesto = 0;
  let anterior: number | null = null;
  ordenados.forEach((p, i) => {
    if (p.puntaje !== anterior) {
      puesto = i + 1;
      anterior = p.puntaje;
    }
    salida.set(p.filaId, puesto);
  });
  return salida;
}

/** Los doce meses, para el cronograma. El índice es el valor guardado. */
export const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
] as const;
