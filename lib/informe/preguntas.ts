import type { Lectura, Senal } from "./lecturas";

/**
 * De las conclusiones a las preguntas.
 *
 * Un tablero que solo describe no cambia nada. Cada lectura deja una
 * pregunta; aquí se escogen las tres que más pesan y las acciones que se
 * desprenden de ellas.
 *
 * El orden es por severidad, no por taller: lo que está en rojo va primero
 * aunque venga del último ejercicio. Una lectura incompleta pesa menos que
 * una completa de la misma señal — preguntar sobre datos que faltan es
 * preguntar por el ejercicio, no por la empresa.
 */

const PESO: Record<Senal, number> = { alerta: 3, atencion: 2, neutro: 1, favorable: 0 };

function severidad(l: Lectura): number {
  return PESO[l.senal] * 10 - (l.incompleta ? 1 : 0);
}

export type Cuestion = { id: string; pregunta: string; lectura: Lectura };

/** Las tres preguntas del módulo, de la más urgente a la menos. */
export function tresPreguntas(ls: Lectura[]): Cuestion[] {
  return [...ls]
    .filter((l): l is Lectura & { pregunta: string } => Boolean(l.pregunta))
    .sort((a, b) => severidad(b) - severidad(a))
    .slice(0, 3)
    .map((l) => ({ id: l.id, pregunta: l.pregunta, lectura: l }));
}

export type Foco = { id: string; accion: string; senal: Senal; origen: string };

/**
 * En qué enfocarse las próximas semanas.
 *
 * Solo salen focos de lecturas que no están en verde: si algo va bien no se
 * inventa una tarea para que la lista se vea larga.
 */
export function focos(ls: Lectura[]): Foco[] {
  return [...ls]
    .filter((l): l is Lectura & { foco: string } => Boolean(l.foco) && l.senal !== "favorable")
    .sort((a, b) => severidad(b) - severidad(a))
    .map((l) => ({ id: l.id, accion: l.foco, senal: l.senal, origen: l.titulo }));
}

/** Cuántas lecturas hay de cada señal. Alimenta el resumen de arriba. */
export function conteo(ls: Lectura[]): Record<Senal, number> {
  const c: Record<Senal, number> = { alerta: 0, atencion: 0, favorable: 0, neutro: 0 };
  for (const l of ls) c[l.senal]++;
  return c;
}
