const D = require('docx');
const {
  Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle,
  ShadingType, AlignmentType, VerticalAlign, HeadingLevel,
} = D;

const F = 'Arial';
const INK = '1F2937', BLUE = '1F4E78', BAR = '2F75B5', HEAD = 'EAF2F8',
      ZEBRA = 'F2F5F8', SOFT = 'D9E6F2', WARN = 'FFF2CC', W = 'FFFFFF',
      GOLD = 'C99000';
const USABLE = 14256;                       // carta apaisada menos margenes
const LINE = { style: BorderStyle.SINGLE, size: 4, color: 'B7C9DA' };
const BORDERS = { top: LINE, bottom: LINE, left: LINE, right: LINE,
                  insideHorizontal: LINE, insideVertical: LINE };

const t = (text, o = {}) => new TextRun({
  text, font: F, size: o.size || 18, bold: !!o.bold, italics: !!o.it,
  color: o.color || INK });

const cellP = (runs, o = {}) => new Paragraph({
  spacing: { before: o.before || 0, after: o.after === undefined ? 20 : o.after },
  alignment: o.align, children: runs });

function cell(w, content, o = {}) {
  const kids = Array.isArray(content) ? content : [content];
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    shading: o.fill ? { type: ShadingType.CLEAR, fill: o.fill } : undefined,
    margins: { top: 60, bottom: 60, left: 90, right: 90 },
    verticalAlign: o.valign || VerticalAlign.TOP,
    columnSpan: o.span,
    children: kids,
  });
}
const txtCell = (w, s, o = {}) =>
  cell(w, cellP([t(s, { bold: o.bold, color: o.color, size: o.size, it: o.it })],
    { align: o.align, after: 0 }), o);

const table = (widths, rows) => new Table({
  columnWidths: widths, width: { size: USABLE, type: WidthType.DXA },
  borders: BORDERS, rows });

// tabla que no se parte entre paginas
const tableNS = (widths, rows) => new Table({
  columnWidths: widths, width: { size: USABLE, type: WidthType.DXA },
  borders: BORDERS, cantSplit: true, rows });

// barra de seccion azul a todo el ancho
const bar = (text) => new Table({
  columnWidths: [USABLE], width: { size: USABLE, type: WidthType.DXA },
  borders: BORDERS,
  rows: [ new TableRow({ children: [
    txtCell(USABLE, text, { bold: true, color: W, fill: BAR, size: 19 }) ] }) ],
});

const spacer = (h) => new Paragraph({ spacing: { after: h || 120 }, children: [] });

// bloque de aviso amarillo
const warn = (text) => new Table({
  columnWidths: [USABLE], width: { size: USABLE, type: WidthType.DXA },
  borders: BORDERS,
  rows: [ new TableRow({ children: [
    txtCell(USABLE, text, { fill: WARN, size: 17 }) ] }) ],
});

// lista numerada dentro de una celda
function pasos(lista) {
  return lista.map((s, i) => new Paragraph({
    spacing: { before: i === 0 ? 0 : 60, after: 0 },
    indent: { left: 260, hanging: 260 },
    children: [ t((i + 1) + '.  ', { bold: true, color: BLUE }), t(s) ],
  }));
}
function vinetas(lista) {
  return lista.map((s, i) => new Paragraph({
    spacing: { before: i === 0 ? 0 : 50, after: 0 },
    indent: { left: 220, hanging: 220 },
    children: [ t('·  ', { bold: true, color: BLUE }), t(s) ],
  }));
}

module.exports = { D, F, INK, BLUE, BAR, HEAD, ZEBRA, SOFT, WARN, W, GOLD,
  USABLE, LINE, BORDERS, t, cellP, cell, txtCell, table, tableNS, bar, spacer, warn,
  pasos, vinetas, Paragraph, TextRun, Table, TableRow, TableCell, WidthType,
  BorderStyle, ShadingType, AlignmentType, VerticalAlign };
