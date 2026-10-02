import type { Bloque, Definicion } from "./tipos";

/**
 * Construcción de identificadores de campo.
 *
 * La regla es determinista y estable en el tiempo: el `campo_id` de una
 * respuesta no cambia nunca. Para las filas dinámicas se usa el uuid de la
 * fila y jamás su índice — dos personas agregando un competidor a la vez
 * generan uuid distintos y ambas filas sobreviven, que es exactamente lo
 * que el prototipo no podía hacer.
 *
 *   <bloque>                        texto suelto, chips agregables
 *   <bloque>.<indice>               lista numerada
 *   <bloque>.<item>.<subcampo>      fichas, ranking
 *   <bloque>.<grupo>.<fila>         matriz
 *   <bloque>.<fila_uuid>.<columna>  tabla, línea de tiempo
 *   <bloque>.<cuadrante>.<indice>   cuadrantes
 */

export const campo = {
  simple: (bloque: string) => bloque,
  linea: (bloque: string, i: number) => `${bloque}.${i}`,
  item: (bloque: string, item: string, sub: string) => `${bloque}.${item}.${sub}`,
  matriz: (bloque: string, grupo: string, fila: string) => `${bloque}.${grupo}.${fila}`,
  fila: (bloque: string, filaId: string, columna: string) => `${bloque}.${filaId}.${columna}`,
  encabezado: (bloque: string, columna: string) => `${bloque}.encabezados.${columna}`,
  cuadrante: (bloque: string, cuadrante: string, i: number) => `${bloque}.${cuadrante}.${i}`,
};

/** Primer segmento de un campo_id: el bloque al que pertenece. */
export const bloqueDe = (campoId: string): string => campoId.split(".")[0] ?? campoId;

/** Recorre todos los bloques de una definición, en orden de lectura. */
export function* bloques(def: Definicion): Generator<Bloque> {
  for (const seccion of def.secciones) {
    for (const bloque of seccion.bloques) yield bloque;
  }
}

export function buscarBloque(def: Definicion, id: string): Bloque | undefined {
  for (const b of bloques(def)) if (b.id === id) return b;
  return undefined;
}
