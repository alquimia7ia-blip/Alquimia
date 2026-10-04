import { z } from "zod";
import { ESCALAS } from "./escalas";
import { cabecerasDe } from "./calculo";
import type { Definicion } from "./tipos";

/**
 * Validación de la definición de un taller.
 *
 * Se corre en el seed y en el editor de contenido, para que un error de
 * autoría falle ahí y no delante de una empresa a mitad del taller.
 */

const identificador = z
  .string()
  .min(1)
  .regex(/^[a-z0-9_-]+$/i, "solo letras, números, guion y guion bajo");

const escalaConocida = z.string().refine((id) => id in ESCALAS, {
  message: "escala desconocida; agrégala en lib/talleres/escalas.ts",
});

const base = {
  id: identificador,
  ayuda: z.string().optional(),
  detalle: z.object({ titulo: z.string(), cuerpo: z.string() }).optional(),
  peso: z.number().positive().optional(),
  requerido: z.boolean().optional(),
};

const color = z.enum(["fav", "med", "des", "na", "acento"]);

/** Columna de texto de una fila dinámica: la comparten tabla, priorización
 *  y cronograma. */
const columna = z.object({
  id: identificador,
  titulo: z.string().min(1),
  multilinea: z.boolean().optional(),
  numerica: z.boolean().optional(),
  marcador: z.string().optional(),
  requerida: z.boolean().optional(),
  origen: z.boolean().optional(),
});

const formato = z.enum(["numero", "pesos", "porcentaje"]);

/** Un operando de una fórmula. Qué refs son legales depende de dónde viva. */
const refCalculo = z.discriminatedUnion("de", [
  z.object({ de: z.literal("columna"), id: identificador }),
  z.object({ de: z.literal("parametro"), id: identificador }),
  z.object({ de: z.literal("total"), columna: identificador }),
  z.object({ de: z.literal("promedio"), columna: identificador }),
  z.object({ de: z.literal("indicador"), id: identificador }),
  z.object({ de: z.literal("constante"), valor: z.number() }),
]);

const operacion = z.discriminatedUnion("op", [
  // Uno solo es legal y se usa: es la forma de sacar el total de una columna
  // como indicador sin inventar una operación «identidad».
  z.object({ op: z.literal("suma"), de: z.array(refCalculo).min(1) }),
  z.object({ op: z.literal("producto"), de: z.array(refCalculo).min(1) }),
  z.object({ op: z.literal("resta"), de: z.tuple([refCalculo, refCalculo]) }),
  z.object({ op: z.literal("division"), de: z.tuple([refCalculo, refCalculo]) }),
  z.object({ op: z.literal("porcentaje"), de: z.tuple([refCalculo, refCalculo]) }),
]);

const columnaCalculada = columna.extend({
  unidad: z.string().optional(),
  pista: z.string().optional(),
  calculada: operacion.optional(),
  formato: formato.optional(),
  decimales: z.number().int().min(0).max(4).optional(),
  total: z.boolean().optional(),
});

const bloque = z.discriminatedUnion("tipo", [
  z.object({ ...base, tipo: z.literal("nota"), cuerpo: z.string().min(1) }),

  z.object({
    ...base,
    tipo: z.literal("texto"),
    etiqueta: z.string().optional(),
    marcador: z.string().optional(),
    multilinea: z.boolean().optional(),
  }),

  z.object({
    ...base,
    tipo: z.literal("lista_numerada"),
    etiqueta: z.string().optional(),
    lineas: z.number().int().min(1).max(30),
    marcador: z.string().optional(),
  }),

  z.object({
    ...base,
    tipo: z.literal("fichas_escala"),
    escala: escalaConocida,
    items: z
      .array(
        z.object({
          id: identificador,
          titulo: z.string().min(1),
          descripcion: z.string().optional(),
        }),
      )
      .min(1),
    permiteAgregar: z.boolean().optional(),
    campoNota: z
      .object({ etiqueta: z.string(), requerido: z.boolean().optional() })
      .optional(),
  }),

  z.object({
    ...base,
    tipo: z.literal("matriz_escala"),
    escala: escalaConocida,
    grupos: z
      .array(
        z.object({
          id: identificador,
          titulo: z.string().min(1),
          filas: z
            .array(z.object({ id: identificador, texto: z.string().min(1) }))
            .min(1),
        }),
      )
      .min(1),
  }),

  z.object({
    ...base,
    tipo: z.literal("ranking_escala"),
    escala: escalaConocida,
    items: z
      .array(
        z.object({
          id: identificador,
          titulo: z.string().min(1),
          descripcion: z.string().optional(),
          detalle: z.object({ titulo: z.string(), cuerpo: z.string() }).optional(),
        }),
      )
      .min(2),
    campoNota: z
      .object({ etiqueta: z.string(), requerido: z.boolean().optional() })
      .optional(),
  }),

  z.object({
    ...base,
    tipo: z.literal("tabla"),
    columnas: z.array(columna).min(1),
    filasIniciales: z.number().int().min(0).max(50).optional(),
    filasMinimas: z.number().int().min(0).max(50).optional(),
    sugerencias: z.array(z.string()).optional(),
    columnasEditables: z
      .array(z.object({ id: identificador, valorPorDefecto: z.string() }))
      .optional(),
  }),

  z.object({
    ...base,
    tipo: z.literal("matriz_priorizacion"),
      columnas: z.array(columna).min(1),
      criterios: z
        .array(
          z.object({
            id: identificador,
            titulo: z.string().min(1),
            ayuda: z.string().optional(),
            invertido: z.boolean().optional(),
          }),
        )
        .min(2),
      maximo: z.number().int().min(2).max(10),
    filasIniciales: z.number().int().min(0).max(50).optional(),
    filasMinimas: z.number().int().min(0).max(50).optional(),
    sugerencias: z.array(z.string()).optional(),
  }),

  z.object({
    ...base,
    tipo: z.literal("flujo_caja"),
    meses: z.number().int().min(3).max(36),
    mesInicial: z.number().int().min(0).max(11).optional(),
    etiquetaInicial: z.string().optional(),
    entradas: z.array(z.object({ id: identificador, titulo: z.string().min(1) })).min(1),
    salidas: z.array(z.object({ id: identificador, titulo: z.string().min(1) })).min(1),
  }),

  z.object({
    ...base,
    tipo: z.literal("cronograma"),
    columnas: z.array(columna).min(1),
    anios: z.array(z.number().int().min(2000).max(2100)).min(1).max(10),
    filasIniciales: z.number().int().min(0).max(50).optional(),
    filasMinimas: z.number().int().min(0).max(50).optional(),
    sugerencias: z.array(z.string()).optional(),
  }),

  z.object({
    ...base,
    tipo: z.literal("tabla_calculada"),
    parametros: z
      .array(
        z.object({
          id: identificador,
          titulo: z.string().min(1),
          unidad: z.string().optional(),
          pista: z.string().optional(),
          marcador: z.string().optional(),
          requerido: z.boolean().optional(),
        }),
      )
      .optional(),
    // Vacío es legal: el OEE son cinco parámetros y cuatro indicadores, sin
    // tabla. Lo que no es legal es un bloque sin nada que teclear, y eso lo
    // comprueba el superRefine de abajo.
    columnas: z.array(columnaCalculada),
    filasIniciales: z.number().int().min(0).max(50).optional(),
    filasMinimas: z.number().int().min(0).max(50).optional(),
    sugerencias: z.array(z.string()).optional(),
    textoAgregar: z.string().optional(),
    indicadores: z
      .array(
        z.object({
          id: identificador,
          titulo: z.string().min(1),
          pista: z.string().optional(),
          calculada: operacion,
          formato: formato.optional(),
          decimales: z.number().int().min(0).max(4).optional(),
          unidad: z.string().optional(),
          principal: z.boolean().optional(),
          oculto: z.boolean().optional(),
        }),
      )
      .optional(),
    veredicto: z
      .discriminatedUnion("tipo", [
        z.object({
          tipo: z.literal("umbral"),
          indicador: identificador,
          tramos: z
            .array(
              z.object({
                hasta: z.number().optional(),
                color,
                texto: z.string().min(1),
              }),
            )
            .min(2),
        }),
        z.object({
          tipo: z.literal("fila_maxima"),
          columna: identificador,
          nombre: identificador,
          texto: z.string().min(1),
        }),
      ])
      .optional(),
  }),

  z.object({
    ...base,
    tipo: z.literal("chips_agregables"),
    etiqueta: z.string().optional(),
    descripcion: z.string().optional(),
    sugerencias: z.array(z.string()).optional(),
    esperadas: z.number().int().min(1).max(20).optional(),
  }),

  z.object({
    ...base,
    tipo: z.literal("linea_tiempo"),
    filasIniciales: z.number().int().min(0).max(50).optional(),
    filasMinimas: z.number().int().min(0).max(50).optional(),
    marcadorAnio: z.string().optional(),
    marcadorHecho: z.string().optional(),
  }),

  z.object({
    ...base,
    tipo: z.literal("cuadrantes"),
    cuadrantes: z
      .array(
        z.object({
          id: identificador,
          titulo: z.string().min(1),
          subtitulo: z.string().optional(),
          color,
          lineas: z.number().int().min(1).max(20),
        }),
      )
      .min(2),
    alimentadoPor: z
      .object({
        oportunidad: z.string().optional(),
        amenaza: z.string().optional(),
        fortaleza: z.string().optional(),
        debilidad: z.string().optional(),
      })
      .optional(),
  }),
]);

const seccion = z.object({
  id: identificador,
  titulo: z.string().optional(),
  lead: z.string().optional(),
  bloques: z.array(bloque).min(1),
});

export const definicionSchema = z
  .object({ version: z.literal(1), secciones: z.array(seccion).min(1) })
  .superRefine((def, ctx) => {
    // Los id de bloque son el primer segmento de cada campo_id: si se
    // repiten, dos bloques distintos escribirían sobre la misma respuesta.
    const vistos = new Set<string>();
    for (const s of def.secciones) {
      for (const b of s.bloques) {
        if (vistos.has(b.id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `id de bloque repetido: "${b.id}"`,
          });
        }
        vistos.add(b.id);

        // Columnas y criterios comparten el espacio de nombres del campo_id
        // (`<bloque>.<fila>.<id>`). Un id repetido entre los dos haría que la
        // nota de un criterio y el texto de una columna se escribieran sobre
        // el mismo campo, y el puntaje leería texto.
        if (b.tipo === "matriz_priorizacion") {
          const ids = [...b.columnas, ...b.criterios].map((x) => x.id);
          if (new Set(ids).size !== ids.length) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `bloque "${b.id}": columnas y criterios comparten un id`,
            });
          }
        }

        // «anio» y «mes» son los campos que el propio bloque escribe en cada
        // fila; una columna con ese id los sobrescribiría.
        if (b.tipo === "cronograma") {
          for (const col of b.columnas) {
            if (col.id === "anio" || col.id === "mes") {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `bloque "${b.id}": la columna "${col.id}" choca con la fecha`,
              });
            }
          }
        }

        // La tabla calculada es el único bloque cuya definición lleva
        // fórmulas, y una fórmula mal escrita no falla: devuelve «—» en
        // silencio. Estas comprobaciones existen para que el error aparezca
        // al sembrar el contenido y no delante de una empresa.
        if (b.tipo === "tabla_calculada") {
          const col = new Map(b.columnas.map((c) => [c.id, c]));
          const entradas = b.columnas.filter((c) => !c.calculada);
          const indicadores = b.indicadores ?? [];
          const falla = (m: string) =>
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: `bloque "${b.id}": ${m}` });

          if (col.size !== b.columnas.length) falla("hay columnas con el mismo id");
          if (new Set(indicadores.map((i) => i.id)).size !== indicadores.length) {
            falla("hay indicadores con el mismo id");
          }
          // «parametros» es el segundo segmento que usa `campo.parametro`.
          if (col.has("parametros")) falla('la columna "parametros" choca con los parámetros');
          if (entradas.length === 0 && (b.parametros ?? []).length === 0) {
            falla("no hay nada que teclear: solo columnas calculadas");
          }
          if (indicadores.filter((i) => i.principal).length > 1) {
            falla("dos indicadores marcados como principal");
          }

          const parametros = new Set((b.parametros ?? []).map((p) => p.id));
          const refParametro = (r: { de: string; id?: string }) =>
            r.de === "parametro" && !parametros.has(r.id ?? "")
              ? falla(`la fórmula usa el parámetro "${r.id}", que no existe`)
              : undefined;

          // Dentro de una fila no existen los totales: se calculan después,
          // cuando ya están todas las filas. Sí existen los indicadores de
          // cabecera, que solo miran parámetros —el takt time—.
          const cabecera = cabecerasDe(b);
          const vistas = new Set<string>();
          for (const c of b.columnas) {
            if (!c.calculada) {
              vistas.add(c.id);
              continue;
            }
            if (c.origen) falla(`la columna calculada "${c.id}" no puede llevar origen`);
            for (const r of c.calculada.de) {
              refParametro(r);
              if (r.de === "total" || r.de === "promedio") {
                falla(`la columna "${c.id}" usa "${r.de}", que no existe dentro de una fila`);
              }
              if (r.de === "indicador" && !cabecera.has(r.id)) {
                // Si dependiera de las filas, la fila necesitaría el total y
                // el total necesitaría la fila.
                falla(
                  `la columna "${c.id}" usa el indicador "${r.id}", que depende de la tabla`,
                );
              }
              if (r.de === "columna") {
                const origen = col.get(r.id);
                if (!origen) falla(`la columna "${c.id}" usa "${r.id}", que no existe`);
                else if (!origen.numerica && !origen.calculada) {
                  falla(`la columna "${c.id}" opera sobre "${r.id}", que no es numérica`);
                } else if (!vistas.has(r.id)) {
                  // Se evalúan en orden de declaración: una columna no puede
                  // apoyarse en otra que todavía no se ha calculado.
                  falla(`la columna "${c.id}" usa "${r.id}", declarada después`);
                }
              }
            }
            vistas.add(c.id);
          }

          const listos = new Set<string>();
          for (const ind of indicadores) {
            for (const r of ind.calculada.de) {
              refParametro(r);
              if (r.de === "columna") {
                falla(`el indicador "${ind.id}" usa una columna suelta; usa total o promedio`);
              }
              if ((r.de === "total" || r.de === "promedio") && !col.has(r.columna)) {
                falla(`el indicador "${ind.id}" suma "${r.columna}", que no existe`);
              }
              if (r.de === "indicador" && !listos.has(r.id)) {
                falla(`el indicador "${ind.id}" usa "${r.id}", declarado después`);
              }
            }
            listos.add(ind.id);
          }

          const v = b.veredicto;
          if (v?.tipo === "umbral") {
            if (!indicadores.some((i) => i.id === v.indicador)) {
              falla(`el veredicto mira el indicador "${v.indicador}", que no existe`);
            }
            // El último tramo es el que recoge todo lo que quedó por encima;
            // sin él, un valor alto no tendría veredicto.
            v.tramos.forEach((t, i) => {
              const ultimo = i === v.tramos.length - 1;
              if (!ultimo && t.hasta == null) falla("solo el último tramo puede no tener tope");
              const previo = v.tramos[i - 1]?.hasta;
              if (t.hasta != null && previo != null && t.hasta <= previo) {
                falla("los tramos del veredicto no van de menor a mayor");
              }
            });
          }
          if (v?.tipo === "fila_maxima") {
            const medida = col.get(v.columna);
            if (!medida || (!medida.numerica && !medida.calculada)) {
              falla(`el veredicto ordena por "${v.columna}", que no es una columna numérica`);
            }
            const nombre = col.get(v.nombre);
            if (!nombre || nombre.calculada || nombre.numerica) {
              falla(`el veredicto nombra la fila con "${v.nombre}", que no es texto que se teclee`);
            }
          }
        }

        if (b.tipo === "cuadrantes" && b.alimentadoPor) {
          const ids = new Set(b.cuadrantes.map((q) => q.id));
          for (const destino of Object.values(b.alimentadoPor)) {
            if (destino && !ids.has(destino)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `alimentadoPor apunta al cuadrante "${destino}", que no existe`,
              });
            }
          }
        }
      }
    }
  });

export const tallerSemillaSchema = z.object({
  numero: z.number().int().min(1),
  slug: identificador,
  corto: z.string().min(1),
  titulo: z.string().min(1),
  lead: z.string(),
  definicion: definicionSchema,
  camposMinimos: z.number().int().min(0).optional(),
});

/** Valida y devuelve la definición tipada, o lanza con un mensaje legible. */
export function validarDefinicion(valor: unknown, contexto: string): Definicion {
  const r = definicionSchema.safeParse(valor);
  if (!r.success) {
    const detalle = r.error.issues
      .map((i) => `  · ${i.path.join(".") || "(raíz)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Definición inválida en ${contexto}:\n${detalle}`);
  }
  return r.data as Definicion;
}
