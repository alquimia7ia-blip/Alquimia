import { z } from "zod";
import { ESCALAS } from "./escalas";
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
    columnas: z
      .array(
        z.object({
          id: identificador,
          titulo: z.string().min(1),
          multilinea: z.boolean().optional(),
          numerica: z.boolean().optional(),
          marcador: z.string().optional(),
          requerida: z.boolean().optional(),
        }),
      )
      .min(1),
    filasIniciales: z.number().int().min(0).max(50).optional(),
    filasMinimas: z.number().int().min(0).max(50).optional(),
    sugerencias: z.array(z.string()).optional(),
    columnasEditables: z
      .array(z.object({ id: identificador, valorPorDefecto: z.string() }))
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
      .object({ oportunidad: z.string().optional(), amenaza: z.string().optional() })
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
