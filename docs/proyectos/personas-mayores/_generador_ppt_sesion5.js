const pptxgen = require('pptxgenjs');
const fs = require('fs');
const p = new pptxgen();
p.layout = 'LAYOUT_WIDE';
p.author = 'Equipo de Personas Mayores';
p.title  = 'Sesion 5 - Usamos la tecnologia y el dinero con proposito';

const NAVY='0E3A54', CYAN='00A9E0', ORANGE='F26522', WHITE='FFFFFF',
      LIGHT='EEF3F6', GREY='5A6B77', GREEN='1E7A5A', RED='B3341E';
const F = 'Arial';
const ic = n => 'image/png;base64,' + fs.readFileSync(`icons/${n}.png`).toString('base64');

const sello = (s,c) => s.addText(
  'Secretaría de Inclusión Social y Familia · Equipo de Personas Mayores',
  { x: 6.5, y: 0.26, w: 6.2, h: 0.32, align: 'right', fontFace: F,
    fontSize: 11, color: c || GREY, isTextBox: true });

function disco(s, x, y, d, fill, icon) {
  s.addShape(p.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: fill } });
  const q = d * 0.27;
  s.addImage({ data: ic(icon), x: x + q, y: y + q, w: d - 2*q, h: d - 2*q });
}
function slideClaro(titulo, icon, rot) {
  const s = p.addSlide(); s.background = { color: WHITE }; sello(s);
  if (rot) s.addText(rot, { x: 1.95, y: 0.72, w: 10.7, h: 0.35, fontFace: F,
    fontSize: 13, bold: true, color: ORANGE, charSpacing: 2, isTextBox: true });
  if (icon) disco(s, 0.62, 0.9, 1.05, CYAN, icon);
  s.addText(titulo, { x: icon ? 1.95 : 0.62, y: rot ? 1.06 : 0.9, w: icon ? 10.7 : 12.1,
    h: 0.95, fontFace: F, fontSize: 36, bold: true, color: NAVY,
    valign: 'middle', isTextBox: true });
  return s;
}
function slideOscuro(titulo, icon, rot) {
  const s = p.addSlide(); s.background = { color: NAVY }; sello(s, 'A8BAC6');
  if (rot) s.addText(rot, { x: 1.95, y: 0.72, w: 10.7, h: 0.35, fontFace: F,
    fontSize: 13, bold: true, color: CYAN, charSpacing: 2, isTextBox: true });
  if (icon) disco(s, 0.62, 0.9, 1.05, ORANGE, icon);
  s.addText(titulo, { x: icon ? 1.95 : 0.62, y: rot ? 1.06 : 0.9, w: icon ? 10.7 : 12.1,
    h: 0.95, fontFace: F, fontSize: 36, bold: true, color: WHITE,
    valign: 'middle', isTextBox: true });
  return s;
}
function slideEjercicio(rotulo, instruccion, detalle, icon) {
  const s = p.addSlide(); s.background = { color: CYAN };
  s.addText(rotulo, { x: 0.62, y: 0.6, w: 9, h: 0.45, fontFace: F, fontSize: 16,
    bold: true, color: NAVY, charSpacing: 2, isTextBox: true });
  if (icon) disco(s, 10.9, 0.55, 1.5, NAVY, icon);
  s.addText(instruccion, { x: 0.62, y: 1.2, w: 10, h: 1.75, fontFace: F,
    fontSize: 38, bold: true, color: WHITE, valign: 'top', isTextBox: true });
  if (detalle) s.addText(detalle, { x: 0.62, y: 3.1, w: 12.1, h: 3.7, fontFace: F,
    fontSize: 25, color: WHITE, lineSpacing: 38, valign: 'top', isTextBox: true });
  return s;
}
function divisor(tema, titulo, sub, icon) {
  const s = p.addSlide(); s.background = { color: NAVY }; sello(s, 'A8BAC6');
  s.addShape(p.ShapeType.rect, { x: 0, y: 2.5, w: 0.75, h: 2.4, fill: { color: ORANGE } });
  s.addText(tema, { x: 1.3, y: 2.5, w: 8, h: 0.6, fontFace: F, fontSize: 19,
    bold: true, color: CYAN, charSpacing: 3, isTextBox: true });
  s.addText(titulo, { x: 1.3, y: 3.05, w: 9, h: 2, fontFace: F, fontSize: 48,
    bold: true, color: WHITE, isTextBox: true });
  s.addText(sub, { x: 1.3, y: 5.2, w: 10.5, h: 0.5, fontFace: F, fontSize: 18,
    color: '9FC7DC', isTextBox: true });
  disco(s, 10.9, 2.6, 1.7, CYAN, icon);
  return s;
}
function fila(s, y, etiqueta, valor, o = {}) {
  s.addText(etiqueta, { x: o.x || 1.3, y, w: o.w || 6.6, h: 0.7, fontFace: F,
    fontSize: o.fs || 28, bold: !!o.bold, color: o.color || NAVY,
    valign: 'middle', margin: 0, isTextBox: true });
  s.addText(valor, { x: (o.x || 1.3) + (o.w || 6.6), y, w: 3.5, h: 0.7, align: 'right',
    fontFace: F, fontSize: o.fs || 28, bold: true, color: o.vcolor || o.color || NAVY,
    valign: 'middle', margin: 0, isTextBox: true });
}
// slide de un mensaje del ejercicio de seguridad
function mensaje(n, texto, veredicto, senal, seguro) {
  const s = p.addSlide(); s.background = { color: NAVY };
  s.addText('MENSAJE ' + n + ' DE 5', { x: 0.62, y: 0.55, w: 6, h: 0.4, fontFace: F,
    fontSize: 14, bold: true, color: CYAN, charSpacing: 3, isTextBox: true });
  s.addShape(p.ShapeType.rect, { x: 0.62, y: 1.35, w: 12.1, h: 2.75, fill: { color: WHITE } });
  s.addText('«' + texto + '»', { x: 1.1, y: 1.55, w: 11.1, h: 2.35, fontFace: F,
    fontSize: 33, bold: true, color: NAVY, valign: 'middle', isTextBox: true });
  s.addShape(p.ShapeType.rect, { x: 0.62, y: 4.5, w: 4.1, h: 1.0,
    fill: { color: seguro ? GREEN : RED } });
  s.addText(veredicto, { x: 0.62, y: 4.5, w: 4.1, h: 1.0, align: 'center', valign: 'middle',
    fontFace: F, fontSize: 26, bold: true, color: WHITE, margin: 0, isTextBox: true });
  s.addText(senal, { x: 5.1, y: 4.5, w: 7.6, h: 1.6, fontFace: F, fontSize: 21,
    color: WHITE, valign: 'top', lineSpacing: 32, isTextBox: true });
  s.addText('Muéstrelo primero sin la respuesta. Pregunte: ¿en qué se nota?',
    { x: 0.62, y: 6.45, w: 12.1, h: 0.45, fontFace: F, fontSize: 14, italic: true,
      color: '7FA8BF', isTextBox: true });
  return s;
}

/* ============ 1 · PORTADA ============ */
{
  const s = p.addSlide(); s.background = { color: NAVY };
  s.addText('MEDELLÍN', { x: 4.9, y: 0.55, w: 8, h: 1.15, fontFace: F, fontSize: 62,
    bold: true, color: '15455F', isTextBox: true });
  s.addText('TE QUIERE', { x: 4.9, y: 1.42, w: 8, h: 1.15, fontFace: F, fontSize: 62,
    bold: true, color: '15455F', isTextBox: true });
  s.addShape(p.ShapeType.rect, { x: 0, y: 0, w: 4.35, h: 7.5, fill: { color: '1B4E6B' } });
  s.addText('AQUÍ VA UNA FOTO\nDEL GRUPO', { x: 0.4, y: 3.1, w: 3.55, h: 1.3,
    align: 'center', fontFace: F, fontSize: 15, bold: true, color: '6E9DB5', isTextBox: true });
  s.addShape(p.ShapeType.rect, { x: 4.35, y: 2.4, w: 0.62, h: 2.9, fill: { color: ORANGE } });
  s.addShape(p.ShapeType.rect, { x: 4.97, y: 2.4, w: 7.75, h: 2.9, fill: { color: CYAN } });
  s.addText('SESIÓN 5', { x: 5.4, y: 2.6, w: 7, h: 0.5, fontFace: F, fontSize: 17,
    bold: true, color: 'D6F1FD', charSpacing: 3, isTextBox: true });
  s.addText('USAMOS LA TECNOLOGÍA\nY EL DINERO CON PROPÓSITO',
    { x: 5.4, y: 3.1, w: 7, h: 1.5, fontFace: F, fontSize: 29, bold: true,
      color: WHITE, valign: 'top', isTextBox: true });
  s.addText('Formación en Artes y Oficios · 8 horas presenciales',
    { x: 5.4, y: 4.62, w: 7, h: 0.45, fontFace: F, fontSize: 15, color: 'E8F6FD', isTextBox: true });
  s.addText('Secretaría de Inclusión Social y Familia  ·  Equipo de Personas Mayores',
    { x: 4.97, y: 6.55, w: 7.75, h: 0.4, align: 'right', fontFace: F, fontSize: 13,
      color: 'BBD3E0', isTextBox: true });
  s.addNotes('FM-AO-05. Reemplace el recuadro izquierdo por una foto del grupo.');
}

/* ============ 2 · RUTA ============ */
{
  const s = slideClaro('Lo que vamos a hacer hoy', 'ruta');
  const B = [
    ['8:00',  'Bienvenida', 'Nos conocemos', CYAN],
    ['8:20',  'El dinero de la iniciativa', 'Doña Rosa y el presupuesto', NAVY],
    ['10:30', 'Cómo doy a conocer', 'Experiencias y cuidados', NAVY],
    ['12:10', 'Almuerzo', 'Descanso', GREY],
    ['13:20', 'Mostrar lo que hago', 'Mensaje y fotografía', NAVY],
    ['15:30', 'Cierre', 'Lo que me llevo', CYAN],
  ];
  B.forEach((b, i) => {
    const x = 0.62 + (i % 3) * 4.13, y = 2.3 + Math.floor(i / 3) * 2.35;
    s.addShape(p.ShapeType.rect, { x, y, w: 3.83, h: 2.0, fill: { color: LIGHT } });
    s.addText(b[0], { x: x + 0.28, y: y + 0.16, w: 3.3, h: 0.55, fontFace: F,
      fontSize: 25, bold: true, color: b[3], margin: 0, isTextBox: true });
    s.addText(b[1], { x: x + 0.28, y: y + 0.72, w: 3.3, h: 0.8, fontFace: F,
      fontSize: 19, bold: true, color: NAVY, margin: 0, isTextBox: true });
    s.addText(b[2], { x: x + 0.28, y: y + 1.48, w: 3.3, h: 0.4, fontFace: F,
      fontSize: 13, color: GREY, margin: 0, isTextBox: true });
  });
  s.addNotes('Momento 1. Lea la ruta en voz alta, sin profundizar.');
}

/* ============ 3 · M1 BIENVENIDA ============ */
slideEjercicio('MOMENTO 1 · BIENVENIDA · 20 MINUTOS',
  '¿Para qué uso la tecnología?',
  '¿Por dónde se entera usted de las cosas?\n¿Por dónde avisa cuando quiere avisar algo?\n\nVamos anotando todas las respuestas.',
  'saludo')
  .addNotes('Anote en dos columnas SIN título. Al final rotule: con aparato / sin aparato. Aclare que hoy nadie necesita celular ni contar cuánto gana.');

/* ============ 4 · DIVISOR DINERO ============ */
divisor('MOMENTOS 2 Y 3', 'El dinero de\nla iniciativa',
  'Lo que entra · lo que cuesta · lo que se gasta · lo que se guarda', 'dinero')
  .addNotes('Es el bloque más denso del día y por eso va en la mañana, con la atención alta.');

/* ============ 5 · CASO DOÑA ROSA ============ */
{
  const s = slideClaro('El caso de doña Rosa', 'libro', 'MOMENTO 2 · 1 HORA');
  s.addShape(p.ShapeType.rect, { x: 0.62, y: 2.3, w: 12.1, h: 3.3, fill: { color: LIGHT } });
  s.addText('Doña Rosa hace velas en su casa.\n\nEste mes vendió 20 velas a $16.000 cada una. Para hacerlas compró cera, pabilo y vasos por $120.000. Pagó $20.000 de transporte para llevarlas a una feria y $15.000 de bolsas para empacarlas. Guardó $25.000 para el mes siguiente.',
    { x: 1.1, y: 2.6, w: 11.1, h: 2.8, fontFace: F, fontSize: 24, color: NAVY,
      lineSpacing: 36, valign: 'top', isTextBox: true });
  s.addText('Léalo dos veces, despacio, antes de escribir nada en el tablero.',
    { x: 0.62, y: 5.85, w: 12.1, h: 0.5, fontFace: F, fontSize: 18, italic: true,
      color: GREY, isTextBox: true });
  s.addNotes('Reparta el caso impreso en letra grande. Léalo dos veces.');
}

/* ============ 6 · LAS CUATRO PALABRAS ============ */
{
  const s = slideClaro('Las cuatro palabras', 'calculadora', 'MOMENTO 2');
  const C = [
    ['INGRESO', 'Lo que entra\npor las ventas', CYAN],
    ['COSTO', 'Lo que gasto\npara producir', NAVY],
    ['GASTO', 'Lo que pago\npara poder vender', GREY],
    ['AHORRO', 'Lo que aparto\npara después', ORANGE],
  ];
  C.forEach((c, i) => {
    const x = 0.62 + i * 3.09;
    s.addShape(p.ShapeType.rect, { x, y: 2.4, w: 2.85, h: 3.3, fill: { color: c[2] } });
    s.addText(c[0], { x: x + 0.25, y: 2.7, w: 2.35, h: 0.7, fontFace: F, fontSize: 24,
      bold: true, color: WHITE, margin: 0, isTextBox: true });
    s.addText(c[1], { x: x + 0.25, y: 3.6, w: 2.35, h: 1.5, fontFace: F, fontSize: 17,
      color: WHITE, lineSpacing: 26, margin: 0, isTextBox: true });
  });
  s.addText('Dibuje las cuatro columnas en el tablero SIN definirlas. El grupo decide en cuál va cada cosa del caso.',
    { x: 0.62, y: 6.0, w: 12.1, h: 0.6, fontFace: F, fontSize: 18, color: NAVY, isTextBox: true });
  s.addNotes('No defina las palabras al principio. Relea el caso renglón por renglón y que el grupo clasifique. Las definiciones se leen AL FINAL.');
}

/* ============ 7 · LA CUENTA DE DOÑA ROSA ============ */
{
  const s = slideClaro('La cuenta de doña Rosa', 'foco', 'MOMENTO 2 · SOLO AL FINAL');
  fila(s, 2.35, 'Ingreso   ·   20 velas a $16.000', '$ 320.000', { fs: 27, color: CYAN, bold: true });
  fila(s, 3.05, 'Costo   ·   cera, pabilo y vasos', '− $ 120.000', { fs: 27 });
  fila(s, 3.75, 'Gasto   ·   transporte y bolsas', '−  $ 35.000', { fs: 27 });
  s.addShape(p.ShapeType.rect, { x: 1.3, y: 4.55, w: 10.1, h: 0.03, fill: { color: NAVY } });
  s.addShape(p.ShapeType.rect, { x: 1.3, y: 4.7, w: 10.1, h: 0.95, fill: { color: NAVY } });
  fila(s, 4.82, '  LE QUEDARON', '$ 165.000  ', { x: 1.3, w: 6.6, fs: 30, bold: true, color: WHITE });
  s.addText('De esos, guardó $25.000 para el mes siguiente. Eso es el ahorro.',
    { x: 1.3, y: 5.9, w: 11, h: 0.6, fontFace: F, fontSize: 21, bold: true,
      color: ORANGE, margin: 0, isTextBox: true });
  s.addNotes('Escriba la resta grande en el tablero. Verifique con: ¿cómo se lo explicaría a un nieto? Nunca pregunte ¿entendieron?');
}

/* ============ 8 · JUEGO DEL PRESUPUESTO ============ */
slideEjercicio('MOMENTO 3 · JUEGO · 50 MINUTOS',
  'Ustedes deciden en qué se usan $200.000',
  'Cada grupo recibe 20 fichas.  Cada ficha vale $10.000.\n\nEs la plata que le quedó a doña Rosa este mes.\nRepártanla entre las tarjetas de la mesa.',
  'fichas')
  .addNotes('Subgrupos de 4 o 5. Deje 15 minutos y NO opine ni corrija mientras deciden.');

/* ============ 9 · LAS TARJETAS ============ */
{
  const s = slideClaro('¿En qué la usarían?', 'tienda', 'MOMENTO 3 · LAS TARJETAS');
  const T = [
    ['Materiales para el próximo mes', '6 fichas', NAVY],
    ['Transporte a la feria', '2 fichas', NAVY],
    ['Bolsas y empaque', '2 fichas', NAVY],
    ['Refrigerio del día de venta', '1 ficha', NAVY],
    ['Vestido nuevo para la feria', '4 fichas', ORANGE],
    ['Guardar para después', 'lo que sobre', CYAN],
  ];
  T.forEach((t, i) => {
    const x = 0.62 + (i % 2) * 6.25, y = 2.3 + Math.floor(i / 2) * 1.35;
    s.addShape(p.ShapeType.rect, { x, y, w: 5.95, h: 1.12, fill: { color: LIGHT } });
    s.addText(t[0], { x: x + 0.3, y: y + 0.08, w: 3.4, h: 0.95, fontFace: F, fontSize: 19,
      bold: true, color: NAVY, valign: 'middle', margin: 0, isTextBox: true });
    s.addText(t[1], { x: x + 3.6, y: y + 0.08, w: 2.1, h: 0.95, align: 'right',
      fontFace: F, fontSize: 19, bold: true, color: t[2], valign: 'middle',
      margin: 0, isTextBox: true });
  });
  s.addNotes('El vestido nuevo es la tentación del juego y es a propósito. No advierta sobre ella ni la desaconseje.');
}

/* ============ 10 · EL IMPREVISTO ============ */
{
  const s = p.addSlide(); s.background = { color: ORANGE };
  s.addText('A LOS 15 MINUTOS', { x: 0.62, y: 1.45, w: 8, h: 0.55, fontFace: F,
    fontSize: 17, bold: true, color: 'FFE0CE', charSpacing: 3, isTextBox: true });
  s.addText('¡Se dañó la olla\nde la cera!', { x: 0.62, y: 2.1, w: 9.6, h: 2.2,
    fontFace: F, fontSize: 48, bold: true, color: WHITE, isTextBox: true });
  s.addText('Arreglarla cuesta 3 fichas.  Todos los grupos tienen que pagarla.',
    { x: 0.62, y: 4.55, w: 10.5, h: 0.6, fontFace: F, fontSize: 24, bold: true,
      color: WHITE, isTextBox: true });
  s.addText('Quien guardó, la paga sin problema. Quien no guardó, tiene que quitar de otro lado.',
    { x: 0.62, y: 5.35, w: 11, h: 0.8, fontFace: F, fontSize: 20, color: 'FFEDE3',
      lineSpacing: 30, isTextBox: true });
  disco(s, 10.7, 2.2, 1.9, NAVY, 'escudo');
  s.addNotes('No señale a ningún grupo. Deje que el imprevisto muestre solo para qué sirve guardar. Cierre preguntando: ¿qué harían distinto?');
}

/* ============ 11 · PAUSA ============ */
{
  const s = slideOscuro('Pausa y refrigerio', 'comida', 'MOMENTO 4 · 20 MINUTOS');
  s.addText('Descanso real.\n\nSe puede ir al café en cualquier momento,\nsin pedir permiso.',
    { x: 1.95, y: 2.4, w: 10.3, h: 2.4, fontFace: F, fontSize: 27, color: WHITE,
      lineSpacing: 42, isTextBox: true });
  s.addNotes('Entregue refrigerio y diligencie el formato de entrega de beneficios. No adelante contenido.');
}

/* ============ 12 · DIVISOR MEDIOS ============ */
divisor('MOMENTOS 5, 6 Y 7', 'Cómo doy a\nconocer lo que hago',
  'Lo que ya hacemos · los cuidados que hay que tener', 'megafono')
  .addNotes('Primero salen las experiencias del grupo, después se les pone nombre.');

/* ============ 13 · EXPERIENCIAS ============ */
slideEjercicio('MOMENTO 5 · EN SUBGRUPOS · 40 MINUTOS',
  '¿Cómo se enteró la gente?',
  'Piense en algo que usted vendió, prestó o regaló.\n\n¿Cómo se enteró la gente de que usted lo tenía?\n\nCada grupo trae UNA sola historia.',
  'grupo')
  .addNotes('Subgrupos de 4, 15 minutos de conversación. Mientras cuentan, anote en el tablero SOLO el medio: la vecina avisó, el cartel, la llamada, la foto por WhatsApp.');

/* ============ 14 · MEDIOS Y CUIDADOS ============ */
{
  const s = slideClaro('Cada medio tiene su cuidado', 'escudo', 'MOMENTO 7 · 50 MINUTOS');
  const M = [
    ['Llamadas y mensajes', 'No comparta claves ni códigos'],
    ['Fotografías', 'Pida permiso antes de fotografiar a alguien'],
    ['WhatsApp o redes', 'No abra enlaces dudosos'],
    ['Carteles y voz a voz', 'También sirven, y mucho'],
    ['Ayuda de otra persona', 'Sin entregar sus claves'],
  ];
  M.forEach((m, i) => {
    const y = 2.25 + i * 0.88;
    s.addShape(p.ShapeType.rect, { x: 0.62, y, w: 12.1, h: 0.76,
      fill: { color: i % 2 ? LIGHT : WHITE } });
    s.addText(m[0], { x: 0.95, y, w: 4.4, h: 0.76, fontFace: F, fontSize: 21,
      bold: true, color: NAVY, valign: 'middle', margin: 0, isTextBox: true });
    s.addText(m[1], { x: 5.5, y, w: 7, h: 0.76, fontFace: F, fontSize: 21,
      color: GREY, valign: 'middle', margin: 0, isTextBox: true });
  });
  s.addNotes('Retome el tablero del momento 5 y vaya agregando el cuidado a cada medio que el grupo ya nombró. No empiece de cero.');
}

/* ============ 15 · EJERCICIO SEGURIDAD ============ */
slideEjercicio('MOMENTO 7 · EJERCICIO',
  '¿Le abro o no le abro?',
  'Voy a leer cinco mensajes. Responda con la mano:\n\n👍  arriba si le parece seguro\n👎  abajo si le parece sospechoso\n✋  plana si no sabe',
  'mano')
  .addNotes('Nadie usa su celular real. Después de cada mensaje pregunte: ¿en qué se nota? La señal es lo que enseña, no el veredicto.');

/* ============ 16-20 · LOS CINCO MENSAJES ============ */
mensaje(1, 'Su pedido está listo. Confirme por el número de siempre.',
  'PUEDE SER', 'Parece normal, pero conviene confirmar por un medio que usted ya conozca.', true)
  .addNotes('Respuesta matizada: no es un engaño, pero enseña el hábito de verificar.');
mensaje(2, 'Felicitaciones, ganó un premio. Envíe el código que le llegó por mensaje.',
  'SOSPECHOSO', 'Le pide un código. Nadie serio pide códigos por mensaje.', false)
  .addNotes('Este es el engaño más común. Insista en la señal: pidió un código.');
mensaje(3, 'Doña Rosa, ¿todavía tiene velas rojas? Soy la vecina del 302.',
  'SEGURO', 'Se identifica, pregunta por un producto y no le pide nada.', true)
  .addNotes('Sirve para que vean que no todo mensaje es peligroso.');
mensaje(4, 'Su cuenta será bloqueada hoy. Entre a este enlace y actualice la clave.',
  'SOSPECHOSO', 'Tres señales juntas: lo apura, le manda un enlace y le pide la clave.', false)
  .addNotes('Señale que la urgencia es parte del engaño: lo apuran para que no piense.');
mensaje(5, 'Le consigno ya mismo, pero primero devuélvame $50.000 que le mandé de más.',
  'SOSPECHOSO', 'Lo presiona para que usted mande dinero primero.', false)
  .addNotes('Cierre con la regla: nadie serio le pide una clave ni un código por mensaje.');

/* ============ 21 · ALMUERZO ============ */
{
  const s = slideOscuro('Almuerzo', 'comida', 'MOMENTO 8 · 1 HORA');
  s.addText('12:10  ·  volvemos a la 1:10', { x: 1.95, y: 2.35, w: 9, h: 0.7, fontFace: F,
    fontSize: 30, color: CYAN, isTextBox: true });
  s.addText('Nos vemos a la 1:10 en punto.', { x: 1.95, y: 3.5, w: 10, h: 0.9,
    fontFace: F, fontSize: 34, bold: true, color: WHITE, isTextBox: true });
  s.addNotes('Deje esta diapositiva proyectada. Escriba la hora de regreso también en el tablero.');
}

/* ============ 22 · NECESIDAD O GUSTO ============ */
slideEjercicio('MOMENTO 9 · REACTIVACIÓN · 10 MINUTOS',
  'Necesidad o gusto',
  'El mercado de la semana  ·  Un vestido nuevo  ·  La droga del mes\nUn paseo  ·  Una olla para trabajar  ·  Un celular nuevo\n\nMano arriba: necesidad.   Mano abajo: gusto.   Mano plana: depende.',
  'mano')
  .addNotes('No hay respuesta correcta y dígalo en voz alta. Cuando el grupo se divida, pregunte ¿de qué depende? y siga. Corte a los 10 minutos exactos.');

/* ============ 23 · DIVISOR MOSTRAR ============ */
divisor('MOMENTOS 10 Y 11', 'Mostrar lo\nque hago',
  'Un mensaje claro · una buena presentación', 'camara')
  .addNotes('Después del almuerzo no entra concepto nuevo: los dos momentos son prácticos.');

/* ============ 24 · LAS CUATRO PARTES ============ */
{
  const s = slideClaro('Un mensaje lleva cuatro cosas', 'lapiz', 'MOMENTO 10 · 50 MINUTOS');
  const P = [['1', 'Qué es'], ['2', 'Para quién sirve'], ['3', 'Cuánto vale'], ['4', 'Cómo lo piden']];
  P.forEach((q, i) => {
    const x = 0.62 + i * 3.09;
    s.addShape(p.ShapeType.rect, { x, y: 2.4, w: 2.85, h: 2.0, fill: { color: LIGHT } });
    s.addShape(p.ShapeType.ellipse, { x: x + 0.25, y: 2.65, w: 0.72, h: 0.72, fill: { color: ORANGE } });
    s.addText(q[0], { x: x + 0.25, y: 2.65, w: 0.72, h: 0.72, align: 'center', valign: 'middle',
      fontFace: F, fontSize: 26, bold: true, color: WHITE, margin: 0, isTextBox: true });
    s.addText(q[1], { x: x + 0.25, y: 3.5, w: 2.35, h: 0.8, fontFace: F, fontSize: 21,
      bold: true, color: NAVY, margin: 0, isTextBox: true });
  });
  s.addShape(p.ShapeType.rect, { x: 0.62, y: 4.75, w: 12.1, h: 1.5, fill: { color: CYAN } });
  s.addText('«Velas de cera para regalo. Sirven para un detalle o para la casa.\n$16.000. Pregunte por doña Rosa en la tienda de la esquina.»',
    { x: 1.0, y: 4.9, w: 11.4, h: 1.2, fontFace: F, fontSize: 22, bold: true,
      color: WHITE, lineSpacing: 32, isTextBox: true });
  s.addNotes('Escriba el ejemplo grande en el tablero antes de que las parejas empiecen.');
}

/* ============ 25 · EJERCICIO MENSAJE ============ */
slideEjercicio('MOMENTO 10 · EN PAREJAS',
  'Primero arme el mensaje del otro',
  'En parejas. Cada quien arma el mensaje del producto del compañero.\n\nA los 25 minutos cambiamos: ahora el suyo.\n\nNo escriba teléfonos ni direcciones reales. Escriba «aquí va mi contacto».',
  'grupo')
  .addNotes('Si en una pareja ninguno escribe, lo dictan y usted o el auxiliar escribe. Solo 3 o 4 parejas leen en voz alta, no todas.');

/* ============ 26 · TRES REGLAS ============ */
{
  const s = slideClaro('Una buena presentación: tres reglas', 'camara', 'MOMENTO 11 · 1 HORA');
  const R = [
    ['1', 'sol',    'Luz de ventana', 'Nunca con flash\nni de noche'],
    ['2', 'cuadro', 'Fondo limpio',   'Una tela o una\npared sin nada'],
    ['3', 'zoom',   'Acérquese',      'Que el producto\nllene la foto'],
  ];
  R.forEach((r, i) => {
    const x = 0.62 + i * 4.13;
    s.addShape(p.ShapeType.rect, { x, y: 2.35, w: 3.83, h: 3.5, fill: { color: LIGHT } });
    disco(s, x + 1.32, 2.65, 1.2, CYAN, r[1]);
    s.addText(r[0] + '.  ' + r[2], { x: x + 0.3, y: 4.05, w: 3.23, h: 0.6, align: 'center',
      fontFace: F, fontSize: 23, bold: true, color: NAVY, margin: 0, isTextBox: true });
    s.addText(r[3], { x: x + 0.3, y: 4.7, w: 3.23, h: 1.0, align: 'center', fontFace: F,
      fontSize: 17, color: GREY, lineSpacing: 25, margin: 0, isTextBox: true });
  });
  s.addNotes('Primero ponga un objeto MAL presentado y pregunte qué le arreglarían. Las tres reglas salen de las respuestas del grupo.');
}

/* ============ 27 · LAS TRES ESTACIONES ============ */
{
  const s = slideOscuro('Tres estaciones de 20 minutos', 'ruta', 'MOMENTO 11 · ROTAMOS');
  const E = [
    ['A', 'Preparar la escena', 'Extender la tela y poner\nel objeto junto a la ventana', CYAN],
    ['B', 'Registrar', 'Tomar la foto  o  dibujarla.\nLas dos opciones valen igual', ORANGE],
    ['C', 'Escribir', 'Poner debajo la frase\nque armamos antes', CYAN],
  ];
  E.forEach((e, i) => {
    const x = 0.62 + i * 4.13;
    s.addShape(p.ShapeType.rect, { x, y: 2.35, w: 3.83, h: 3.2, fill: { color: '15455F' } });
    s.addShape(p.ShapeType.ellipse, { x: x + 0.3, y: 2.65, w: 0.85, h: 0.85, fill: { color: e[3] } });
    s.addText(e[0], { x: x + 0.3, y: 2.65, w: 0.85, h: 0.85, align: 'center', valign: 'middle',
      fontFace: F, fontSize: 30, bold: true, color: WHITE, margin: 0, isTextBox: true });
    s.addText(e[1], { x: x + 0.3, y: 3.7, w: 3.23, h: 0.6, fontFace: F, fontSize: 22,
      bold: true, color: WHITE, margin: 0, isTextBox: true });
    s.addText(e[2], { x: x + 0.3, y: 4.35, w: 3.23, h: 1.0, fontFace: F, fontSize: 16,
      color: '9FC7DC', lineSpacing: 24, margin: 0, isTextBox: true });
  });
  s.addText('Nadie está obligado a usar su celular ni a salir en una foto.',
    { x: 0.62, y: 5.8, w: 12.1, h: 0.5, fontFace: F, fontSize: 18, color: WHITE, isTextBox: true });
  s.addNotes('Divida el grupo en tres y rote cada 20 minutos. Al final ponga todo a la vista y pregunte cuál se ve mejor y por qué.');
}

/* ============ 28 · CIERRE: LOS SEIS EJES ============ */
{
  const s = slideClaro('Lo que vimos en las cinco sesiones', 'libro', 'MOMENTO 13 · CIERRE');
  const EJ = [
    'Qué son las artes y los oficios',
    'Emprender y crear empresa',
    'Mercadeo: cómo llego al cliente',
    'El papel del artesano',
    'La tecnología para dar a conocer',
    'El uso racional de la economía',
  ];
  EJ.forEach((e, i) => {
    const x = 0.62 + (i % 2) * 6.25, y = 2.3 + Math.floor(i / 2) * 1.25;
    s.addShape(p.ShapeType.ellipse, { x, y: y + 0.1, w: 0.62, h: 0.62, fill: { color: CYAN } });
    s.addText(String(i + 1), { x, y: y + 0.1, w: 0.62, h: 0.62, align: 'center', valign: 'middle',
      fontFace: F, fontSize: 22, bold: true, color: WHITE, margin: 0, isTextBox: true });
    s.addText(e, { x: x + 0.85, y, w: 5.2, h: 0.85, fontFace: F, fontSize: 21,
      bold: true, color: NAVY, valign: 'middle', margin: 0, isTextBox: true });
  });
  s.addText('Por cada uno pregunte: ¿qué recuerdan de esto? Anote una frase del grupo, no la suya.',
    { x: 0.62, y: 6.15, w: 12.1, h: 0.5, fontFace: F, fontSize: 17, italic: true,
      color: GREY, isTextBox: true });
  s.addNotes('Si de algún eje no recuerdan nada, anótelo: le sirve para informar a coordinación.');
}

/* ============ 29 · TAREA Y SESIÓN 6 ============ */
{
  const s = slideOscuro('Lo que me llevo de hoy', 'corazon', 'MOMENTO 13 · 30 MINUTOS');
  s.addText('Cada quien dice UNA sola cosa que aprendió.\nEl que no quiera hablar, pasa.',
    { x: 1.95, y: 2.15, w: 10.3, h: 1.1, fontFace: F, fontSize: 25, color: WHITE,
      lineSpacing: 38, isTextBox: true });
  s.addShape(p.ShapeType.rect, { x: 0.62, y: 3.6, w: 12.1, h: 1.75, fill: { color: '15455F' } });
  s.addText('TAREA PARA LA CASA  ·  2 HORAS', { x: 1.1, y: 3.82, w: 8, h: 0.42, fontFace: F,
    fontSize: 15, bold: true, color: CYAN, charSpacing: 3, isTextBox: true });
  s.addText('Escoja cómo mostrar su iniciativa: una frase, un dibujo, un cartel o una foto.\nY piense en un gasto que conviene hacer ya y otro que puede esperar.',
    { x: 1.1, y: 4.28, w: 11.2, h: 1.0, fontFace: F, fontSize: 20, bold: true,
      color: WHITE, lineSpacing: 30, isTextBox: true });
  s.addShape(p.ShapeType.rect, { x: 0.62, y: 5.6, w: 12.1, h: 1.05, fill: { color: ORANGE } });
  s.addText('La sesión 6 es la primera PRÁCTICA.   Fecha: __________   Hora: __________   Lugar: __________',
    { x: 1.1, y: 5.6, w: 11.2, h: 1.05, fontFace: F, fontSize: 19, bold: true,
      color: WHITE, valign: 'middle', isTextBox: true });
  s.addNotes('No se publica información ni se usa dinero real en la tarea. Deje escritos fecha, hora y lugar de la sesión 6 en el tablero.');
}

p.writeFile({ fileName: '/home/user/Alquimia/docs/proyectos/personas-mayores/PPT_Sesion_5_Tecnologia_y_Dinero.pptx' })
 .then(f => console.log('creado:', f));
