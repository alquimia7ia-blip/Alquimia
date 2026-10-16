/**
 * Saldo de caja mes a mes.
 *
 * Vive aparte y sin dependencias, como `priorizacion.ts`: la pantalla, el
 * informe y la prueba usan la misma aritmética. Si cada uno sumara por su
 * cuenta, la empresa podría ver en el taller que la caja aguanta y leer en
 * su informe final que no — y la decisión de invertir se toma con uno de
 * los dos documentos.
 */

/** Lo escrito en una celda, ya convertido. Vacío o ilegible cuenta como 0. */
export function cifra(valor: unknown): number {
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : 0;
  if (typeof valor !== "string") return 0;
  // Se tolera cómo escribe la gente: «1.500.000», «1,500,000», «$ 1 500 000».
  const limpio = valor.replace(/[^\d,.-]/g, "").replace(/[.,](?=\d{3}\b)/g, "");
  const n = Number(limpio.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

export type MesFlujo = {
  /** Índice dentro del horizonte, 0 el primero. */
  indice: number;
  entradas: number;
  salidas: number;
  /** entradas − salidas. */
  neto: number;
  /** Saldo con el que se cierra el mes. */
  acumulado: number;
};

export type Flujo = {
  meses: MesFlujo[];
  /** Índice del primer mes que cierra en rojo. `null` si ninguno. */
  primerMesEnRojo: number | null;
  /** El saldo más bajo del horizonte: cuánto hay que conseguir, y cuándo. */
  valle: { indice: number; saldo: number } | null;
  /** Saldo al cerrar el horizonte. */
  saldoFinal: number;
};

/**
 * Recorre el horizonte acumulando.
 *
 * Lo que importa no es el saldo final sino **el valle**: un plan que termina
 * el año con diez millones y pasa por menos cero en mayo no es un plan
 * viable, es un plan que quiebra en mayo. El saldo final, mirado solo, lo
 * esconde.
 */
export function calcularFlujo(
  inicial: number,
  porMes: { entradas: number; salidas: number }[],
): Flujo {
  const meses: MesFlujo[] = [];
  let acumulado = inicial;
  let primerMesEnRojo: number | null = null;
  let valle: { indice: number; saldo: number } | null = null;

  porMes.forEach((m, indice) => {
    const neto = m.entradas - m.salidas;
    acumulado += neto;
    meses.push({ indice, entradas: m.entradas, salidas: m.salidas, neto, acumulado });

    if (acumulado < 0 && primerMesEnRojo === null) primerMesEnRojo = indice;
    if (!valle || acumulado < valle.saldo) valle = { indice, saldo: acumulado };
  });

  return { meses, primerMesEnRojo, valle, saldoFinal: acumulado };
}

/** Los doce meses, para rotular. Igual que en `priorizacion.ts`. */
export const MESES_CORTOS = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
] as const;

/** Rótulo de la columna n del horizonte, dando la vuelta al año. */
export function rotuloMes(indice: number, mesInicial = 0): string {
  return MESES_CORTOS[(mesInicial + indice) % 12]!;
}

/** Pesos colombianos, sin decimales: en caja los centavos no ayudan. */
export function pesos(n: number): string {
  return n.toLocaleString("es-CO", { maximumFractionDigits: 0 });
}
