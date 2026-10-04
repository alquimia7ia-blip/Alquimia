import { campo } from "./rutas";
import { cifra } from "./flujo";
import type {
  BloqueTablaCalculada,
  ColorEscala,
  ColumnaCalculada,
  Fila,
  FormatoCifra,
  IndicadorCalculo,
  Operacion,
  RefCalculo,
} from "./tipos";

/**
 * La aritmética de las tablas calculadas.
 *
 * Vive aparte y sin dependencias de React, igual que `flujo.ts`: la pantalla,
 * el informe en PDF y la prueba automática usan esta misma función. Si cada
 * uno sumara por su cuenta, una empresa podría ver un OEE del 48 % en el
 * taller y leer 62 % en su informe final —y decidir si compra una máquina
 * con uno de los dos documentos.
 *
 * Tres reglas sostienen todo lo demás:
 *
 *  1. **Una celda vacía vale cero.** Es lo que ya hace `cifra()` en el flujo
 *     de caja, y vale la pena ser consistente: el usuario no distingue entre
 *     «cero» y «todavía no escribí», pero sí nota si dos tablas del mismo
 *     taller tratan su celda vacía de forma distinta.
 *  2. **Dividir por cero da `null`, nunca infinito.** Un OEE que diga
 *     `Infinity` destruye la confianza en todo el tablero.
 *  3. **Nada de lo calculado es un campo.** No se guarda, no cuenta al
 *     progreso y no se puede teclear encima. Pedir un total como dato es
 *     invitar a cuadrarlo a mano, que es justo lo que el taller quiere evitar.
 */

/** Lee el valor crudo de un campo. Lo provee el contexto o el informe. */
export type Lectura = (campoId: string) => unknown;

export type FilaCalculada = {
  id: string;
  /** Ninguna columna que se teclea tiene contenido: la fila está en blanco. */
  vacia: boolean;
  /** Entradas y derivadas. `null` solo cuando la fórmula no se pudo resolver. */
  valores: Map<string, number | null>;
  /** Lo tecleado tal cual, para las columnas de texto. */
  textos: Map<string, string>;
};

export type TablaCalculada = {
  parametros: Map<string, number>;
  filas: FilaCalculada[];
  /** Suma por columna, sobre las filas con dato. */
  totales: Map<string, number>;
  indicadores: Map<string, number | null>;
  /** Nadie ha escrito nada todavía: ni parámetros ni celdas. */
  vacia: boolean;
  veredicto: { texto: string; color: ColorEscala } | null;
};

/** Las columnas que la empresa teclea, en el orden en que se muestran. */
export const entradasDe = (b: BloqueTablaCalculada): ColumnaCalculada[] =>
  b.columnas.filter((c) => !c.calculada);

/** Las columnas que el bloque calcula. */
export const derivadasDe = (b: BloqueTablaCalculada): ColumnaCalculada[] =>
  b.columnas.filter((c) => c.calculada);

/**
 * Los indicadores que no dependen de las filas.
 *
 * La comparten el cálculo y la validación del esquema a propósito: si cada
 * uno decidiera por su cuenta qué es «de cabecera», el esquema aprobaría una
 * fórmula que el cálculo luego resolvería como «—» sin decir por qué.
 */
export function cabecerasDe(b: { indicadores?: IndicadorCalculo[] }): Set<string> {
  const salida = new Set<string>();
  for (const ind of b.indicadores ?? []) {
    const propio = ind.calculada.de.every(
      (r) =>
        r.de === "parametro"
        || r.de === "constante"
        || (r.de === "indicador" && salida.has(r.id)),
    );
    if (propio) salida.add(ind.id);
  }
  return salida;
}

// ---------------------------------------------------------------------
// Evaluación
// ---------------------------------------------------------------------

/** Resuelve una operación. Cualquier operando sin resolver anula el resultado. */
function operar(o: Operacion, ref: (r: RefCalculo) => number | null): number | null {
  const vals = o.de.map(ref);
  if (vals.some((v) => v === null)) return null;
  const n = vals as number[];

  switch (o.op) {
    case "suma":
      return n.reduce((s, x) => s + x, 0);
    case "producto":
      return n.reduce((s, x) => s * x, 1);
    case "resta":
      return n[0]! - n[1]!;
    // Dividir por cero no es un error de la empresa: es una tabla a medio
    // llenar. Devolver null deja la celda en «—» y el taller sigue usable.
    case "division":
      return n[1] === 0 ? null : n[0]! / n[1]!;
    case "porcentaje":
      return n[1] === 0 ? null : (n[0]! / n[1]!) * 100;
  }
}

/**
 * Calcula el bloque completo: parámetros, filas, totales e indicadores.
 *
 * El orden importa y es el único orden posible: las derivadas de una fila
 * necesitan sus entradas; los totales necesitan todas las filas; los
 * indicadores necesitan los totales y pueden apoyarse en indicadores
 * anteriores —de ahí que se evalúen en el orden en que están declarados, que
 * el esquema obliga a respetar—.
 */
export function calcularTabla(
  b: BloqueTablaCalculada,
  filas: Fila[],
  leer: Lectura,
): TablaCalculada {
  const crudo = (campoId: string) => {
    const v = leer(campoId);
    return typeof v === "string" ? v : "";
  };

  const parametros = new Map<string, number>();
  let algoEscrito = false;
  for (const p of b.parametros ?? []) {
    const texto = crudo(campo.parametro(b.id, p.id));
    if (texto.trim() !== "") algoEscrito = true;
    parametros.set(p.id, cifra(texto));
  }

  const entradas = entradasDe(b);
  const derivadas = derivadasDe(b);

  // Los indicadores de cabecera van primero: no dependen de las filas y las
  // filas sí dependen de ellos. El takt time es el caso: una cifra para toda
  // la planta contra la que se compara cada estación.
  const indicadores = new Map<string, number | null>();
  const cabecera = cabecerasDe(b);
  const hayParametros = algoEscrito;
  for (const ind of b.indicadores ?? []) {
    if (!cabecera.has(ind.id)) continue;
    indicadores.set(
      ind.id,
      hayParametros
        ? operar(ind.calculada, (r) => {
            if (r.de === "parametro") return parametros.get(r.id) ?? null;
            if (r.de === "indicador") return indicadores.get(r.id) ?? null;
            if (r.de === "constante") return r.valor;
            return null;
          })
        : null,
    );
  }

  const calculadas: FilaCalculada[] = filas.map((f) => {
    const valores = new Map<string, number | null>();
    const textos = new Map<string, string>();
    let vacia = true;

    for (const c of entradas) {
      const texto = crudo(campo.fila(b.id, f.id, c.id));
      if (texto.trim() !== "") {
        vacia = false;
        algoEscrito = true;
      }
      textos.set(c.id, texto);
      if (c.numerica) valores.set(c.id, cifra(texto));
    }

    // Una fila en blanco no se calcula. Sin esto, abrir el taller mostraría
    // una columna de ceros bien formados, que se lee como un resultado.
    for (const c of derivadas) {
      valores.set(
        c.id,
        vacia
          ? null
          : operar(c.calculada!, (r) => {
              if (r.de === "columna") return valores.get(r.id) ?? null;
              if (r.de === "parametro") return parametros.get(r.id) ?? null;
              if (r.de === "constante") return r.valor;
              // Solo los de cabecera: el esquema rechaza una columna que se
              // apoye en un indicador que a su vez depende de las filas.
              if (r.de === "indicador") return indicadores.get(r.id) ?? null;
              // total y promedio no existen dentro de una fila.
              return null;
            }),
      );
    }

    return { id: f.id, vacia, valores, textos };
  });

  const conDato = calculadas.filter((f) => !f.vacia);

  const totales = new Map<string, number>();
  for (const c of b.columnas) {
    const suma = conDato.reduce((s, f) => s + (f.valores.get(c.id) ?? 0), 0);
    totales.set(c.id, suma);
  }
  const promedio = (columnaId: string): number | null =>
    conDato.length === 0 ? null : (totales.get(columnaId) ?? 0) / conDato.length;

  // Un bloque con tabla necesita al menos una fila con datos; el OEE, que
  // es solo parámetros, necesita que alguien haya escrito un parámetro.
  const sinInsumos = b.columnas.length > 0 ? conDato.length === 0 : !algoEscrito;

  for (const ind of b.indicadores ?? []) {
    if (cabecera.has(ind.id)) continue;
    indicadores.set(
      ind.id,
      sinInsumos
        ? null
        : operar(ind.calculada, (r) => {
            if (r.de === "total") return totales.get(r.columna) ?? null;
            if (r.de === "promedio") return promedio(r.columna);
            if (r.de === "parametro") return parametros.get(r.id) ?? null;
            if (r.de === "indicador") return indicadores.get(r.id) ?? null;
            if (r.de === "constante") return r.valor;
            return null;
          }),
    );
  }

  return {
    parametros,
    filas: calculadas,
    totales,
    indicadores,
    vacia: !algoEscrito,
    veredicto: veredictoDe(b, calculadas, indicadores),
  };
}

/** La frase que resume el bloque, o nada si aún no hay con qué. */
function veredictoDe(
  b: BloqueTablaCalculada,
  filas: FilaCalculada[],
  indicadores: Map<string, number | null>,
): { texto: string; color: ColorEscala } | null {
  const v = b.veredicto;
  if (!v) return null;

  if (v.tipo === "umbral") {
    const valor = indicadores.get(v.indicador);
    if (valor == null) return null;
    const ind = (b.indicadores ?? []).find((i) => i.id === v.indicador);
    const tramo = v.tramos.find((t) => t.hasta == null || valor <= t.hasta)
      ?? v.tramos[v.tramos.length - 1];
    if (!tramo) return null;
    return {
      color: tramo.color,
      texto: tramo.texto.replaceAll("{valor}", formatear(valor, ind)),
    };
  }

  // La fila que manda. Empate: la primera, y da igual cuál sea —si dos
  // estaciones tardan lo mismo, las dos son el cuello de botella—.
  let mejor: { fila: FilaCalculada; valor: number } | null = null;
  for (const f of filas) {
    const valor = f.valores.get(v.columna);
    if (valor == null) continue;
    if (!mejor || valor > mejor.valor) mejor = { fila: f, valor };
  }
  if (!mejor || mejor.valor === 0) return null;

  const columna = b.columnas.find((c) => c.id === v.columna);
  const nombre = mejor.fila.textos.get(v.nombre)?.trim();
  return {
    color: "des",
    texto: v.texto
      .replaceAll("{fila}", nombre || "la fila sin nombre")
      .replaceAll("{valor}", formatear(mejor.valor, columna)),
  };
}

// ---------------------------------------------------------------------
// Presentación
// ---------------------------------------------------------------------

type ConFormato = {
  formato?: FormatoCifra;
  decimales?: number;
  unidad?: string;
} | undefined;

/** Una cifra, como se muestra. `null` se ve como «—», nunca como 0. */
export function formatear(valor: number | null, c: ConFormato): string {
  if (valor == null || !Number.isFinite(valor)) return "—";
  const formato = c?.formato ?? "numero";
  const decimales = c?.decimales ?? (formato === "pesos" ? 0 : formato === "porcentaje" ? 1 : 0);
  // El OEE del ejemplo sale 71,24999999999999 en coma flotante y se mostraría
  // como «71,2» donde la calculadora de quien revisa da 71,25 → 71,3. Una
  // décima no cambia ninguna decisión, pero sí basta para que alguien deje de
  // creerle a la cifra, y la confianza en el número es todo lo que vende este
  // taller. Se recorta el ruido antes de redondear para mostrar.
  const limpio = Math.round(valor * 1e6) / 1e6;
  const n = limpio.toLocaleString("es-CO", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
  if (formato === "pesos") return `$${n}`;
  if (formato === "porcentaje") return `${n} %`;
  return c?.unidad ? `${n} ${c.unidad}` : n;
}

/** Los indicadores que se muestran: los intermedios no se ven. */
export const visiblesDe = (b: BloqueTablaCalculada): IndicadorCalculo[] =>
  (b.indicadores ?? []).filter((i) => !i.oculto);

/** El indicador que el bloque destaca, si declaró uno. */
export const principalDe = (b: BloqueTablaCalculada): IndicadorCalculo | undefined =>
  (b.indicadores ?? []).find((i) => i.principal);
