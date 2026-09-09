import { campo } from "@/lib/talleres/rutas";
import { opcion } from "@/lib/talleres/escalas";
import { lleno } from "@/lib/talleres/progreso";
import type { Bloque, Definicion, Fila, ValorCampo } from "@/lib/talleres/tipos";

/**
 * Serializa una bitácora a HTML.
 *
 * En el prototipo el informe estaba escrito taller por taller. Aquí cada tipo
 * de bloque sabe cómo contarse, así que los módulos 2 a 4 salen en el informe
 * sin tocar este archivo.
 */

export type DatosInforme = {
  empresa: string;
  modulo: string;
  talleres: {
    numero: number; corto: string; titulo: string;
    definicion: Definicion; id: string;
  }[];
  respuestas: Map<string, ValorCampo>;
  filas: Fila[];
  avance: { resueltos: number; total: number; fraccion: number };
};

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const sinResponder = '<p class="vacio">Sin responder.</p>';

function tabla(encabezados: string[], filas: string[][]): string {
  if (filas.length === 0) return sinResponder;
  return `<div class="tw"><table><thead><tr>${
    encabezados.map((h) => `<th>${esc(h)}</th>`).join("")
  }</tr></thead><tbody>${
    filas.map((f) => `<tr>${f.map((c) => `<td>${esc(c) || "—"}</td>`).join("")}</tr>`).join("")
  }</tbody></table></div>`;
}

function lista(valores: unknown[]): string {
  const limpios = valores.map(String).filter((v) => v.trim() !== "");
  if (limpios.length === 0) return sinResponder;
  return `<ul>${limpios.map((v) => `<li>${esc(v)}</li>`).join("")}</ul>`;
}

function bloqueAHtml(b: Bloque, d: DatosInforme, tallerId: string): string {
  const v = (id: string) => d.respuestas.get(id);
  const texto = (id: string) => { const x = v(id); return typeof x === "string" ? x : ""; };
  const etiqueta = (escalaId: string, id: string) => {
    const val = texto(id);
    return val ? (opcion(escalaId, val)?.etiqueta ?? val) : "";
  };
  const filasDe = (bloqueId: string) =>
    d.filas.filter((f) => f.bloqueId === bloqueId && f.tallerId === tallerId)
      .sort((a, b2) => a.orden - b2.orden);

  switch (b.tipo) {
    // Los avisos son guía para responder, no respuestas: fuera del informe.
    case "nota":
      return "";

    case "texto": {
      const t = texto(campo.simple(b.id));
      return `${b.etiqueta ? `<h4>${esc(b.etiqueta)}</h4>` : ""}` +
             (lleno(t) ? `<p>${esc(t)}</p>` : sinResponder);
    }

    case "lista_numerada":
      return `${b.etiqueta ? `<h4>${esc(b.etiqueta)}</h4>` : ""}` +
        lista(Array.from({ length: b.lineas }, (_, i) => texto(campo.linea(b.id, i))));

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
      return tabla(cols, [...fijas, ...propias].map((f) => (b.campoNota ? f : f.slice(0, 2))));
    }

    case "matriz_escala":
      return b.grupos.map((g) => {
        const filas = g.filas
          .map((f) => [f.texto, etiqueta(b.escala, campo.matriz(b.id, g.id, f.id))])
          .filter((f) => f[1]);
        return filas.length ? `<h4>${esc(g.titulo)}</h4>${tabla(["Hecho del entorno", "Efecto"], filas)}` : "";
      }).join("");

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
      return tabla(cols, filas.map((f) => (b.campoNota ? f.fila : f.fila.slice(0, 3))));
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
      return tabla(b.columnas.map(encabezado), filas);
    }

    case "chips_agregables": {
      const val = v(b.id);
      return `${b.etiqueta ? `<h4>${esc(b.etiqueta)}</h4>` : ""}` +
             lista(Array.isArray(val) ? val : []);
    }

    case "linea_tiempo": {
      const filas = filasDe(b.id)
        .map((f) => [texto(campo.fila(b.id, f.id, "anio")), texto(campo.fila(b.id, f.id, "hecho"))])
        .filter((f) => f.some((c) => c.trim() !== ""))
        .sort((a, c) => (a[0] ?? "").localeCompare(c[0] ?? ""));
      return tabla(["Año", "Hecho relevante"], filas);
    }

    case "cuadrantes":
      return `<div class="cuadros">${b.cuadrantes.map((q) => `
        <section class="cuadro ${esc(q.color)}">
          <h4>${esc(q.titulo)}</h4>
          ${lista(Array.from({ length: q.lineas }, (_, i) => texto(campo.cuadrante(b.id, q.id, i))))}
        </section>`).join("")}</div>`;
  }
}

export function cuerpoInforme(d: DatosInforme): string {
  const partes: string[] = [];
  partes.push(`<header class="portada-informe">
    <h1>${esc(d.empresa || "Empresa sin nombre")}</h1>
    <p class="sub">${esc(d.modulo)} — Empresas con Propósito MEGA</p>
    <p class="sub">${d.avance.resueltos} de ${d.avance.total} campos resueltos ·
       ${Math.round(d.avance.fraccion * 100)}% del módulo</p>
  </header>`);

  for (const t of d.talleres) {
    partes.push(`<h2>Taller ${t.numero}. ${esc(t.corto)}</h2>`);
    partes.push(`<p class="pregunta">${esc(t.titulo)}</p>`);
    const cuerpo = t.definicion.secciones
      .flatMap((s) => s.bloques.map((b) => bloqueAHtml(b, d, t.id)))
      .filter((x) => x !== "")
      .join("");
    partes.push(cuerpo || sinResponder);
  }
  return partes.join("\n");
}
