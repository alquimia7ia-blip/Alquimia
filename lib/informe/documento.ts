import { campo } from "@/lib/talleres/rutas";
import { opcion } from "@/lib/talleres/escalas";
import { lleno, camposEsperados, progresoTaller } from "@/lib/talleres/progreso";
import type { Bloque, ColorEscala, Definicion, Fila, ValorCampo } from "@/lib/talleres/tipos";

/**
 * Una bitácora, como documento.
 *
 * Esto no produce HTML ni PDF: produce nodos. El informe se entrega en PDF
 * (`pdf.tsx`), pero la decisión de qué va en él —y en qué orden— no puede
 * vivir dentro del renderizador, o el día que haya que entregarlo también en
 * otro formato habría dos versiones del informe que se desincronizan sin
 * avisar. Es la misma separación que ya hay entre `lecturas.ts` y el tablero.
 *
 * Cada tipo de bloque sabe cómo contarse, así que los módulos que vengan
 * salen en el informe sin tocar este archivo.
 */

export type DatosInforme = {
  empresa: string;
  modulo: string;
  talleres: {
    numero: number; corto: string; titulo: string;
    definicion: Definicion; id: string;
    /** Para el avance por taller del informe. Sin esto, se usa el conteo. */
    camposMinimos?: number;
  }[];
  respuestas: Map<string, ValorCampo>;
  filas: Fila[];
  avance: { resueltos: number; total: number; fraccion: number };
};

// ---------------------------------------------------------------------
// El modelo
// ---------------------------------------------------------------------

export type Nodo =
  | { tipo: "rotulo"; texto: string }
  | { tipo: "parrafo"; texto: string }
  | { tipo: "vacio" }
  | { tipo: "lista"; items: string[] }
  | { tipo: "tabla"; encabezados: string[]; filas: string[][] }
  | { tipo: "cuadrantes"; cuadros: { titulo: string; color: ColorEscala; items: string[] }[] };

export type TallerInforme = {
  numero: number;
  corto: string;
  titulo: string;
  avance: { resueltos: number; total: number; fraccion: number };
  nodos: Nodo[];
};

export type Documento = {
  empresa: string;
  modulo: string;
  programa: string;
  fecha: string;
  avance: { resueltos: number; total: number; fraccion: number };
  talleres: TallerInforme[];
};

const PROGRAMA = "Empresas con Propósito MEGA";

// ---------------------------------------------------------------------

const limpiar = (valores: unknown[]) =>
  valores.map((v) => String(v ?? "").trim()).filter((v) => v !== "");

function tabla(encabezados: string[], filas: string[][]): Nodo {
  return filas.length === 0
    ? { tipo: "vacio" }
    : { tipo: "tabla", encabezados, filas: filas.map((f) => f.map((c) => c.trim() || "—")) };
}

function lista(valores: unknown[]): Nodo {
  const items = limpiar(valores);
  return items.length === 0 ? { tipo: "vacio" } : { tipo: "lista", items };
}

/** Los nodos de un bloque. Vacío cuando el bloque no aporta nada al informe. */
function bloqueANodos(b: Bloque, d: DatosInforme, tallerId: string): Nodo[] {
  const v = (id: string) => d.respuestas.get(id);
  const texto = (id: string) => { const x = v(id); return typeof x === "string" ? x : ""; };
  const etiqueta = (escalaId: string, id: string) => {
    const val = texto(id);
    return val ? (opcion(escalaId, val)?.etiqueta ?? val) : "";
  };
  const filasDe = (bloqueId: string) =>
    d.filas.filter((f) => f.bloqueId === bloqueId && f.tallerId === tallerId)
      .sort((a, b2) => a.orden - b2.orden);
  const conRotulo = (rotulo: string | undefined, nodo: Nodo): Nodo[] =>
    rotulo ? [{ tipo: "rotulo", texto: rotulo }, nodo] : [nodo];

  switch (b.tipo) {
    // Los avisos son guía para responder, no respuestas: fuera del informe.
    case "nota":
      return [];

    case "texto": {
      const t = texto(campo.simple(b.id));
      return conRotulo(b.etiqueta, lleno(t) ? { tipo: "parrafo", texto: t } : { tipo: "vacio" });
    }

    case "lista_numerada":
      return conRotulo(b.etiqueta,
        lista(Array.from({ length: b.lineas }, (_, i) => texto(campo.linea(b.id, i)))));

    case "fichas_escala": {
      const fijas = b.items.map((it) => [
        it.titulo,
        etiqueta(b.escala, campo.item(b.id, it.id, "valoracion")),
        b.campoNota ? texto(campo.item(b.id, it.id, "nota")) : "",
      ]).filter((f) => f[1] || f[2]);
      const propias = filasDe(b.id).map((f) => [
        texto(campo.fila(b.id, f.id, "titulo")),
        etiqueta(b.escala, campo.fila(b.id, f.id, "valoracion")),
        b.campoNota ? texto(campo.fila(b.id, f.id, "nota")) : "",
      ]).filter((f) => f[0]);
      const cols = ["Tendencia", "Impacto"];
      if (b.campoNota) cols.push("Cómo se traduce en la operación");
      return [tabla(cols, [...fijas, ...propias].map((f) => (b.campoNota ? f : f.slice(0, 2))))];
    }

    case "matriz_escala":
      return b.grupos.flatMap((g) => {
        const filas = g.filas
          .map((f) => [f.texto, etiqueta(b.escala, campo.matriz(b.id, g.id, f.id))])
          .filter((f) => f[1]);
        return filas.length
          ? [{ tipo: "rotulo", texto: g.titulo } as Nodo,
             tabla(["Hecho del entorno", "Efecto"], filas)]
          : [];
      });

    case "ranking_escala": {
      const filas = b.items.map((it) => ({
        prioridad: texto(campo.item(b.id, it.id, "prioridad")),
        fila: [
          texto(campo.item(b.id, it.id, "prioridad")),
          it.titulo,
          etiqueta(b.escala, campo.item(b.id, it.id, "impacto")),
          b.campoNota ? texto(campo.item(b.id, it.id, "nota")) : "",
        ],
      })).sort((a, c) => (Number(a.prioridad) || 99) - (Number(c.prioridad) || 99));
      const cols = ["Prioridad", "Fuerza", "Efecto en rentabilidad"];
      if (b.campoNota) cols.push("Sustento");
      return [tabla(cols, filas.map((f) => (b.campoNota ? f.fila : f.fila.slice(0, 3))))];
    }

    case "tabla": {
      const encabezado = (col: { id: string; titulo: string }) => {
        const editable = b.columnasEditables?.find((c) => c.id === col.id);
        if (!editable) return col.titulo;
        return texto(campo.encabezado(b.id, col.id)) || editable.valorPorDefecto;
      };
      const filas = filasDe(b.id)
        .map((f) => b.columnas.map((c) => texto(campo.fila(b.id, f.id, c.id))))
        .filter((f) => f.some((c) => c.trim() !== "") && (f[0] ?? "").trim() !== "");
      return [tabla(b.columnas.map(encabezado), filas)];
    }

    case "chips_agregables": {
      const val = v(b.id);
      return conRotulo(b.etiqueta, lista(Array.isArray(val) ? val : []));
    }

    case "linea_tiempo": {
      const filas = filasDe(b.id)
        .map((f) => [texto(campo.fila(b.id, f.id, "anio")), texto(campo.fila(b.id, f.id, "hecho"))])
        .filter((f) => f.some((c) => c.trim() !== ""))
        .sort((a, c) => (a[0] ?? "").localeCompare(c[0] ?? ""));
      return [tabla(["Año", "Hecho relevante"], filas)];
    }

    case "cuadrantes":
      return [{
        tipo: "cuadrantes",
        cuadros: b.cuadrantes.map((q) => ({
          titulo: q.titulo,
          color: q.color,
          items: limpiar(Array.from({ length: q.lineas }, (_, i) =>
            texto(campo.cuadrante(b.id, q.id, i)))),
        })),
      }];
  }
}

export function documentoInforme(d: DatosInforme): Documento {
  return {
    empresa: d.empresa || "Empresa sin nombre",
    modulo: d.modulo,
    programa: PROGRAMA,
    fecha: new Date().toLocaleDateString("es-CO", {
      day: "numeric", month: "long", year: "numeric",
    }),
    avance: d.avance,
    talleres: d.talleres.map((t) => ({
      numero: t.numero,
      corto: t.corto,
      titulo: t.titulo,
      avance: progresoTaller(
        camposEsperados(t.definicion, d.filas.filter((f) => f.tallerId === t.id)),
        d.respuestas,
        t.camposMinimos,
      ),
      nodos: t.definicion.secciones.flatMap((s) =>
        s.bloques.flatMap((b) => bloqueANodos(b, d, t.id))),
    })),
  };
}
