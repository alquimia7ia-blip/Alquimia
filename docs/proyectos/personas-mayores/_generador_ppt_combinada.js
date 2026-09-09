const pptxgen = require('pptxgenjs');
const fs = require('fs');
const p = new pptxgen();
p.layout = 'LAYOUT_WIDE';                 // 13.333 x 7.5
p.author = 'Equipo de Personas Mayores';
p.title  = 'Sesion 5 - El telefono y el dinero de mi negocio';

/* ---------------------------------------------------------------
   PALETA  ·  solo dos fondos llevan texto largo: BLANCO y NAVY.
   El cian y el naranja pasan a ser acentos y paneles claros,
   porque texto blanco sobre cian daba 2,7:1 de contraste.
      NAVY sobre BLANCO  ....... 11,9 : 1
      BLANCO sobre NAVY  ....... 11,9 : 1
      NAVY sobre PALE    ....... 10,2 : 1
   --------------------------------------------------------------- */
const NAVY  = '0E3A54',   // azul institucional
      DEEP  = '15455F',   // navy un tono mas claro
      CYAN  = '00A9E0',   // acento
      ORANGE= 'F26522',   // acento
      RUST  = 'B8430D',   // naranja legible sobre blanco (5,3:1)
      PALE  = 'D9F0FA',   // panel de ejercicio
      SOFT  = 'E7EEF3',   // tarjeta gris clara
      INK   = '233A48',   // texto de apoyo sobre blanco
      SKY   = 'B9D9EA',   // texto de apoyo sobre navy
      WHITE = 'FFFFFF',
      PLACE = 'FDEBE1';   // caja "anexe aqui"
const F = 'Arial';
const ic = n => 'image/png;base64,' + fs.readFileSync(`icons/${n}.png`).toString('base64');

function disco(s, x, y, d, fill, icon) {
  s.addShape(p.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: fill } });
  const q = d * 0.27;
  s.addImage({ data: ic(icon), x: x + q, y: y + q, w: d - 2*q, h: d - 2*q });
}
const sello = (s, c) => s.addText(
  'Secretaría de Inclusión Social y Familia  ·  Equipo de Personas Mayores',
  { x: 6.0, y: 6.98, w: 6.72, h: 0.32, align: 'right', fontFace: F,
    fontSize: 11, color: c || '8FA3B0', isTextBox: true });

// rotulo pequeno de esquina (18pt, el minimo de todo el deck)
const rotulo = (s, txt, color) => s.addText(txt, { x: 0.62, y: 0.42, w: 9, h: 0.42,
  fontFace: F, fontSize: 18, bold: true, color, charSpacing: 2, isTextBox: true });

/* ---------- A · lamina blanca con titulo grande ---------- */
function blanca(titulo, icon, rot) {
  const s = p.addSlide(); s.background = { color: WHITE }; sello(s);
  if (rot) rotulo(s, rot, RUST);
  const y = rot ? 1.0 : 0.75;
  if (icon) disco(s, 0.62, y, 1.3, CYAN, icon);
  s.addText(titulo, { x: icon ? 2.25 : 0.62, y, w: icon ? 10.4 : 12.1, h: 1.3,
    fontFace: F, fontSize: 44, bold: true, color: NAVY, valign: 'middle', isTextBox: true });
  return s;
}
/* ---------- B · lamina navy ---------- */
function oscura(titulo, icon, sub) {
  const s = p.addSlide(); s.background = { color: NAVY }; sello(s, '6E8FA3');
  if (icon) disco(s, 0.62, 0.75, 1.3, ORANGE, icon);
  s.addText(titulo, { x: icon ? 2.25 : 0.62, y: 0.75, w: icon ? 10.4 : 12.1, h: 1.3,
    fontFace: F, fontSize: 44, bold: true, color: WHITE, valign: 'middle', isTextBox: true });
  if (sub) s.addText(sub, { x: 0.62, y: 2.15, w: 12.1, h: 0.6, fontFace: F,
    fontSize: 26, color: SKY, isTextBox: true });
  return s;
}
/* ---------- C · divisor de tema ---------- */
function divisor(n, titulo, sub, icon) {
  const s = p.addSlide(); s.background = { color: NAVY }; sello(s, '6E8FA3');
  s.addShape(p.ShapeType.rect, { x: 0, y: 2.35, w: 0.8, h: 2.75, fill: { color: ORANGE } });
  s.addText(n, { x: 1.35, y: 2.35, w: 8, h: 0.65, fontFace: F, fontSize: 24,
    bold: true, color: CYAN, charSpacing: 3, isTextBox: true });
  s.addText(titulo, { x: 1.35, y: 3.0, w: 9.2, h: 2.1, fontFace: F, fontSize: 56,
    bold: true, color: WHITE, valign: 'top', isTextBox: true });
  if (sub) s.addText(sub, { x: 1.35, y: 5.25, w: 10.4, h: 0.7, fontFace: F,
    fontSize: 26, color: SKY, isTextBox: true });
  disco(s, 10.85, 2.5, 1.9, CYAN, icon);
  return s;
}
/* ---------- D · ejercicio (panel cian claro, texto navy) ---------- */
function ejercicio(rot, instruccion, detalle, icon, o = {}) {
  const s = p.addSlide(); s.background = { color: PALE };
  s.addShape(p.ShapeType.rect, { x: 0, y: 0, w: 0.28, h: 7.5, fill: { color: CYAN } });
  s.addText(rot, { x: 0.72, y: 0.45, w: 9, h: 0.45, fontFace: F, fontSize: 18,
    bold: true, color: '0C6B92', charSpacing: 2, isTextBox: true });
  sello(s, '6FA2BC');
  if (icon) disco(s, 10.55, 1.25, 2.1, NAVY, icon);
  s.addText(instruccion, { x: 0.72, y: 1.2, w: 9.5, h: 2.2, fontFace: F,
    fontSize: o.fs || 48, bold: true, color: NAVY, valign: 'middle',
    lineSpacing: (o.fs || 48) * 1.18, isTextBox: true });
  if (detalle) s.addText(detalle, { x: 0.72, y: o.dy || 3.6, w: o.dw || 11.4, h: 2.7,
    fontFace: F, fontSize: o.dfs || 30, color: INK,
    lineSpacing: (o.dfs || 30) * 1.5, valign: 'top', isTextBox: true });
  return s;
}
/* ---------- E · pausa ---------- */
function pausa(rot, titulo, minutos, texto, icon) {
  const s = p.addSlide(); s.background = { color: NAVY }; sello(s, '6E8FA3');
  rotulo(s, rot, CYAN);
  disco(s, 10.5, 2.45, 2.2, ORANGE, icon);
  s.addText(titulo, { x: 0.62, y: 1.95, w: 9.4, h: 1.35, fontFace: F, fontSize: 60,
    bold: true, color: WHITE, valign: 'middle', isTextBox: true });
  s.addText(minutos, { x: 0.62, y: 3.45, w: 9.4, h: 0.95, fontFace: F, fontSize: 42,
    bold: true, color: CYAN, valign: 'middle', isTextBox: true });
  if (texto) s.addText(texto, { x: 0.62, y: 4.6, w: 10.5, h: 1.8, fontFace: F,
    fontSize: 28, color: SKY, lineSpacing: 44, isTextBox: true });
  return s;
}
/* ---------- F · regla (naranja, muy pocas palabras) ---------- */
function regla(rot, frase, apoyo, icon) {
  const s = p.addSlide(); s.background = { color: ORANGE };
  s.addText(rot, { x: 0.62, y: 1.35, w: 9, h: 0.5, fontFace: F, fontSize: 20,
    bold: true, color: 'FFE7D8', charSpacing: 3, isTextBox: true });
  s.addText(frase, { x: 0.62, y: 2.0, w: 9.7, h: 2.5, fontFace: F, fontSize: 56,
    bold: true, color: WHITE, valign: 'middle', lineSpacing: 64, isTextBox: true });
  if (apoyo) {
    s.addShape(p.ShapeType.rect, { x: 0.62, y: 4.75, w: 12.1, h: 1.55, fill: { color: WHITE } });
    s.addText(apoyo, { x: 1.05, y: 4.75, w: 11.3, h: 1.55, fontFace: F, fontSize: 28,
      bold: true, color: NAVY, lineSpacing: 40, valign: 'middle', isTextBox: true });
  }
  disco(s, 10.7, 2.15, 1.95, NAVY, icon);
  sello(s, 'FFD2BB');
  return s;
}
/* ---------- G · fila de iconos con palabra ---------- */
function iconos(titulo, items, icon, rot) {
  const s = blanca(titulo, icon, rot);
  const n = items.length, w = 12.1 / n;
  const d = n <= 3 ? 1.75 : n === 4 ? 1.55 : 1.3;
  items.forEach((it, i) => {
    const cx = 0.62 + i * w + w / 2;
    disco(s, cx - d/2, 2.75, d, i % 2 ? CYAN : NAVY, it[1]);
    s.addText(it[0], { x: cx - w/2 + 0.06, y: 2.75 + d + 0.3, w: w - 0.12, h: 0.75,
      align: 'center', fontFace: F, fontSize: n <= 4 ? 32 : 26, bold: true,
      color: NAVY, margin: 0, isTextBox: true });
    if (it[2]) s.addText(it[2], { x: cx - w/2 + 0.06, y: 2.75 + d + 1.05, w: w - 0.12,
      h: 1.4, align: 'center', fontFace: F, fontSize: n <= 4 ? 24 : 21,
      color: INK, lineSpacing: n <= 4 ? 32 : 28, margin: 0, isTextBox: true });
  });
  return s;
}
/* ---------- H · renglon de cuenta ---------- */
function fila(s, y, etiqueta, valor, o = {}) {
  const x = o.x === undefined ? 1.1 : o.x, w = o.w || 7.5, fs = o.fs || 34;
  s.addText(etiqueta, { x, y, w, h: 0.82, fontFace: F, fontSize: fs,
    bold: !!o.bold, color: o.color || NAVY, valign: 'middle', margin: 0, isTextBox: true });
  s.addText(valor, { x: x + w, y, w: 3.6, h: 0.82, align: 'right', fontFace: F,
    fontSize: fs, bold: true, color: o.vcolor || o.color || NAVY,
    valign: 'middle', margin: 0, isTextBox: true });
}
const linea = (s, y, c) => s.addShape(p.ShapeType.rect,
  { x: 1.1, y, w: 11.1, h: 0.04, fill: { color: c || 'B6C6D0' } });

/* ---------- I · caja para anexar la tecnica del grupo ---------- */
const anexo = (s, y, texto) => {
  s.addShape(p.ShapeType.rect, { x: 0.62, y, w: 12.1, h: 0.95, fill: { color: PLACE } });
  s.addShape(p.ShapeType.rect, { x: 0.62, y, w: 0.14, h: 0.95, fill: { color: ORANGE } });
  s.addText('✎   ' + texto, { x: 1.0, y, w: 11.5, h: 0.95, fontFace: F, fontSize: 22,
    bold: true, color: RUST, valign: 'middle', margin: 0, isTextBox: true });
};

/* =====================================================================
   ORDEN Y TEMAS: ficha FM-AO-05, sus 13 momentos, sin alterar.
   ===================================================================== */

/* ===== 1 · PORTADA ===== */
{
  const s = p.addSlide(); s.background = { color: NAVY };
  s.addText('MEDELLÍN',  { x: 4.9, y: 0.30, w: 8, h: 0.95, fontFace: F, fontSize: 58,
    bold: true, color: DEEP, margin: 0, isTextBox: true });
  s.addText('TE QUIERE', { x: 4.9, y: 1.10, w: 8, h: 0.95, fontFace: F, fontSize: 58,
    bold: true, color: DEEP, margin: 0, isTextBox: true });
  s.addShape(p.ShapeType.rect, { x: 0, y: 0, w: 4.35, h: 7.5, fill: { color: DEEP } });
  s.addText('AQUÍ VA UNA FOTO\nDEL GRUPO', { x: 0.4, y: 3.1, w: 3.55, h: 1.3,
    align: 'center', fontFace: F, fontSize: 16, bold: true, color: '7BA7BE', isTextBox: true });
  s.addShape(p.ShapeType.rect, { x: 4.35, y: 2.2, w: 0.62, h: 3.2, fill: { color: ORANGE } });
  s.addShape(p.ShapeType.rect, { x: 4.97, y: 2.2, w: 7.75, h: 3.2, fill: { color: CYAN } });
  s.addText('CLASE 5', { x: 5.4, y: 2.42, w: 7, h: 0.5, fontFace: F, fontSize: 20,
    bold: true, color: NAVY, charSpacing: 3, isTextBox: true });
  s.addText('EL TELÉFONO\nY EL DINERO', { x: 5.4, y: 2.95, w: 7, h: 1.75, fontFace: F,
    fontSize: 44, bold: true, color: WHITE, valign: 'top', isTextBox: true });
  s.addText('Artes y Oficios  ·  Personas Mayores', { x: 5.4, y: 4.75, w: 7, h: 0.5,
    fontFace: F, fontSize: 19, bold: true, color: WHITE, isTextBox: true });
  s.addText('Secretaría de Inclusión Social y Familia  ·  Equipo de Personas Mayores',
    { x: 4.97, y: 6.6, w: 7.75, h: 0.4, align: 'right', fontFace: F, fontSize: 13,
      color: 'BBD3E0', isTextBox: true });
  s.addNotes('Sesión 5 · FM-AO-05. Reemplace el recuadro de la izquierda por una foto del grupo.');
}

/* ===== 2 · RUTA DEL DÍA ===== */
{
  const s = blanca('Lo que vamos a hacer hoy', 'ruta');
  const bloques = [
    ['MAÑANA',  'Nos conocemos',        'Para qué usamos el teléfono', CYAN],
    ['MAÑANA',  'Cómo avisar',          'Y cómo cuidarnos',           NAVY],
    ['MAÑANA',  'Mostrar',             'La foto de mi producto',     NAVY],
    ['MEDIODÍA','Almuerzo',             'Descanso',                   '5A6B77'],
    ['TARDE',   'El dinero',           'Lo que entra y lo que sale', NAVY],
    ['TARDE',   'Cierre',               'Lo que me llevo',            CYAN],
  ];
  bloques.forEach((b, i) => {
    const x = 0.62 + (i % 3) * 4.13, y = 2.35 + Math.floor(i / 3) * 2.3;
    s.addShape(p.ShapeType.rect, { x, y, w: 3.83, h: 2.15, fill: { color: SOFT } });
    s.addShape(p.ShapeType.rect, { x, y, w: 3.83, h: 0.11, fill: { color: b[3] } });
    s.addText(b[0], { x: x + 0.28, y: y + 0.22, w: 3.3, h: 0.4, fontFace: F,
      fontSize: 18, bold: true, color: b[3], charSpacing: 2, margin: 0, isTextBox: true });
    s.addText(b[1], { x: x + 0.28, y: y + 0.66, w: 3.35, h: 0.62, fontFace: F,
      fontSize: 28, bold: true, color: NAVY, margin: 0, isTextBox: true });
    s.addText(b[2], { x: x + 0.28, y: y + 1.32, w: 3.35, h: 0.8, fontFace: F,
      fontSize: 22, color: INK, lineSpacing: 27, margin: 0, isTextBox: true });
  });
  s.addNotes('Léala en voz alta y no profundice. Es solo para que sepan la forma del día.');
}

/* ===== 3 · MOMENTO 1 · BIENVENIDA ===== */
ejercicio('PARA EMPEZAR', '¿Para qué usa usted\nel teléfono?',
  'Vamos anotando en el tablero todo lo que salga.\nTambién vale el cartel, la llamada y el voz a voz.',
  'saludo')
  .addNotes('Momento 1 · 20 min. Empiece usted. Nadie está obligado a hablar. Incluya respuestas no digitales.');

/* ===== 4 · MOMENTO 2 · EXPERIENCIAS ===== */
ejercicio('CONVERSEMOS EN GRUPOS', '¿Cómo se enteró\nla gente?',
  'Piense en algo que usted vendió, prestó o regaló.\n¿Cómo supo la gente que usted lo tenía?',
  'grupo')
  .addNotes('Momento 2 · 40 min. Subgrupos de 4 o 5. Cada grupo trae UNA sola historia a la plenaria.');

/* ===== 5 · DIVISOR TEMA 1 ===== */
divisor('TEMA 1', 'Cómo aviso\nlo que hago', 'La llamada · El WhatsApp · La foto · El cartel', 'celular')
  .addNotes('Momento 3. Bloque de la mañana, con el grupo despierto.');

/* ===== 6 · MOMENTO 3 · LOS MEDIOS ===== */
iconos('Hay muchas formas de avisar', [
  ['La llamada',  'telefono'],
  ['El WhatsApp', 'whatsapp'],
  ['Una foto',    'camara'],
  ['Un cartel',   'megafono'],
  ['El voz a voz','grupo'],
], 'megafono')
  .addNotes('Momento 3 · 50 min. Diga en voz alta que el cartel y el voz a voz también son medios válidos.');

/* ---------- J · cuidado: etiqueta chica, mensaje enorme ---------- */
function cuidado(n, mensaje, apoyo, icon, fs) {
  const s = p.addSlide(); s.background = { color: NAVY }; sello(s, '6E8FA3');
  rotulo(s, 'CUIDADO ' + n + ' DE 4', CYAN);
  disco(s, 10.55, 2.15, 2.2, ORANGE, icon);
  s.addText(mensaje, { x: 0.62, y: 1.55, w: 9.5, h: 2.7, fontFace: F, fontSize: fs || 60,
    bold: true, color: WHITE, valign: 'middle', lineSpacing: (fs || 60) * 1.15,
    isTextBox: true });
  s.addText(apoyo, { x: 0.62, y: 4.55, w: 11.6, h: 2.0, fontFace: F, fontSize: 30,
    color: SKY, lineSpacing: 46, valign: 'top', isTextBox: true });
  return s;
}

/* ===== 7-10 · MOMENTO 3 · LOS CUATRO CUIDADOS ===== */
cuidado(1, 'Nunca dé su clave',
  'Ni por teléfono. Ni por mensaje. A nadie.\nEl banco nunca le pide la clave.', 'escudo')
  .addNotes('Momento 3. Repita esta frase dos veces y deje un silencio. Es la más importante del bloque.');

cuidado(2, 'No abra enlaces\nraros',
  'Si no sabe quién lo mandó, no lo abra.\nSi tiene duda, pregúntele a alguien de confianza.', 'celular', 54);

cuidado(3, 'Pida permiso\nantes de la foto',
  'Antes de tomarle una foto a alguien, pregúntele.\nY antes de publicarla, también.', 'camara', 52);

cuidado(4, 'Si lo apuran,\ndesconfíe',
  'Nadie serio le pide plata de afán.\nConfirme por un número que usted ya conozca.', 'mano', 54);

/* ===== 11 · MOMENTO 4 · REFRIGERIO ===== */
pausa('DESCANSO', 'Refrigerio', '20 minutos', null, 'comida')
  .addNotes('Momento 4 · 20 min. Juego "el mensaje que viaja": una frase pasa de persona en persona y al final se compara con la original.');

/* ===== 12 · MOMENTO 5 · TRES REGLAS DE LA FOTO ===== */
{
  const s = blanca('Así se ve bien', 'camara');
  const tarjeta = (x, n, icon, tit, txt) => {
    s.addShape(p.ShapeType.rect, { x, y: 2.3, w: 3.83, h: 3.9, fill: { color: SOFT } });
    s.addShape(p.ShapeType.rect, { x, y: 2.3, w: 3.83, h: 0.11, fill: { color: CYAN } });
    disco(s, x + 1.24, 2.62, 1.35, CYAN, icon);
    s.addText(n + '.  ' + tit, { x: x + 0.25, y: 4.0, w: 3.33, h: 0.65, align: 'center',
      fontFace: F, fontSize: 28, bold: true, color: NAVY, margin: 0, isTextBox: true });
    s.addText(txt, { x: x + 0.25, y: 4.72, w: 3.33, h: 1.3, align: 'center', fontFace: F,
      fontSize: 23, color: INK, lineSpacing: 31, margin: 0, isTextBox: true });
  };
  tarjeta(0.62, '1', 'sol',    'Con luz',      'Al lado de\nla ventana');
  tarjeta(4.75, '2', 'cuadro', 'Sin desorden', 'Una tela o una\npared limpia');
  tarjeta(8.88, '3', 'zoom',   'De cerquita',  'Que se vea\nbien grande');
  s.addNotes('Momento 5 · 1 hora. Muestre primero un objeto MAL presentado y pregunte al grupo qué le arreglarían.');
}

/* ===== 13 · MOMENTO 5 · EJERCICIO DE LA FOTO ===== */
{
  const s = ejercicio('AHORA USTED', 'Tómele una foto a\nlo que usted hace',
    'Si no tiene teléfono, dibújelo en una hoja.\nLas dos formas valen igual.', 'camara', { fs: 44 });
  anexo(s, 5.85, 'Anexe aquí una foto de una pieza de la técnica del grupo');
  s.addNotes('Nadie está obligado a usar su celular ni a salir en la foto. Puede simularse en papel.');
}

/* ===== 14 · MOMENTO 6 · PAUSA ACTIVA ===== */
pausa('ESTIRAMOS', 'Pausa activa', '10 minutos',
  'Movemos hombros, manos y tobillos.\nSentados o de pie, como cada quien pueda.', 'caminar')
  .addNotes('Momento 6 · 10 min. Despacio. Sin conteos rápidos, sin competencia, nadie obligado a levantarse.');

/* ===== 15 · MOMENTO 7 · EL AVISO ===== */
iconos('Su aviso lleva cuatro cosas', [
  ['El nombre',   'lapiz',  'Cómo se llama\nlo que hace'],
  ['Qué es',      'bolsa',  'Para qué\nsirve'],
  ['Cuánto vale', 'dinero', 'El precio,\nsiempre'],
  ['Cómo pedirlo','casa',   'Dónde lo\nbuscan a usted'],
], 'megafono')
  .addNotes('Momento 7 · 50 min. Sin precio la gente no pregunta: insista en ese punto.');

/* ===== 16 · MOMENTO 7 · UN AVISO ARMADO ===== */
{
  const s = blanca('Un aviso armado se ve así', 'whatsapp');
  s.addShape(p.ShapeType.rect, { x: 0.62, y: 2.3, w: 8.4, h: 3.35, fill: { color: SOFT } });
  s.addShape(p.ShapeType.rect, { x: 0.62, y: 2.3, w: 0.14, h: 3.35, fill: { color: CYAN } });
  s.addText('Velas de cera con olor a limón.\nDuran 6 horas prendidas.\n\n$ 16.500 cada una.\nAquí va mi contacto.',
    { x: 1.1, y: 2.5, w: 7.7, h: 2.95, fontFace: F, fontSize: 30, bold: true,
      color: NAVY, lineSpacing: 42, valign: 'top', isTextBox: true });
  const marca = (y, txt) => {
    s.addShape(p.ShapeType.ellipse, { x: 9.4, y, w: 0.42, h: 0.42, fill: { color: ORANGE } });
    s.addText(txt, { x: 10.0, y: y - 0.08, w: 2.8, h: 0.6, fontFace: F, fontSize: 23,
      bold: true, color: NAVY, valign: 'middle', margin: 0, isTextBox: true });
  };
  marca(2.55, 'El nombre');
  marca(3.35, 'Qué es');
  marca(4.35, 'Cuánto vale');
  marca(5.05, 'Cómo pedirlo');
  s.addText('Nunca escriba su teléfono ni su dirección en la pantalla del salón.',
    { x: 0.62, y: 5.95, w: 12.1, h: 0.6, fontFace: F, fontSize: 24, bold: true,
      color: RUST, isTextBox: true });
  s.addNotes('Cambie la vela por la técnica del grupo. El aviso es imaginario: no se publican datos reales.');
}

/* ===== 17 · MOMENTO 7 · EJERCICIO DEL AVISO ===== */
{
  const s = ejercicio('EN PAREJAS', 'Arme el aviso\nde su producto',
    'Primero el del compañero. Después el suyo.\nSi ninguno escribe, lo dictan y el auxiliar escribe.',
    'lapiz', { fs: 46 });
  anexo(s, 5.85, 'Anexe aquí un aviso de ejemplo con la técnica del grupo');
  s.addNotes('Momento 7. Solo 3 o 4 leen en voz alta, no todos. Nadie escribe datos personales.');
}

/* ===== 18 · MOMENTO 8 · ALMUERZO ===== */
pausa('ALMUERZO', 'Almuerzo', 'Volvemos en 1 hora',
  'Escriba en el tablero la hora exacta de regreso.', 'comida')
  .addNotes('Momento 8 · 1 hora. Deje la diapositiva proyectada durante el almuerzo.');

/* ===== 19 · MOMENTO 9 · NECESIDAD O GUSTO ===== */
ejercicio('DESPUÉS DEL ALMUERZO', '¿Necesidad o gusto?',
  'Mano arriba  →  es necesidad.\nMano abajo  →  es gusto.\nMano plana  →  depende.',
  'mano', { dfs: 32 })
  .addNotes('Momento 9 · 10 min. Ejemplos: el mercado, un vestido nuevo, la droga del mes, una olla para trabajar. No hay respuesta correcta.');

/* ===== 20 · DIVISOR TEMA 2 ===== */
divisor('TEMA 2', 'El dinero de\nmi negocio', 'Lo que entra · Lo que sale · Lo que queda', 'dinero')
  .addNotes('Momento 10. Trabaje siempre con casos imaginarios.');

const anexoLinea = (s, y, texto) => s.addText('✎   ' + texto,
  { x: 0.62, y, w: 11.0, h: 0.45, fontFace: F, fontSize: 22, bold: true,
    color: RUST, valign: 'middle', margin: 0, isTextBox: true });

/* ===== 21 · MOMENTO 10 · LAS CUATRO PALABRAS ===== */
iconos('Cuatro palabras del dinero', [
  ['INGRESO', 'bolsa',  'Lo que le\npagan'],
  ['COSTO',   'fichas', 'Lo que gastó\npara hacerlo'],
  ['GASTO',   'bus',    'Pasajes,\nbolsas'],
  ['AHORRO',  'casa',   'Lo que guarda\npara después'],
], 'calculadora')
  .addNotes('Momento 10 · 1 hora. Diga cada palabra despacio y pida un ejemplo del grupo. NO pida cifras personales de nadie.');

/* ===== 22 · MOMENTO 10 · EJEMPLO: EL COSTO ===== */
{
  const s = blanca('Cuánto cuesta hacer UNA vela', 'foco');
  fila(s, 2.30, 'Cera',              '$  3.000', { fs: 30 });
  fila(s, 3.02, 'Pabilo y esencia',  '$  1.000', { fs: 30 });
  fila(s, 3.74, 'Vaso',              '$  2.000', { fs: 30 });
  linea(s, 4.58);
  fila(s, 4.64, 'Mi tiempo  (1 hora)', '$  5.000', { fs: 30, color: RUST, bold: true });
  s.addShape(p.ShapeType.rect, { x: 1.1, y: 5.48, w: 11.1, h: 0.92, fill: { color: NAVY } });
  fila(s, 5.53, '   ME CUESTA', '$ 11.000   ',
    { x: 1.1, w: 7.5, fs: 32, bold: true, color: WHITE });
  anexoLinea(s, 6.50, 'Cambie la vela por la técnica del grupo y sus precios reales.');
  s.addNotes('Escríbalo en el tablero renglón por renglón, al mismo tiempo. El valor del tiempo es lo que siempre se olvida: insista ahí.');
}

/* ===== 23 · MOMENTO 10 · DEL COSTO AL PRECIO ===== */
{
  const s = blanca('Del costo al precio', 'dinero');
  fila(s, 2.45, 'Me costó hacerla',    '$ 11.000', { fs: 32 });
  fila(s, 3.35, 'Lo que quiero ganar', '$  5.500', { fs: 32, color: RUST });
  linea(s, 4.32, NAVY);
  s.addShape(p.ShapeType.rect, { x: 1.1, y: 4.48, w: 11.1, h: 1.15, fill: { color: CYAN } });
  fila(s, 4.58, '   LA VENDO EN', '$ 16.500   ',
    { x: 1.1, w: 7.5, fs: 36, bold: true, color: NAVY });
  s.addText('Si la vende en $8.000, está pagando por trabajar.',
    { x: 1.1, y: 5.85, w: 11.1, h: 0.7, fontFace: F, fontSize: 28, bold: true,
      color: NAVY, isTextBox: true });
  s.addNotes('Pregunte al grupo cuántos habrían puesto un precio menor a 11.000. Ahí cae la idea sola.');
}

/* ===== 24 · MOMENTO 10 · LA REGLA ===== */
regla('LA REGLA DE ORO', 'Su tiempo\ntambién se cobra.',
  'Si no cuenta las horas que trabajó, el negocio parece que deja plata y en realidad no deja nada.', 'reloj')
  .addNotes('Una sola idea. Léala y deje un silencio de cinco segundos antes de seguir.');

/* ===== 25 · MOMENTO 10 · LA CUENTA DEL MES ===== */
{
  const s = blanca('La cuenta del mes', 'bolsa');
  const caja = (x, rot, txt, color) => {
    s.addShape(p.ShapeType.rect, { x, y: 2.45, w: 3.45, h: 2.85, fill: { color } });
    s.addText(rot, { x: x + 0.28, y: 2.72, w: 2.9, h: 0.95, fontFace: F, fontSize: 30,
      bold: true, color: WHITE, margin: 0, isTextBox: true });
    s.addText(txt, { x: x + 0.28, y: 3.72, w: 2.95, h: 1.35, fontFace: F, fontSize: 23,
      color: WHITE, lineSpacing: 31, margin: 0, isTextBox: true });
  };
  caja(0.62, 'LO QUE\nENTRÓ', 'Todo lo que\nvendí en el mes', CYAN);
  s.addText('−', { x: 4.07, y: 3.35, w: 0.75, h: 0.9, align: 'center', fontFace: F,
    fontSize: 52, bold: true, color: NAVY, isTextBox: true });
  caja(4.82, 'LO QUE\nSALIÓ', 'Materiales,\npasajes, bolsas', '5A6B77');
  s.addText('=', { x: 8.27, y: 3.35, w: 0.75, h: 0.9, align: 'center', fontFace: F,
    fontSize: 52, bold: true, color: NAVY, isTextBox: true });
  caja(9.02, 'LO QUE\nQUEDÓ', 'Lo que de verdad\nme ganó', ORANGE);
  s.addText('Si lo que queda da negativo: suba el precio o baje los gastos.',
    { x: 0.62, y: 5.55, w: 12.1, h: 0.8, fontFace: F, fontSize: 26, bold: true,
      color: NAVY, isTextBox: true });
  s.addNotes('Solo tres cajas. No use las palabras ingresos ni egresos aquí: entró, salió y quedó bastan.');
}

/* ===== 26 · MOMENTO 10 · EJERCICIO DE LA CUENTA ===== */
{
  const s = ejercicio('AHORA USTED', 'Saque la cuenta\nde SU producto', null, 'calculadora', { fs: 44 });
  s.addTable([
    [{ text: ' Mis materiales', options: { bold: true } },
     { text: '$ ', options: { bold: true, align: 'right' } }],
    [' ', ' '],
    [{ text: ' Mi tiempo', options: { bold: true } },
     { text: '$ ', options: { bold: true, align: 'right' } }],
    [{ text: ' ME CUESTA', options: { bold: true, fill: { color: NAVY }, color: WHITE } },
     { text: '$ ', options: { bold: true, align: 'right', fill: { color: NAVY }, color: WHITE } }],
  ], { x: 0.72, y: 3.65, w: 11.9, colW: [8.9, 3.0], rowH: 0.72, fontFace: F,
       fontSize: 26, color: NAVY, fill: { color: WHITE },
       border: { pt: 1, color: '9EBFD0' }, valign: 'middle' });
  s.addNotes('Momento 10 · 40 min. De a dos: quien ya sabe ayuda a quien no. Pasen por las mesas. Es un cálculo de su propio producto, no una cifra personal ni bancaria.');
}

/* ===== 27 · MOMENTO 10 · DECISIÓN RESPONSABLE ===== */
{
  const s = blanca('Antes de comprar, pregúntese', 'bombillo');
  const paso = (y, n, txt) => {
    s.addShape(p.ShapeType.ellipse, { x: 0.9, y, w: 0.95, h: 0.95, fill: { color: ORANGE } });
    s.addText(n, { x: 0.9, y, w: 0.95, h: 0.95, align: 'center', valign: 'middle',
      fontFace: F, fontSize: 36, bold: true, color: WHITE, margin: 0, isTextBox: true });
    s.addText(txt, { x: 2.3, y, w: 10.2, h: 0.95, fontFace: F, fontSize: 34,
      bold: true, color: NAVY, valign: 'middle', margin: 0, isTextBox: true });
  };
  paso(2.5,  '1', '¿De verdad lo necesito?');
  paso(3.85, '2', '¿Puedo esperar un poquito?');
  paso(5.2,  '3', '¿Tengo con qué pagarlo hoy?');
  s.addNotes('Momento 10. Enlaza con el ejercicio de necesidad o gusto de la mañana.');
}

/* ===== 28 · MOMENTO 11 · JUEGO DEL PRESUPUESTO ===== */
{
  const s = ejercicio('JUEGO', 'Repartamos la plata',
    'Cada grupo recibe fichas de dinero y decide\ncuánto va para cada cosa:', 'fichas', { fs: 48, dy: 3.35 });
  const chip = (x, txt) => {
    s.addShape(p.ShapeType.rect, { x, y: 4.95, w: 2.85, h: 1.25, fill: { color: WHITE } });
    s.addShape(p.ShapeType.rect, { x, y: 4.95, w: 2.85, h: 0.12, fill: { color: ORANGE } });
    s.addText(txt, { x: x + 0.15, y: 5.07, w: 2.55, h: 1.1, align: 'center',
      fontFace: F, fontSize: 25, bold: true, color: NAVY, valign: 'middle',
      margin: 0, isTextBox: true });
  };
  chip(0.72,  'Materiales');
  chip(3.77,  'Transporte');
  chip(6.82,  'Empaque');
  chip(9.87,  'Ahorro');
  s.addNotes('Momento 11 · 50 min. Caso imaginario, fichas de papel. Cada grupo explica por qué repartió así. No hay una única respuesta correcta.');
}

/* ===== 29 · MOMENTO 12 · REFRIGERIO ===== */
pausa('DESCANSO', 'Refrigerio', '20 minutos', null, 'comida')
  .addNotes('Momento 12 · 20 min. Actividad breve, adaptada y voluntaria.');

/* ===== 30 · MOMENTO 13 · CIERRE ===== */
ejercicio('PARA CERRAR', '¿Qué se lleva\nde hoy?',
  'Cada quien dice una sola cosa.\nEl que no quiera hablar, pasa.', 'corazon')
  .addNotes('Momento 13 · 30 min. Cierre en autoestima, no en evaluación. Recoja la caja de preguntas anónimas antes de despedir.');

/* ===== 31 · TAREA PARA LA CASA ===== */
{
  const s = oscura('Para la casa', 'libro');
  s.addShape(p.ShapeType.rect, { x: 0.62, y: 2.4, w: 12.1, h: 1.55, fill: { color: DEEP } });
  s.addText('1.  Escoja cómo mostrar lo que usted hace.',
    { x: 1.1, y: 2.4, w: 11.4, h: 1.55, fontFace: F, fontSize: 32, bold: true,
      color: WHITE, valign: 'middle', isTextBox: true });
  s.addShape(p.ShapeType.rect, { x: 0.62, y: 4.15, w: 12.1, h: 1.55, fill: { color: DEEP } });
  s.addText('2.  Piense en un gasto que sí y en uno que puede esperar.',
    { x: 1.1, y: 4.15, w: 11.4, h: 1.55, fontFace: F, fontSize: 30, bold: true,
      color: WHITE, valign: 'middle', isTextBox: true });
  s.addText('Una frase, un dibujo, un cartel o una foto. Como usted quiera.',
    { x: 0.62, y: 5.95, w: 12.1, h: 0.6, fontFace: F, fontSize: 26, color: SKY, isTextBox: true });
  s.addNotes('Trabajo en casa · 2 horas. No debe publicar información personal ni usar dinero real.');
}

/* ===== 32 · LA PRÓXIMA CLASE ===== */
{
  const s = p.addSlide(); s.background = { color: ORANGE };
  s.addText('LA PRÓXIMA CLASE', { x: 0.62, y: 1.4, w: 9, h: 0.55, fontFace: F,
    fontSize: 20, bold: true, color: 'FFE7D8', charSpacing: 3, isTextBox: true });
  s.addText('Ya empezamos\na trabajar', { x: 0.62, y: 2.05, w: 9.7, h: 2.3, fontFace: F,
    fontSize: 56, bold: true, color: WHITE, lineSpacing: 64, isTextBox: true });
  disco(s, 10.7, 2.2, 2.0, NAVY, 'check');
  s.addShape(p.ShapeType.rect, { x: 0.62, y: 4.75, w: 12.1, h: 1.4, fill: { color: WHITE } });
  s.addText('Día: __________    Hora: __________    Lugar: __________',
    { x: 1.0, y: 4.75, w: 11.4, h: 1.4, fontFace: F, fontSize: 28, bold: true,
      color: NAVY, valign: 'middle', isTextBox: true });
  sello(s, 'FFD2BB');
  s.addNotes('Sesión 6: primera práctica. Deje escritos día, hora y lugar también en el tablero.');
}

p.writeFile({ fileName: '/home/user/Alquimia/docs/proyectos/personas-mayores/PPT_Sesion_5_COMBINADA.pptx' })
 .then(f => console.log('creado:', f));
