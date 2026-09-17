/**
 * Piezas compartidas por los dos documentos comerciales.
 *
 * Las cifras no se escriben aquí: se leen de `docs/comercial/modelo-precio.py
 * --json`, que es la única fuente. Si un supuesto cambia, se cambia allá y se
 * regeneran los dos .docx, de modo que nunca circulen dos versiones del mismo
 * número.
 *
 * Requiere el paquete `docx` de npm. No está en el package.json de la
 * aplicación a propósito —es una herramienta de oficina, no del producto—:
 *   npm install docx      (o NODE_PATH apuntando a donde ya esté)
 */
const {
  Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle,
  Table, TableRow, TableCell, WidthType, ShadingType, VerticalAlign,
} = require("docx");
const { execFileSync } = require("child_process");
const path = require("path");

/** Paleta de ALQUIMIA, la misma de `app/tokens.css`. */
const C = {
  acento: "14497E",      // --accent
  acento2: "1B6AB5",     // --accent-2
  suave: "E9F0F8",       // --accent-soft
  linea: "BBD1E8",       // --accent-line
  turquesa: "0C7A6F",    // --pista
  turquesaSuave: "E4F6F3",
  texto: "1A1A1A",
  apagado: "5A6470",
  alerta: "8A1C1C",
  alertaSuave: "FBEAEA",
};

const FUENTE = "Calibri";
/** Carta, no A4: es el tamaño de papel de Colombia. Medidas en DXA (1440 = 1"). */
const PAGINA = { ancho: 12240, alto: 15840, margen: 1440 };
const ANCHO_UTIL = PAGINA.ancho - 2 * PAGINA.margen;   // 9360

const cifras = () => JSON.parse(execFileSync("python3", [
  path.join(__dirname, "..", "..", "docs", "comercial", "modelo-precio.py"), "--json",
], { encoding: "utf8", maxBuffer: 4 << 20 }));

/** $1.234.567 — punto de miles, como se escribe en Colombia. */
const cop = (v) => "$" + Math.round(v).toLocaleString("de-DE");
const pct = (v) => (v * 100).toFixed(1).replace(".", ",") + " %";

const texto = (t, o = {}) => new TextRun({
  text: t, font: FUENTE, size: o.size ?? 21, bold: o.bold, italics: o.italics,
  color: o.color ?? C.texto, break: o.break,
});

const parrafo = (t, o = {}) => new Paragraph({
  children: Array.isArray(t) ? t : [texto(t, o)],
  alignment: o.alignment,
  spacing: { before: o.before ?? 0, after: o.after ?? 140, line: o.line ?? 276 },
  indent: o.indent,
  border: o.border,
  shading: o.shading,
});

const h1 = (t) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  children: [texto(t, { size: 30, bold: true, color: C.acento })],
  spacing: { before: 380, after: 170 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 10, color: C.linea, space: 6 } },
});

const h2 = (t) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  children: [texto(t, { size: 24, bold: true, color: C.acento2 })],
  spacing: { before: 260, after: 110 },
});

/** Viñeta con sangría, sin insertar el carácter «•» a mano. */
const punto = (t, o = {}) => new Paragraph({
  children: Array.isArray(t) ? t : [texto(t, o)],
  numbering: { reference: "vinetas", level: 0 },
  spacing: { after: 70, line: 264 },
});

const numerado = (t) => new Paragraph({
  children: Array.isArray(t) ? t : [texto(t)],
  numbering: { reference: "pasos", level: 0 },
  spacing: { after: 90, line: 264 },
});

/** Bloque destacado: fondo suave y barra de color a la izquierda. */
const destacado = (lineas, tono = "acento") => {
  const fondo = tono === "alerta" ? C.alertaSuave : tono === "turquesa" ? C.turquesaSuave : C.suave;
  const barra = tono === "alerta" ? C.alerta : tono === "turquesa" ? C.turquesa : C.acento;
  return lineas.map((l, i) => new Paragraph({
    children: Array.isArray(l) ? l : [texto(l)],
    shading: { type: ShadingType.CLEAR, fill: fondo, color: "auto" },
    border: {
      left: { style: BorderStyle.SINGLE, size: 18, color: barra, space: 10 },
      top: i === 0 ? { style: BorderStyle.SINGLE, size: 2, color: fondo, space: 8 } : undefined,
      bottom: i === lineas.length - 1
        ? { style: BorderStyle.SINGLE, size: 2, color: fondo, space: 8 } : undefined,
    },
    spacing: { before: i === 0 ? 150 : 0, after: i === lineas.length - 1 ? 180 : 60, line: 270 },
    indent: { left: 150, right: 150 },
  }));
};

const celda = (contenido, o = {}) => new TableCell({
  width: { size: o.ancho, type: WidthType.DXA },
  shading: o.fondo ? { type: ShadingType.CLEAR, fill: o.fondo, color: "auto" } : undefined,
  verticalAlign: VerticalAlign.CENTER,
  margins: { top: 90, bottom: 90, left: 130, right: 130 },
  columnSpan: o.span,
  children: (Array.isArray(contenido) ? contenido : [contenido]).map((t) => new Paragraph({
    children: [texto(t, { bold: o.bold, size: o.size ?? 20, color: o.color })],
    alignment: o.alignment,
    spacing: { after: 0, line: 252 },
  })),
});

/**
 * Tabla con anchos en DXA tanto en la tabla como en cada celda: con
 * porcentajes, Google Docs descuadra las columnas.
 */
const tabla = ({ anchos, cabecera, filas, tono = "acento" }) => {
  const fondoCab = tono === "alerta" ? C.alerta : tono === "turquesa" ? C.turquesa : C.acento;
  return new Table({
    columnWidths: anchos,
    width: { size: anchos.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: C.linea },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: C.linea },
      left: { style: BorderStyle.SINGLE, size: 4, color: C.linea },
      right: { style: BorderStyle.SINGLE, size: 4, color: C.linea },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: C.linea },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: C.linea },
    },
    rows: [
      new TableRow({
        tableHeader: true,
        children: cabecera.map((c, i) => celda(c.t ?? c, {
          ancho: anchos[i], bold: true, color: "FFFFFF", fondo: fondoCab,
          alignment: (c.alignment ?? (i === 0 ? AlignmentType.LEFT : AlignmentType.RIGHT)),
        })),
      }),
      ...filas.map((fila, f) => new TableRow({
        children: fila.map((c, i) => celda(c.t ?? c, {
          ancho: anchos[i],
          bold: c.bold,
          fondo: c.fondo ?? (f % 2 ? "F7FAFD" : undefined),
          color: c.color,
          span: c.span,
          alignment: c.alignment ?? (i === 0 ? AlignmentType.LEFT : AlignmentType.RIGHT),
        })),
      })),
    ],
  });
};

/** Numeraciones: nunca se escribe el carácter de viñeta a mano. */
const numeracion = {
  config: [
    {
      reference: "vinetas",
      levels: [{
        level: 0, format: "bullet", text: "•", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 360, hanging: 220 } },
                 run: { color: C.acento2, font: FUENTE } },
      }],
    },
    {
      reference: "pasos",
      levels: [{
        level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 400, hanging: 260 } },
                 run: { bold: true, color: C.acento, font: FUENTE } },
      }],
    },
  ],
};

const estilos = {
  default: {
    document: { run: { font: FUENTE, size: 21, color: C.texto },
                paragraph: { spacing: { line: 276 } } },
  },
};

const seccion = (hijos, o = {}) => ({
  properties: {
    page: {
      size: { width: PAGINA.ancho, height: PAGINA.alto },
      margin: { top: PAGINA.margen, bottom: PAGINA.margen,
                left: PAGINA.margen, right: PAGINA.margen,
                header: 720, footer: 600 },
    },
  },
  footers: o.footers,
  headers: o.headers,
  children: hijos,
});

module.exports = {
  C, FUENTE, PAGINA, ANCHO_UTIL, cifras, cop, pct,
  texto, parrafo, h1, h2, punto, numerado, destacado, celda, tabla,
  numeracion, estilos, seccion,
};
