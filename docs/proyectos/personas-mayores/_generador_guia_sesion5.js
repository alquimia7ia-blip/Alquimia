const L = require('./fmlib.js');
const D = require('docx');
const { Document, Packer, Paragraph, PageOrientation, Header, Footer, AlignmentType, TextRun } = D;
const fs = require('fs');

const kids = [];
const push = (...x) => kids.push(...x);
const WD = [2300, 6500, 5456];

// ficha de un momento: proposito, pasos, que decir, materiales, cuidado
function bloque(num, titulo, tiempo, diapos, proposito, pasos, decir, materiales, cuidado) {
  const filas = [
    new D.TableRow({ children: [
      L.txtCell(WD[0]+WD[1]+WD[2],
        'MOMENTO ' + num + '  ·  ' + titulo.toUpperCase() + '  ·  ' + tiempo + '  ·  ' + diapos,
        { bold: true, color: L.W, fill: L.BAR, size: 18, span: 3 }) ]}),
    new D.TableRow({ children: [
      L.txtCell(WD[0], 'Para qué es', { bold: true, color: L.BLUE, fill: L.HEAD }),
      L.cell(WD[1]+WD[2], L.cellP([L.t(proposito)], { after: 0 }), { span: 2 }) ]}),
    new D.TableRow({ children: [
      L.txtCell(WD[0], 'Paso a paso', { bold: true, color: L.BLUE, fill: L.HEAD }),
      L.cell(WD[1]+WD[2], L.pasos(pasos), { span: 2 }) ]}),
  ];
  if (decir) filas.push(new D.TableRow({ children: [
    L.txtCell(WD[0], 'Qué decir', { bold: true, color: L.BLUE, fill: L.HEAD }),
    L.cell(WD[1]+WD[2], decir.map((d, i) => new Paragraph({
      spacing: { before: i === 0 ? 0 : 60, after: 0 },
      children: [ L.t('«' + d + '»', { it: true, color: L.BLUE }) ] })), { span: 2 }) ]}));
  filas.push(new D.TableRow({ children: [
    L.txtCell(WD[0], 'Qué se necesita', { bold: true, color: L.BLUE, fill: L.HEAD }),
    L.txtCell(WD[1], materiales, { fill: L.ZEBRA, size: 17 }),
    L.txtCell(WD[2], cuidado, { fill: L.WARN, size: 17 }) ]}));
  return [ L.tableNS(WD, filas), L.spacer(110) ];
}

/* ===== ENCABEZADO ===== */
push(L.table([2400, 8556, 3300], [
  new D.TableRow({ children: [
    L.txtCell(2400, 'GUÍA DEL TALLERISTA', { bold: true, color: L.W, fill: L.BAR, size: 19 }),
    L.txtCell(8556, 'SESIÓN 5 · USAMOS LA TECNOLOGÍA Y EL DINERO CON PROPÓSITO',
      { bold: true, color: L.W, fill: L.BAR, size: 19 }),
    L.txtCell(3300, '8 h presenciales + 2 h en casa', { color: L.W, fill: L.BAR, size: 17 }) ]}),
  new D.TableRow({ children: [
    L.txtCell(2400, 'FM-AO-05', { fill: L.HEAD, size: 16, color: L.BLUE }),
    L.txtCell(8556, 'Paso a paso de cada actividad · acompaña la presentación de 25 diapositivas',
      { fill: L.HEAD, size: 16, color: L.BLUE }),
    L.txtCell(3300, 'No se diligencia', { fill: L.HEAD, size: 16, color: L.BLUE }) ]}),
]), L.spacer(110));

push(L.warn('Esta guía sigue el orden y los temas de la ficha FM-AO-05 sin cambiarlos. Lo que agrega es el paso a paso de cada actividad y las frases exactas que puede usar. La columna «Qué decir» son ejemplos: dígalo con sus palabras. Las diapositivas se indican como D1, D2, etc.'), L.spacer(140));

/* ===== ANTES DE EMPEZAR ===== */
push(L.bar('ANTES DE QUE LLEGUE EL GRUPO'), L.spacer(0));
const WA = [4752, 4752, 4752];
push(L.table(WA, [
  new D.TableRow({ children: [
    L.txtCell(WA[0], 'Proyector probado y presentación abierta en la diapositiva 1.', { fill: L.ZEBRA }),
    L.txtCell(WA[1], 'Tablero o papel kraft y marcadores gruesos. Se usa en cinco momentos.', { fill: L.ZEBRA }),
    L.txtCell(WA[2], 'Listado de asistencia y formato de entrega de beneficios.', { fill: L.ZEBRA }) ]}),
  new D.TableRow({ children: [
    L.txtCell(WA[0], 'Fichas de dinero: 20 por subgrupo. Sirven tapas, botones o papeles cortados.'),
    L.txtCell(WA[1], 'Hojas y marcadores para cada participante. Una tela lisa para el fondo de las fotos.'),
    L.txtCell(WA[2], 'Uno o dos objetos de ejemplo de la técnica del grupo, terminados.') ]}),
  new D.TableRow({ children: [
    L.txtCell(WA[0], 'Sillas en semicírculo, no en filas. Deje pasillo para quien use bastón o caminador.', { fill: L.ZEBRA }),
    L.txtCell(WA[1], 'Una mesa junto a la ventana, libre, para el momento 5.', { fill: L.ZEBRA }),
    L.txtCell(WA[2], 'Rincón con agua o café, disponible toda la jornada sin pedir permiso.', { fill: L.ZEBRA }) ]}),
]), L.spacer(100));
push(L.warn('Las diapositivas 12, 15 y 19 tienen un recuadro naranja que dice «Anexe aquí…». Antes de dictar, reemplácelo por una foto o un ejemplo de la técnica que está trabajando su grupo. Si no alcanza, borre el recuadro: la diapositiva funciona igual.'), L.spacer(140));

/* ===== LOS MOMENTOS ===== */
push(L.bar('PASO A PASO DE CADA MOMENTO'), L.spacer(0));

push(...bloque('1', 'Bienvenida y activación', '20 min', 'D2 y D3',
  'Que todas las personas hablen una vez en los primeros veinte minutos y que el tema salga de su propia experiencia, no de usted.',
  [ 'Salude y muestre la D2. Diga en dos frases qué se va a ver hoy: el teléfono en la mañana y el dinero en la tarde.',
    'Aclare de entrada que hoy nadie necesita traer celular, ni contar cuánto gana, ni mostrar sus cuentas. Esto baja la tensión y hace que participen.',
    'Pase a la D3 y lance la pregunta. Espere. No responda usted primero.',
    'Anote en el tablero todo lo que salga, en dos columnas, pero sin ponerles título.',
    'Cuando haya ocho o diez respuestas, rotule las columnas: con aparato y sin aparato.',
    'Cierre señalando que las dos columnas sirven para dar a conocer lo que uno hace.' ],
  [ '¿Para qué usa usted el teléfono?',
    'Y cuando usted quiere avisar algo, ¿por dónde avisa?',
    'Fíjense: aquí hay cosas con aparato y cosas sin aparato. Las dos sirven.' ],
  'Tablero y marcadores gruesos.',
  'Anote mentalmente quién no habló. Búsquelo en el momento 2, que es en subgrupo y cuesta menos.'));

push(...bloque('2', 'Experiencias cotidianas', '40 min', 'D4',
  'Recoger las experiencias del grupo antes de explicar nada. Lo que salga aquí es el material con el que usted trabaja el momento 3.',
  [ 'Forme subgrupos de cuatro personas. Que se muevan de puesto: eso ya es pausa activa.',
    'Muestre la D4 y déjela proyectada todo el ejercicio. Es la única pregunta.',
    'Deje quince minutos de conversación. Pase por las mesas, escuche, pero no dirija.',
    'Pida que cada subgrupo traiga UNA sola historia a la plenaria. No todas: no alcanza el tiempo y el grupo se cansa.',
    'Mientras cuentan, anote en el tablero solo el medio que aparece: la vecina avisó, el cartel de la tienda, la llamada, la foto por WhatsApp, el aviso en la misa.',
    'Deje ese tablero escrito. Lo va a necesitar en el momento 3.' ],
  [ 'Piense en algo que usted vendió, prestó o regaló. ¿Cómo se enteró la gente de que usted lo tenía?',
    'Cuéntenos una sola historia, la que más les llame la atención.' ],
  'Tarjetas con la pregunta impresa en letra grande, tablero.',
  'Si nadie menciona medios digitales, no los fuerce ni lo haga notar. El momento 3 los introduce.'));

push(...bloque('3', 'Tecnología accesible y segura', '50 min', 'D5 a D9',
  'Poner nombre y cuidado a los medios que el grupo ya nombró. Es el bloque conceptual de la mañana.',
  [ 'Muestre la D5 y compárela con el tablero del momento 2: son los mismos medios que ellos dijeron. Dígalo en voz alta.',
    'Insista en que el cartel y el voz a voz valen tanto como el WhatsApp. Muchos creen que si no tienen teléfono no pueden vender.',
    'Pase a la D6. Lea el título en voz alta, pausado, y deje tres segundos de silencio antes de explicar.',
    'Por cada cuidado (D6 a D9) cuente un caso corto que le haya pasado a alguien conocido, no una advertencia abstracta.',
    'Después de cada uno pregunte si a alguien le ha llegado algo parecido. Si alguien cuenta, agradézcalo y no lo corrija.',
    'Cierre repitiendo la regla que resume las cuatro: nadie serio le pide una clave por mensaje.' ],
  [ 'Estos son los mismos medios que ustedes nombraron hace un rato.',
    'A usted, ¿le ha llegado alguna vez un mensaje raro?',
    'Nadie serio le va a pedir su clave por mensaje. Nadie.' ],
  'El tablero del momento 2, ya escrito.',
  'No pida claves, saldos, cuentas ni el celular de nadie. Ningún ejercicio se hace sobre el teléfono de un participante.'));

push(...bloque('4', 'Pausa lúdica y refrigerio', '20 min', 'D10',
  'Descanso real. No es tiempo de contenido.',
  [ 'Entregue el refrigerio y diligencie el formato de entrega de beneficios mientras están sentados.',
    'Si el grupo quiere, proponga Mensaje que viaja: una frase corta pasa de persona en persona en voz baja y al final se compara con la original.',
    'Avise antes que el juego está hecho para que el mensaje se pierda, para que nadie se sienta en falta.',
    'No adelante el siguiente bloque durante la pausa.' ],
  null,
  'Refrigerios y formato de entrega de beneficios.',
  'El juego es voluntario y se puede hacer sentados y comiendo. Si el grupo prefiere solo conversar, déjelo.'));

push(...bloque('5', 'Mostrar una oferta', '1 h', 'D11 y D12',
  'Practicar cómo se ve un producto bien presentado. Es la parte más práctica de la mañana.',
  [ 'Antes de mostrar la D11, ponga sobre una mesa un objeto de ejemplo MAL presentado: contra la luz, con desorden atrás y colocado lejos.',
    'Pregunte al grupo qué le arreglaría. Deje que respondan tres o cuatro personas antes de decir nada.',
    'Ahora sí muestre la D11: las tres reglas son las que ellos acabaron de decir. Señálelo.',
    'Pase a la D12 y forme parejas. Quien tiene teléfono ayuda a quien no.',
    'Una sola foto por persona, no diez. Quien no quiera o no pueda usar teléfono, dibuja la escena en una hoja.',
    'A los cuarenta minutos ponga todas las fotos y dibujos a la vista y pregunte cuál se ve mejor y por qué.',
    'Las razones que den son el resumen del bloque. Anótelas en el tablero.' ],
  [ '¿Qué le arreglaría usted a esto para que se viera mejor?',
    'Una sola foto. La mejor que le salga.',
    '¿Cuál se ve mejor? ¿Por qué?' ],
  'Objeto de ejemplo, tela lisa de fondo, hojas y marcadores, cámara o celular del equipo.',
  'Nadie está obligado a usar su celular ni a salir en una foto. Pida autorización antes de fotografiar a cualquier persona.'));

push(...bloque('6', 'Pausa activa', '10 min', 'D13',
  'Recuperar la atención antes del último bloque de la mañana.',
  [ 'Movilidad suave de manos, muñecas, cuello y hombros. Diga en voz alta que se puede hacer sentado.',
    'Descanso visual: mirar un punto lejano veinte segundos, dos veces.',
    'Sin conteos rápidos, sin competencia y sin sacar a nadie por equivocarse.' ],
  null, 'Ninguno.',
  'Vaya despacio. Si alguien no quiere moverse, no insista ni lo señale.'));

push(...bloque('7', 'Mensaje sencillo', '50 min', 'D14 y D15',
  'Que cada quien salga con un aviso armado de lo que hace.',
  [ 'Muestre la D14 y explique las cuatro partes, una por vez, señalándolas en la pantalla.',
    'Lea el ejemplo armado en voz alta antes de que intenten. Ver el resultado primero les quita el miedo.',
    'Pase a la D15 y forme parejas. Cada quien arma primero el aviso del producto del compañero, no el propio: cuesta menos y se oye mejor.',
    'Quien pueda escribir, escribe. Si en una pareja ninguno escribe, lo dictan y usted o el auxiliar lo escribe por ellos.',
    'A los veinticinco minutos avise el cambio: ahora cada quien arma el suyo.',
    'Tres o cuatro parejas leen en voz alta. No todas.',
    'Repita la regla cada vez que pase por una mesa: no se escriben teléfonos ni direcciones reales.' ],
  [ 'Primero arme el del compañero. Después el suyo.',
    'Donde va el contacto, escriba «aquí va mi contacto». Nada más.' ],
  'Hojas, marcadores gruesos, el ejemplo escrito grande en el tablero.',
  'Anote quién no tiene claro qué vende. Ese dato sirve para el acompañamiento individual, no para comentarlo en el grupo.'));

push(...bloque('8', 'Almuerzo', '1 h', 'D16',
  'Descanso.',
  [ 'Entregue el almuerzo y diligencie el formato de entrega de beneficios.',
    'Escriba la hora exacta de regreso en el tablero, además de decirla.',
    'Verifique que quien tenga dificultad de movilidad reciba el almuerzo en su puesto.',
    'Deje la D16 proyectada durante el almuerzo.' ],
  null, 'Almuerzos y formato de entrega de beneficios.',
  'La hora siguiente al almuerzo es la de menor atención. Por eso el momento 9 es de movimiento.'));

push(...bloque('9', 'Reactivación', '10 min', 'D17',
  'Recoger la atención después del almuerzo sin exigir concentración, y preparar la idea de priorizar.',
  [ 'Muestre la D17 y acuerde los gestos antes de empezar: mano arriba necesidad, mano abajo gusto, mano plana depende.',
    'Diga los ejemplos uno por uno y despacio: el mercado de la semana, un vestido nuevo, la droga del mes, un paseo, una olla para trabajar, un celular nuevo.',
    'Cuando el grupo se divida, no resuelva. Pregunte de qué depende y siga con el siguiente.',
    'Corte a los diez minutos exactos, aunque esté animado.' ],
  [ 'No hay respuesta correcta. Cada quien sabe lo suyo.',
    'Se dividieron. ¿De qué depende?' ],
  'Ninguno.',
  'Evite que el grupo corrija a quien responde distinto. Dígalo en voz alta al empezar.'));

push(...bloque('10', 'Ingresos, gastos y ahorro', '1 h', 'D18, D19 y D20',
  'Distinguir cuatro palabras aplicadas a una iniciativa, no en abstracto. Es el bloque conceptual de la tarde.',
  [ 'Muestre la D18. Lea las cuatro palabras y su explicación, una por vez.',
    'Por cada palabra pida un ejemplo al grupo, referido a lo que ellos hacen. No siga hasta que salga uno.',
    'Pase a la D19 y escriba la resta grande en el tablero, con un ejemplo inventado que usted lleve preparado.',
    'Insista en la parte que siempre se olvida: las horas de trabajo también cuentan como costo.',
    'Pase a la D20 y lea las tres preguntas en voz alta, pausado.',
    'Verifique con la pregunta: ¿cómo le explicaría esto a un nieto? Nunca pregunte si entendieron, porque siempre responden que sí.' ],
  [ 'Deme un ejemplo suyo de lo que sería un costo.',
    'Lo que entra, menos lo que sale, es lo que de verdad le queda.',
    '¿Cómo le explicaría usted esto a un nieto?' ],
  'Tablero, marcadores y un ejemplo con cifras preparado antes de la jornada.',
  'Trabaje con casos imaginarios. No solicite claves, saldos, deudas, ingresos personales ni información bancaria.'));

push(...bloque('11', 'Juego del presupuesto', '50 min', 'D21',
  'Aplicar de inmediato lo del momento 10, tomando decisiones con dinero de mentira.',
  [ 'Forme subgrupos de cuatro o cinco. Entregue veinte fichas a cada uno y diga cuánto vale cada ficha.',
    'Muestre la D21 y explique el caso imaginario que usted preparó: cuánto le quedó a esa persona y en qué puede usarlo.',
    'Ponga sobre cada mesa las tarjetas de destino con su precio en fichas: materiales, transporte, empaque, ahorro y otros gastos.',
    'Deje quince minutos para que repartan. Pase por las mesas pero no opine ni corrija.',
    'A los quince minutos anuncie un imprevisto que todos deben pagar. Quien no guardó tendrá que quitar de otro lado.',
    'Cada subgrupo cuenta qué decidió y por qué. No corrija ninguna decisión: solo pregunte qué harían distinto.',
    'Cierre nombrando lo que pasó: para eso sirve guardar una parte.' ],
  [ 'Ustedes deciden. No hay una sola forma correcta.',
    'Apareció un gasto que nadie tenía previsto. ¿Cómo lo resuelven?',
    '¿Qué harían distinto si volvieran a empezar?' ],
  'Veinte fichas por subgrupo, tarjetas de destino, el caso imaginario impreso.',
  'El caso debe ser ficticio. Nadie usa cifras propias ni cuenta cuánto gana.'));

push(...bloque('12', 'Pausa lúdica y refrigerio', '20 min', 'D22',
  'Último descanso antes del cierre.',
  [ 'Entregue el refrigerio y diligencie el formato de entrega de beneficios.',
    'Proponga una actividad breve, adaptada y voluntaria, compatible con estar sentados.',
    'Aproveche para recoger las hojas y los dibujos del momento 5 y organizarlos para el cierre.',
    'Avise que después de esta pausa viene el cierre, para que nadie se retire creyendo que la jornada terminó.' ],
  null, 'Refrigerios y formato de entrega de beneficios.',
  'Es la pausa donde más gente se retira. El aviso del paso 4 evita que pase.'));

push(...bloque('13', 'Cierre', '30 min', 'D23, D24 y D25',
  'Integrar los seis ejes teóricos de las cinco sesiones y anunciar la práctica. El cierre no es un resumen: es lo último que se llevan.',
  [ 'Escriba en el tablero los seis ejes vistos en las cinco sesiones y pregunte por cada uno qué recuerdan. Anote una frase del grupo, no la suya.',
    'Si de algún eje no recuerdan nada, anótelo también: sirve para informar a coordinación.',
    'Muestre la D23 y haga la ronda: cada quien dice una sola cosa. Quien no quiera hablar, pasa sin comentario.',
    'Pase a la D24 y explique la tarea. Aclare que no se publica información ni se usa dinero real.',
    'Termine con la D25 y deje escritos día, hora y lugar de la sesión 6 en el tablero, además de decirlos.',
    'Entregue el listado de asistencia, el formato de entrega de beneficios y las fotografías por la ruta definida.' ],
  [ '¿Qué recuerdan de esto?',
    'Una sola cosa que se lleva de hoy.',
    'La próxima clase ya empezamos a trabajar con las manos.' ],
  'Tablero y las hojas del momento 5.',
  'Termine en autoestima, no en evaluación. Nadie debe salir sintiendo que le tomaron examen.'));

/* ===== CÓMO HABLARLE AL GRUPO ===== */
push(new Paragraph({ children: [ new D.PageBreak() ] }));
push(L.bar('CÓMO HABLARLE AL GRUPO'), L.spacer(0));
const WC = [3200, 11056];
push(L.table(WC, [
  new D.TableRow({ children: [
    L.txtCell(WC[0], 'Clave', { bold: true, color: L.BLUE, fill: L.HEAD }),
    L.txtCell(WC[1], 'Cómo se aplica', { bold: true, color: L.BLUE, fill: L.HEAD }) ]}),
  ...[
    ['Una instrucción por vez', 'Diga una sola cosa, muestre un ejemplo y compruebe que se entendió antes de decir la siguiente.'],
    ['Hable de usted', 'Nunca tutee ni use diminutivos. Evite «abuelitos», «viejitos» y «mi amor». Son personas adultas.'],
    ['Primero la experiencia', 'Deje que el grupo cuente o haga antes de que usted nombre el concepto. El nombre llega después.'],
    ['No pregunte «¿entendieron?»', 'Siempre responden que sí. Pregunte: ¿cómo se lo explicaría a un nieto?, o pida que levante la mano quien podría hacerlo mañana solo.'],
    ['Repita sin que se note', 'Diga lo mismo de tres formas distintas en vez de repetir la misma frase más duro. Subir la voz no ayuda a entender.'],
    ['Deje silencios', 'Después de una pregunta, cuente hasta cinco antes de hablar. Necesitan ese tiempo y usted lo va a sentir eterno.'],
    ['Ofrezca opciones', 'Oral, escrito, dibujado o práctico. Nadie está obligado a moverse, usar celular ni hablar frente a todos.'],
    ['No dependa del celular', 'Toda actividad debe tener su versión en papel o conversada. Anúncielo antes de empezar, no cuando alguien diga que no tiene.'],
    ['Nombre a la gente', 'Aprenda los nombres el primer momento y úselos. Conecta más que cualquier dinámica.'],
    ['Proteja los datos', 'No pida claves, saldos, deudas, cuentas ni publicaciones reales en ningún momento de la jornada.'],
  ].map((r, i) => new D.TableRow({ children: [
    L.txtCell(WC[0], r[0], { bold: true, fill: i % 2 ? L.ZEBRA : undefined }),
    L.txtCell(WC[1], r[1], { fill: i % 2 ? L.ZEBRA : undefined }) ]})),
]), L.spacer(140));

/* ===== SI ALGO SE SALE DE CONTROL ===== */
push(L.bar('SI ALGO SE SALE DE LO PREVISTO'), L.spacer(0));
push(L.table(WC, [
  new D.TableRow({ children: [
    L.txtCell(WC[0], 'Qué pasa', { bold: true, color: L.BLUE, fill: L.HEAD }),
    L.txtCell(WC[1], 'Qué hacer', { bold: true, color: L.BLUE, fill: L.HEAD }) ]}),
  ...[
    ['Va atrasado', 'Recorte del momento 2 o del 5, que son los más largos. Nunca recorte las pausas ni el cierre.'],
    ['Le sobró tiempo', 'Vuelva al tablero del momento 2 y pida más historias. Siempre hay.'],
    ['El grupo se apagó', 'Pare y haga una pausa activa aunque no toque. Diez minutos perdidos recuperan una hora.'],
    ['Alguien acapara la palabra', '«Guárdeme ese detalle para el descanso, que lo quiero oír completo.» Y pase el turno a otro nombre.'],
    ['Nadie responde', 'No insista en plenaria. «Piénsenlo treinta segundos con el compañero de al lado y volvemos.»'],
    ['Alguien se frustra', 'Bájele la exigencia a esa persona sin anunciarlo: déle una tarea que sí pueda hacer y reconózcala.'],
    ['No hay proyector', 'La jornada funciona igual. Escriba los títulos de las diapositivas en el tablero, con letra grande.'],
    ['Falla el internet', 'Nada de esta sesión necesita internet. Ninguna actividad depende de estar conectado.'],
  ].map((r, i) => new D.TableRow({ children: [
    L.txtCell(WC[0], r[0], { bold: true, fill: i % 2 ? L.ZEBRA : undefined }),
    L.txtCell(WC[1], r[1], { fill: i % 2 ? L.ZEBRA : undefined }) ]})),
]), L.spacer(140));

/* ===== AL TERMINAR ===== */
push(L.bar('AL TERMINAR LA JORNADA'), L.spacer(0));
push(L.table(WA, [
  new D.TableRow({ children: [
    L.txtCell(WA[0], 'Listado de asistencia diligenciado y entregado.', { fill: L.ZEBRA }),
    L.txtCell(WA[1], 'Formato de entrega de beneficios de refrigerios, almuerzo y materiales.', { fill: L.ZEBRA }),
    L.txtCell(WA[2], 'Evidencias fotográficas autorizadas, por la ruta definida.', { fill: L.ZEBRA }) ]}),
  new D.TableRow({ children: [
    L.txtCell(WA[0], 'Novedades que requieran apoyo, comunicadas a coordinación.'),
    L.txtCell(WA[1], 'Nombres de quienes no tienen clara su iniciativa, para el acompañamiento individual.'),
    L.txtCell(WA[2], 'Ejes que el grupo no recordó en el cierre, para informar a coordinación.') ]}),
]));

/* ===== DOCUMENTO ===== */
const doc = new Document({
  styles: { default: { document: { run: { font: L.F, size: 18, color: L.INK } } } },
  sections: [{
    properties: { page: {
      size: { width: 12240, height: 15840, orientation: PageOrientation.LANDSCAPE },
      margin: { top: 792, bottom: 792, left: 792, right: 792, header: 317, footer: 360 } } },
    headers: { default: new Header({ children: [ new Paragraph({ spacing: { after: 60 },
      children: [ new TextRun({ text: 'PROGRAMA PERSONAS MAYORES   |   COMPONENTE 3 · FORMACIÓN EN ARTES Y OFICIOS   |   GUÍA DEL TALLERISTA',
        font: L.F, size: 16, bold: true, color: L.GOLD }) ] }) ] }) },
    footers: { default: new Footer({ children: [ new Paragraph({ alignment: AlignmentType.RIGHT,
      children: [ new TextRun({ children: [ D.PageNumber.CURRENT ], font: L.F, size: 16, color: '808080' }) ] }) ] }) },
    children: kids,
  }],
});

Packer.toBuffer(doc).then(b => {
  fs.writeFileSync('/home/user/Alquimia/docs/proyectos/personas-mayores/Guia_Tallerista_Sesion_5.docx', b);
  console.log('guia ok');
});
