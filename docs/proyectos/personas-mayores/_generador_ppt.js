const pptxgen = require('pptxgenjs');
const fs = require('fs');
const p = new pptxgen();
p.layout = 'LAYOUT_WIDE';               // 13.333 x 7.5
p.author = 'Equipo de Personas Mayores';
p.title  = 'Modulo 1 - Mi negocio: las cuentas y el celular';

const NAVY = '0E3A54', CYAN = '00A9E0', ORANGE = 'F26522',
      WHITE = 'FFFFFF', LIGHT = 'EEF3F6', GREY = '5A6B77';
const F = 'Arial';
const ic = n => 'image/png;base64,' + fs.readFileSync(`icons/${n}.png`).toString('base64');

const sello = s => s.addText(
  'Secretaría de Inclusión Social y Familia · Equipo de Personas Mayores',
  { x: 6.5, y: 0.26, w: 6.2, h: 0.32, align: 'right', fontFace: F,
    fontSize: 11, color: GREY, isTextBox: true });

const selloClaro = s => s.addText(
  'Secretaría de Inclusión Social y Familia · Equipo de Personas Mayores',
  { x: 6.5, y: 0.26, w: 6.2, h: 0.32, align: 'right', fontFace: F,
    fontSize: 11, color: 'A8BAC6', isTextBox: true });

// disco de color con icono
function disco(s, x, y, d, fill, icon, pad) {
  s.addShape(p.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: fill } });
  const q = pad === undefined ? d * 0.27 : pad;
  s.addImage({ data: ic(icon), x: x + q, y: y + q, w: d - 2 * q, h: d - 2 * q });
}

// ---------- plantillas ----------
function slideClaro(titulo, icon) {
  const s = p.addSlide(); s.background = { color: WHITE }; sello(s);
  if (icon) disco(s, 0.62, 0.82, 1.05, CYAN, icon);
  s.addText(titulo, { x: icon ? 1.95 : 0.62, y: 0.82, w: icon ? 10.7 : 12.1, h: 1.05,
    fontFace: F, fontSize: 38, bold: true, color: NAVY, valign: 'middle', isTextBox: true });
  return s;
}
function slideOscuro(titulo, icon, sub) {
  const s = p.addSlide(); s.background = { color: NAVY }; selloClaro(s);
  if (icon) disco(s, 0.62, 0.82, 1.05, ORANGE, icon);
  s.addText(titulo, { x: icon ? 1.95 : 0.62, y: 0.82, w: icon ? 10.7 : 12.1, h: 1.05,
    fontFace: F, fontSize: 38, bold: true, color: WHITE, valign: 'middle', isTextBox: true });
  if (sub) s.addText(sub, { x: 0.62, y: 1.95, w: 12.1, h: 0.5, fontFace: F,
    fontSize: 20, color: '9FC7DC', isTextBox: true });
  return s;
}
// tarjeta de ejercicio (fondo cian, letra enorme)
function slideEjercicio(rotulo, instruccion, detalle, icon) {
  const s = p.addSlide(); s.background = { color: CYAN };
  s.addText(rotulo, { x: 0.62, y: 0.6, w: 8, h: 0.45, fontFace: F, fontSize: 17,
    bold: true, color: NAVY, charSpacing: 2, isTextBox: true });
  if (icon) disco(s, 10.9, 0.55, 1.5, NAVY, icon);
  s.addText(instruccion, { x: 0.62, y: 1.25, w: 10, h: 1.9, fontFace: F,
    fontSize: 40, bold: true, color: WHITE, valign: 'top', isTextBox: true });
  if (detalle) s.addText(detalle, { x: 0.62, y: 3.3, w: 12.1, h: 3.5, fontFace: F,
    fontSize: 26, color: WHITE, lineSpacing: 40, valign: 'top', isTextBox: true });
  return s;
}
// fila de cuenta grande
function fila(s, y, etiqueta, valor, o = {}) {
  s.addText(etiqueta, { x: o.x || 1.4, y, w: o.w || 6.4, h: 0.72, fontFace: F,
    fontSize: o.fs || 30, bold: !!o.bold, color: o.color || NAVY,
    valign: 'middle', margin: 0, isTextBox: true });
  s.addText(valor, { x: (o.x || 1.4) + (o.w || 6.4), y, w: 3.4, h: 0.72, align: 'right',
    fontFace: F, fontSize: o.fs || 30, bold: true, color: o.vcolor || o.color || NAVY,
    valign: 'middle', margin: 0, isTextBox: true });
}
const linea = (s, y, color) => s.addShape(p.ShapeType.rect,
  { x: 1.4, y, w: 9.8, h: 0.03, fill: { color: color || 'C9D6DE' } });

// ============ 1. PORTADA ============
{
  const s = p.addSlide(); s.background = { color: NAVY };
  s.addText('MEDELLÍN', { x: 4.9, y: 0.55, w: 8, h: 1.15, fontFace: F, fontSize: 62,
    bold: true, color: '15455F', isTextBox: true });
  s.addText('TE QUIERE', { x: 4.9, y: 1.42, w: 8, h: 1.15, fontFace: F, fontSize: 62,
    bold: true, color: '15455F', isTextBox: true });
  s.addText('Secretaría de Inclusión Social y Familia  ·  Equipo de Personas Mayores',
    { x: 4.97, y: 6.55, w: 7.75, h: 0.4, align: 'right', fontFace: F, fontSize: 13,
      color: 'BBD3E0', isTextBox: true });
  // banda de foto a la izquierda
  s.addShape(p.ShapeType.rect, { x: 0, y: 0, w: 4.35, h: 7.5, fill: { color: '1B4E6B' } });
  s.addText('AQUÍ VA UNA FOTO\nDEL GRUPO', { x: 0.4, y: 3.1, w: 3.55, h: 1.3, align: 'center',
    fontFace: F, fontSize: 15, bold: true, color: '6E9DB5', isTextBox: true });
  s.addShape(p.ShapeType.rect, { x: 4.35, y: 2.55, w: 0.62, h: 2.6, fill: { color: ORANGE } });
  s.addShape(p.ShapeType.rect, { x: 4.97, y: 2.55, w: 7.75, h: 2.6, fill: { color: CYAN } });
  s.addText('MI NEGOCIO:\nLAS CUENTAS Y EL CELULAR',
    { x: 5.4, y: 2.75, w: 7, h: 1.5, fontFace: F, fontSize: 33, bold: true,
      color: WHITE, valign: 'middle', isTextBox: true });
  s.addText('Formación en Artes y Oficios · Jornada de 8 horas',
    { x: 5.4, y: 4.28, w: 7, h: 0.5, fontFace: F, fontSize: 16, color: 'E8F6FD', isTextBox: true });
  s.addNotes('Portada. Reemplace el recuadro de la izquierda por una foto del grupo o de la comuna.');
}

// ============ 2. RUTA DEL DÍA ============
{
  const s = slideClaro('Lo que vamos a hacer hoy', 'ruta');
  const bloques = [
    ['8:00',  'Bienvenida', 'Nos conocemos', CYAN],
    ['8:30',  'El dinero de mi negocio', 'Cuánto cuesta, a cómo vendo', NAVY],
    ['10:20', 'Practicamos las cuentas', 'Con mi propio producto', NAVY],
    ['12:00', 'Almuerzo', 'Descanso', GREY],
    ['13:00', 'Mi negocio en el celular', 'Fotos y WhatsApp', NAVY],
    ['15:30', 'Cierre', 'Lo que me llevo', CYAN],
  ];
  bloques.forEach((b, i) => {
    const x = 0.62 + (i % 3) * 4.13, y = 2.25 + Math.floor(i / 3) * 2.4;
    s.addShape(p.ShapeType.rect, { x, y, w: 3.83, h: 2.05, fill: { color: LIGHT } });
    s.addText(b[0], { x: x + 0.28, y: y + 0.18, w: 3.3, h: 0.55, fontFace: F,
      fontSize: 26, bold: true, color: b[3], margin: 0, isTextBox: true });
    s.addText(b[1], { x: x + 0.28, y: y + 0.76, w: 3.3, h: 0.78, fontFace: F,
      fontSize: 20, bold: true, color: NAVY, margin: 0, isTextBox: true });
    s.addText(b[2], { x: x + 0.28, y: y + 1.5, w: 3.3, h: 0.4, fontFace: F,
      fontSize: 14, color: GREY, margin: 0, isTextBox: true });
  });
  s.addNotes('Lea la ruta en voz alta. No profundice: es solo para que sepan qué esperar.');
}

// ============ 3. BIENVENIDA · JUEGO ============
slideEjercicio('BIENVENIDA · 20 MINUTOS',
  'Nombre y oficio de la casa',
  'Cada persona dice:\n\n1.  Cómo quiere que la llamen.\n2.  Un oficio que hubo en su casa.\n     «Mi mamá cosía»  ·  «Mi papá era zapatero»',
  'saludo')
  .addNotes('Empiece usted para dar el ejemplo. Nadie está obligado. Si alguien no quiere hablar, pasa el turno sin comentario.');

// ============ 4. DIVISOR TEMA 1 ============
{
  const s = p.addSlide(); s.background = { color: NAVY }; selloClaro(s);
  s.addShape(p.ShapeType.rect, { x: 0, y: 2.5, w: 0.75, h: 2.4, fill: { color: ORANGE } });
  s.addText('TEMA 1', { x: 1.3, y: 2.5, w: 8, h: 0.6, fontFace: F, fontSize: 20,
    bold: true, color: CYAN, charSpacing: 3, isTextBox: true });
  s.addText('El dinero de\nmi negocio', { x: 1.3, y: 3.05, w: 9, h: 2, fontFace: F,
    fontSize: 52, bold: true, color: WHITE, isTextBox: true });
  s.addText('Cuánto me cuesta · A cómo lo vendo · Cuánto me queda',
    { x: 1.3, y: 5.15, w: 10, h: 0.5, fontFace: F, fontSize: 19, color: '9FC7DC', isTextBox: true });
  disco(s, 10.9, 2.6, 1.7, CYAN, 'dinero');
  s.addNotes('Este es el bloque más difícil del día y por eso va en la mañana, con el grupo despierto.');
}

// ============ 5. EJERCICIO EL PRECIO JUSTO ============
slideEjercicio('EJERCICIO · 20 MINUTOS',
  '¿A cómo vendería usted esta vela?',
  'No lo diga en voz alta todavía.\n\nEscriba el precio en su tarjeta.\nDéle la vuelta y déjela sobre la mesa.',
  'lapiz')
  .addNotes('Lleve una vela artesanal terminada (o la pieza de la técnica del grupo). Reparta tarjetas. Luego lea los precios en voz alta: la diferencia entre el más bajo y el más alto va a ser enorme. Esa sorpresa es la que enseña, no usted.');

// ============ 6. LAS DOS CUENTAS ============
{
  const s = slideClaro('Solo hay dos cuentas que saber', 'calculadora');
  const tarjeta = (x, num, tit, form, color) => {
    s.addShape(p.ShapeType.rect, { x, y: 2.35, w: 5.75, h: 3.5, fill: { color: LIGHT } });
    s.addText(num, { x: x + 0.45, y: 2.6, w: 1.2, h: 0.9, fontFace: F, fontSize: 44,
      bold: true, color, margin: 0, isTextBox: true });
    s.addText(tit, { x: x + 0.45, y: 3.5, w: 4.9, h: 0.6, fontFace: F, fontSize: 26,
      bold: true, color: NAVY, margin: 0, isTextBox: true });
    s.addText(form, { x: x + 0.45, y: 4.2, w: 4.9, h: 1.4, fontFace: F, fontSize: 22,
      color: GREY, lineSpacing: 32, margin: 0, isTextBox: true });
  };
  tarjeta(0.62, '1', 'El COSTO', 'Lo que gasto\npara hacer uno', CYAN);
  tarjeta(6.95, '2', 'El PRECIO', 'Lo que cobro\npor ese uno', ORANGE);
  s.addNotes('Repita despacio: costo es lo que sale de mi bolsillo, precio es lo que entra. Una instrucción por vez.');
}

// ============ 7. EJEMPLO: LA VELA ============
{
  const s = slideClaro('Ejemplo: una vela artesanal', 'foco');
  s.addText('¿Cuánto me cuesta hacer UNA?', { x: 1.4, y: 1.95, w: 9.8, h: 0.5,
    fontFace: F, fontSize: 20, bold: true, color: ORANGE, margin: 0, isTextBox: true });
  fila(s, 2.5, 'Cera', '$ 3.000');
  fila(s, 3.18, 'Pabilo y esencia', '$ 1.000');
  fila(s, 3.86, 'Vaso', '$ 2.000');
  linea(s, 4.62);
  fila(s, 4.72, 'Mi tiempo  (1 hora)', '$ 5.000');
  s.addShape(p.ShapeType.rect, { x: 1.4, y: 5.5, w: 9.8, h: 0.95, fill: { color: NAVY } });
  fila(s, 5.62, '  COSTO DE UNA VELA', '$ 11.000  ',
    { x: 1.4, w: 6.4, fs: 32, bold: true, color: WHITE });
  s.addNotes('Escríbalo en el tablero al mismo tiempo, renglón por renglón. El valor del tiempo es la parte que siempre olvidan: insista.');
}

// ============ 8. DEL COSTO AL PRECIO ============
{
  const s = slideClaro('Del costo al precio', 'dinero');
  fila(s, 2.35, 'Me costó hacerla', '$ 11.000', { fs: 30 });
  fila(s, 3.15, 'Lo que quiero ganar', '$  5.500', { fs: 30, color: ORANGE });
  linea(s, 3.98, NAVY);
  s.addShape(p.ShapeType.rect, { x: 1.4, y: 4.15, w: 9.8, h: 1.05, fill: { color: CYAN } });
  fila(s, 4.3, '  LA VENDO EN', '$ 16.500  ',
    { x: 1.4, w: 6.4, fs: 34, bold: true, color: WHITE });
  s.addText('Si la vende en $8.000, está pagando por trabajar.',
    { x: 1.4, y: 5.6, w: 9.8, h: 0.6, fontFace: F, fontSize: 22, bold: true,
      color: NAVY, margin: 0, isTextBox: true });
  s.addNotes('Aquí vuelva a las tarjetas del ejercicio: cuántos habían puesto menos de 11.000.');
}

// ============ 9. EJERCICIO: CALCULE EL SUYO ============
{
  const s = slideEjercicio('EJERCICIO · 40 MINUTOS',
    'Saque la cuenta de SU producto', null, 'calculadora');
  s.addTable([
    [{ text: 'Mis materiales', options: { bold: true } }, { text: '$', options: { bold: true, align: 'right' } }],
    ['', ''], ['', ''],
    [{ text: 'Mi tiempo', options: { bold: true } }, { text: '$', options: { bold: true, align: 'right' } }],
    [{ text: 'COSTO', options: { bold: true, fill: { color: NAVY }, color: WHITE } },
     { text: '$', options: { bold: true, align: 'right', fill: { color: NAVY }, color: WHITE } }],
  ], { x: 1.1, y: 3.15, w: 11.1, colW: [8.6, 2.5], rowH: 0.66, fontFace: F, fontSize: 22,
       color: NAVY, fill: { color: WHITE }, border: { pt: 1, color: 'C9D6DE' }, valign: 'middle' });
  s.addNotes('Pasen por las mesas. Trabajen de a dos: quien ya sabe ayuda a quien no. 40 minutos incluye la puesta en común.');
}

// ============ 10. PAUSA ACTIVA ============
{
  const s = slideOscuro('Pausa activa', 'caminar');
  s.addText('10 minutos', { x: 1.95, y: 1.9, w: 6, h: 0.6, fontFace: F, fontSize: 22,
    color: CYAN, isTextBox: true });
  s.addText('Movemos hombros, manos, muñecas y tobillos.\n\nSentados o de pie, como cada quien pueda.\nNadie está obligado a levantarse.',
    { x: 1.95, y: 2.8, w: 10, h: 2.6, fontFace: F, fontSize: 27, color: WHITE,
      lineSpacing: 42, isTextBox: true });
  s.addNotes('Vaya despacio. Sin conteos rápidos ni competencia.');
}

// ============ 11. REGLA DE ORO ============
{
  const s = p.addSlide(); s.background = { color: ORANGE };
  s.addText('LA REGLA DE ORO', { x: 0.62, y: 1.5, w: 8, h: 0.55, fontFace: F,
    fontSize: 18, bold: true, color: 'FFE0CE', charSpacing: 3, isTextBox: true });
  s.addText('Su tiempo\ntambién se cobra.', { x: 0.62, y: 2.15, w: 9.6, h: 2.3,
    fontFace: F, fontSize: 50, bold: true, color: WHITE, isTextBox: true });
  s.addText('Si no cuenta las horas que trabajó, el negocio parece que deja plata\ny en realidad no deja nada.',
    { x: 0.62, y: 4.7, w: 10.5, h: 1.2, fontFace: F, fontSize: 22, color: 'FFEDE3',
      lineSpacing: 34, isTextBox: true });
  disco(s, 10.7, 2.3, 1.9, NAVY, 'reloj');
  s.addNotes('Slide de una sola idea. Deje un silencio después de leerla.');
}

// ============ 12. LA CUENTA DEL MES ============
{
  const s = slideClaro('La cuenta del mes', 'bolsa');
  const caja = (x, rot, txt, color, sub) => {
    s.addShape(p.ShapeType.rect, { x, y: 2.5, w: 3.5, h: 2.4, fill: { color } });
    s.addText(rot, { x: x + 0.3, y: 2.75, w: 2.9, h: 0.9, fontFace: F, fontSize: 25,
      bold: true, color: WHITE, margin: 0, isTextBox: true });
    s.addText(txt, { x: x + 0.3, y: 3.55, w: 2.9, h: 1.1, fontFace: F, fontSize: 17,
      color: WHITE, lineSpacing: 26, margin: 0, isTextBox: true });
  };
  caja(0.62, 'VENTAS', 'Todo lo que\nentró en el mes', CYAN);
  s.addText('−', { x: 4.25, y: 3.3, w: 0.9, h: 0.9, align: 'center', fontFace: F,
    fontSize: 46, bold: true, color: NAVY, isTextBox: true });
  caja(5.05, 'GASTOS', 'Materiales,\ntransporte, otros', GREY);
  s.addText('=', { x: 8.68, y: 3.3, w: 0.9, h: 0.9, align: 'center', fontFace: F,
    fontSize: 46, bold: true, color: NAVY, isTextBox: true });
  caja(9.48, 'GANANCIA', 'Lo que de verdad\nme quedó', ORANGE);
  s.addText('Si la ganancia da negativa, el negocio está perdiendo. Hay que subir el precio o bajar los gastos.',
    { x: 0.62, y: 5.35, w: 12.1, h: 0.9, fontFace: F, fontSize: 20, color: NAVY, isTextBox: true });
  s.addNotes('Solo tres cajas. No introduzca términos como ingresos o egresos: ventas, gastos y ganancia bastan.');
}

// ============ 13. EJERCICIO CUENTA DEL MES ============
slideEjercicio('EJERCICIO · 30 MINUTOS',
  'Haga la cuenta de su mes',
  'Ventas del mes        $ ______________\n\nGastos del mes        $ ______________\n\nGanancia                  $ ______________',
  'lapiz')
  .addNotes('Es una proyección, no un compromiso. Dígalo en voz alta para que nadie sienta que está firmando una meta.');

// ============ 14. ALMUERZO ============
{
  const s = slideOscuro('Almuerzo', 'comida');
  s.addText('12:00  ·  1 hora', { x: 1.95, y: 1.95, w: 8, h: 0.7, fontFace: F,
    fontSize: 30, color: CYAN, isTextBox: true });
  s.addText('Nos vemos a la 1:00 en punto.', { x: 1.95, y: 3.1, w: 10, h: 0.9,
    fontFace: F, fontSize: 34, bold: true, color: WHITE, isTextBox: true });
  s.addNotes('Deje esta diapositiva proyectada durante el almuerzo.');
}

// ============ 15. DIVISOR TEMA 2 ============
{
  const s = p.addSlide(); s.background = { color: NAVY }; selloClaro(s);
  s.addShape(p.ShapeType.rect, { x: 0, y: 2.5, w: 0.75, h: 2.4, fill: { color: ORANGE } });
  s.addText('TEMA 2', { x: 1.3, y: 2.5, w: 8, h: 0.6, fontFace: F, fontSize: 20,
    bold: true, color: CYAN, charSpacing: 3, isTextBox: true });
  s.addText('Mi negocio\nen el celular', { x: 1.3, y: 3.05, w: 9, h: 2, fontFace: F,
    fontSize: 52, bold: true, color: WHITE, isTextBox: true });
  s.addText('Una buena foto · Mostrar y vender por WhatsApp',
    { x: 1.3, y: 5.15, w: 10, h: 0.5, fontFace: F, fontSize: 19, color: '9FC7DC', isTextBox: true });
  disco(s, 10.9, 2.6, 1.7, CYAN, 'celular');
  s.addNotes('Después del almuerzo el grupo está en su punto más bajo: este bloque es práctico y en parejas a propósito.');
}

// ============ 16. CAMINATA DE A DOS ============
slideEjercicio('DESPUÉS DEL ALMUERZO · 15 MINUTOS',
  'La caminata de a dos',
  'Salimos a caminar en parejas con una sola pregunta:\n\n«¿A quién le ha mostrado usted lo que hace?»\n\nAl volver, cada pareja trae una frase.',
  'caminar')
  .addNotes('No es relleno: es lo que evita que el grupo se duerma. Salgan de verdad del salón.');

// ============ 17. TRES REGLAS DE LA FOTO ============
{
  const s = slideClaro('Una buena foto: tres reglas', 'camara');
  const regla = (x, n, icon, tit, txt) => {
    s.addShape(p.ShapeType.rect, { x, y: 2.3, w: 3.83, h: 3.55, fill: { color: LIGHT } });
    disco(s, x + 1.32, 2.62, 1.2, CYAN, icon);
    s.addText(n + '.  ' + tit, { x: x + 0.3, y: 4.05, w: 3.23, h: 0.6, align: 'center',
      fontFace: F, fontSize: 24, bold: true, color: NAVY, margin: 0, isTextBox: true });
    s.addText(txt, { x: x + 0.3, y: 4.7, w: 3.23, h: 1.0, align: 'center', fontFace: F,
      fontSize: 17, color: GREY, lineSpacing: 25, margin: 0, isTextBox: true });
  };
  regla(0.62, '1', 'sol',    'Luz de ventana', 'Nunca con flash\nni de noche');
  regla(4.75, '2', 'cuadro', 'Fondo limpio',   'Una tela o una\npared sin nada');
  regla(8.88, '3', 'zoom',   'Acérquese',      'Que el producto\nllene la foto');
  s.addNotes('Muestre una foto mala y una buena del mismo producto. El contraste enseña solo.');
}

// ============ 18. EJERCICIO FOTO ============
slideEjercicio('EJERCICIO · 40 MINUTOS',
  'Tome UNA foto de su producto',
  'En parejas. Quien tiene celular ayuda a quien no.\n\nUna sola foto, aplicando las tres reglas.\nAl final las vemos todas en la pantalla.',
  'camara')
  .addNotes('Una sola foto, no diez. Pasen por las parejas. Al final proyecte varias y pregunte al grupo cuál se ve mejor y por qué.');

// ============ 19. WHATSAPP 3 PASOS ============
{
  const s = slideClaro('Mostrar y vender por WhatsApp', 'whatsapp');
  const paso = (y, n, tit, txt) => {
    s.addShape(p.ShapeType.ellipse, { x: 0.8, y, w: 0.85, h: 0.85, fill: { color: ORANGE } });
    s.addText(n, { x: 0.8, y, w: 0.85, h: 0.85, align: 'center', valign: 'middle',
      fontFace: F, fontSize: 32, bold: true, color: WHITE, margin: 0, isTextBox: true });
    s.addText(tit, { x: 2.0, y: y - 0.02, w: 10.3, h: 0.5, fontFace: F, fontSize: 26,
      bold: true, color: NAVY, margin: 0, isTextBox: true });
    s.addText(txt, { x: 2.0, y: y + 0.46, w: 10.3, h: 0.5, fontFace: F, fontSize: 19,
      color: GREY, margin: 0, isTextBox: true });
  };
  paso(2.3, '1', 'Publique la foto en sus Estados', 'La ven todos sus contactos y no cuesta nada');
  paso(3.65, '2', 'Escriba el precio y para qué sirve', 'Sin precio, la gente no pregunta');
  paso(5.0, '3', 'Diga cómo lo pueden pedir', 'Un número de teléfono o su dirección');
  s.addNotes('WhatsApp Estados, no redes nuevas: es la herramienta que ya tienen y ya saben abrir.');
}

// ============ 20. CIERRE ============
{
  const s = slideOscuro('Lo que me llevo de hoy', 'corazon');
  s.addText('Cada quien dice UNA sola cosa que aprendió.\nEl que no quiera hablar, pasa.',
    { x: 1.95, y: 2.05, w: 10.3, h: 1.2, fontFace: F, fontSize: 26, color: WHITE,
      lineSpacing: 40, isTextBox: true });
  s.addShape(p.ShapeType.rect, { x: 0.62, y: 3.65, w: 12.1, h: 2.4, fill: { color: '15455F' } });
  s.addText('TAREA PARA LA CASA', { x: 1.1, y: 3.9, w: 8, h: 0.45, fontFace: F,
    fontSize: 16, bold: true, color: CYAN, charSpacing: 3, isTextBox: true });
  s.addText('Saque la cuenta de otros dos productos suyos\ny publique una foto en sus Estados.',
    { x: 1.1, y: 4.4, w: 11.2, h: 1.3, fontFace: F, fontSize: 27, bold: true,
      color: WHITE, lineSpacing: 40, isTextBox: true });
  s.addNotes('Cierre en autoestima, no en resumen. Recoja la caja de preguntas anónimas antes de despedir.');
}

p.writeFile({ fileName: '/home/user/Alquimia/docs/proyectos/personas-mayores/PPT_Modulo_Cuentas_y_Celular.pptx' })
 .then(f => console.log('creado:', f));
