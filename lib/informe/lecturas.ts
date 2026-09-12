import { campo } from "@/lib/talleres/rutas";
import { opcion } from "@/lib/talleres/escalas";
import type { DatosInforme } from "./cuerpo";
import type { ColorEscala, Sugerencia } from "@/lib/talleres/tipos";

/**
 * Conclusiones calculadas a partir de una bitácora.
 *
 * El informe (cuerpo.ts) es un acta: le devuelve a la empresa lo que la
 * empresa escribió. Esto es lo contrario — solo dice cosas que nadie
 * escribió, deducidas de cruzar respuestas.
 *
 * Los lectores se enganchan al TIPO DE BLOQUE, nunca a un taller concreto.
 * Es la misma regla que hizo genérico al informe: cablearlos al Módulo 1
 * obligaría a escribir código nuevo para los módulos 2 a 4, que es
 * exactamente el error que costó las once funciones `render()`.
 *
 * Nada de esto adivina. Si faltan datos para sostener una lectura, la
 * lectura sale marcada como incompleta en vez de rellenarse con supuestos.
 */

export type Senal = "favorable" | "atencion" | "alerta" | "neutro";

export type Cifra = { n: string; k: string; color?: ColorEscala };
export type Barra = { rotulo: string; valor: number; total: number; color?: ColorEscala };

export type Lectura = {
  id: string;
  titulo: string;
  origen: string;
  senal: Senal;
  titular: string;
  detalle?: string;
  cifras?: Cifra[];
  barras?: Barra[];
  /** Faltan respuestas para sostenerla. Se muestra, atenuada, con qué falta. */
  incompleta?: boolean;
};

// ---------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------

const texto = (d: DatosInforme, id: string) => {
  const v = d.respuestas.get(id);
  return typeof v === "string" ? v.trim() : "";
};

const lista = (d: DatosInforme, id: string) => {
  const v = d.respuestas.get(id);
  return Array.isArray(v) ? v.filter((x) => String(x).trim() !== "") : [];
};

/**
 * Número escrito por una persona, no por una máquina: admite separadores de
 * miles con punto o coma, símbolo de peso y espacios.
 *
 * Con un solo separador y tres dígitos detrás («1.500») se interpreta como
 * separador de miles, no como decimal. Es ambiguo de verdad, y en pesos
 * colombianos —que es lo que el Taller 8 recoge— leer 1.500 como uno coma
 * cinco sería el error caro.
 */
export function numero(bruto: string): number | null {
  const s = bruto.replace(/[^\d.,-]/g, "").trim();
  if (s === "" || !/\d/.test(s)) return null;

  const comas = (s.match(/,/g) ?? []).length;
  const puntos = (s.match(/\./g) ?? []).length;
  const tras = (sep: string) => s.length - s.lastIndexOf(sep) - 1;

  let normal: string;
  if (comas && puntos) {
    // Conviven los dos: el decimal es el que aparece de último.
    normal = s.lastIndexOf(",") > s.lastIndexOf(".")
      ? s.replace(/\./g, "").replace(",", ".")
      : s.replace(/,/g, "");
  } else if (comas) {
    normal = comas === 1 && tras(",") !== 3 ? s.replace(",", ".") : s.replace(/,/g, "");
  } else if (puntos) {
    normal = puntos === 1 && tras(".") !== 3 ? s : s.replace(/\./g, "");
  } else {
    normal = s;
  }

  const n = Number(normal);
  return Number.isFinite(n) ? n : null;
}

const pct = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(n % 1 === 0 ? 0 : 1)}%`;

// ---------------------------------------------------------------------
// 1 · Balance del entorno · toda escala que declare `sugiere`
// ---------------------------------------------------------------------

type Marca = { sugiere: Sugerencia; etiqueta: string; contexto: string };

function marcas(d: DatosInforme): Marca[] {
  const out: Marca[] = [];
  for (const t of d.talleres) {
    for (const s of t.definicion.secciones) {
      for (const b of s.bloques) {
        if (b.tipo === "fichas_escala") {
          for (const it of b.items) {
            const o = opcion(b.escala, texto(d, campo.item(b.id, it.id, "valoracion")));
            if (o?.sugiere) out.push({ sugiere: o.sugiere, etiqueta: it.titulo, contexto: t.corto });
          }
          // Las tendencias propias del sector se guardan como filas, no en
          // `items`: dejarlas fuera subestimaría el balance de quien más
          // trabajo se tomó.
          for (const f of d.filas.filter((x) => x.bloqueId === b.id && x.tallerId === t.id)) {
            const o = opcion(b.escala, texto(d, campo.fila(b.id, f.id, "valoracion")));
            const titulo = texto(d, campo.fila(b.id, f.id, "titulo"));
            if (o?.sugiere) out.push({ sugiere: o.sugiere, etiqueta: titulo || "Propia", contexto: t.corto });
          }
        } else if (b.tipo === "matriz_escala") {
          for (const g of b.grupos) {
            for (const f of g.filas) {
              const o = opcion(b.escala, texto(d, campo.matriz(b.id, g.id, f.id)));
              if (o?.sugiere) out.push({ sugiere: o.sugiere, etiqueta: f.texto, contexto: g.titulo });
            }
          }
        }
      }
    }
  }
  return out;
}

function balanceEntorno(d: DatosInforme): Lectura | null {
  const m = marcas(d);
  if (m.length === 0) return null;
  const opo = m.filter((x) => x.sugiere === "oportunidad").length;
  const ame = m.filter((x) => x.sugiere === "amenaza").length;

  const senal: Senal = ame > opo * 1.5 ? "alerta" : opo > ame ? "favorable" : "atencion";
  const titular = ame > opo
    ? `El entorno te presiona más de lo que te abre: ${ame} amenazas contra ${opo} oportunidades.`
    : opo > ame
      ? `El entorno te abre más de lo que te aprieta: ${opo} oportunidades contra ${ame} amenazas.`
      : `Entorno equilibrado: ${opo} oportunidades y ${ame} amenazas.`;

  return {
    id: "balance-entorno",
    titulo: "Balance del entorno",
    origen: "De todo lo que calificaste con una escala",
    senal,
    titular,
    detalle: m.length < 20
      ? `Calculado sobre ${m.length} calificaciones. Entre más completes, más firme la lectura.`
      : `Calculado sobre ${m.length} calificaciones.`,
    cifras: [
      { n: String(opo), k: "oportunidades", color: "fav" },
      { n: String(ame), k: "amenazas", color: "des" },
    ],
    incompleta: m.length < 10,
  };
}

// ---------------------------------------------------------------------
// 2 · Frente más adverso · cualquier `matriz_escala`
// ---------------------------------------------------------------------

function frenteAdverso(d: DatosInforme): Lectura | null {
  for (const t of d.talleres) {
    for (const s of t.definicion.secciones) {
      for (const b of s.bloques) {
        if (b.tipo !== "matriz_escala") continue;
        const filas = b.grupos.map((g) => {
          let ame = 0, resp = 0;
          for (const f of g.filas) {
            const o = opcion(b.escala, texto(d, campo.matriz(b.id, g.id, f.id)));
            if (o) resp++;
            if (o?.sugiere === "amenaza") ame++;
          }
          return { titulo: g.titulo, ame, resp, total: g.filas.length };
        });
        const conRespuesta = filas.filter((f) => f.resp > 0);
        if (conRespuesta.length === 0) continue;

        const peor = [...conRespuesta].sort((a, b2) => b2.ame / b2.resp - a.ame / a.resp)[0]!;
        const sinTocar = filas.filter((f) => f.resp === 0).map((f) => f.titulo);

        return {
          id: `frente-${b.id}`,
          titulo: "Frente más adverso",
          origen: `${t.corto} · ${b.grupos.length} frentes`,
          senal: peor.ame / peor.resp > 0.5 ? "alerta" : "atencion",
          titular: peor.ame === 0
            ? "Ningún frente del entorno te resulta claramente adverso."
            : `Lo que más te presiona viene de «${peor.titulo}»: ${peor.ame} de ${peor.resp} hechos calificados en contra.`,
          detalle: sinTocar.length
            ? `Sin calificar todavía: ${sinTocar.join(", ")}.`
            : undefined,
          barras: conRespuesta.map((f) => ({
            rotulo: f.titulo, valor: f.ame, total: f.resp, color: "des" as ColorEscala,
          })),
          incompleta: sinTocar.length > 0,
        };
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------
// 3 · Quién manda en el margen · cualquier `ranking_escala`
// ---------------------------------------------------------------------

function mandaEnElMargen(d: DatosInforme): Lectura | null {
  for (const t of d.talleres) {
    for (const s of t.definicion.secciones) {
      for (const b of s.bloques) {
        if (b.tipo !== "ranking_escala") continue;
        const puestos = b.items.map((it) => ({
          titulo: it.titulo,
          orden: texto(d, campo.item(b.id, it.id, "prioridad")),
          valor: texto(d, campo.item(b.id, it.id, "impacto")),
        }));
        const primera = puestos.find((p) => p.orden === "1");
        const calificadas = puestos.filter((p) => p.valor !== "").length;
        if (!primera && calificadas === 0) continue;

        const o = primera ? opcion(b.escala, primera.valor) : undefined;
        const aprieta = o?.sugiere === "amenaza";

        return {
          id: `manda-${b.id}`,
          titulo: "Quién manda en tu margen",
          origen: t.corto,
          senal: aprieta ? "alerta" : o ? "favorable" : "neutro",
          titular: !primera
            ? "Todavía no ordenaste cuál fuerza pesa más."
            : !o
              ? `Pusiste «${primera.titulo}» de primera, pero falta calificar su efecto.`
              : aprieta
                ? `«${primera.titulo}» es la que más pesa, y su efecto sobre tu rentabilidad es ${o.etiqueta.toLowerCase()}. Tu margen no lo define tu costo: lo define esa fuerza.`
                : `«${primera.titulo}» es la que más pesa, con efecto ${o.etiqueta.toLowerCase()} sobre tu rentabilidad.`,
          detalle: `${calificadas} de ${b.items.length} fuerzas calificadas.`,
          barras: puestos
            .filter((p) => p.valor !== "")
            .map((p) => {
              const op = opcion(b.escala, p.valor);
              const peso = op?.sugiere === "amenaza" ? 3 : op?.sugiere === "oportunidad" ? 1 : 2;
              return { rotulo: p.titulo, valor: peso, total: 3, color: op?.color };
            }),
          incompleta: calificadas < b.items.length,
        };
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------
// 4 · Tendencia de tus números · cualquier `tabla` con columnas numéricas
// ---------------------------------------------------------------------

function tendenciaNumeros(d: DatosInforme): Lectura | null {
  for (const t of d.talleres) {
    for (const s of t.definicion.secciones) {
      for (const b of s.bloques) {
        if (b.tipo !== "tabla") continue;
        const nums = b.columnas.filter((c) => c.numerica);
        if (nums.length < 2) continue;
        const etiqueta = b.columnas.find((c) => !c.numerica);
        if (!etiqueta) continue;

        const filas = d.filas
          .filter((f) => f.bloqueId === b.id && f.tallerId === t.id)
          .sort((a, b2) => a.orden - b2.orden);

        const series = filas.map((f) => {
          const nombre = texto(d, campo.fila(b.id, f.id, etiqueta.id));
          const valores = nums.map((c) => numero(texto(d, campo.fila(b.id, f.id, c.id))));
          return { nombre, valores };
        }).filter((x) => x.nombre !== "" && x.valores.filter((v) => v !== null).length >= 2);

        if (series.length === 0) {
          return {
            id: `tendencia-${b.id}`,
            titulo: "Tendencia de tus números",
            origen: t.corto,
            senal: "neutro",
            titular: "Todavía no hay dos años con cifras para comparar.",
            detalle: "Es la única lectura del módulo que se apoya en datos duros. Vale la pena completarla aunque sea con estimaciones.",
            incompleta: true,
          };
        }

        const cambios = series.map((x) => {
          const llenos = x.valores.filter((v): v is number => v !== null);
          const ini = llenos[0]!, fin = llenos[llenos.length - 1]!;
          return { nombre: x.nombre, ini, fin, cambio: ini === 0 ? null : ((fin - ini) / Math.abs(ini)) * 100 };
        }).filter((c) => c.cambio !== null) as { nombre: string; ini: number; fin: number; cambio: number }[];

        if (cambios.length === 0) continue;

        const suben = cambios.filter((c) => c.cambio > 2);
        const bajan = cambios.filter((c) => c.cambio < -2);
        // La divergencia es el hallazgo: crecer y perder margen a la vez.
        const divergen = suben.length > 0 && bajan.length > 0;
        const mayorCaida = [...bajan].sort((a, b2) => a.cambio - b2.cambio)[0];

        return {
          id: `tendencia-${b.id}`,
          titulo: "Tendencia de tus números",
          origen: `${t.corto} · ${cambios.length} indicadores comparables`,
          senal: bajan.length > suben.length ? "alerta" : divergen ? "atencion" : suben.length ? "favorable" : "neutro",
          titular: divergen
            ? `Tus números no se mueven en la misma dirección: ${suben.length} suben y ${bajan.length} bajan. Eso casi nunca es casualidad.`
            : bajan.length
              ? `${bajan.length} de ${cambios.length} indicadores vienen cayendo.`
              : `${suben.length} de ${cambios.length} indicadores vienen subiendo.`,
          detalle: mayorCaida
            ? `La caída más fuerte es «${mayorCaida.nombre}», ${pct(mayorCaida.cambio)}.`
            : undefined,
          cifras: cambios.slice(0, 4).map((c) => ({
            n: pct(c.cambio), k: c.nombre,
            color: c.cambio > 2 ? "fav" : c.cambio < -2 ? "des" : "med",
          })),
          incompleta: cambios.length < filas.length,
        };
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------
// 5 · Coherencia del cierre · cualquier `cuadrantes` con `alimentadoPor`
// ---------------------------------------------------------------------

function coherenciaCierre(d: DatosInforme): Lectura | null {
  const m = marcas(d);
  for (const t of d.talleres) {
    for (const s of t.definicion.secciones) {
      for (const b of s.bloques) {
        if (b.tipo !== "cuadrantes" || !b.alimentadoPor) continue;

        const filas: { rol: Sugerencia; cuadrante: string; disponibles: number; escritas: number; lineas: number }[] = [];
        for (const [rol, cuadranteId] of Object.entries(b.alimentadoPor) as [Sugerencia, string][]) {
          const c = b.cuadrantes.find((q) => q.id === cuadranteId);
          if (!c) continue;
          let escritas = 0;
          for (let i = 0; i < c.lineas; i++) {
            if (texto(d, campo.cuadrante(b.id, c.id, i)) !== "") escritas++;
          }
          filas.push({
            rol, cuadrante: c.titulo, lineas: c.lineas,
            disponibles: m.filter((x) => x.sugiere === rol).length,
            escritas,
          });
        }
        if (filas.length === 0) continue;

        const huerfanos = filas.filter((f) => f.disponibles >= 3 && f.escritas === 0);
        const totalEscritas = filas.reduce((a, f) => a + f.escritas, 0);

        return {
          id: `coherencia-${b.id}`,
          titulo: "Coherencia del cierre",
          origen: `${t.corto} · contra lo que marcaste antes`,
          senal: huerfanos.length ? "alerta" : totalEscritas === 0 ? "neutro" : "favorable",
          titular: huerfanos.length
            ? `Marcaste ${huerfanos.map((h) => `${h.disponibles} ${h.rol}s`).join(" y ")} en los talleres anteriores, pero el cuadrante de ${huerfanos.map((h) => h.cuadrante.toLowerCase()).join(" y ")} está vacío. El cierre no recogió tu propio diagnóstico.`
            : totalEscritas === 0
              ? "El cierre está sin escribir todavía."
              : "El cierre recoge lo que marcaste en los talleres anteriores.",
          detalle: filas
            .map((f) => `${f.cuadrante}: ${f.escritas} de ${f.lineas} escritas, con ${f.disponibles} sugerencias disponibles de tus propias respuestas.`)
            .join(" "),
          barras: filas.map((f) => ({
            rotulo: f.cuadrante, valor: f.escritas, total: Math.max(f.lineas, f.escritas),
            color: f.escritas === 0 && f.disponibles >= 3
              ? "des" as ColorEscala
              : f.escritas >= f.lineas ? "fav" as ColorEscala : "med" as ColorEscala,
          })),
          incompleta: totalEscritas === 0,
        };
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------
// 6 · Cobertura de lo enumerable · `chips_agregables` con `esperadas`
// ---------------------------------------------------------------------

function cobertura(d: DatosInforme): Lectura | null {
  const grupos: { rotulo: string; hay: number; pide: number }[] = [];
  let origen = "";
  for (const t of d.talleres) {
    for (const s of t.definicion.secciones) {
      for (const b of s.bloques) {
        if (b.tipo !== "chips_agregables" || !b.esperadas) continue;
        origen ||= t.corto;
        grupos.push({
          rotulo: b.etiqueta ?? b.id,
          hay: lista(d, campo.simple(b.id)).length,
          pide: b.esperadas,
        });
      }
    }
  }
  if (grupos.length === 0) return null;

  const cortos = grupos.filter((g) => g.hay < g.pide);
  return {
    id: "cobertura",
    titulo: "Cobertura",
    origen,
    senal: cortos.length === grupos.length ? "atencion" : cortos.length ? "atencion" : "favorable",
    titular: cortos.length === 0
      ? "Enumeraste al menos lo que el ejercicio pide en cada grupo."
      : `Faltan por nombrar: ${cortos.map((g) => `${g.rotulo.toLowerCase()} (${g.hay} de ${g.pide})`).join(", ")}.`,
    barras: grupos.map((g) => ({
      rotulo: g.rotulo, valor: g.hay, total: Math.max(g.pide, g.hay),
      color: g.hay >= g.pide ? "fav" as ColorEscala : "med" as ColorEscala,
    })),
    incompleta: cortos.length > 0,
  };
}

// ---------------------------------------------------------------------

const LECTORES = [
  balanceEntorno, frenteAdverso, mandaEnElMargen,
  tendenciaNumeros, coherenciaCierre, cobertura,
];

export function lecturas(d: DatosInforme): Lectura[] {
  return LECTORES.map((f) => f(d)).filter((x): x is Lectura => x !== null);
}
