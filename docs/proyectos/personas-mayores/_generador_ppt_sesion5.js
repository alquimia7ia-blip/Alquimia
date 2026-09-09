const pptxgen = require('pptxgenjs');
const fs = require('fs');
const p = new pptxgen();
p.layout = 'LAYOUT_WIDE';
p.author = 'Equipo de Personas Mayores';
p.title  = 'Sesion 5 - Usamos la tecnologia y el dinero con proposito';

const NAVY='0E3A54', CYAN='00A9E0', ORANGE='F26522', WHITE='FFFFFF',
      LIGHT='EEF3F6', GREY='5A6B77';
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
// momento: rotulo naranja + titulo + texto "que hacer" de la ficha
function momento(num, titulo, tiempo, queHacer, icon, oscuro) {
  const s = oscuro ? slideOscuro(titulo, icon, 'MOMENTO ' + num + '  ·  ' + tiempo)
                   : slideClaro(titulo, icon, 'MOMENTO ' + num + '  ·  ' + tiempo);
  s.addText(queHacer, { x: 1.95, y: 2.5, w: 10.4, h: 3.4, fontFace: F, fontSize: 27,
    color: oscuro ? WHITE : NAVY, lineSpacing: 42, valign: 'top', isTextBox: true });
  return s;
}
// juego de la ficha: como se realiza + que aporta
function juego(rotulo, nombre, como, aporta, icon) {
  const s = p.addSlide(); s.background = { color: CYAN };
  s.addText(rotulo, { x: 0.62, y: 0.6, w: 9, h: 0.45, fontFace: F, fontSize: 16,
    bold: true, color: NAVY, charSpacing: 2, isTextBox: true });
  disco(s, 10.9, 0.55, 1.5, NAVY, icon);
  s.addText(nombre, { x: 0.62, y: 1.2, w: 10, h: 1.4, fontFace: F,
    fontSize: 38, bold: true, color: WHITE, valign: 'top', isTextBox: true });
  s.addText(como, { x: 0.62, y: 2.85, w: 12.1, h: 2.6, fontFace: F, fontSize: 25,
    color: WHITE, lineSpacing: 38, valign: 'top', isTextBox: true });
  s.addShape(p.ShapeType.rect, { x: 0.62, y: 5.7, w: 12.1, h: 0.95, fill: { color: NAVY } });
  s.addText('QUÉ APORTA:   ' + aporta, { x: 1.0, y: 5.7, w: 11.4, h: 0.95, fontFace: F,
    fontSize: 22, bold: true, color: WHITE, valign: 'middle', isTextBox: true });
  return s;
}
// tabla de conceptos de la ficha
function conceptos(titulo, rotulo, icon, filas, wIzq) {
  const s = slideClaro(titulo, icon, rotulo);
  const h = 0.72;
  filas.forEach((f, i) => {
    const y = 2.3 + i * (h + 0.09);
    s.addShape(p.ShapeType.rect, { x: 0.62, y, w: 12.1, h,
      fill: { color: i % 2 ? LIGHT : WHITE } });
    s.addText(f[0], { x: 0.95, y, w: wIzq, h, fontFace: F, fontSize: 20,
      bold: true, color: NAVY, valign: 'middle', margin: 0, isTextBox: true });
    s.addText(f[1], { x: 0.95 + wIzq + 0.3, y, w: 11.45 - wIzq - 0.3, h, fontFace: F,
      fontSize: 18, color: GREY, valign: 'middle', margin: 0, isTextBox: true });
  });
  return s;
}
// tabla de ruta
function ruta(titulo, rotulo, filas) {
  const s = slideClaro(titulo, 'ruta', rotulo);
  const h = 0.56;
  s.addShape(p.ShapeType.rect, { x: 0.62, y: 2.15, w: 12.1, h: 0.42, fill: { color: NAVY } });
  [['#', 0.95, 0.5], ['Momento', 1.55, 3.3], ['Tiempo', 5.0, 1.2], ['Qué hacer', 6.35, 6.1]]
    .forEach(c => s.addText(c[0], { x: c[1], y: 2.15, w: c[2], h: 0.42, fontFace: F,
      fontSize: 14, bold: true, color: WHITE, valign: 'middle', margin: 0, isTextBox: true }));
  filas.forEach((f, i) => {
    const y = 2.62 + i * (h + 0.06);
    s.addShape(p.ShapeType.rect, { x: 0.62, y, w: 12.1, h,
      fill: { color: i % 2 ? LIGHT : WHITE } });
    s.addText(f[0], { x: 0.95, y, w: 0.5, h, fontFace: F, fontSize: 17, bold: true,
      color: CYAN, valign: 'middle', margin: 0, isTextBox: true });
    s.addText(f[1], { x: 1.55, y, w: 3.3, h, fontFace: F, fontSize: 17, bold: true,
      color: NAVY, valign: 'middle', margin: 0, isTextBox: true });
    s.addText(f[2], { x: 5.0, y, w: 1.2, h, fontFace: F, fontSize: 16,
      color: ORANGE, valign: 'middle', margin: 0, isTextBox: true });
    s.addText(f[3], { x: 6.35, y, w: 6.1, h, fontFace: F, fontSize: 15,
      color: GREY, valign: 'middle', margin: 0, isTextBox: true });
  });
  return s;
}

/* ===== 1 · PORTADA ===== */
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
  s.addText('FM-AO-05  ·  SESIÓN 5', { x: 5.4, y: 2.6, w: 7, h: 0.5, fontFace: F,
    fontSize: 16, bold: true, color: 'D6F1FD', charSpacing: 3, isTextBox: true });
  s.addText('USAMOS LA TECNOLOGÍA\nY EL DINERO CON PROPÓSITO',
    { x: 5.4, y: 3.1, w: 7, h: 1.5, fontFace: F, fontSize: 29, bold: true,
      color: WHITE, valign: 'top', isTextBox: true });
  s.addText('Formación en Artes y Oficios · 8 h presenciales + 2 h en casa',
    { x: 5.4, y: 4.62, w: 7, h: 0.45, fontFace: F, fontSize: 15, color: 'E8F6FD', isTextBox: true });
  s.addText('Secretaría de Inclusión Social y Familia  ·  Equipo de Personas Mayores',
    { x: 4.97, y: 6.55, w: 7.75, h: 0.4, align: 'right', fontFace: F, fontSize: 13,
      color: 'BBD3E0', isTextBox: true });
  s.addNotes('Quinta y última sesión teórica. Reemplace el recuadro izquierdo por una foto del grupo.');
}

/* ===== 2 · OBJETIVO ===== */
{
  const s = slideClaro('Para qué es esta jornada', 'bombillo');
  s.addShape(p.ShapeType.rect, { x: 0.62, y: 2.3, w: 12.1, h: 1.95, fill: { color: LIGHT } });
  s.addText('OBJETIVO', { x: 1.0, y: 2.5, w: 4, h: 0.4, fontFace: F, fontSize: 15,
    bold: true, color: ORANGE, charSpacing: 3, isTextBox: true });
  s.addText('Reconocer usos accesibles y seguros de medios tecnológicos para comunicar una iniciativa y comprender principios básicos de ingresos, gastos, ahorro y decisiones responsables.',
    { x: 1.0, y: 2.95, w: 11.3, h: 1.2, fontFace: F, fontSize: 22, color: NAVY,
      lineSpacing: 32, isTextBox: true });
  s.addShape(p.ShapeType.rect, { x: 0.62, y: 4.5, w: 12.1, h: 1.95, fill: { color: CYAN } });
  s.addText('AL FINALIZAR', { x: 1.0, y: 4.7, w: 4, h: 0.4, fontFace: F, fontSize: 15,
    bold: true, color: 'D6F1FD', charSpacing: 3, isTextBox: true });
  s.addText('Cada participante habrá identificado una forma posible de mostrar o comunicar una oferta y una decisión sencilla para organizar mejor los recursos de una iniciativa.',
    { x: 1.0, y: 5.15, w: 11.3, h: 1.2, fontFace: F, fontSize: 22, color: WHITE,
      lineSpacing: 32, isTextBox: true });
  s.addNotes('Objetivo y resultado esperado, tal como están en la ficha FM-AO-05.');
}

/* ===== 3-4 · RUTA ===== */
ruta('Ruta de la jornada', 'MOMENTOS 1 A 7  ·  MAÑANA', [
  ['1', 'Bienvenida y activación', '20 min', 'Presente el propósito y realice ¿Para qué uso la tecnología?'],
  ['2', 'Experiencias cotidianas', '40 min', 'Converse en subgrupos sobre llamadas, fotos, radio y carteles'],
  ['3', 'Tecnología accesible y segura', '50 min', 'Explique usos posibles y cuidados'],
  ['4', 'Pausa lúdica y refrigerio', '20 min', 'Proponga Mensaje que viaja u otra actividad voluntaria'],
  ['5', 'Mostrar una oferta', '1 h', 'Practiquen fondo limpio, buena luz y descripción breve'],
  ['6', 'Pausa activa', '10 min', 'Descanso visual y movilidad suave'],
  ['7', 'Mensaje sencillo', '50 min', 'Construyan en parejas un mensaje, sin datos reales'],
]).addNotes('Ruta de la jornada según la ficha. Los tiempos suman 8 horas incluidos todos los momentos.');

ruta('Ruta de la jornada', 'MOMENTOS 8 A 13  ·  TARDE', [
  ['8',  'Almuerzo', '1 h', 'Almuerzo y descanso'],
  ['9',  'Reactivación', '10 min', 'Realice Necesidad o gusto u otra actividad corta'],
  ['10', 'Ingresos, gastos y ahorro', '1 h', 'Explique con ejemplos de una iniciativa'],
  ['11', 'Juego del presupuesto', '50 min', 'Con fichas de dinero y un caso imaginario'],
  ['12', 'Pausa lúdica y refrigerio', '20 min', 'Actividad breve, adaptada y voluntaria'],
  ['13', 'Cierre', '30 min', 'Integre los seis ejes y explique la transición a la sesión 6'],
]).addNotes('Segunda mitad de la ruta.');

/* ===== 5-6 · MOMENTO 1 ===== */
momento('1', 'Bienvenida y activación', '20 MINUTOS',
  'Presente el propósito de la jornada.\n\nRealice ¿Para qué uso la tecnología?\no otra actividad breve.', 'saludo')
  .addNotes('Las actividades no dependen de que cada persona tenga celular, internet o cuenta bancaria.');

juego('MOMENTO 1 · JUEGO', '¿Para qué uso la tecnología?',
  'El grupo menciona los medios que usa en la vida diaria.\n\nIncluya opciones no digitales como cartel, llamada o voz a voz.',
  'Reconocimiento de experiencias', 'megafono')
  .addNotes('La participación es voluntaria. Evite competencia y exigencias de memoria o rapidez.');

/* ===== 7 · MOMENTO 2 ===== */
momento('2', 'Experiencias cotidianas', '40 MINUTOS',
  'Converse en subgrupos sobre experiencias y anécdotas:\n\nllamadas, mensajes, fotografías, radio, carteles\ny otros medios usados para informarse o vender.', 'grupo')
  .addNotes('Use parejas o subgrupos para facilitar la participación; lleve a plenaria solo algunas ideas.');

/* ===== 8-9 · MOMENTO 3 ===== */
momento('3', 'Tecnología accesible y segura', '50 MINUTOS',
  'Explique usos posibles y cuidados:\n\ndatos personales  ·  enlaces  ·  claves  ·  engaños\ny autorización antes de publicar fotografías.', 'escudo')
  .addNotes('No pida claves, saldos, deudas, cuentas bancarias ni publicaciones reales durante el ejercicio.');

conceptos('Medios tecnológicos: usos y cuidados', 'MOMENTO 3', 'celular', [
  ['Llamadas y mensajes', 'Confirmar el destinatario, escribir información clara y no compartir claves o códigos.'],
  ['Fotografías', 'Buscar luz suficiente y fondo ordenado; pedir autorización antes de fotografiar o publicar a otras personas.'],
  ['WhatsApp o redes', 'No abrir enlaces dudosos, no enviar dinero por presión y verificar pedidos o pagos por un medio conocido.'],
  ['Carteles y voz a voz', 'También son medios válidos. Deben incluir información clara, legible y verificable.'],
  ['Apoyo de otra persona', 'Puede solicitar acompañamiento de alguien de confianza sin entregar claves ni perder control de sus decisiones.'],
], 3.3).addNotes('Tabla de conceptos esenciales de la ficha. Dé una instrucción por vez y compruebe que se entendió.');

/* ===== 10-11 · MOMENTO 4 ===== */
momento('4', 'Pausa lúdica y refrigerio', '20 MINUTOS',
  'Proponga Mensaje que viaja\nu otra actividad voluntaria.', 'comida', true)
  .addNotes('Entregue el refrigerio y diligencie el formato de entrega de beneficios.');

juego('MOMENTO 4 · JUEGO', 'Mensaje que viaja',
  'Una frase breve pasa de persona en persona.\n\nAl final se compara con la original\ny se conversa sobre la claridad.',
  'Comunicación clara', 'whatsapp')
  .addNotes('Es compatible con estar sentados y comiendo. La participación es voluntaria.');

/* ===== 12-13 · MOMENTO 5 ===== */
momento('5', 'Mostrar una oferta', '1 HORA',
  'Con objetos o ejemplos, practiquen:\n\nfondo limpio  ·  buena luz  ·  información clara\ny una descripción breve.\n\nPuede simularse en papel.', 'camara')
  .addNotes('Ofrezca alternativas en papel, conversación o demostración compartida. No dependa del celular.');

juego('MOMENTO 5 · ACTIVIDAD', 'Foto o dibujo de producto',
  'En parejas, preparan una escena con fondo ordenado y buena luz,\n\no la dibujan si no hay dispositivo.',
  'Presentación de la oferta', 'cuadro')
  .addNotes('Nadie está obligado a usar celular. Pida autorización antes de fotografiar a cualquier persona.');

/* ===== 14 · MOMENTO 6 ===== */
momento('6', 'Pausa activa', '10 MINUTOS',
  'Descanso visual y movilidad suave\nde manos, cuello y hombros.', 'caminar', true)
  .addNotes('Cada 60 a 90 minutos proponga movilidad suave, descanso visual, respiración o una activación breve.');

/* ===== 15 · MOMENTO 7 ===== */
momento('7', 'Mensaje sencillo', '50 MINUTOS',
  'Construyan en parejas un mensaje con:\n\nnombre  ·  qué ofrece  ·  para quién puede servir\ny forma segura de contacto.\n\nSin publicar datos reales.', 'lapiz')
  .addNotes('La participación puede ser oral, escrita, gráfica o práctica.');

/* ===== 16 · MOMENTO 8 ===== */
momento('8', 'Almuerzo', '1 HORA', 'Almuerzo y descanso.', 'comida', true)
  .addNotes('Entregue el almuerzo y diligencie el formato de entrega de beneficios.');

/* ===== 17-18 · MOMENTO 9 ===== */
momento('9', 'Reactivación', '10 MINUTOS',
  'Realice Necesidad o gusto\nu otra actividad corta.', 'mano', true)
  .addNotes('Alterne conversación y actividad. Permita repetir, descansar y recibir apoyo.');

juego('MOMENTO 9 · JUEGO', 'Necesidad o gusto',
  'Ante ejemplos cotidianos, cada persona indica con un gesto\n\nsi lo considera necesidad, gusto o depende del caso.',
  'Priorización', 'pregunta')
  .addNotes('Nadie está obligado a moverse ni a hablar frente a todo el grupo.');

/* ===== 19-21 · MOMENTO 10 ===== */
momento('10', 'Ingresos, gastos y ahorro', '1 HORA',
  'Explique con ejemplos de una iniciativa:\n\ndinero que entra  ·  costos  ·  gastos\nreserva  ·  ahorro.\n\nNo solicite cifras personales.', 'dinero')
  .addNotes('Trabaje con casos imaginarios. Parta de la experiencia de las personas y evite lenguaje infantilizante.');

conceptos('Uso racional de los recursos', 'MOMENTO 10', 'calculadora', [
  ['Ingreso', 'Dinero que entra por una venta, servicio u otra fuente.'],
  ['Costo', 'Recurso que se usa directamente para producir u ofrecer: materiales, insumos o mano de obra, según el caso.'],
  ['Gasto', 'Pago necesario para funcionar, comunicar, transportar o entregar, entre otros.'],
  ['Ahorro o reserva', 'Parte que se guarda para una meta, una compra futura o una situación inesperada.'],
  ['Decisión responsable', 'Comparar, priorizar, evitar compras innecesarias y no comprometer dinero que no se tiene.'],
], 3.3).addNotes('Explicación aplicada a una iniciativa, tal como está en la ficha.');

{
  const s = p.addSlide(); s.background = { color: ORANGE };
  s.addText('CUIDADO', { x: 0.62, y: 1.7, w: 8, h: 0.55, fontFace: F, fontSize: 18,
    bold: true, color: 'FFE0CE', charSpacing: 3, isTextBox: true });
  s.addText('Trabaje siempre con\ncasos imaginarios.', { x: 0.62, y: 2.35, w: 9.6, h: 2.2,
    fontFace: F, fontSize: 46, bold: true, color: WHITE, isTextBox: true });
  s.addText('No solicite claves, saldos, deudas, ingresos personales ni información bancaria.',
    { x: 0.62, y: 4.8, w: 10.6, h: 1.0, fontFace: F, fontSize: 23, color: 'FFEDE3',
      lineSpacing: 34, isTextBox: true });
  disco(s, 10.7, 2.45, 1.9, NAVY, 'escudo');
  s.addNotes('Advertencia de la ficha para los momentos 10 y 11.');
}

/* ===== 22-23 · MOMENTO 11 ===== */
momento('11', 'Juego del presupuesto', '50 MINUTOS',
  'Con fichas de dinero y un caso imaginario, prioricen:\n\nmateriales  ·  transporte  ·  empaque\nahorro  ·  otros gastos.', 'fichas')
  .addNotes('El caso debe ser ficticio. No solicite información financiera real de ninguna persona.');

juego('MOMENTO 11 · JUEGO', 'Presupuesto imaginario',
  'Distribuyan fichas entre materiales, transporte, empaque,\n\nahorro y otros gastos de un caso ficticio.',
  'Decisiones financieras', 'tienda')
  .addNotes('Trabaje en subgrupos. Lleve a plenaria solo algunas decisiones.');

/* ===== 24 · MOMENTO 12 ===== */
momento('12', 'Pausa lúdica y refrigerio', '20 MINUTOS',
  'Proponga una actividad breve,\nadaptada y voluntaria.', 'comida', true)
  .addNotes('Entregue el refrigerio y diligencie el formato de entrega de beneficios.');

/* ===== 25 · MOMENTO 13 ===== */
momento('13', 'Cierre', '30 MINUTOS',
  'Integre los seis ejes teóricos\n\ny explique la transición a la primera práctica\nen la sesión 6.', 'corazon')
  .addNotes('Cuide el trato: parta de la experiencia de las personas y evite juicios sobre sus capacidades.');

/* ===== 26 · PREGUNTAS ORIENTADORAS ===== */
{
  const s = slideClaro('Preguntas orientadoras', 'pregunta', 'CIERRE');
  const Q = ['¿Qué medio podría usar?',
             '¿Qué cuidado debo tener?',
             '¿Qué decisión ayudaría a organizar mejor\nlos recursos de una iniciativa?'];
  Q.forEach((q, i) => {
    const y = 2.4 + i * 1.35;
    s.addShape(p.ShapeType.ellipse, { x: 0.8, y: y + 0.12, w: 0.85, h: 0.85, fill: { color: CYAN } });
    s.addText(String(i + 1), { x: 0.8, y: y + 0.12, w: 0.85, h: 0.85, align: 'center',
      valign: 'middle', fontFace: F, fontSize: 30, bold: true, color: WHITE,
      margin: 0, isTextBox: true });
    s.addText(q, { x: 2.0, y, w: 10.3, h: 1.15, fontFace: F, fontSize: 26, bold: true,
      color: NAVY, valign: 'middle', lineSpacing: 34, margin: 0, isTextBox: true });
  });
  s.addText('Escuche sin exigir respuestas escritas ni elaborar un informe.',
    { x: 0.62, y: 6.35, w: 12.1, h: 0.5, fontFace: F, fontSize: 17, italic: true,
      color: GREY, isTextBox: true });
  s.addNotes('Preguntas orientadoras de la ficha FM-AO-05.');
}

/* ===== 27 · TRABAJO EN CASA ===== */
{
  const s = slideOscuro('Trabajo en casa', 'casa', '2 HORAS');
  s.addShape(p.ShapeType.rect, { x: 0.62, y: 2.4, w: 12.1, h: 2.1, fill: { color: '15455F' } });
  s.addText('Elegir una forma sencilla de presentar una iniciativa:\nuna frase, un dibujo, un cartel o una fotografía.',
    { x: 1.1, y: 2.62, w: 11.2, h: 1.7, fontFace: F, fontSize: 25, bold: true,
      color: WHITE, lineSpacing: 38, isTextBox: true });
  s.addShape(p.ShapeType.rect, { x: 0.62, y: 4.7, w: 12.1, h: 1.5, fill: { color: CYAN } });
  s.addText('Y pensar en un gasto que conviene priorizar y otro que podría esperar.',
    { x: 1.1, y: 4.7, w: 11.2, h: 1.5, fontFace: F, fontSize: 24, bold: true,
      color: WHITE, valign: 'middle', isTextBox: true });
  s.addText('No debe publicar información ni usar dinero real.',
    { x: 0.62, y: 6.4, w: 12.1, h: 0.5, fontFace: F, fontSize: 20, bold: true,
      color: ORANGE, isTextBox: true });
  s.addNotes('Trabajo en casa de 2 horas, según la ficha. La sesión 6 es la primera práctica.');
}

p.writeFile({ fileName: '/home/user/Alquimia/docs/proyectos/personas-mayores/PPT_Sesion_5_Tecnologia_y_Dinero.pptx' })
 .then(f => console.log('creado:', f));
