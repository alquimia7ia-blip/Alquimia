/**
 * Propuesta comercial de Brújula empresarial para cámaras de comercio.
 *
 * Es una plantilla: los marcadores entre corchetes —[NOMBRE DE LA CÁMARA],
 * [N.º DE USUARIOS]…— se reemplazan para cada cámara sin rehacer las tablas.
 *
 * Lo que se vende es la plataforma sola. El contenido de cada programa lo
 * aporta la cámara: el del programa MEGA es de la Cámara del Aburrá Sur y no
 * es revendible.
 *
 *   node scripts/comercial/propuesta.js
 */
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, AlignmentType, BorderStyle, PageBreak,
  Footer, PageNumber, TextRun,
} = require("docx");
const {
  C, FUENTE, ANCHO_UTIL, cifras, cop, texto, parrafo, h1, h2, punto, numerado,
  destacado, tabla, numeracion, estilos, seccion,
} = require("./comun");

const n = cifras();
const SALIDA = path.join(__dirname, "..", "..", "docs", "comercial",
                         "propuesta-brujula-camaras.docx");

/* ------------------------------------------------------------------ portada */

const portada = [
  parrafo([texto("ALQUIMIA", { size: 26, bold: true, color: C.acento })],
          { before: 900, after: 0 }),
  parrafo([texto("Productos digitales con inteligencia artificial · Medellín",
                 { size: 19, color: C.apagado })], { after: 700 }),

  parrafo([texto("Brújula empresarial", { size: 56, bold: true, color: C.acento })],
          { after: 90 }),
  parrafo([texto("Plataforma de acompañamiento para programas de desarrollo empresarial",
                 { size: 26, color: C.apagado })], { after: 60 }),
  new Paragraph({
    children: [],
    border: { bottom: { style: BorderStyle.SINGLE, size: 14, color: C.turquesa, space: 4 } },
    spacing: { after: 560 },
  }),

  parrafo([texto("PROPUESTA COMERCIAL", { size: 19, bold: true, color: C.turquesa })],
          { after: 180 }),
  parrafo([texto("Preparada para  ", { size: 22, color: C.apagado }),
           texto("[NOMBRE DE LA CÁMARA DE COMERCIO]", { size: 22, bold: true })],
          { after: 90 }),
  parrafo([texto("Atención  ", { size: 22, color: C.apagado }),
           texto("[NOMBRE DEL DESTINATARIO] · [CARGO]", { size: 22 })], { after: 90 }),
  parrafo([texto("Ciudad  ", { size: 22, color: C.apagado }),
           texto("[CIUDAD]", { size: 22 })], { after: 90 }),
  parrafo([texto("Fecha  ", { size: 22, color: C.apagado }),
           texto("[FECHA]", { size: 22 })], { after: 90 }),
  parrafo([texto("Vigencia de esta oferta  ", { size: 22, color: C.apagado }),
           texto("30 días calendario", { size: 22 })], { after: 700 }),

  ...destacado([
    [texto("Presentado por", { bold: true, color: C.acento })],
    [texto("ALQUIMIA · alquimia7.ia@gmail.com · Medellín, Colombia")],
    [texto("Documento confidencial, para uso exclusivo del destinatario.",
           { italics: true, color: C.apagado, size: 19 })],
  ]),

  new Paragraph({ children: [new PageBreak()] }),
];

/* -------------------------------------------------------- cuerpo del documento */

const resumen = [
  h1("1 · Resumen ejecutivo"),
  parrafo("Las cámaras de comercio acompañan cada año a decenas de empresas en programas de " +
          "diagnóstico, planeación y transformación. Ese trabajo se documenta hoy en archivos " +
          "de Word, Excel y PowerPoint dispersos entre los empresarios y los tutores. El " +
          "resultado es conocido: no hay forma de saber quién avanzó, el empresario termina " +
          "sin un entregable consolidado, y el conocimiento que el programa produce se pierde " +
          "al cerrar la cohorte."),
  parrafo("Brújula empresarial convierte el programa de la cámara en una plataforma en línea. " +
          "Cada empresa trabaja en una bitácora propia, con su equipo, desde cualquier " +
          "dispositivo. El avance se registra solo. Al terminar, cada empresa descarga un " +
          "informe completo de su trabajo, y la cámara ve el estado de toda su cohorte en un " +
          "panel."),
  ...destacado([
    [texto("El contenido de su programa es suyo. ", { bold: true }),
     texto("Brújula no impone metodología: sus talleres se cargan como contenido de la " +
           "plataforma, con la marca de la cámara. Lo que se licencia es el motor, no el " +
           "programa.")],
  ], "turquesa"),
  parrafo([texto("Inversión de referencia para [N.º DE USUARIOS] usuarios: ", { bold: true }),
           texto(`${cop(n.contratoTipo.implementacion)} de implementación por única vez y ` +
                 `${cop(n.contratoTipo.suscripcionAnual)} de suscripción anual, antes de IVA. ` +
                 "El detalle está en la sección 7.")]),
];

const problema = [
  h1("2 · El problema que resuelve"),
  parrafo("Al conversar con equipos que operan programas empresariales aparecen siempre los " +
          "mismos cuatro puntos:"),
  punto([texto("No hay trazabilidad. ", { bold: true }),
         texto("El tutor se entera de que una empresa se quedó atrás en la sesión presencial, " +
               "tres semanas después de que ocurriera.")]),
  punto([texto("El entregable se arma a mano. ", { bold: true }),
         texto("Consolidar los talleres de cada empresa en un informe final consume días de " +
               "trabajo del equipo de la cámara al cierre de cada cohorte.")]),
  punto([texto("No hay comparabilidad. ", { bold: true }),
         texto("Como cada empresa responde en su propio archivo, la cámara no puede leer la " +
               "cohorte como un conjunto ni medir el impacto del programa.")]),
  punto([texto("La información sensible circula por correo. ", { bold: true }),
         texto("Los talleres de finanzas piden ventas, márgenes y utilidades. Esos archivos " +
               "viajan adjuntos entre personas que, en la misma cohorte, suelen ser " +
               "competidores directos.")]),
];

const solucion = [
  h1("3 · La solución"),
  parrafo("Brújula empresarial es una plataforma en línea, sin instalación, a la que cada " +
          "empresario entra con su propio correo y contraseña desde el computador o el " +
          "teléfono."),
  h2("Cómo funciona"),
  numerado([texto("La cámara entrega el contenido de su programa. ", { bold: true }),
            texto("ALQUIMIA lo convierte en talleres interactivos con la marca de la cámara.")]),
  numerado([texto("Cada empresa recibe su bitácora. ", { bold: true }),
            texto("Hasta cinco personas de la misma empresa trabajan sobre ella en equipo.")]),
  numerado([texto("El avance se guarda solo, campo por campo. ", { bold: true }),
            texto("Si se cae la conexión, lo escrito se conserva y se envía al volver la red.")]),
  numerado([texto("La empresa ve sus conclusiones y descarga su informe. ", { bold: true }),
            texto("Un documento PDF con todo su trabajo, listo para presentar a su junta.")]),
  numerado([texto("La cámara sigue la cohorte desde su panel. ", { bold: true }),
            texto("Avance por empresa y por taller, y espacio para las observaciones de los " +
                  "tutores.")]),
  ...destacado([
    [texto("El argumento que más pesa: el aislamiento entre empresas.", { bold: true })],
    [texto("En una cohorte hay competidores directos compartiendo plataforma, y los talleres " +
           "de finanzas registran ventas, márgenes y utilidades por línea de producto. En " +
           "Brújula ese aislamiento no depende de que el programa esté bien escrito: vive " +
           "dentro de la base de datos misma, que sencillamente no entrega la información de " +
           "una empresa a nadie más. Es la misma técnica que usan las plataformas bancarias.")],
  ], "turquesa"),
];

const cap = (t, estado) => [t, { t: estado, alignment: AlignmentType.CENTER,
                                 color: estado === "Incluido" ? undefined : C.turquesa,
                                 bold: estado !== "Incluido" }];

const alcance = [
  h1("4 · Qué incluye el servicio"),
  parrafo("La columna de la derecha distingue lo que ya está funcionando de lo que se entrega " +
          "al activar el servicio para su cámara. Preferimos decirlo así antes que prometer de " +
          "más."),
  tabla({
    anchos: [6360, 3000],
    cabecera: ["Componente", { t: "Estado", alignment: AlignmentType.CENTER }],
    filas: [
      cap("Talleres interactivos de su programa, cargados como contenido de la plataforma",
          "Desde la activación"),
      cap("Bitácora colaborativa por empresa, con hasta cinco usuarios", "Incluido"),
      cap("Guardado automático campo por campo, con trabajo sin conexión", "Incluido"),
      cap("Aislamiento de la información entre empresas dentro de la base de datos", "Incluido"),
      cap("Indicadores de avance, niveles y reconocimiento por taller cumplido", "Incluido"),
      cap("Tablero de conclusiones con gráficas por empresa", "Incluido"),
      cap("Informe PDF descargable por empresa", "Incluido"),
      cap("Registro de dudas por taller y observaciones de los tutores", "Incluido"),
      cap("Encuesta de cierre de módulo para medir la percepción del empresario", "Incluido"),
      cap("Panel de cohorte para el equipo de la cámara", "Desde la activación"),
      cap("Colores y logo de la cámara en toda la plataforma", "Desde la activación"),
      cap("Cumplimiento de la Ley 1581 de 2012: autorizaciones versionadas y registro de acceso",
          "Incluido"),
      cap("Soporte por correo en días hábiles y actualizaciones de la plataforma", "Incluido"),
    ],
  }),
  parrafo(" ", { after: 60 }),
  h2("Lo que no incluye"),
  parrafo("Dicho con la misma claridad, para que no haya sorpresas en la ejecución:"),
  punto("El contenido del programa: la metodología, los talleres y su redacción los aporta la cámara."),
  punto("La facilitación de las sesiones y el acompañamiento a las empresas."),
  punto("Capacitación presencial. La inducción al equipo de la cámara se hace en línea y sí está incluida."),
  punto("Integraciones con los sistemas de información de la cámara. Se cotizan aparte."),
];

const licenciamiento = [
  h1("5 · Modelo de licenciamiento"),
  parrafo("El servicio se licencia por usuario activo y mes, en pesos colombianos, mediante " +
          "un contrato anual."),
  h2("Escalones de precio"),
  parrafo("El precio funciona por escalones, igual que una tarifa tributaria: cada tramo se " +
          "cobra únicamente sobre los usuarios que caen dentro de él. Así, ampliar la cohorte " +
          "siempre reduce el costo promedio por usuario y nunca produce saltos de factura."),
  tabla({
    anchos: [5560, 3800],
    cabecera: ["Usuarios", { t: "Precio por usuario / mes", alignment: AlignmentType.RIGHT }],
    filas: n.tramos.map((t) => [
      t.hasta ? `Del usuario ${t.desde} al ${t.hasta}` : `Del usuario ${t.desde} en adelante`,
      cop(t.precio),
    ]),
  }),
  parrafo(" ", { after: 60 }),
  h2("Precio efectivo según el tamaño de la cohorte"),
  tabla({
    anchos: [1900, 2500, 2360, 2600],
    cabecera: ["Usuarios", "Valor mensual", "Promedio por usuario", "Valor anual"],
    filas: n.escala.map((e) => [
      { t: String(e.usuarios), alignment: AlignmentType.LEFT },
      cop(e.mensual), cop(e.efectivo), cop(e.anual),
    ]),
  }),
  parrafo([texto("Todos los valores son antes de IVA del 19 %.",
                 { size: 19, color: C.apagado, italics: true })],
          { before: 90 }),
  h2("Reglas del modelo"),
  punto([texto("Mínimo facturable: ", { bold: true }),
         texto(`${n.minimoFacturable} usuarios por contrato, aunque la cámara active menos. ` +
               "Por debajo de ese número el servicio no se sostiene.")]),
  punto([texto("Máximo por empresa: ", { bold: true }),
         texto(`${n.maxUsuariosEmpresa} usuarios (un propietario y cuatro miembros). El ` +
               "programa trabaja con el equipo directivo, y el tope evita que unas pocas " +
               "empresas agoten los cupos de toda la cohorte. Usuarios adicionales para una " +
               "empresa se facturan al precio del escalón vigente.")]),
  punto([texto("Usuario activo: ", { bold: true }),
         texto("persona con cuenta habilitada durante el mes. Las cuentas que la cámara " +
               "desactive dejan de facturarse en el corte siguiente.")]),
  punto([texto("Implementación: ", { bold: true }),
         texto(`${cop(n.implementacionPorTaller)} por taller configurado, con un mínimo de ` +
               `${cop(n.implementacionMinima)}. Es un pago único que cubre la conversión del ` +
               "contenido, la marca de la cámara y la carga de la primera cohorte.")]),
];

const inversion = [
  h1("6 · Inversión"),
  parrafo("El siguiente cálculo corresponde a una cohorte de [N.º DE EMPRESAS] empresas con " +
          "[N.º DE USUARIOS] usuarios y un programa de [N.º DE TALLERES] talleres. Reemplace " +
          "estas cifras por las de su convocatoria."),
  tabla({
    anchos: [5560, 3800],
    cabecera: ["Concepto", { t: "Valor (COP)", alignment: AlignmentType.RIGHT }],
    filas: [
      [`Implementación · ${n.contratoTipo.talleres} talleres configurados, pago único`,
       cop(n.contratoTipo.implementacion)],
      [`Suscripción año 1 · ${n.contratoTipo.usuarios} usuarios durante 12 meses`,
       cop(n.contratoTipo.suscripcionAnual)],
      [{ t: "Subtotal año 1, antes de IVA", bold: true, fondo: C.suave },
       { t: cop(n.contratoTipo.totalAnio1), bold: true, fondo: C.suave }],
      ["IVA 19 %", cop(n.contratoTipo.totalAnio1ConIva - n.contratoTipo.totalAnio1)],
      [{ t: "TOTAL AÑO 1", bold: true, fondo: C.suave },
       { t: cop(n.contratoTipo.totalAnio1ConIva), bold: true, fondo: C.suave }],
      ["Años siguientes · suscripción anual, antes de IVA",
       `${cop(n.contratoTipo.suscripcionAnual)} + IPC`],
    ],
  }),
  parrafo(" ", { after: 60 }),
  ...destacado([
    [texto("La implementación se paga una sola vez. ", { bold: true }),
     texto("A partir del segundo año la cámara solo paga la suscripción, ajustada por el IPC. " +
           "Agregar un módulo nuevo al programa se cotiza al mismo valor por taller.")],
  ]),
  h2("Forma de pago propuesta"),
  punto("Implementación: 50 % a la firma y 50 % contra la entrega de la plataforma configurada."),
  punto("Suscripción: facturación mensual, o anual anticipada con un 5 % de descuento."),
  punto("Plazo de pago: 30 días calendario desde la radicación de la factura."),
];

const condiciones = [
  h1("7 · Condiciones comerciales"),
  tabla({
    anchos: [2900, 6460],
    cabecera: ["Condición", { t: "Detalle", alignment: AlignmentType.LEFT }],
    filas: [
      ["Vigencia", { t: "Doce (12) meses contados desde la activación del servicio.",
                     alignment: AlignmentType.LEFT }],
      ["Renovación", { t: "Automática por períodos iguales de doce meses, salvo que " +
                          "cualquiera de las partes avise por escrito con sesenta (60) días " +
                          "de antelación al vencimiento.", alignment: AlignmentType.LEFT }],
      ["Reajuste anual", { t: "El valor por usuario se ajusta en cada renovación según el IPC " +
                              "certificado por el DANE para el año calendario inmediatamente " +
                              "anterior. El reajuste nunca será negativo.",
                           alignment: AlignmentType.LEFT }],
      ["Naturaleza", { t: "Licencia de uso temporal y no exclusiva del software. No constituye " +
                          "cesión de derechos patrimoniales ni desarrollo por encargo.",
                       alignment: AlignmentType.LEFT }],
      ["Propiedad", { t: "El contenido que la cámara cargue es y seguirá siendo de la cámara. " +
                         "La plataforma, su código y su arquitectura son de ALQUIMIA.",
                      alignment: AlignmentType.LEFT }],
      ["Disponibilidad", { t: "99,5 % mensual, excluidas las ventanas de mantenimiento " +
                              "programado avisadas con 72 horas de anticipación.",
                           alignment: AlignmentType.LEFT }],
      ["Soporte", { t: "Por correo electrónico en días hábiles, de 8:00 a 18:00 (COT). " +
                       "Respuesta dentro del siguiente día hábil.",
                    alignment: AlignmentType.LEFT }],
      ["Datos al terminar", { t: "Si el contrato no se renueva, la cámara recibe la totalidad " +
                                 "de la información de sus empresas en formato abierto dentro " +
                                 "de los treinta (30) días siguientes, sin costo.",
                              alignment: AlignmentType.LEFT }],
      ["IVA", { t: "Todos los valores de esta propuesta se expresan antes del IVA del 19 %.",
                alignment: AlignmentType.LEFT }],
    ],
  }),
];

const datos = [
  h1("8 · Protección de datos personales"),
  parrafo("El programa recoge datos personales de los empresarios participantes, de modo que " +
          "la relación queda sujeta a la Ley 1581 de 2012 y sus decretos reglamentarios."),
  punto([texto("Roles. ", { bold: true }),
         texto("La cámara actúa como responsable del tratamiento y ALQUIMIA como encargado. " +
               "El contrato de transmisión de datos se firma como anexo, antes de registrar " +
               "al primer usuario.")]),
  punto([texto("Transferencia internacional. ", { bold: true }),
         texto("La infraestructura está alojada en Estados Unidos. Como Colombia no reconoce " +
               "a ese país con nivel adecuado de protección, la plataforma pide al titular una " +
               "autorización expresa y separada para la transferencia, y guarda la constancia " +
               "con fecha y versión de la política.")]),
  punto([texto("Minimización. ", { bold: true }),
         texto("Se recogen únicamente nombre, cargo y correo. No se pide cédula, dirección ni " +
               "dato sensible alguno.")]),
  punto([texto("Derechos del titular. ", { bold: true }),
         texto("Cada participante puede consultar, actualizar y solicitar la supresión de sus " +
               "datos desde la plataforma, dentro de los plazos de ley.")]),
  punto([texto("Registro de acceso. ", { bold: true }),
         texto("Toda lectura de la bitácora de una empresa por parte de un tutor queda " +
               "registrada y es auditable.")]),
];

const implementacion = [
  h1("9 · Implementación"),
  parrafo("Desde la firma hasta la primera sesión con empresarios transcurren entre cuatro y " +
          "seis semanas, según el tamaño del programa."),
  tabla({
    anchos: [1500, 4560, 3300],
    cabecera: ["Semana", { t: "Actividad", alignment: AlignmentType.LEFT },
               { t: "Responsable", alignment: AlignmentType.LEFT }],
    filas: [
      ["1", { t: "Entrega del contenido del programa y de la identidad visual",
              alignment: AlignmentType.LEFT }, { t: "Cámara", alignment: AlignmentType.LEFT }],
      ["1 – 3", { t: "Conversión de los talleres y configuración de la marca",
                  alignment: AlignmentType.LEFT }, { t: "ALQUIMIA", alignment: AlignmentType.LEFT }],
      ["3", { t: "Revisión y aprobación del contenido cargado", alignment: AlignmentType.LEFT },
       { t: "Cámara", alignment: AlignmentType.LEFT }],
      ["4", { t: "Carga de la cohorte y envío de accesos a las empresas",
              alignment: AlignmentType.LEFT }, { t: "Conjunta", alignment: AlignmentType.LEFT }],
      ["4", { t: "Inducción en línea al equipo de tutores (2 horas)",
              alignment: AlignmentType.LEFT }, { t: "ALQUIMIA", alignment: AlignmentType.LEFT }],
      ["5", { t: "Arranque con empresarios", alignment: AlignmentType.LEFT },
       { t: "Cámara", alignment: AlignmentType.LEFT }],
    ],
  }),
  parrafo(" ", { after: 40 }),
  h2("Hoja de ruta del producto"),
  parrafo("Estas mejoras se entregan a los clientes con contrato vigente sin costo adicional:"),
  punto("Exportación de la cohorte completa a Excel, con una hoja por taller."),
  punto("Edición del contenido por parte del equipo de la cámara, sin intermediación de ALQUIMIA."),
  punto("Trabajo simultáneo en vivo: ver los cambios de un compañero sin recargar la página."),
  punto("Informe comparativo de cohorte para medir el impacto del programa."),
];

const cierre = [
  h1("10 · Siguiente paso"),
  parrafo("Proponemos una demostración de cuarenta y cinco minutos con el equipo que opera el " +
          "programa, sobre una cohorte de prueba cargada con contenido de su cámara. No tiene " +
          "costo ni compromiso."),
  parrafo([texto("Para agendarla: ", { bold: true }),
           texto("alquimia7.ia@gmail.com")], { after: 700 }),

  parrafo([texto("Aceptación", { size: 24, bold: true, color: C.acento })], { after: 400 }),
  tabla({
    anchos: [4680, 4680],
    cabecera: [{ t: "Por ALQUIMIA", alignment: AlignmentType.LEFT },
               { t: "Por [NOMBRE DE LA CÁMARA]", alignment: AlignmentType.LEFT }],
    filas: [
      [{ t: " ", alignment: AlignmentType.LEFT }, { t: " ", alignment: AlignmentType.LEFT }],
      [{ t: " ", alignment: AlignmentType.LEFT }, { t: " ", alignment: AlignmentType.LEFT }],
      [{ t: "Nombre:", alignment: AlignmentType.LEFT },
       { t: "Nombre:", alignment: AlignmentType.LEFT }],
      [{ t: "Cargo:", alignment: AlignmentType.LEFT },
       { t: "Cargo:", alignment: AlignmentType.LEFT }],
      [{ t: "Fecha:", alignment: AlignmentType.LEFT },
       { t: "Fecha:", alignment: AlignmentType.LEFT }],
    ],
  }),
];

/* --------------------------------------------------------------------- armado */

const pie = new Footer({
  children: [new Paragraph({
    alignment: AlignmentType.CENTER,
    border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.linea, space: 8 } },
    children: [
      new TextRun({ text: "ALQUIMIA · Brújula empresarial · Propuesta comercial confidencial · ",
                    font: FUENTE, size: 16, color: C.apagado }),
      new TextRun({ children: [PageNumber.CURRENT], font: FUENTE, size: 16, color: C.apagado }),
      new TextRun({ text: " de ", font: FUENTE, size: 16, color: C.apagado }),
      new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FUENTE, size: 16, color: C.apagado }),
    ],
  })],
});

const doc = new Document({
  creator: "ALQUIMIA",
  title: "Brújula empresarial · Propuesta comercial",
  description: "Propuesta de licenciamiento de la plataforma Brújula empresarial para cámaras de comercio",
  styles: estilos,
  numbering: numeracion,
  sections: [seccion([
    ...portada, ...resumen, ...problema, ...solucion, ...alcance,
    ...licenciamiento, ...inversion, ...condiciones, ...datos,
    ...implementacion, ...cierre,
  ], { footers: { default: pie } })],
});

Packer.toBuffer(doc).then((b) => {
  fs.writeFileSync(SALIDA, b);
  console.log(`✓ ${path.relative(process.cwd(), SALIDA)} · ${(b.length / 1024).toFixed(0)} KB`);
});
