const pptxgen = require('pptxgenjs');
const fs = require('fs');
const p = new pptxgen();
p.layout = 'LAYOUT_WIDE';
p.author = 'Equipo de Personas Mayores';
p.title  = 'Sesion 5 - Usamos la tecnologia y el dinero con proposito';

const NAVY='0E3A54', CYAN='00A9E0', ORANGE='F26522', WHITE='FFFFFF',
      LIGHT='EEF3F6', GREY='5A6B77', PLACE='FDEBE1';
const F = 'Arial';
const ic = n => 'image/png;base64,' + fs.readFileSync(`icons/${n}.png`).toString('base64');

const sello = (s,c) => s.addText('Secretaría de Inclusión Social y Familia',
  { x: 7.8, y: 6.85, w: 4.9, h: 0.3, align: 'right', fontFace: F,
    fontSize: 10, color: c || 'A9B7C0', isTextBox: true });

function disco(s, x, y, d, fill, icon) {
  s.addShape(p.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: fill } });
  const q = d * 0.27;
  s.addImage({ data: ic(icon), x: x + q, y: y + q, w: d - 2*q, h: d - 2*q });
}
const rotulo = (s, txt, color) => s.addText(txt, { x: 0.7, y: 0.45, w: 9, h: 0.4,
  fontFace: F, fontSize: 15, bold: true, color: color || ORANGE,
  charSpacing: 2, isTextBox: true });

// A · una frase enorme + icono grande al lado
function frase(rot, texto, apoyo, icon, o = {}) {
  const s = p.addSlide();
  const dark = !!o.dark;
  s.background = { color: dark ? NAVY : WHITE };
  rotulo(s, rot, dark ? CYAN : ORANGE); sello(s, dark ? '6E8FA3' : 'A9B7C0');
  disco(s, 10.35, 2.35, 2.3, dark ? ORANGE : CYAN, icon);
  s.addText(texto, { x: 0.7, y: 1.45, w: 9.3, h: 2.9, fontFace: F,
    fontSize: o.fs || 50, bold: true, color: dark ? WHITE : NAVY,
    valign: 'middle', lineSpacing: (o.fs || 50) * 1.15, isTextBox: true });
  if (apoyo) s.addText(apoyo, { x: 0.7, y: 4.6, w: 9.3, h: 1.9, fontFace: F,
    fontSize: 28, color: dark ? '9FC7DC' : GREY, lineSpacing: 42,
    valign: 'top', isTextBox: true });
  return s;
}
// B · fila de iconos con una palabra cada uno
function iconos(rot, titulo, items, o = {}) {
  const s = p.addSlide();
  const dark = !!o.dark;
  s.background = { color: dark ? NAVY : WHITE };
  rotulo(s, rot, dark ? CYAN : ORANGE); sello(s, dark ? '6E8FA3' : 'A9B7C0');
  s.addText(titulo, { x: 0.7, y: 1.15, w: 12, h: 1.15, fontFace: F, fontSize: 46,
    bold: true, color: dark ? WHITE : NAVY, valign: 'middle', isTextBox: true });
  const n = items.length;
  const w = 12.0 / n, d = n <= 4 ? 1.65 : 1.35;
  items.forEach((it, i) => {
    const cx = 0.65 + i * w + w / 2;
    disco(s, cx - d/2, 2.85, d, i % 2 ? CYAN : NAVY, it[1]);
    s.addText(it[0], { x: cx - w/2 + 0.1, y: 2.85 + d + 0.28, w: w - 0.2, h: 0.75,
      align: 'center', fontFace: F, fontSize: n <= 4 ? 30 : 25, bold: true,
      color: dark ? WHITE : NAVY, margin: 0, isTextBox: true });
    if (it[2]) s.addText(it[2], { x: cx - w/2 + 0.1, y: 2.85 + d + 1.02, w: w - 0.2,
      h: 1.1, align: 'center', fontFace: F, fontSize: n <= 4 ? 22 : 19,
      color: dark ? '9FC7DC' : GREY, lineSpacing: n <= 4 ? 30 : 26,
      margin: 0, isTextBox: true });
  });
  return s;
}
// C · ejercicio, fondo cian
function ejercicio(rot, instruccion, apoyo, icon) {
  const s = p.addSlide(); s.background = { color: CYAN };
  s.addText(rot, { x: 0.7, y: 0.45, w: 9, h: 0.4, fontFace: F, fontSize: 15,
    bold: true, color: NAVY, charSpacing: 2, isTextBox: true });
  sello(s, '9BD9F2');
  disco(s, 10.35, 2.35, 2.3, NAVY, icon);
  s.addText(instruccion, { x: 0.7, y: 1.45, w: 9.3, h: 2.9, fontFace: F,
    fontSize: 50, bold: true, color: WHITE, valign: 'middle',
    lineSpacing: 58, isTextBox: true });
  if (apoyo) s.addText(apoyo, { x: 0.7, y: 4.6, w: 9.3, h: 1.9, fontFace: F,
    fontSize: 28, color: 'E8F6FD', lineSpacing: 42, valign: 'top', isTextBox: true });
  return s;
}
// D · pausa, fondo navy, hora enorme
function pausa(rot, titulo, minutos, icon) {
  const s = p.addSlide(); s.background = { color: NAVY };
  rotulo(s, rot, CYAN); sello(s, '6E8FA3');
  disco(s, 10.35, 2.6, 2.3, ORANGE, icon);
  s.addText(titulo, { x: 0.7, y: 2.1, w: 9.3, h: 1.4, fontFace: F, fontSize: 58,
    bold: true, color: WHITE, valign: 'middle', isTextBox: true });
  s.addText(minutos, { x: 0.7, y: 3.75, w: 9.3, h: 1.0, fontFace: F, fontSize: 40,
    color: CYAN, valign: 'middle', isTextBox: true });
  return s;
}
// caja para anexar despues la tecnica del grupo
const anexo = (s, y, texto) => {
  s.addShape(p.ShapeType.rect, { x: 0.7, y, w: 9.3, h: 0.95, fill: { color: PLACE } });
  s.addText('✎  ' + texto, { x: 1.0, y, w: 8.7, h: 0.95, fontFace: F, fontSize: 20,
    bold: true, color: 'A8420F', valign: 'middle', margin: 0, isTextBox: true });
};

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
  s.addShape(p.ShapeType.rect, { x: 4.35, y: 2.3, w: 0.62, h: 3.0, fill: { color: ORANGE } });
  s.addShape(p.ShapeType.rect, { x: 4.97, y: 2.3, w: 7.75, h: 3.0, fill: { color: CYAN } });
  s.addText('CLASE 5', { x: 5.4, y: 2.5, w: 7, h: 0.5, fontFace: F, fontSize: 18,
    bold: true, color: 'D6F1FD', charSpacing: 3, isTextBox: true });
  s.addText('EL TELÉFONO\nY EL DINERO', { x: 5.4, y: 3.0, w: 7, h: 1.7, fontFace: F,
    fontSize: 40, bold: true, color: WHITE, valign: 'top', isTextBox: true });
  s.addText('Artes y Oficios  ·  Personas Mayores', { x: 5.4, y: 4.72, w: 7, h: 0.45,
    fontFace: F, fontSize: 17, color: 'E8F6FD', isTextBox: true });
  s.addText('Secretaría de Inclusión Social y Familia  ·  Equipo de Personas Mayores',
    { x: 4.97, y: 6.6, w: 7.75, h: 0.4, align: 'right', fontFace: F, fontSize: 12,
      color: 'BBD3E0', isTextBox: true });
  s.addNotes('Sesión 5 · FM-AO-05. Título dicho en palabras del grupo. Reemplace el recuadro por una foto.');
}

/* ===== 2 · QUÉ VAMOS A HACER ===== */
iconos('HOY', 'Hoy vamos a ver dos cosas', [
  ['El teléfono', 'celular', 'Cómo mostrar\nlo que usted hace'],
  ['El dinero', 'dinero', 'Cuánto entra\ny cuánto se guarda'],
]).addNotes('Momento 1. Dígalo en dos frases. No lea el objetivo del documento.');

/* ===== 3 · M1 BIENVENIDA ===== */
ejercicio('PARA EMPEZAR', '¿Para qué usa usted\nel teléfono?',
  'Vamos anotando todo lo que salga.\nTambién vale el cartel, la llamada y el voz a voz.', 'saludo')
  .addNotes('Momento 1 · 20 min. Juego "¿Para qué uso la tecnología?". Incluya opciones no digitales.');

/* ===== 4 · M2 EXPERIENCIAS ===== */
ejercicio('CONVERSEMOS EN GRUPOS', '¿Cómo se enteró\nla gente?',
  'Piense en algo que usted vendió, prestó o regaló.\n¿Cómo supo la gente que usted lo tenía?', 'grupo')
  .addNotes('Momento 2 · 40 min. Subgrupos. Cada grupo trae una sola historia a la plenaria.');

/* ===== 5 · M3 LOS MEDIOS ===== */
iconos('AVISAR', 'Hay muchas formas de avisar', [
  ['La llamada', 'telefono'],
  ['El WhatsApp', 'whatsapp'],
  ['Una foto', 'camara'],
  ['Un cartel', 'megafono'],
  ['El voz a voz', 'grupo'],
]).addNotes('Momento 3 · 50 min. El cartel y el voz a voz también son medios válidos: dígalo en voz alta.');

/* ===== 6-9 · M3 LOS CUIDADOS ===== */
frase('CUIDADO 1', 'Nunca dé su clave',
  'Ni por teléfono. Ni por mensaje. A nadie.\nEl banco nunca le pide la clave.', 'escudo', { dark: true });

frase('CUIDADO 2', 'No abra enlaces\nraros',
  'Si no sabe quién lo mandó, no lo abra.\nSi tiene duda, pregúntele a alguien de confianza.', 'celular', { dark: true, fs: 46 });

frase('CUIDADO 3', 'Pida permiso\nantes de la foto',
  'Antes de tomarle una foto a alguien, pregúntele.\nY antes de publicarla, también.', 'camara', { dark: true, fs: 46 });

frase('CUIDADO 4', 'Si lo apuran,\ndesconfíe',
  'Nadie serio le pide plata de afán.\nTómese su tiempo y confirme por un número que usted ya conozca.',
  'mano', { dark: true, fs: 46 });

/* ===== 10 · M4 PAUSA ===== */
pausa('DESCANSO', 'Refrigerio', '20 minutos', 'comida')
  .addNotes('Momento 4 · 20 min. Juego "Mensaje que viaja": una frase pasa de persona en persona y al final se compara con la original.');

/* ===== 11 · M5 ASÍ SE VE BIEN ===== */
iconos('MOSTRAR LO QUE HACE', 'Así se ve bien', [
  ['Con luz', 'sol', 'Al lado de\nla ventana'],
  ['Sin desorden', 'cuadro', 'Una tela o\nuna pared limpia'],
  ['De cerquita', 'zoom', 'Que se vea\nbien grande'],
]).addNotes('Momento 5 · 1 hora. Muestre primero un objeto MAL presentado y pregunte qué le arreglarían.');

/* ===== 12 · M5 EJERCICIO ===== */
{
  const s = ejercicio('AHORA USTED', 'Tómele una foto\na lo que usted hace',
    'Si no tiene teléfono, dibújelo en una hoja.\nLas dos formas valen igual.', 'camara');
  anexo(s, 6.15, 'Anexe aquí una foto de una pieza de la técnica del grupo');
  s.addNotes('Puede simularse en papel. Nadie está obligado a usar su celular ni a salir en la foto.');
}

/* ===== 13 · M6 PAUSA ACTIVA ===== */
pausa('ESTIRAMOS', 'Pausa activa', '10 minutos', 'caminar')
  .addNotes('Momento 6 · 10 min. Descanso visual y movilidad suave de manos, cuello y hombros. Sentados o de pie.');

/* ===== 14 · M7 EL MENSAJE ===== */
iconos('EL AVISO', 'Su aviso lleva cuatro cosas', [
  ['El nombre', 'lapiz', 'Cómo se llama\nlo que hace'],
  ['Qué es', 'bolsa', 'Para qué\nsirve'],
  ['Cuánto vale', 'dinero', 'El precio,\nsiempre'],
  ['Cómo lo piden', 'casa', 'Dónde lo\nbuscan a usted'],
]).addNotes('Momento 7 · 50 min. Sin publicar datos reales: se escribe "aquí va mi contacto".');

/* ===== 15 · M7 EJERCICIO ===== */
{
  const s = ejercicio('EN PAREJAS', 'Arme el aviso\nde su producto',
    'Primero el del compañero. Después el suyo.', 'lapiz');
  anexo(s, 5.55, 'Anexe aquí un aviso de ejemplo con la técnica del grupo');
  s.addText('No escriba su teléfono ni su dirección. Escriba: «aquí va mi contacto».',
    { x: 0.7, y: 6.55, w: 9.3, h: 0.5, fontFace: F, fontSize: 22, bold: true,
      color: WHITE, isTextBox: true });
  s.addNotes('Si en una pareja ninguno escribe, lo dictan y el auxiliar escribe. Solo 3 o 4 leen en voz alta.');
}

/* ===== 16 · M8 ALMUERZO ===== */
pausa('ALMUERZO', 'Almuerzo', 'Volvemos en 1 hora', 'comida')
  .addNotes('Momento 8 · 1 hora. Escriba la hora exacta de regreso en el tablero.');

/* ===== 17 · M9 NECESIDAD O GUSTO ===== */
ejercicio('DESPUÉS DEL ALMUERZO', '¿Necesidad o gusto?',
  'Mano arriba si es necesidad.\nMano abajo si es gusto.\nMano plana si depende.', 'mano')
  .addNotes('Momento 9 · 10 min. Ejemplos: el mercado, un vestido nuevo, la droga del mes, una olla para trabajar. No hay respuesta correcta.');

/* ===== 18 · M10 LAS CUATRO PALABRAS ===== */
iconos('EL DINERO', 'Cuatro palabras del dinero', [
  ['INGRESO', 'bolsa', 'Lo que le\npagan'],
  ['COSTO', 'fichas', 'Lo que gastó\npara hacerlo'],
  ['GASTO', 'bus', 'Pasajes,\nbolsas'],
  ['AHORRO', 'casa', 'Lo que guarda\npara después'],
]).addNotes('Momento 10 · 1 hora. Explique con ejemplos de una iniciativa. NO solicite cifras personales de nadie.');

/* ===== 19 · M10 LA RESTA ===== */
{
  const s = frase('LA CUENTA', 'Lo que entra\nmenos lo que sale',
    'Eso es lo que de verdad le queda.', 'calculadora', { fs: 46 });
  anexo(s, 6.15, 'Anexe aquí un ejemplo con precios de la técnica del grupo');
  s.addNotes('Trabaje con casos imaginarios. No pida claves, saldos, deudas ni información bancaria.');
}

/* ===== 20 · M10 DECISIÓN RESPONSABLE ===== */
frase('ANTES DE COMPRAR', 'Pregúntese tres\ncosas',
  '¿De verdad lo necesito?\n¿Puedo esperar un poquito?\n¿Tengo con qué pagarlo hoy?', 'bombillo', { fs: 46 });

/* ===== 21 · M11 JUEGO DEL PRESUPUESTO ===== */
ejercicio('JUEGO', 'Repartamos la plata',
  'Cada grupo recibe fichas de dinero.\nDecidan cuánto va para materiales, transporte,\nempaque y cuánto se guarda.', 'fichas')
  .addNotes('Momento 11 · 50 min. Con fichas y un caso imaginario. Prioricen materiales, transporte, empaque, ahorro y otros gastos.');

/* ===== 22 · M12 PAUSA ===== */
pausa('DESCANSO', 'Refrigerio', '20 minutos', 'comida')
  .addNotes('Momento 12 · 20 min. Actividad breve, adaptada y voluntaria.');

/* ===== 23 · M13 CIERRE ===== */
ejercicio('PARA CERRAR', '¿Qué se lleva\nde hoy?',
  'Cada quien dice una sola cosa.\nEl que no quiera hablar, pasa.', 'corazon')
  .addNotes('Momento 13 · 30 min. Integre los seis ejes teóricos. Termine en autoestima, no en evaluación.');

/* ===== 24 · TAREA ===== */
{
  const s = frase('PARA LA CASA', 'Escoja cómo mostrar\nlo que usted hace',
    'Una frase, un dibujo, un cartel o una foto.\nY piense en un gasto que sí y en uno que puede esperar.',
    'libro', { dark: true, fs: 44 });
  s.addNotes('Trabajo en casa · 2 horas. No debe publicar información ni usar dinero real.');
}

/* ===== 25 · PRÓXIMA CLASE ===== */
{
  const s = p.addSlide(); s.background = { color: ORANGE };
  s.addText('LA PRÓXIMA CLASE', { x: 0.7, y: 1.5, w: 9, h: 0.5, fontFace: F,
    fontSize: 17, bold: true, color: 'FFE0CE', charSpacing: 3, isTextBox: true });
  s.addText('Ya empezamos\na trabajar', { x: 0.7, y: 2.1, w: 9.6, h: 2.2, fontFace: F,
    fontSize: 52, bold: true, color: WHITE, isTextBox: true });
  disco(s, 10.35, 2.35, 2.1, NAVY, 'check');
  s.addShape(p.ShapeType.rect, { x: 0.7, y: 4.7, w: 12.0, h: 1.35, fill: { color: WHITE } });
  s.addText('Día: ____________     Hora: ____________     Lugar: ____________',
    { x: 1.1, y: 4.7, w: 11.2, h: 1.35, fontFace: F, fontSize: 26, bold: true,
      color: NAVY, valign: 'middle', isTextBox: true });
  s.addText('Secretaría de Inclusión Social y Familia', { x: 7.8, y: 6.85, w: 4.9, h: 0.3,
    align: 'right', fontFace: F, fontSize: 10, color: 'FFD9C6', isTextBox: true });
  s.addNotes('Sesión 6: primera práctica. Deje escritos día, hora y lugar en el tablero.');
}

p.writeFile({ fileName: '/home/user/Alquimia/docs/proyectos/personas-mayores/PPT_Sesion_5_Tecnologia_y_Dinero.pptx' })
 .then(f => console.log('creado:', f));
