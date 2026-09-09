const L = require('./fmlib.js');
const D = require('docx');
const { Document, Packer, Paragraph, TableRow, PageOrientation, Header, Footer,
        AlignmentType, PageNumber, TextRun } = D;
const fs = require('fs');
const U = L.USABLE;

const kids = [];
const push = (...x) => kids.push(...x);

// ============ ENCABEZADO ============
push(L.table([2100, 9456, 2700], [
  new TableRow({ children: [
    L.txtCell(2100, 'FM-AO-05', { bold: true, color: L.W, fill: L.BAR, size: 20 }),
    L.txtCell(9456, 'SESIÓN 5 · USAMOS LA TECNOLOGÍA Y EL DINERO CON PROPÓSITO',
      { bold: true, color: L.W, fill: L.BAR, size: 20 }),
    L.txtCell(2700, '8 h presenciales + 2 h en casa', { color: L.W, fill: L.BAR, size: 17 }),
  ]}),
  new TableRow({ children: [
    L.txtCell(2100, 'Guía para el equipo facilitador', { fill: L.HEAD, size: 16, color: L.BLUE }),
    L.txtCell(9456, 'Versión reorganizada · desarrollo detallado de cada momento',
      { fill: L.HEAD, size: 16, color: L.BLUE }),
    L.txtCell(2700, 'Ficha de orientación', { fill: L.HEAD, size: 16, color: L.BLUE }),
  ]}),
]), L.spacer(100));

// ============ COMO USAR / OBJETIVO ============
push(L.table([2100, 12156], [
  new TableRow({ children: [
    L.txtCell(2100, 'Cómo usar esta ficha', { bold: true, color: L.BLUE, fill: L.HEAD }),
    L.txtCell(12156, 'Es una guía común para orientar la jornada, no un informe. No se diligencia. Esta es la quinta y última sesión teórica y será orientada por el profesional misional asignado. Las actividades no dependen de que cada persona tenga celular, internet, cuenta bancaria o información financiera para compartir.'),
  ]}),
  new TableRow({ children: [
    L.txtCell(2100, 'Objetivo', { bold: true, color: L.BLUE, fill: L.HEAD }),
    L.txtCell(12156, 'Reconocer usos accesibles y seguros de medios tecnológicos para comunicar una iniciativa y comprender principios básicos de ingresos, gastos, ahorro y decisiones responsables.'),
  ]}),
  new TableRow({ children: [
    L.txtCell(2100, 'Al finalizar', { bold: true, color: L.BLUE, fill: L.HEAD }),
    L.txtCell(12156, 'Cada participante habrá identificado una forma posible de mostrar o comunicar una oferta y una decisión sencilla para organizar mejor los recursos de una iniciativa.', { fill: L.ZEBRA }),
  ]}),
  new TableRow({ children: [
    L.txtCell(2100, 'Qué cambia en esta versión', { bold: true, color: L.BLUE, fill: L.HEAD }),
    L.cell(12156, L.vinetas([
      'Los trece momentos y sus tiempos son los mismos. Cambia el orden en que se desarrollan.',
      'El bloque de dinero pasa a la mañana, cuando el grupo tiene la atención más alta, y el juego del presupuesto queda inmediatamente después para aplicarlo.',
      'Las experiencias cotidianas quedan antes de la explicación de tecnología: primero se recoge lo que el grupo ya sabe y después se le pone nombre.',
      'Después del almuerzo no se introduce ningún concepto nuevo: quedan el trabajo en parejas y la práctica con objetos.',
      'Se agrega el desarrollo detallado de cada momento y los casos, tarjetas y mensajes para los ejercicios.',
    ])),
  ]}),
]), L.spacer(140));

// ============ RUTA ============
push(new Paragraph({ children: [ new D.PageBreak() ] }));
push(L.bar('RUTA DE LA JORNADA · 8 HORAS, INCLUIDOS TODOS LOS MOMENTOS'), L.spacer(0));

const RUTA = [
  ['1',  'Bienvenida y activación',      '8:00 – 8:20',   '20 min', 'Presente el propósito del día y realice ¿Para qué uso la tecnología?, recogiendo medios con y sin aparato.'],
  ['2',  'Ingresos, gastos y ahorro',    '8:20 – 9:20',   '1 h',    'Con el caso de doña Rosa, clasifique en el tablero qué es ingreso, costo, gasto y ahorro. No solicite cifras personales.'],
  ['3',  'Juego del presupuesto',        '9:20 – 10:10',  '50 min', 'Con fichas de dinero y el mismo caso, los subgrupos deciden en qué se usan $200.000 y enfrentan un imprevisto.'],
  ['4',  'Pausa lúdica y refrigerio',    '10:10 – 10:30', '20 min', 'Refrigerio y actividad voluntaria compatible con comer y conversar.'],
  ['5',  'Experiencias cotidianas',      '10:30 – 11:10', '40 min', 'En subgrupos conversan cómo se enteró la gente de algo que vendieron. Se anotan los medios que aparecen.'],
  ['6',  'Pausa activa',                 '11:10 – 11:20', '10 min', 'Descanso visual y movilidad suave de manos, cuello y hombros.'],
  ['7',  'Tecnología accesible y segura','11:20 – 12:10', '50 min', 'Sobre los medios ya anotados, explique usos y cuidados. Ejercicio ¿Le abro o no le abro? con cinco mensajes.'],
  ['8',  'Almuerzo',                     '12:10 – 13:10', '1 h',    'Almuerzo y descanso. Deje escrita la hora de regreso.'],
  ['9',  'Reactivación',                 '13:10 – 13:20', '10 min', 'Necesidad o gusto: cada persona responde con un gesto ante ejemplos cotidianos.'],
  ['10', 'Mensaje sencillo',             '13:20 – 14:10', '50 min', 'En parejas construyen un mensaje con qué es, para quién sirve, cuánto vale y cómo lo piden. Sin datos reales.'],
  ['11', 'Mostrar una oferta',           '14:10 – 15:10', '1 h',    'Por estaciones, preparan la escena, toman la foto o la dibujan y le escriben la frase debajo.'],
  ['12', 'Pausa lúdica y refrigerio',    '15:10 – 15:30', '20 min', 'Refrigerio y actividad breve, adaptada y voluntaria.'],
  ['13', 'Cierre',                       '15:30 – 16:00', '30 min', 'Integre los seis ejes teóricos, ronda de cierre y transición a la primera práctica en la sesión 6.'],
];
const WR = [560, 2900, 1700, 1100, 7996];
push(L.table(WR, [
  new TableRow({ tableHeader: true, children: [
    L.txtCell(WR[0], '#',        { bold: true, color: L.BLUE, fill: L.HEAD }),
    L.txtCell(WR[1], 'Momento',  { bold: true, color: L.BLUE, fill: L.HEAD }),
    L.txtCell(WR[2], 'Hora',     { bold: true, color: L.BLUE, fill: L.HEAD }),
    L.txtCell(WR[3], 'Tiempo',   { bold: true, color: L.BLUE, fill: L.HEAD }),
    L.txtCell(WR[4], 'Qué hacer',{ bold: true, color: L.BLUE, fill: L.HEAD }),
  ]}),
  ...RUTA.map((r, i) => {
    const log = ['4','6','8','12'].includes(r[0]);
    const f = log ? L.SOFT : (i % 2 ? L.ZEBRA : undefined);
    return new TableRow({ children: [
      L.txtCell(WR[0], r[0], { bold: true, color: L.BLUE, fill: f }),
      L.txtCell(WR[1], r[1], { bold: true, fill: f }),
      L.txtCell(WR[2], r[2], { fill: f, color: L.BLUE }),
      L.txtCell(WR[3], r[3], { fill: f }),
      L.txtCell(WR[4], r[4], { fill: f, size: 17 }),
    ]});
  }),
]), L.spacer(100));
push(L.warn('Las horas son de referencia y suman 8 horas exactas. Si la jornada empieza a otra hora, corra todos los momentos por igual y conserve el orden: el almuerzo debe quedar después del momento 7 y ningún concepto nuevo debe caer en la hora siguiente al almuerzo.'));

push(new Paragraph({ children: [ new D.PageBreak() ] }));

// ============ DESARROLLO DETALLADO ============
push(L.bar('DESARROLLO DETALLADO DE CADA MOMENTO'), L.spacer(0));

const WD = [2500, 6400, 5356];
function momento(num, titulo, hora, tiempo, proposito, listaPasos, materiales, observar) {
  const filas = [
    new TableRow({ children: [
      L.txtCell(WD[0] + WD[1] + WD[2],
        num + '.  ' + titulo.toUpperCase() + '   ·   ' + hora + '   ·   ' + tiempo,
        { bold: true, color: L.W, fill: L.BAR, size: 18, span: 3 }),
    ]}),
    new TableRow({ children: [
      L.txtCell(WD[0], 'Para qué es', { bold: true, color: L.BLUE, fill: L.HEAD }),
      L.cell(WD[1] + WD[2], L.cellP([L.t(proposito)], { after: 0 }), { span: 2 }),
    ]}),
    new TableRow({ children: [
      L.txtCell(WD[0], 'Cómo se hace', { bold: true, color: L.BLUE, fill: L.HEAD }),
      L.cell(WD[1] + WD[2], L.pasos(listaPasos), { span: 2 }),
    ]}),
    new TableRow({ children: [
      L.txtCell(WD[0], 'Qué se necesita', { bold: true, color: L.BLUE, fill: L.HEAD }),
      L.txtCell(WD[1], materiales, { fill: L.ZEBRA, size: 17 }),
      L.txtCell(WD[2], observar, { fill: L.WARN, size: 17 }),
    ]}),
  ];
  return [ L.tableNS(WD, filas), L.spacer(110) ];
}

push(...momento('1', 'Bienvenida y activación', '8:00 – 8:20', '20 min',
  'Que todas las personas hablen una vez en los primeros veinte minutos y que el tema del día salga de su propia experiencia.',
  [ 'Salude y diga en dos frases qué se va a hacer hoy. No lea el objetivo del documento en voz alta.',
    'Aclare de entrada: hoy nadie necesita traer celular, ni contar cuánto gana, ni mostrar sus cuentas. Esto baja la tensión del grupo.',
    'Pregunte al grupo: ¿por dónde se entera usted de las cosas, y por dónde avisa cuando quiere avisar algo?',
    'Anote las respuestas en el tablero en dos columnas, pero sin ponerles título todavía.',
    'Cuando haya ocho o diez respuestas, rotule las columnas: con aparato y sin aparato. Señale que las dos sirven para dar a conocer una iniciativa.',
    'Cierre: hoy vemos dos cosas, el dinero de la iniciativa en la mañana y cómo mostrarla en la tarde.' ],
  'Tablero o papel kraft y marcadores gruesos.',
  'Anote quién no habló. Búsquelo en el momento 5, que es en subgrupo pequeño y cuesta menos.'));

push(...momento('2', 'Ingresos, gastos y ahorro', '8:20 – 9:20', '1 h',
  'Distinguir cuatro palabras aplicadas a una iniciativa concreta, no en abstracto. Va aquí porque es el bloque más denso del día y el grupo está en su mejor momento de atención.',
  [ 'Lea en voz alta el caso de doña Rosa (está al final de esta ficha, en Casos y materiales). Léalo dos veces, despacio.',
    'Dibuje en el tablero cuatro columnas y escriba encima: INGRESO · COSTO · GASTO · AHORRO. No las defina todavía.',
    'Vuelva a leer el caso renglón por renglón. En cada renglón pregunte al grupo: ¿esto en cuál columna va? El grupo decide, usted solo escribe.',
    'Si hay desacuerdo, no lo resuelva de una: pregunte por qué cada quien lo pondría ahí. La discusión es la parte que enseña.',
    'Cuando las cuatro columnas tengan contenido, ahora sí lea la definición de cada palabra usando la tabla Uso racional de los recursos de esta ficha.',
    'Escriba grande la resta: lo que entra, menos lo que cuesta, menos lo que se gasta, es lo que queda.',
    'Verifique con la pregunta: ¿cómo le explicaría usted esto a un nieto? Nunca pregunte ¿entendieron?, porque siempre responden que sí.' ],
  'Tablero, marcadores y el caso de doña Rosa impreso en letra grande para repartir.',
  'No pida cifras personales de nadie, ni saldos, ni deudas. Todo el ejercicio se hace sobre el caso imaginario.'));

push(...momento('3', 'Juego del presupuesto', '9:20 – 10:10', '50 min',
  'Aplicar de inmediato las cuatro palabras del momento anterior, tomando decisiones reales con dinero de mentira.',
  [ 'Forme subgrupos de cuatro o cinco personas. Entregue a cada subgrupo veinte fichas y diga que cada ficha vale diez mil pesos: en total tienen doscientos mil.',
    'Explique la situación: a doña Rosa le quedaron doscientos mil de las ventas del mes y tiene que decidir en qué los usa.',
    'Ponga sobre cada mesa las seis tarjetas de destino con su precio en fichas (están al final de esta ficha).',
    'Deje quince minutos para que repartan. Pase por las mesas pero no opine ni corrija.',
    'A los quince minutos anuncie en voz alta el imprevisto: se dañó la olla de la cera y arreglarla cuesta tres fichas. Todos tienen que pagarlo.',
    'Los subgrupos que no guardaron nada van a tener que quitar fichas de otro lado. No lo señale: deje que ellos lo descubran.',
    'Cada subgrupo cuenta qué decidió y por qué. No corrija ninguna decisión; solo pregunte: ¿qué harían distinto si volvieran a empezar?',
    'Cierre nombrando lo que pasó: para eso sirve guardar una parte, para cuando aparece lo que uno no tenía previsto.' ],
  'Veinte fichas por subgrupo, un juego de seis tarjetas de destino por mesa y la hoja del caso.',
  'La tarjeta del vestido nuevo es la tentación del juego y es a propósito. No advierta sobre ella ni la desaconseje.'));

push(...momento('4', 'Pausa lúdica y refrigerio', '10:10 – 10:30', '20 min',
  'Descanso real. No es tiempo de contenido.',
  [ 'Entregue el refrigerio y diligencie el formato de entrega de beneficios mientras las personas están sentadas.',
    'Si el grupo quiere, proponga Mensaje que viaja, que se puede hacer sentados y comiendo.',
    'No dé instrucciones de contenido ni adelante el siguiente bloque durante la pausa.' ],
  'Refrigerios y formato de entrega de beneficios.',
  'Deje disponible un rincón con agua o café al que se pueda ir sin pedir permiso durante toda la jornada.'));

push(...momento('5', 'Experiencias cotidianas', '10:30 – 11:10', '40 min',
  'Sacar de la experiencia del grupo los medios que después usted va a nombrar. Va antes de la explicación a propósito: primero pasa la experiencia y después se le pone el nombre.',
  [ 'Forme subgrupos de cuatro. Entregue a cada uno una tarjeta con una sola pregunta escrita en letra grande: ¿cómo se enteró la gente de algo que usted vendió, prestó o regaló?',
    'Deje quince minutos de conversación. Pase por las mesas y escuche, pero no dirija la conversación.',
    'Pida que cada subgrupo traiga una sola historia a la plenaria, no todas. Así alcanza el tiempo y nadie se siente examinado.',
    'Mientras cuentan, usted anota en el tablero solamente el medio que aparece en cada historia: la vecina avisó, el cartel en la tienda, la llamada, la foto por WhatsApp, el aviso en la misa.',
    'Cuando estén todos anotados, léalos en voz alta y diga: todos estos son medios para dar a conocer algo, y todos son válidos.',
    'Cierre anunciando el puente: ahora vamos a ver cómo usarlos bien y qué cuidados hay que tener.' ],
  'Tarjetas con la pregunta impresa en letra grande, tablero y marcadores.',
  'Si nadie menciona medios digitales, no los fuerce ni lo haga notar. El momento 7 los introduce sin necesidad de que hayan salido aquí.'));

push(...momento('6', 'Pausa activa', '11:10 – 11:20', '10 min',
  'Recuperar la atención antes del último bloque de la mañana.',
  [ 'Movilidad suave de manos, muñecas, cuello y hombros, sentados o de pie según cada quien pueda.',
    'Descanso visual: mirar un punto lejano durante veinte segundos, dos veces.',
    'Sin conteos rápidos, sin competencia y sin sacar a nadie por equivocarse.' ],
  'Ninguno.',
  'Nadie está obligado a levantarse. Diga en voz alta que se puede hacer sentado.'));

push(...momento('7', 'Tecnología accesible y segura', '11:20 – 12:10', '50 min',
  'Poner nombre y cuidado a los medios que ya salieron en el momento 5. Es el segundo bloque conceptual del día y por eso queda antes del almuerzo, no después.',
  [ 'Retome el tablero del momento 5, con los medios que el propio grupo nombró. No empiece de cero.',
    'Vaya tomando uno por uno y agregue al lado el cuidado que le corresponde, usando la tabla Medios tecnológicos · usos y cuidados de esta ficha.',
    'Por cada medio cuente un caso corto y cotidiano: el mensaje que pide un código, el enlace que llega por WhatsApp, la foto de un nieto publicada sin permiso.',
    'Haga el ejercicio ¿Le abro o no le abro?: lea en voz alta los cinco mensajes que están al final de esta ficha, uno por uno.',
    'Después de cada mensaje, el grupo responde con un gesto: pulgar arriba si le parece seguro, pulgar abajo si le parece sospechoso, mano plana si no sabe.',
    'Pregunte siempre lo mismo: ¿en qué se nota? Lo que enseña es la señal que identificaron, no el veredicto.',
    'Cierre con la regla que resume todo el bloque: nadie serio le va a pedir una clave ni un código por mensaje.' ],
  'El tablero del momento 5 y los cinco mensajes impresos en letra grande.',
  'No pida claves, saldos, cuentas ni el celular real de nadie. Ningún ejercicio de este bloque se hace sobre el teléfono de un participante.'));

push(...momento('8', 'Almuerzo', '12:10 – 13:10', '1 h',
  'Descanso.',
  [ 'Entregue el almuerzo y diligencie el formato de entrega de beneficios.',
    'Anuncie la hora exacta de regreso y déjela escrita en el tablero, a la vista.',
    'Verifique que quien tenga dificultad de movilidad reciba el almuerzo en su puesto.' ],
  'Almuerzos y formato de entrega de beneficios.',
  'La hora siguiente al almuerzo es la de menor atención del día. Por eso los momentos 10 y 11 son prácticos y no traen concepto nuevo.'));

push(...momento('9', 'Reactivación', '13:10 – 13:20', '10 min',
  'Recoger la atención después del almuerzo sin exigir concentración, y preparar la idea de priorizar.',
  [ 'Explique el juego Necesidad o gusto: usted dice un ejemplo cotidiano y cada quien responde con un gesto.',
    'Acuerde los gestos: mano arriba si es necesidad, mano abajo si es gusto, mano plana si depende.',
    'Diga los ejemplos uno por uno y despacio: el mercado de la semana, un vestido nuevo, la droga del mes, un paseo, una olla para trabajar, un celular nuevo.',
    'Cuando el grupo se divida, no resuelva: pregunte ¿de qué depende? y siga con el siguiente ejemplo.',
    'Cierre a los diez minutos exactos, aunque esté animado. Es una reactivación, no un bloque.' ],
  'Ninguno.',
  'No hay respuesta correcta y conviene decirlo en voz alta. Evite que el grupo corrija a quien responde distinto.'));

push(...momento('10', 'Mensaje sencillo', '13:20 – 14:10', '50 min',
  'Construir en parejas un mensaje de oferta. Queda en esta franja porque es trabajo en parejas, se habla más de lo que se escucha y no introduce ningún concepto nuevo.',
  [ 'Escriba en el tablero las cuatro partes que lleva un mensaje: qué es · para quién sirve · cuánto vale · cómo lo piden.',
    'Lea un ejemplo ya armado para que vean el resultado antes de intentarlo: velas de cera para regalo, sirven para un detalle o para la casa, dieciséis mil pesos, pregunte por doña Rosa en la tienda de la esquina.',
    'Forme parejas. Cada persona arma primero el mensaje del producto de la otra, no el propio. Cuesta menos y se oye mejor.',
    'Quien pueda escribir, escribe. Si en una pareja ninguno escribe, lo dictan y usted o el auxiliar lo escribe por ellos.',
    'A los veinticinco minutos, cambian: ahora cada quien arma el mensaje de su propio producto, con lo que aprendió del ejercicio anterior.',
    'Tres o cuatro parejas leen su mensaje en voz alta. No todas: se pierde el tiempo y el grupo se cansa.',
    'Regla firme durante todo el ejercicio: nadie escribe un teléfono ni una dirección real en la hoja. Se escribe aquí va mi contacto.' ],
  'Hojas tamaño carta, marcadores gruesos y el ejemplo escrito grande en el tablero.',
  'Anote quién no tiene claro qué vende. Ese dato sirve para el acompañamiento individual, no para comentarlo en el grupo.'));

push(...momento('11', 'Mostrar una oferta', '14:10 – 15:10', '1 h',
  'Practicar cómo se ve un producto bien presentado. Es la parte más física del día y por eso queda en la tarde, cuando el grupo ya se reactivó.',
  [ 'Ponga sobre una mesa un objeto de ejemplo mal presentado a propósito: contra la luz, con desorden detrás y colocado lejos.',
    'Pregunte al grupo: ¿qué le arreglaría usted a esto? Deje que respondan varios antes de decir nada.',
    'Con las respuestas del propio grupo arme en el tablero las tres reglas: luz de ventana, fondo limpio, acérquese.',
    'Organice tres estaciones de veinte minutos y divida el grupo en tres. Los subgrupos rotan por las tres.',
    'Estación A · Preparar la escena: extender una tela como fondo y ubicar el objeto junto a la ventana.',
    'Estación B · Registrar: tomar la foto con la cámara o el celular del equipo, o dibujar la escena en una hoja si no hay dispositivo. Las dos opciones valen igual.',
    'Estación C · Escribir: poner debajo de la foto o el dibujo la frase que armaron en el momento 10.',
    'Al final ponga todas las escenas y dibujos a la vista y pregunte al grupo cuál se ve mejor y por qué. Las razones que den son el resumen del bloque.' ],
  'Uno o dos objetos de ejemplo, una tela lisa de fondo, hojas, marcadores y la cámara o el celular del equipo.',
  'Nadie está obligado a usar su propio celular ni a salir en una foto. Pida autorización antes de fotografiar a cualquier persona y publique solo lo que la ruta de evidencias autorice.'));

push(...momento('12', 'Pausa lúdica y refrigerio', '15:10 – 15:30', '20 min',
  'Último descanso antes del cierre.',
  [ 'Entregue el refrigerio y diligencie el formato de entrega de beneficios.',
    'Proponga una actividad breve, adaptada y voluntaria, compatible con estar sentados.',
    'Aproveche para recoger las hojas y los dibujos del momento 11 y organizarlos para el cierre.' ],
  'Refrigerios y formato de entrega de beneficios.',
  'Avise que después de esta pausa viene el cierre, para que nadie se retire creyendo que la jornada ya terminó.'));

push(...momento('13', 'Cierre', '15:30 – 16:00', '30 min',
  'Integrar los seis ejes teóricos de las cinco sesiones y anunciar la transición a la práctica. El cierre no es un resumen: es lo último que se llevan.',
  [ 'Escriba en el tablero los seis ejes teóricos vistos en las cinco sesiones.',
    'Por cada eje pregunte: ¿qué recuerdan de esto? Anote una frase del grupo, no la suya. Si de un eje no recuerdan nada, anótelo también: le sirve para informar a coordinación.',
    'Haga la ronda de cierre: cada quien dice una sola cosa que se lleva de hoy. Quien no quiera hablar, pasa sin comentario.',
    'Abra la caja de preguntas anónimas si la usó durante el día y responda las que haya. Es donde aparecen las dudas de quien no pregunta en público.',
    'Explique el trabajo en casa, que son dos horas, y aclare que no se publica información ni se usa dinero real.',
    'Anuncie que la sesión 6 es la primera práctica y deje escritos en el tablero la fecha, la hora y el lugar.' ],
  'Tablero, la caja de preguntas y las hojas del momento 11.',
  'Termine en autoestima, no en evaluación. Nadie debe salir sintiendo que le tomaron examen.'));

push(new Paragraph({ children: [ new D.PageBreak() ] }));

// ============ CASOS Y MATERIALES ============
push(L.bar('CASOS Y MATERIALES PARA LOS EJERCICIOS'), L.spacer(0));

push(L.table([2500, 11756], [
  new TableRow({ children: [
    L.txtCell(2500, 'Caso de doña Rosa\nMomentos 2 y 3', { bold: true, color: L.BLUE, fill: L.HEAD }),
    L.cell(11756, [
      L.cellP([L.t('Doña Rosa hace velas en su casa. Este mes vendió 20 velas a $16.000 cada una. Para hacerlas compró cera, pabilo y vasos por $120.000. Pagó $20.000 de transporte para llevarlas a una feria y $15.000 de bolsas para empacarlas. Guardó $25.000 para el mes siguiente.', { bold: true })], { after: 80 }),
      ...L.vinetas([
        'Ingreso: $320.000, que es lo que entró por las ventas.',
        'Costo: $120.000 de cera, pabilo y vasos, porque sin eso no hay vela.',
        'Gasto: $35.000 entre transporte y bolsas, porque son pagos para poder vender, no para producir.',
        'Ahorro o reserva: $25.000 que apartó para el mes siguiente.',
        'Le quedaron $165.000, y de esos guardó $25.000.',
      ]),
    ]),
  ]}),
  new TableRow({ children: [
    L.txtCell(2500, 'Tarjetas del presupuesto\nMomento 3', { bold: true, color: L.BLUE, fill: L.HEAD }),
    L.cell(11756, [
      L.cellP([L.t('Cada subgrupo recibe 20 fichas. Cada ficha vale $10.000, en total $200.000. Prepare un juego de tarjetas por mesa.', { it: true })], { after: 80 }),
      ...L.vinetas([
        'Materiales para el próximo mes — 6 fichas',
        'Transporte a la feria — 2 fichas',
        'Bolsas y empaque — 2 fichas',
        'Refrigerio del día de venta — 1 ficha',
        'Vestido nuevo para la feria — 4 fichas',
        'Guardar para el próximo mes — las fichas que decidan dejar',
      ]),
      L.cellP([L.t('A los 15 minutos anuncie el imprevisto: se dañó la olla de la cera y arreglarla cuesta 3 fichas. Todos los subgrupos deben pagarlo.', { bold: true })], { before: 80, after: 0 }),
    ], { fill: L.ZEBRA }),
  ]}),
  new TableRow({ children: [
    L.txtCell(2500, '¿Le abro o no le abro?\nMomento 7', { bold: true, color: L.BLUE, fill: L.HEAD }),
    L.cell(11756, [
      L.cellP([L.t('Lea cada mensaje en voz alta. El grupo responde con un gesto y usted pregunta: ¿en qué se nota?', { it: true })], { after: 80 }),
      ...L.vinetas([
        '«Su pedido está listo. Confirme por el número de siempre.» — Puede ser seguro, pero conviene confirmar por un medio conocido.',
        '«Felicitaciones, ganó un premio. Envíe el código que le llegó por mensaje.» — Sospechoso: nadie serio pide códigos.',
        '«Doña Rosa, ¿todavía tiene velas rojas? Soy la vecina del 302.» — Seguro: se identifica y no pide nada.',
        '«Su cuenta será bloqueada hoy. Entre a este enlace y actualice la clave.» — Sospechoso: apura, manda enlace y pide clave.',
        '«Le consigno ya mismo, pero primero devuélvame $50.000 que le mandé de más.» — Sospechoso: presiona para que usted envíe dinero.',
      ]),
    ]),
  ]}),
  new TableRow({ children: [
    L.txtCell(2500, 'Mensaje de ejemplo\nMomento 10', { bold: true, color: L.BLUE, fill: L.HEAD }),
    L.cell(11756, [
      L.cellP([L.t('Escríbalo grande en el tablero antes de que las parejas empiecen:')], { after: 60 }),
      L.cellP([L.t('«Velas de cera para regalo. Sirven para un detalle o para la casa. $16.000. Pregunte por doña Rosa en la tienda de la esquina.»', { bold: true, color: L.BLUE })], { after: 60 }),
      L.cellP([L.t('Señale las cuatro partes: qué es · para quién sirve · cuánto vale · cómo lo piden.', { it: true })], { after: 0 }),
    ], { fill: L.ZEBRA }),
  ]}),
]), L.spacer(140));

// ============ HERRAMIENTAS ESPECIFICAS ============
push(L.bar('SESIÓN 5 · HERRAMIENTAS ESPECÍFICAS'), L.spacer(0));

const WT = [4200, 10056];
push(L.table(WT, [
  new TableRow({ children: [
    L.txtCell(WT[0] + WT[1], 'MEDIOS TECNOLÓGICOS · USOS Y CUIDADOS',
      { bold: true, color: L.W, fill: L.BAR, span: 2 }) ]}),
  new TableRow({ children: [
    L.txtCell(WT[0], 'Uso posible', { bold: true, color: L.BLUE, fill: L.HEAD }),
    L.txtCell(WT[1], 'Cuidado básico', { bold: true, color: L.BLUE, fill: L.HEAD }) ]}),
  ...[
    ['Llamadas y mensajes', 'Confirmar el destinatario, escribir información clara y no compartir claves o códigos.'],
    ['Fotografías', 'Buscar luz suficiente y fondo ordenado; pedir autorización antes de fotografiar o publicar a otras personas.'],
    ['WhatsApp o redes', 'No abrir enlaces dudosos, no enviar dinero por presión y verificar pedidos o pagos por un medio conocido.'],
    ['Carteles y voz a voz', 'También son medios válidos. Deben incluir información clara, legible y verificable.'],
    ['Apoyo de otra persona', 'Puede solicitar acompañamiento de alguien de confianza sin entregar claves ni perder control de sus decisiones.'],
  ].map((r, i) => new TableRow({ children: [
    L.txtCell(WT[0], r[0], { bold: true, fill: i % 2 ? L.ZEBRA : undefined }),
    L.txtCell(WT[1], r[1], { fill: i % 2 ? L.ZEBRA : undefined }) ]})),
]), L.spacer(110));

push(L.table(WT, [
  new TableRow({ children: [
    L.txtCell(WT[0] + WT[1], 'USO RACIONAL DE LOS RECURSOS',
      { bold: true, color: L.W, fill: L.BAR, span: 2 }) ]}),
  new TableRow({ children: [
    L.txtCell(WT[0], 'Concepto', { bold: true, color: L.BLUE, fill: L.HEAD }),
    L.txtCell(WT[1], 'Explicación aplicada a una iniciativa', { bold: true, color: L.BLUE, fill: L.HEAD }) ]}),
  ...[
    ['Ingreso', 'Dinero que entra por una venta, servicio u otra fuente.'],
    ['Costo', 'Recurso que se usa directamente para producir u ofrecer: materiales, insumos o mano de obra, según el caso.'],
    ['Gasto', 'Pago necesario para funcionar, comunicar, transportar o entregar, entre otros.'],
    ['Ahorro o reserva', 'Parte que se guarda para una meta, una compra futura o una situación inesperada.'],
    ['Decisión responsable', 'Comparar, priorizar, evitar compras innecesarias y no comprometer dinero que no se tiene.'],
  ].map((r, i) => new TableRow({ children: [
    L.txtCell(WT[0], r[0], { bold: true, fill: i % 2 ? L.ZEBRA : undefined }),
    L.txtCell(WT[1], r[1], { fill: i % 2 ? L.ZEBRA : undefined }) ]})),
]), L.spacer(100));
push(L.warn('Cuidado: Trabaje con casos imaginarios. No solicite claves, saldos, deudas, ingresos personales ni información bancaria.'));

push(new Paragraph({ children: [ new D.PageBreak() ] }));

// ============ JUEGOS ============
push(L.bar('JUEGOS Y ACTIVACIONES SUGERIDAS DE ESTA SESIÓN'), L.spacer(0));
const WJ = [3000, 8256, 3000];
push(L.table(WJ, [
  new TableRow({ children: [
    L.txtCell(WJ[0], 'Momento y actividad', { bold: true, color: L.BLUE, fill: L.HEAD }),
    L.txtCell(WJ[1], 'Cómo se realiza', { bold: true, color: L.BLUE, fill: L.HEAD }),
    L.txtCell(WJ[2], 'Qué aporta', { bold: true, color: L.BLUE, fill: L.HEAD }) ]}),
  ...[
    ['Bienvenida · ¿Para qué uso la tecnología?',
     'El grupo menciona los medios que usa en la vida diaria para enterarse o para avisar. Se anotan en dos columnas sin título y al final se rotulan con aparato y sin aparato. Incluya cartel, llamada y voz a voz.',
     'Reconocimiento de experiencias.'],
    ['Pausa · Mensaje que viaja',
     'Una frase breve pasa de persona en persona en voz baja. Al final se compara con la original. Avise antes que el juego está hecho para que el mensaje se pierda, para que nadie se sienta en falta.',
     'Comunicación clara.'],
    ['Juego · Presupuesto imaginario',
     'Cada subgrupo reparte 20 fichas entre seis destinos de un caso ficticio. A los 15 minutos aparece un imprevisto de 3 fichas que todos deben pagar. Quien no guardó reserva tiene que quitar de otro lado.',
     'Decisiones financieras.'],
    ['Reactivación · Necesidad o gusto',
     'Ante ejemplos cotidianos dichos uno por uno, cada persona responde con un gesto: mano arriba necesidad, mano abajo gusto, mano plana depende. No hay respuesta correcta y conviene decirlo.',
     'Priorización.'],
    ['Actividad · Foto o dibujo de producto',
     'Por estaciones de 20 minutos: preparar la escena con tela y luz de ventana, registrarla con foto o dibujo, y escribirle debajo la frase del momento 10. Dibujar vale igual que fotografiar.',
     'Presentación de la oferta.'],
    ['Ejercicio · ¿Le abro o no le abro?',
     'Se leen cinco mensajes en voz alta y el grupo responde con un gesto si le parece seguro o sospechoso. Después de cada uno se pregunta en qué se nota. Ningún ejercicio usa el celular real de nadie.',
     'Uso seguro de medios.'],
  ].map((r, i) => new TableRow({ children: [
    L.txtCell(WJ[0], r[0], { bold: true, fill: i % 2 ? L.ZEBRA : undefined, size: 17 }),
    L.txtCell(WJ[1], r[1], { fill: i % 2 ? L.ZEBRA : undefined, size: 17 }),
    L.txtCell(WJ[2], r[2], { fill: i % 2 ? L.ZEBRA : undefined, size: 17 }) ]})),
]), L.spacer(100));
push(L.warn('Ayudas didácticas: Estas propuestas son orientativas: pueden adaptarse, sustituirse o cambiarse por otras según el propósito, los ritmos, la accesibilidad y la seguridad del grupo. La participación es voluntaria; evite competencia, ridiculización, contacto físico obligatorio y exigencias de memoria o rapidez.'), L.spacer(140));

// ============ ANTES DE EMPEZAR ============
push(L.bar('ANTES DE EMPEZAR'), L.spacer(0));
const WA = [4752, 4752, 4752];
push(L.table(WA, [
  new TableRow({ children: [
    L.txtCell(WA[0], 'Casos imaginarios impresos en letra grande: doña Rosa, las seis tarjetas de presupuesto y los cinco mensajes.', { fill: L.ZEBRA }),
    L.txtCell(WA[1], 'Veinte fichas de dinero por subgrupo, hojas y marcadores gruesos.', { fill: L.ZEBRA }),
    L.txtCell(WA[2], 'Listado de asistencia disponible.', { fill: L.ZEBRA }) ]}),
  new TableRow({ children: [
    L.txtCell(WA[0], 'Uno o dos objetos de ejemplo y una tela lisa para simular la presentación o la fotografía.'),
    L.txtCell(WA[1], 'Espacio organizado para trabajar en parejas, en subgrupos y por estaciones, con una mesa junto a la ventana.'),
    L.txtCell(WA[2], 'Formato de entrega de beneficios disponible para refrigerios y almuerzo y, cuando corresponda, materiales.') ]}),
  new TableRow({ children: [
    L.txtCell(WA[0], 'Tablero o papel kraft, que se usa en siete de los trece momentos.', { fill: L.ZEBRA }),
    L.txtCell(WA[1], 'Caja de preguntas anónimas, disponible desde el inicio de la jornada.', { fill: L.ZEBRA }),
    L.txtCell(WA[2], 'Cámara o celular del equipo, solo si se usará en la demostración y según la ruta definida.', { fill: L.ZEBRA }) ]}),
]), L.spacer(140));

// ============ DURANTE LA JORNADA ============
push(L.bar('DURANTE LA JORNADA'), L.spacer(0));
const WC = [3000, 11256];
push(L.table(WC, [
  new TableRow({ children: [
    L.txtCell(WC[0], 'Clave', { bold: true, color: L.BLUE, fill: L.HEAD }),
    L.txtCell(WC[1], 'Orientación', { bold: true, color: L.BLUE, fill: L.HEAD }) ]}),
  ...[
    ['Hable claro', 'Dé una instrucción por vez, muestre un ejemplo y compruebe que se entendió.'],
    ['Respete los ritmos', 'Alterne conversación y actividad. Permita repetir, descansar y recibir apoyo.'],
    ['Trabaje en grupos pequeños', 'Use parejas o subgrupos para facilitar la participación; lleve a plenaria solo algunas ideas.'],
    ['Ofrezca opciones', 'La participación puede ser oral, escrita, gráfica o práctica; nadie está obligado a moverse, usar celular o hablar frente a todo el grupo.'],
    ['Cuide el trato', 'Parta de la experiencia de las personas y evite lenguaje infantilizante o juicios sobre sus capacidades.'],
    ['Haga pausas', 'Cada 60 a 90 minutos proponga movilidad suave, descanso visual, respiración o una activación breve.'],
    ['No dependa del celular', 'Ofrezca alternativas en papel, conversación o demostración compartida.'],
    ['Proteja los datos', 'No pida claves, saldos, deudas, cuentas bancarias ni publicaciones reales durante el ejercicio.'],
    ['Primero la experiencia', 'En cada bloque deje que el grupo cuente o haga antes de que usted nombre el concepto. El nombre llega después, no antes.'],
    ['Cuide el after del almuerzo', 'No introduzca conceptos nuevos entre las 13:10 y las 14:10. Si se atrasa, recorte de la mañana, no de la tarde.'],
  ].map((r, i) => new TableRow({ children: [
    L.txtCell(WC[0], r[0], { bold: true, fill: i % 2 ? L.ZEBRA : undefined }),
    L.txtCell(WC[1], r[1], { fill: i % 2 ? L.ZEBRA : undefined }) ]})),
]), L.spacer(140));

// ============ PREGUNTAS Y TRABAJO EN CASA ============
push(L.bar('PREGUNTAS ORIENTADORAS Y TRABAJO EN CASA'), L.spacer(0));
push(L.table(WC, [
  new TableRow({ children: [
    L.txtCell(WC[0], 'Momento', { bold: true, color: L.BLUE, fill: L.HEAD }),
    L.txtCell(WC[1], 'Orientación', { bold: true, color: L.BLUE, fill: L.HEAD }) ]}),
  new TableRow({ children: [
    L.txtCell(WC[0], 'Preguntas orientadoras', { bold: true }),
    L.txtCell(WC[1], 'Pregunte: ¿qué medio podría usar?, ¿qué cuidado debo tener? y ¿qué decisión ayudaría a organizar mejor los recursos de una iniciativa? Escuche sin exigir respuestas escritas.') ]}),
  new TableRow({ children: [
    L.txtCell(WC[0], 'En vez de «¿entendieron?»', { bold: true, fill: L.ZEBRA }),
    L.txtCell(WC[1], 'Esa pregunta siempre recibe un sí. Use: ¿cómo se lo explicaría a un nieto?, o levante la mano quien podría hacerlo mañana sin ayuda.', { fill: L.ZEBRA }) ]}),
  new TableRow({ children: [
    L.txtCell(WC[0], 'Trabajo en casa · 2 h', { bold: true }),
    L.txtCell(WC[1], 'Elegir una forma sencilla de presentar una iniciativa —frase, dibujo, cartel o fotografía— y pensar en un gasto que conviene priorizar y otro que podría esperar. No debe publicar información ni usar dinero real.') ]}),
]), L.spacer(140));

// ============ MEDIOS DE VERIFICACION ============
push(L.bar('MEDIOS DE VERIFICACIÓN'), L.spacer(0));
push(L.table(WA, [
  new TableRow({ children: [
    L.txtCell(WA[0], 'Listado de asistencia.', { fill: L.ZEBRA }),
    L.txtCell(WA[1], 'Formato de entrega de beneficios para refrigerios y almuerzo y, cuando corresponda, materiales.', { fill: L.ZEBRA }),
    L.txtCell(WA[2], 'Evidencias fotográficas autorizadas de la jornada y de los avances, según corresponda.', { fill: L.ZEBRA }) ]}),
]), L.spacer(100));
push(L.warn('Al terminar: Entregue el listado de asistencia, el formato de entrega de beneficios y las fotografías por la ruta definida. Comunique a la coordinación únicamente las novedades que requieran apoyo.'));

// ============ DOCUMENTO ============
const doc = new Document({
  styles: { default: { document: { run: { font: L.F, size: 18, color: L.INK } } } },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840, orientation: PageOrientation.LANDSCAPE },
        margin: { top: 792, bottom: 792, left: 792, right: 792, header: 317, footer: 360 },
      },
    },
    headers: { default: new Header({ children: [ new Paragraph({
      spacing: { after: 60 },
      children: [ new TextRun({ text: 'PROGRAMA PERSONAS MAYORES   |   COMPONENTE 3 · FORMACIÓN EN ARTES Y OFICIOS',
        font: L.F, size: 16, bold: true, color: L.GOLD }) ] }) ] }) },
    footers: { default: new Footer({ children: [ new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [ new TextRun({ children: [ D.PageNumber.CURRENT ], font: L.F, size: 16, color: '808080' }) ] }) ] }) },
    children: kids,
  }],
});

Packer.toBuffer(doc).then(b => {
  fs.writeFileSync('/home/user/Alquimia/docs/proyectos/personas-mayores/FM_Sesion_5_Artes_y_Oficios_Reorganizada.docx', b);
  console.log('ok');
});
