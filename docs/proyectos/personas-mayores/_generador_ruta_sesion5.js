const D = require('docx');
const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        WidthType, BorderStyle, ShadingType, AlignmentType, VerticalAlign,
        PageOrientation, PageBreak } = D;

const F = 'Arial';
const INK='1F2937', NAVY='0E3A54', BLUE='1F4E78', BAR='2F75B5',
      CYAN='DCF0FA', CYANK='0C6B92', GREY='EDEFF1', GREYK='5A6B77',
      RUST='B8430D', WARN='FDEBE1', W='FFFFFF', LINEC='AFC4D4';
const USABLE = 14600;

const LINE = { style: BorderStyle.SINGLE, size: 6, color: LINEC };
const BORDERS = { top: LINE, bottom: LINE, left: LINE, right: LINE,
                  insideHorizontal: LINE, insideVertical: LINE };
const NOB = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const SINBORDE = { top: NOB, bottom: NOB, left: NOB, right: NOB,
                   insideHorizontal: NOB, insideVertical: NOB };

const t = (text, o = {}) => new TextRun({ text, font: F, size: o.size || 22,
  bold: !!o.bold, italics: !!o.it, color: o.color || INK });
const par = (runs, o = {}) => new Paragraph({
  spacing: { before: o.before || 0, after: o.after === undefined ? 0 : o.after },
  alignment: o.align, children: Array.isArray(runs) ? runs : [runs] });

function cell(w, kids, o = {}) {
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    shading: o.fill ? { type: ShadingType.CLEAR, fill: o.fill } : undefined,
    margins: { top: o.mt === undefined ? 45 : o.mt, bottom: o.mb === undefined ? 45 : o.mb,
               left: 110, right: 110 },
    verticalAlign: o.valign || VerticalAlign.CENTER,
    columnSpan: o.span,
    children: Array.isArray(kids) ? kids : [kids] });
}
const tc = (w, s, o = {}) => cell(w, par([t(s, o)], { align: o.align }), o);
const suma = a => a.reduce((x, y) => x + y, 0);
const tabla = (widths, rows, o = {}) => new Table({
  columnWidths: widths, width: { size: o.w || suma(widths), type: WidthType.DXA },
  borders: o.sinBorde ? SINBORDE : BORDERS, cantSplit: true, rows });

/* ================= LA RUTA: 13 MOMENTOS ================= */
// [hora, minutos, numero, nombre, diapositivas, que hago, ojo, tipo]
const RUTA = [
['8:00','20 min','1','Bienvenida','D3',
 '► Pregunto: «¿para qué usa usted el teléfono?» y anoto TODO en el tablero.',
 'Empiece usted. También vale el cartel, la llamada y el voz a voz.','hacen'],

['8:20','40 min','2','Experiencias','D4',
 '► Subgrupos de 4 o 5: «¿cómo se enteró la gente de lo que usted vendió?»',
 'Cada grupo trae UNA sola historia a la plenaria.','hacen'],

['9:00','50 min','3','Formas de avisar\ny los 4 cuidados','D5 a D10',
 'Nombro los 5 medios. Después los 4 cuidados, uno por diapositiva.',
 '«Nunca dé su clave» se repite dos veces y se deja un silencio.','explico'],

['9:50','20 min','4','Refrigerio','D11',
 'Juego «el mensaje que viaja»: una frase pasa de persona en persona.','','pausa'],

['10:10','1 hora','5','Mostrar lo que hago','D12 · D13',
 'Muestro un objeto MAL presentado y pregunto qué le arreglarían. Después las 3 reglas.\n► Cada quien fotografía o dibuja lo suyo.',
 'Nadie está obligado a usar su celular ni a salir en la foto.','hacen'],

['11:10','10 min','6','Pausa activa','D14',
 'Hombros, manos y tobillos. Sentados o de pie.',
 'Sin conteos rápidos, sin competencia, nadie obligado a levantarse.','pausa'],

['11:20','50 min','7','El aviso','D15 a D17',
 'Las 4 partes del aviso y el ejemplo armado.\n► En parejas: primero el del compañero, después el suyo. Leen 3 o 4, no todos.',
 'Nadie escribe teléfono ni dirección: se escribe «aquí va mi contacto».','hacen'],

['12:10','1 hora','8','Almuerzo','D18',
 'Escribo en el tablero la hora exacta de regreso.','','pausa'],

['13:10','10 min','9','¿Necesidad o gusto?','D19',
 '► Digo ejemplos y responden con la mano: el mercado, un vestido nuevo, la droga del mes, una olla para trabajar.',
 'No hay respuesta correcta. Es para despertar después del almuerzo.','hacen'],

['13:20','1 hora','10','El dinero','D20 a D27',
 'Las 4 palabras. La cuenta de la vela en el tablero, renglón por renglón. Del costo al precio. La regla de oro. La cuenta del mes.\n► Cada quien saca la cuenta de su producto.',
 'Casos imaginarios. NUNCA pida claves, saldos, deudas ni ingresos.','explico'],

['14:20','50 min','11','Juego del presupuesto','D28',
 '► Fichas de papel y un caso imaginario. Reparten entre materiales, transporte, empaque y ahorro. Cada grupo explica por qué.',
 '','hacen'],

['15:10','20 min','12','Refrigerio','D29',
 'Actividad breve, adaptada y voluntaria.','','pausa'],

['15:30','30 min','13','Cierre','D30 a D32',
 '► Cada quien dice UNA cosa que se lleva. Explico la tarea y dejo día, hora y lugar de la próxima clase.',
 'Cierre en autoestima, no en evaluación. Recojo la caja de preguntas.','hacen'],
];

const COLS = [1500, 3750, 1350, 8000];
const TINTE = { hacen: CYAN, explico: W, pausa: GREY };

function encabezado() {
  return new TableRow({ children: [
    tc(COLS[0], 'HORA', { bold: true, color: W, fill: BAR, size: 20, align: AlignmentType.CENTER }),
    tc(COLS[1], 'MOMENTO', { bold: true, color: W, fill: BAR, size: 20 }),
    tc(COLS[2], 'PANTALLA', { bold: true, color: W, fill: BAR, size: 20, align: AlignmentType.CENTER }),
    tc(COLS[3], 'QUÉ HAGO', { bold: true, color: W, fill: BAR, size: 20 }),
  ]});
}
function filaMomento(r) {
  const [hora, mins, num, nombre, diapos, hago, ojo, tipo] = r;
  const fondo = TINTE[tipo];
  const pausa = tipo === 'pausa';
  const kidsHago = [];
  hago.split('\n').forEach((linea, i) => kidsHago.push(par([t(linea, {
    size: 22, color: pausa ? GREYK : INK })], { before: i ? 70 : 0 })));
  if (ojo) kidsHago.push(par([t('OJO   ', { size: 18, bold: true, color: RUST }),
    t(ojo, { size: 21, bold: true, color: RUST })], { before: 90 }));

  return new TableRow({ children: [
    cell(COLS[0], [
      par([t(hora, { size: 26, bold: true, color: pausa ? GREYK : NAVY })], { align: AlignmentType.CENTER }),
      par([t(mins, { size: 20, color: GREYK })], { align: AlignmentType.CENTER, before: 40 }),
    ], { fill: fondo }),
    cell(COLS[1], [
      par([t(num + '  ', { size: 30, bold: true, color: pausa ? GREYK : CYANK }),
           t(nombre.split('\n')[0], { size: 26, bold: true, color: pausa ? GREYK : NAVY })]),
      ...(nombre.includes('\n') ? [par([t(nombre.split('\n')[1],
        { size: 26, bold: true, color: NAVY })], { before: 20 })] : []),
    ], { fill: fondo }),
    tc(COLS[2], diapos, { size: 22, bold: true, color: pausa ? GREYK : BLUE,
      align: AlignmentType.CENTER, fill: fondo }),
    cell(COLS[3], kidsHago, { fill: fondo, valign: VerticalAlign.CENTER }),
  ]});
}

/* ================= PIEZAS DE APOYO ================= */
const titulo = (txt, sub) => [
  par([t(txt, { size: 34, bold: true, color: NAVY })]),
  par([t(sub, { size: 20, color: GREYK })], { before: 50, after: 80 }),
];
const barra = (txt, w) => new Table({
  columnWidths: [w || USABLE], width: { size: w || USABLE, type: WidthType.DXA },
  borders: BORDERS, rows: [ new TableRow({ children: [
    tc(w || USABLE, txt, { bold: true, color: W, fill: BAR, size: 21,
      mt: 45, mb: 45 }) ]}) ]});

const CHEQUEO = ['Proyector probado y diapositivas abiertas',
  'Tablero y marcadores', 'Hojas y lápices para todos',
  'Fichas de papel para el juego del presupuesto',
  'Una pieza terminada de la técnica del grupo',
  'La caja de preguntas anónimas'];

const FRASES = [
  ['Para abrir', '«¿Para qué usa usted el teléfono? No hay respuesta mala.»'],
  ['Para que hablen', '«Cuénteme cómo lo hace usted.»'],
  ['Si nadie contesta', '«Yo empiezo y ustedes me corrigen.»'],
  ['Para el dinero', '«Vamos a hacer la cuenta de una vela imaginaria, no de la suya.»'],
  ['Para cerrar', '«Dígame una sola cosa que se lleva de hoy.»'],
];

const SITUACIONES = [
  ['Voy atrasado', 'Recorto el momento 2 o el 5. Nunca las pausas ni el cierre.'],
  ['Nadie responde', 'Contesto yo primero con un ejemplo mío y vuelvo a preguntar.'],
  ['Alguien acapara la palabra', '«Gracias, guárdeme esa. Quiero oír a alguien que no haya hablado.»'],
  ['No hay proyector', 'Sigo la misma ruta en el tablero. Las 4 palabras y las 3 reglas se escriben.'],
  ['Alguien no sabe leer', 'Trabaja de a dos. Dicta y el compañero o el auxiliar escribe.'],
];

const NUNCA = ['Pedir claves, saldos, deudas, ingresos ni información bancaria',
  'Obligar a nadie a hablar, moverse, usar el celular o salir en una foto',
  'Fotografiar a alguien sin pedirle permiso antes',
  'Competencias, apuros de tiempo o ejercicios de memoria rápida',
  'Hablarles como a niños'];

/* ================= DOCUMENTO ================= */
const hijos = [];

hijos.push(...titulo('RUTA DE LA CLASE  ·  SESIÓN 5',
  'El teléfono y el dinero  ·  Formación en Artes y Oficios  ·  Personas Mayores  ·  FM-AO-05'));

hijos.push(barra('ANTES DE ENTRAR'));
hijos.push(tabla([USABLE / 3, USABLE / 3, USABLE / 3], [0, 1].map(f =>
  new TableRow({ children: [0, 1, 2].map(c =>
    cell(USABLE / 3, par([t('☐   ', { size: 24, bold: true, color: CYANK }),
      t(CHEQUEO[f * 3 + c], { size: 21 })])) ) }))));
hijos.push(new Paragraph({ spacing: { after: 160 }, children: [] }));

hijos.push(tabla(COLS, [encabezado(), ...RUTA.slice(0, 8).map(filaMomento)]));
hijos.push(par([t('Horas calculadas desde las 8:00 a. m. Si la jornada empieza a otra hora, corra todas igual.',
  { size: 19, it: true, color: GREYK })], { before: 100 }));

hijos.push(new Paragraph({ children: [new PageBreak()] }));

hijos.push(...titulo('RUTA DE LA CLASE  ·  SESIÓN 5  ·  TARDE',
  'Momentos 9 a 13  ·  y lo que hay que tener a mano'));
hijos.push(tabla(COLS, [encabezado(), ...RUTA.slice(8).map(filaMomento)]));
hijos.push(new Paragraph({ spacing: { after: 110 }, children: [] }));

const COLIZQ = 7100, COLDER = 7100, HUECO = 400;
const vacio = new Paragraph({ spacing: { after: 0 }, children: [] });

const colFrases = [
  barra('FRASES QUE FUNCIONAN', COLIZQ),
  tabla([2350, 4750], FRASES.map(([a, b]) => new TableRow({ children: [
    tc(2350, a, { size: 19, bold: true, color: CYANK, mt: 40, mb: 40 }),
    tc(4750, b, { size: 20, it: true, color: NAVY, mt: 40, mb: 40 }) ]}))),
  vacio,
];
const colSituaciones = [
  barra('SI PASA ESTO   →   HAGA ESTO', COLDER),
  tabla([2500, 4600], SITUACIONES.map(([a, b]) => new TableRow({ children: [
    tc(2500, a, { size: 19, bold: true, color: NAVY, mt: 40, mb: 40 }),
    tc(4600, b, { size: 19, mt: 40, mb: 40 }) ]}))),
  vacio,
];

hijos.push(tabla([COLIZQ, HUECO, COLDER], [ new TableRow({ children: [
  cell(COLIZQ, colFrases, { valign: VerticalAlign.TOP, mt: 0, mb: 0 }),
  cell(HUECO, vacio, { mt: 0, mb: 0 }),
  cell(COLDER, colSituaciones, { valign: VerticalAlign.TOP, mt: 0, mb: 0 }),
]}) ], { sinBorde: true, w: USABLE }));

hijos.push(new Paragraph({ spacing: { after: 40 }, children: [] }));

hijos.push(barra('LO QUE NUNCA'));
hijos.push(tabla([USABLE], [new TableRow({ children: [
  cell(USABLE, NUNCA.map((s, i) => par([t('✕   ', { size: 20, bold: true, color: RUST }),
    t(s, { size: 20, bold: true, color: RUST })], { before: i ? 30 : 0 })),
    { fill: WARN, mt: 40, mb: 40 }) ]})]));

const doc = new Document({
  creator: 'Equipo de Personas Mayores',
  title: 'Ruta de la clase - Sesion 5',
  styles: { default: { document: { run: { font: F, size: 22, color: INK } } } },
  sections: [{
    properties: {
      page: {
        // docx-js invierte las medidas al declarar apaisado: se pasan al reves
        size: { width: 12240, height: 15840, orientation: PageOrientation.LANDSCAPE },
        margin: { top: 500, right: 620, bottom: 340, left: 620 },
      },
    },
    children: hijos,
  }],
});

Packer.toBuffer(doc).then(b => {
  const salida = '/home/user/Alquimia/docs/proyectos/personas-mayores/Ruta_Clase_Sesion_5_Tallerista.docx';
  fs.writeFileSync(salida, b);
  console.log('creado:', salida);
});
