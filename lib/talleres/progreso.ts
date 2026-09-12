import { campo, bloques } from "./rutas";
import type {
  Bloque,
  CampoEsperado,
  Definicion,
  Fila,
  ValorCampo,
} from "./tipos";

/**
 * Cálculo de progreso, genérico a partir de la definición del taller.
 *
 * Una sola implementación alimenta tres sitios: los anillos del cliente, el
 * informe del servidor y —con la misma semántica, traducida a SQL en
 * `app.valor_lleno` y `vista_progreso_taller`— el panel del facilitador.
 * Si esta función y aquella vista dejaran de coincidir, la empresa vería un
 * porcentaje y el docente otro.
 */

/** Espejo exacto de `app.valor_lleno(jsonb)` en 0002_funciones.sql. */
export function lleno(v: ValorCampo | undefined): boolean {
  if (v == null) return false;
  if (typeof v === "string") return v.trim() !== "";
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

const filasDe = (filas: Fila[], bloqueId: string) =>
  filas.filter((f) => f.bloqueId === bloqueId).sort((a, b) => a.orden - b.orden);

/**
 * Expande un bloque a la lista de campos que la definición espera.
 *
 * Las filas dinámicas aportan los campos que existen hoy; el piso de filas
 * esperadas se aplica después, en el denominador, igual que el
 * `Math.max(t, 12)` de los talleres 8, 9 y 10 del prototipo.
 */
function camposDeBloque(b: Bloque, filas: Fila[]): CampoEsperado[] {
  const peso = b.peso ?? 1;
  const req = b.requerido ?? true;
  const c = (campoId: string, requerido = req): CampoEsperado => ({
    campoId,
    peso,
    requerido,
  });

  switch (b.tipo) {
    case "nota":
      return [];

    case "texto":
      return [c(campo.simple(b.id))];

    case "lista_numerada":
      return Array.from({ length: b.lineas }, (_, i) => c(campo.linea(b.id, i)));

    case "fichas_escala": {
      const fijas = b.items.flatMap((it) => {
        const salida = [c(campo.item(b.id, it.id, "valoracion"))];
        // La nota es opcional por defecto: exigirla en 15 tendencias
        // convertiría el taller en una tarea de escritura, no de análisis.
        if (b.campoNota) {
          salida.push(c(campo.item(b.id, it.id, "nota"), b.campoNota.requerido ?? false));
        }
        return salida;
      });
      // Las fichas que agrega la empresa llevan los mismos campos que las
      // fijas, nota incluida: si aquí faltara, la interfaz mostraría un campo
      // que el progreso no cuenta y el informe no exportaría.
      const propias = filasDe(filas, b.id).flatMap((f) => {
        const salida = [
          c(campo.fila(b.id, f.id, "titulo")),
          c(campo.fila(b.id, f.id, "valoracion")),
        ];
        if (b.campoNota) {
          salida.push(c(campo.fila(b.id, f.id, "nota"), b.campoNota.requerido ?? false));
        }
        return salida;
      });
      return [...fijas, ...propias];
    }

    case "matriz_escala":
      return b.grupos.flatMap((g) =>
        g.filas.map((f) => c(campo.matriz(b.id, g.id, f.id))),
      );

    case "ranking_escala":
      return b.items.flatMap((it) => {
        const salida = [
          c(campo.item(b.id, it.id, "prioridad")),
          c(campo.item(b.id, it.id, "impacto")),
        ];
        if (b.campoNota) {
          salida.push(c(campo.item(b.id, it.id, "nota"), b.campoNota.requerido ?? false));
        }
        return salida;
      });

    case "tabla": {
      const encabezados = (b.columnasEditables ?? []).map((col) =>
        c(campo.encabezado(b.id, col.id), false),
      );
      const celdas = filasDe(filas, b.id).flatMap((f) =>
        b.columnas.map((col) => c(campo.fila(b.id, f.id, col.id), (col.requerida ?? true) && req)),
      );
      return [...encabezados, ...celdas];
    }

    case "chips_agregables":
      return [c(campo.simple(b.id))];

    case "linea_tiempo":
      return filasDe(filas, b.id).flatMap((f) => [
        c(campo.fila(b.id, f.id, "anio")),
        c(campo.fila(b.id, f.id, "hecho")),
      ]);

    case "cuadrantes":
      return b.cuadrantes.flatMap((q) =>
        Array.from({ length: q.lineas }, (_, i) => c(campo.cuadrante(b.id, q.id, i))),
      );
  }
}

export function camposEsperados(def: Definicion, filas: Fila[] = []): CampoEsperado[] {
  const salida: CampoEsperado[] = [];
  for (const b of bloques(def)) salida.push(...camposDeBloque(b, filas));
  return salida;
}

export type Avance = { resueltos: number; total: number; fraccion: number };

export function progresoTaller(
  esperados: CampoEsperado[],
  respuestas: Map<string, ValorCampo>,
  camposMinimos = 0,
): Avance {
  let resueltos = 0;
  let total = 0;
  for (const e of esperados) {
    if (e.requerido) total += e.peso;
    if (lleno(respuestas.get(e.campoId))) resueltos += e.peso;
  }
  // Los campos opcionales suman al numerador pero no al denominador; el
  // porcentaje se recorta para que una nota de más no dé 110%.
  total = Math.max(camposMinimos, total);
  resueltos = Math.min(resueltos, total);
  return { resueltos, total, fraccion: total === 0 ? 0 : resueltos / total };
}

export function progresoModulo(avances: Avance[]): Avance {
  const resueltos = avances.reduce((s, a) => s + a.resueltos, 0);
  const total = avances.reduce((s, a) => s + a.total, 0);
  return { resueltos, total, fraccion: total === 0 ? 0 : resueltos / total };
}

// ---------------------------------------------------------------------
// Gamificación · portada del prototipo sin cambios
// ---------------------------------------------------------------------

export const NIVELES: [number, string][] = [
  [0, "Aprendiz"],
  [15, "Observador"],
  [35, "Analista"],
  [55, "Estratega"],
  [75, "Alquimista"],
  [95, "Maestro del módulo"],
];

export function nivel(fraccion: number): string {
  let n = NIVELES[0]![1];
  for (const [umbral, etiqueta] of NIVELES) {
    if (fraccion * 100 >= umbral) n = etiqueta;
  }
  return n;
}

export const xp = (resueltos: number) => resueltos * 10;
