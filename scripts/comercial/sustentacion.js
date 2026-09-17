/**
 * Sustentación interna del precio de Brújula empresarial.
 *
 * NO es para el cliente. Un jefe de compras que conoce tu estructura de costos
 * sabe exactamente hasta dónde puedes bajar, y la negociación termina en tu
 * piso. Por eso va en un archivo aparte y no como anexo de la propuesta.
 *
 *   node scripts/comercial/sustentacion.js
 */
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, AlignmentType, BorderStyle, PageBreak,
  Footer, PageNumber, TextRun,
} = require("docx");
const {
  C, FUENTE, cifras, cop, pct, texto, parrafo, h1, h2, punto,
  destacado, tabla, numeracion, estilos, seccion,
} = require("./comun");

const n = cifras();
const SALIDA = path.join(__dirname, "..", "..", "docs", "comercial",
                         "sustentacion-precio-brujula.docx");

const usd = (v) => "USD " + v.toFixed(2).replace(".", ",");

/* ------------------------------------------------------------------ portada */

const portada = [
  parrafo([texto("ALQUIMIA", { size: 26, bold: true, color: C.acento })],
          { before: 700, after: 0 }),
  parrafo([texto("Documento de trabajo interno", { size: 19, color: C.apagado })],
          { after: 500 }),

  ...destacado([
    [texto("USO INTERNO · NO ENVIAR AL CLIENTE",
           { size: 30, bold: true, color: C.alerta })],
    [texto("Este documento contiene la estructura de costos y el precio piso de ALQUIMIA. " +
           "Entregarlo a un comprador equivale a mostrarle hasta dónde puede presionar: la " +
           "negociación terminaría exactamente en ese número. La propuesta que sí se envía es " +
           "«propuesta-brujula-camaras.docx».")],
  ], "alerta"),

  parrafo([texto("Sustentación de precio", { size: 48, bold: true, color: C.acento })],
          { before: 500, after: 90 }),
  parrafo([texto("Brújula empresarial · licenciamiento a cámaras de comercio",
                 { size: 24, color: C.apagado })], { after: 60 }),
  new Paragraph({
    children: [],
    border: { bottom: { style: BorderStyle.SINGLE, size: 14, color: C.turquesa, space: 4 } },
    spacing: { after: 420 },
  }),
  parrafo([texto("Todas las cifras de este documento y de la propuesta se calculan en " +
                 "docs/comercial/modelo-precio.py. Es la única fuente: si un supuesto cambia, " +
                 "se cambia allí y se regeneran los dos archivos con " +
                 "scripts/comercial/. Así nunca circulan dos versiones del mismo número.",
                 { italics: true, color: C.apagado, size: 19 })]),
  new Paragraph({ children: [new PageBreak()] }),
];

/* -------------------------------------------------------------------- costos */

const costos = [
  h1("1 · Costo fijo mensual"),
  parrafo("Una sola instalación sirve a todas las cámaras: la arquitectura ya es " +
          "multi-inquilino, así que la infraestructura no se multiplica por cliente. " +
          "Supabase Pro incluye 100.000 usuarios activos y 8 GB, y una bitácora completa pesa " +
          "menos de 100 KB. A escala de cientos de usuarios la infraestructura es un costo " +
          "fijo, no variable. De ahí sale el margen."),
  tabla({
    anchos: [4760, 2300, 2300],
    cabecera: ["Rubro", "USD / mes", "COP / mes"],
    filas: [
      ...Object.entries(n.infraUsd).map(([k, v]) => [k, usd(v), cop(v * n.trm)]),
      [{ t: "Subtotal infraestructura", bold: true, fondo: C.suave },
       { t: usd(n.infraUsdTotal), bold: true, fondo: C.suave },
       { t: cop(n.infraCop), bold: true, fondo: C.suave }],
      [`Overhead asignado · ${pct(n.overheadPct)} de ${cop(n.overheadBase)}`, "—",
       cop(n.overheadCop)],
      [{ t: "COSTO FIJO TOTAL", bold: true, fondo: C.suave }, { t: "—", fondo: C.suave },
       { t: cop(n.costoFijo), bold: true, fondo: C.suave }],
      [{ t: "Costo fijo anual", bold: true }, { t: "—" },
       { t: cop(n.costoFijoAnual), bold: true }],
    ],
  }),
  parrafo(" ", { after: 40 }),
  h2("Los dos supuestos que mueven todo"),
  punto([texto(`TRM de ${cop(n.trm)}. `, { bold: true }),
         texto("La infraestructura se paga en dólares y el contrato se cobra en pesos. El " +
               "esquema financiero documenta un movimiento del 7 % en un solo mes (julio a " +
               "agosto de 2026). De ahí la cláusula de revisión extraordinaria por TRM.")]),
  punto([texto(`Overhead asignado del ${pct(n.overheadPct)}. `, { bold: true }),
         texto(`Es la porción del Escenario 1 —fundador solo, ${cop(n.overheadBase)}/mes— que ` +
               "consume esta línea: soporte a cohortes, mantenimiento evolutivo, carga de " +
               "contenido y atención comercial. Bajarlo al 25 % lleva el costo fijo a " +
               `${cop(n.infraCop + 0.25 * n.overheadBase)}; subirlo al 100 % lo lleva a ` +
               `${cop(n.infraCop + n.overheadBase)}.`)]),
  ...destacado([
    [texto("Si el precio se calculara solo contra la infraestructura", { bold: true })],
    [texto(`El costo sería ${cop(n.infraCop)}/mes y el punto de equilibrio caería a siete ` +
           "usuarios. Ese número es cierto y es inútil: no paga una hora de tu tiempo. " +
           "Fijar precio contra el costo directo es la forma más común de construir un " +
           "negocio que factura y no deja nada.")],
  ], "alerta"),
];

/* -------------------------------------------------------------- equilibrio */

const equilibrio = [
  h1("2 · Punto de equilibrio y sensibilidad"),
  parrafo([texto("Punto de equilibrio: ", { bold: true }),
           texto(`${n.equilibrio} usuarios activos. `),
           texto(`A ${cop(n.precioEntrada)} por usuario, ${n.equilibrio} usuarios facturan ` +
                 `${cop(n.equilibrio * n.precioEntrada)} contra un costo fijo de ` +
                 `${cop(n.costoFijo)}.`)]),
  tabla({
    anchos: [2200, 3200, 2000, 1960],
    cabecera: ["Usuarios", "Factura mensual", "Margen", "Lectura"],
    filas: n.sensibilidad.map((s) => {
      const lectura = s.margen < 0 ? "Pérdida"
        : s.margen < 0.20 ? "Frágil"
        : s.margen < 0.45 ? "Aceptable" : "Sano";
      const fondo = s.margen < 0 ? C.alertaSuave
        : s.margen >= 0.45 ? C.turquesaSuave : undefined;
      return [
        { t: String(s.usuarios), alignment: AlignmentType.LEFT, fondo },
        { t: cop(s.mensual), fondo },
        { t: pct(s.margen), fondo, bold: true },
        { t: lectura, alignment: AlignmentType.CENTER, fondo,
          color: s.margen < 0 ? C.alerta : s.margen >= 0.45 ? C.turquesa : undefined },
      ];
    }),
  }),
  parrafo(" ", { after: 40 }),
  ...destacado([
    [texto("El hallazgo incómodo: una cámara sola no basta.", { bold: true })],
    [texto(`El contrato tipo de 90 usuarios deja ${pct(n.contratoTipo.margen)} de margen. ` +
           "Cubre los costos y poco más: no financia desarrollo, ni un mes malo, ni tu " +
           "tiempo comercial para conseguir el siguiente cliente. La operación se vuelve " +
           "sana alrededor de los 150 usuarios, que en la práctica significa " +
           "dos cámaras. Conviene firmar la primera sabiendo que la segunda no es " +
           "opcional.")],
    [texto(`Y léase bien la primera fila: el mínimo facturable de ${n.minimoFacturable} ` +
           "usuarios pierde dinero contra el costo asignado completo. Ese piso no existe " +
           "para que un contrato de ese tamaño sea rentable —no lo es—, sino para impedir " +
           "contratos todavía peores. Un cliente de 50 usuarios solo tiene sentido " +
           "acompañado de otro que sí cargue con el costo fijo, o con el overhead asignado " +
           "repartido entre más líneas de producto.")],
  ], "alerta"),
  h2("El primer año del contrato tipo"),
  parrafo("El margen recurrente no cuenta toda la historia: la implementación se cobra una " +
          "vez y es la que hace tolerable el primer año de una cámara pequeña."),
  tabla({
    anchos: [4680, 2340, 2340],
    cabecera: [{ t: "Concepto", alignment: AlignmentType.LEFT }, "Valor",
               { t: "Naturaleza", alignment: AlignmentType.CENTER }],
    filas: [
      [{ t: `Implementación · ${n.contratoTipo.talleres} talleres`,
         alignment: AlignmentType.LEFT },
       cop(n.contratoTipo.implementacion),
       { t: "Única vez", alignment: AlignmentType.CENTER }],
      [{ t: `Suscripción · ${n.contratoTipo.usuarios} usuarios × 12 meses`,
         alignment: AlignmentType.LEFT },
       cop(n.contratoTipo.suscripcionAnual),
       { t: "Recurrente", alignment: AlignmentType.CENTER }],
      [{ t: "Ingreso año 1, antes de IVA", alignment: AlignmentType.LEFT, bold: true,
         fondo: C.suave },
       { t: cop(n.contratoTipo.totalAnio1), bold: true, fondo: C.suave },
       { t: "—", alignment: AlignmentType.CENTER, fondo: C.suave }],
      [{ t: "Costo fijo del año", alignment: AlignmentType.LEFT },
       cop(n.costoFijoAnual), { t: "—", alignment: AlignmentType.CENTER }],
      [{ t: "Resultado año 1", alignment: AlignmentType.LEFT, bold: true,
         fondo: C.turquesaSuave },
       { t: cop(n.contratoTipo.totalAnio1 - n.costoFijoAnual), bold: true,
         fondo: C.turquesaSuave },
       { t: pct((n.contratoTipo.totalAnio1 - n.costoFijoAnual) / n.contratoTipo.totalAnio1),
         alignment: AlignmentType.CENTER, fondo: C.turquesaSuave, bold: true }],
    ],
  }),
  parrafo([texto("Ojo con la trampa de este cuadro: ", { bold: true }),
           texto("el primer año se ve bien porque la implementación lo sostiene. El segundo " +
                 "año desaparece ese ingreso y la misma cámara cae al " +
                 `${pct(n.contratoTipo.margen)} de margen de la tabla anterior. La cifra que ` +
                 "hay que mirar para decidir si el negocio existe es la del año dos, no la " +
                 "del año uno.")], { before: 120 }),
  h2("Vender ancho, no profundo"),
  parrafo("Los escalones aplican por contrato, no sobre el total agregado de la empresa. " +
          "Dos contratos de 90 usuarios facturan más que uno de 180, porque ninguno de los " +
          "dos cruza al segundo escalón:"),
  tabla({
    anchos: [4680, 2340, 2340],
    cabecera: [{ t: "Escenario", alignment: AlignmentType.LEFT }, "Factura mensual", "Margen"],
    filas: [
      [{ t: "Dos cámaras de 90 usuarios", alignment: AlignmentType.LEFT,
         fondo: C.turquesaSuave },
       { t: cop(2 * 3780000), fondo: C.turquesaSuave, bold: true },
       { t: pct((2 * 3780000 - n.costoFijo) / (2 * 3780000)), fondo: C.turquesaSuave }],
      [{ t: "Una cámara de 180 usuarios", alignment: AlignmentType.LEFT },
       cop(7080000), pct((7080000 - n.costoFijo) / 7080000)],
    ],
  }),
  parrafo([texto("Consecuencia comercial: la prioridad es el número de cámaras firmadas, no " +
                 "el tamaño de cada cohorte. Un segundo cliente pequeño vale más que ampliar " +
                 "el primero.", { bold: true })], { before: 120 }),
];

/* ------------------------------------------------------- impuestos y caja */

const impuestos = [
  h1("3 · De la factura a la caja"),
  parrafo("El margen de la tabla anterior es contable. Lo que efectivamente entra a la " +
          "cuenta es menos, y conviene tenerlo presente antes de comprometer gastos."),
  tabla({
    anchos: [2900, 1900, 4560],
    cabecera: [{ t: "Concepto", alignment: AlignmentType.LEFT }, "Tarifa",
               { t: "Efecto", alignment: AlignmentType.LEFT }],
    filas: [
      ["IVA", "19 %", { t: "Se cobra al cliente y se transfiere a la DIAN. No es ingreso: " +
                           "es dinero ajeno que pasa por la cuenta.",
                        alignment: AlignmentType.LEFT }],
      ["Retención en la fuente", "4 %", { t: "La cámara la practica sobre el valor del " +
                                            "servicio y la descuenta de cada pago. Se " +
                                            "recupera al declarar renta, pero entre tanto es " +
                                            "caja que no está.", alignment: AlignmentType.LEFT }],
      ["ICA Medellín", "1 %", { t: "Sobre ingresos brutos, CIIU 6201. Autorretención del " +
                                   "100 % de la tarifa.", alignment: AlignmentType.LEFT }],
      ["4x1000", "0,4 %", { t: "Por retiro. Exento hasta 350 UVT al mes en una cuenta " +
                               "marcada: vale la pena marcarla.",
                            alignment: AlignmentType.LEFT }],
      ["Renta", "35 %", { t: "Sobre la utilidad. Evaluar el Régimen Simple con el contador " +
                             "antes de la primera declaración.", alignment: AlignmentType.LEFT }],
    ],
  }),
  parrafo(" ", { after: 40 }),
  parrafo([texto("Regla práctica: ", { bold: true }),
           texto("del valor facturado antes de IVA, cuente con disponer de alrededor del 95 % " +
                 "en el corto plazo (retención y ICA), y del 65 % después de renta sobre la " +
                 "utilidad.")]),
];

/* ------------------------------------------------------- guardarraíles */

const negociacion = [
  h1("4 · Guardarraíles de negociación"),
  tabla({
    anchos: [3400, 5960],
    cabecera: [{ t: "Variable", alignment: AlignmentType.LEFT },
               { t: "Límite", alignment: AlignmentType.LEFT }],
    filas: [
      [{ t: "Precio de entrada", alignment: AlignmentType.LEFT },
       { t: `${cop(n.precioEntrada)} por usuario/mes. Es el punto de partida de toda ` +
            "conversación.", alignment: AlignmentType.LEFT }],
      [{ t: "Precio piso absoluto", alignment: AlignmentType.LEFT, fondo: C.alertaSuave },
       { t: `${cop(n.precioPiso)} por usuario/mes. Por debajo de este número el producto no ` +
            "financia su propio desarrollo. No es una postura de negociación: es el límite.",
         alignment: AlignmentType.LEFT, fondo: C.alertaSuave, bold: true }],
      [{ t: "Mínimo facturable", alignment: AlignmentType.LEFT },
       { t: `${n.minimoFacturable} usuarios. No es negociable: un contrato de 20 usuarios no ` +
            "cubre ni la mitad del costo fijo.", alignment: AlignmentType.LEFT }],
      [{ t: "Implementación", alignment: AlignmentType.LEFT },
       { t: `${cop(n.implementacionPorTaller)} por taller. Es trabajo real de conversión de ` +
            "contenido; regalarla equivale a trabajar gratis dos semanas.",
         alignment: AlignmentType.LEFT }],
    ],
  }),
  parrafo(" ", { after: 40 }),
  h2("Qué ceder antes que bajar el precio unitario"),
  parrafo("El precio por usuario fija el techo de todas las renovaciones futuras: bajarlo un " +
          "10 % hoy cuesta ese 10 % cada año que dure la relación. Estas concesiones cuestan " +
          "una sola vez:"),
  punto("Dos meses de gracia al inicio, mientras la cohorte arranca."),
  punto("Descuento del 5 % por pago anual anticipado: mejora tu caja y no toca la tarifa."),
  punto("Tres o cuatro talleres de implementación sin costo."),
  punto("Un módulo adicional gratis en la primera renovación."),
  punto([texto("Y una que además te sirve: ", { italics: true }),
         texto("descuento a cambio de figurar como caso de referencia, con permiso escrito " +
               "para nombrar a la cámara ante otras cámaras. Es el activo comercial que más " +
               "vale cuando no tienes trayectoria.")]),
  ...destacado([
    [texto("Nunca conceder", { bold: true, color: C.alerta })],
    [texto("Exclusividad territorial sin una compensación que valga el mercado que cierra; " +
           "cesión de derechos sobre el software; ni renovación a precio congelado por más " +
           "de un año.")],
  ], "alerta"),
];

/* --------------------------------------------------- antes de vender */

const pendientes = [
  h1("5 · Lo que falta antes de cobrar"),
  parrafo("Tres asuntos abiertos. Ninguno impide preparar la propuesta; los tres impiden " +
          "firmar."),
  tabla({
    anchos: [3000, 4360, 2000],
    cabecera: [{ t: "Asunto", alignment: AlignmentType.LEFT },
               { t: "Por qué bloquea", alignment: AlignmentType.LEFT },
               { t: "Esfuerzo", alignment: AlignmentType.CENTER }],
    filas: [
      [{ t: "Panel de cohorte para la cámara", alignment: AlignmentType.LEFT,
         fondo: C.alertaSuave },
       { t: "Vendiendo la plataforma sola, el panel ES lo que compra la cámara: las empresas " +
            "usan la bitácora, la cámara quiere ver el avance de su cohorte. Hoy no existe; " +
            "la página que hay es una demostración con datos de ejemplo. El cálculo del " +
            "avance ya está resuelto en la base de datos, así que es trabajo de pantalla.",
         alignment: AlignmentType.LEFT, fondo: C.alertaSuave },
       { t: "Días", alignment: AlignmentType.CENTER, fondo: C.alertaSuave }],
      [{ t: "Control de accesos", alignment: AlignmentType.LEFT },
       { t: "El registro es abierto: cualquiera con el enlace crea una cuenta, se asigna a la " +
            "cohorte activa y recibe todos los módulos. Sin cupos no hay nada que vender.",
         alignment: AlignmentType.LEFT },
       { t: "Días", alignment: AlignmentType.CENTER }],
      [{ t: "Planes pagos de la infraestructura", alignment: AlignmentType.LEFT },
       { t: "El plan Hobby de Vercel prohíbe el uso comercial y el plan gratuito de Supabase " +
            "pausa el proyecto tras siete días sin actividad, con tres semanas de trabajo " +
            "autónomo entre sesiones. No se puede facturar desde donde está hoy.",
         alignment: AlignmentType.LEFT },
       { t: "1 hora", alignment: AlignmentType.CENTER }],
    ],
  }),
  parrafo(" ", { after: 40 }),
  h2("Y uno jurídico, antes del primer usuario registrado"),
  punto([texto("Contrato de transmisión de datos (Ley 1581 de 2012). ", { bold: true }),
         texto("La cámara es responsable del tratamiento y ALQUIMIA encargado. Debe estar " +
               "firmado antes de que se registre el primer empresario, no después.")]),
  punto([texto("Redacción del contrato. ", { bold: true }),
         texto("Debe decir «licencia de uso», nunca «desarrollo» ni «obra por encargo»: esa " +
               "palabra abre la discusión sobre quién es dueño del software.")]),
];

/* --------------------------------------------------------------------- armado */

const pie = new Footer({
  children: [new Paragraph({
    alignment: AlignmentType.CENTER,
    border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.linea, space: 8 } },
    children: [
      new TextRun({ text: "USO INTERNO · NO ENVIAR AL CLIENTE · página ",
                    font: FUENTE, size: 16, color: C.alerta, bold: true }),
      new TextRun({ children: [PageNumber.CURRENT], font: FUENTE, size: 16, color: C.alerta }),
      new TextRun({ text: " de ", font: FUENTE, size: 16, color: C.alerta }),
      new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FUENTE, size: 16, color: C.alerta }),
    ],
  })],
});

const doc = new Document({
  creator: "ALQUIMIA",
  title: "Sustentación de precio · USO INTERNO",
  description: "Estructura de costos, punto de equilibrio y guardarraíles de negociación. No enviar al cliente.",
  styles: estilos,
  numbering: numeracion,
  sections: [seccion([
    ...portada, ...costos, ...equilibrio, ...impuestos, ...negociacion, ...pendientes,
  ], { footers: { default: pie } })],
});

Packer.toBuffer(doc).then((b) => {
  fs.writeFileSync(SALIDA, b);
  console.log(`✓ ${path.relative(process.cwd(), SALIDA)} · ${(b.length / 1024).toFixed(0)} KB`);
});
