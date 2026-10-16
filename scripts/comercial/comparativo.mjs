/**
 * Comparativo comercial: la plataforma frente al formato de archivos.
 *
 * Es la pieza que se entrega a quien decide —la Cámara, el comité, el área
 * de formación empresarial— cuando ya vieron la herramienta y hay que
 * responder la pregunta que de verdad importa: por qué cambiar lo que ya
 * funciona. Por eso no describe funciones: compara tareas concretas del
 * programa, las que hoy cuestan trabajo, con lo que pasa con cada una en la
 * plataforma.
 *
 * Tres páginas y ni una más. Un documento comercial largo no se lee, y este
 * se entrega en una reunión donde ya hablaron treinta minutos.
 *
 * Se arma como HTML y se imprime con Chromium porque el control tipográfico
 * y de color que pide un documento de venta no se consigue con un .docx
 * generado por programa —que además cada quien abre con una fuente distinta—.
 * La paleta y la tipografía son las de `app/tokens.css`: el documento y el
 * producto tienen que verse de la misma familia.
 *
 *   node scripts/comercial/comparativo.mjs
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

// Playwright es una herramienta de oficina, no una dependencia del producto:
// vive fuera del proyecto y se resuelve como CommonJS, que es lo que sabe
// buscar en las rutas globales. Un `import` de ESM no las mira.
const { chromium } = createRequire(import.meta.url)("playwright");

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const salida = resolve(raiz, "docs/comercial/comparativo-plataforma.pdf");

/**
 * Las capturas se incrustan, no se enlazan: el HTML se imprime con
 * `setContent`, que no tiene URL base, así que una ruta relativa no cargaría y
 * el PDF saldría con dos huecos blancos sin avisar. Si falta el archivo, el
 * guion falla aquí y no más adelante, en silencio.
 */
const imagen = (nombre) => {
  const ruta = resolve(raiz, "docs/comercial/capturas", nombre);
  return `data:image/png;base64,${readFileSync(ruta).toString("base64")}`;
};
const CAPTURA_TALLER = imagen("taller.png");
const CAPTURA_TABLERO = imagen("tablero.png");

/** Paleta de `app/tokens.css`, tema claro. */
const C = {
  texto: "#0F1B2D", apagado: "#48566B", tenue: "#68748A",
  acento: "#14497E", acento2: "#1B6AB5", acentoSuave: "#E9F0F8", acentoLinea: "#BBD1E8",
  linea: "#D5DCE5", linea2: "#E6EBF1", superficie2: "#F6F9FC",
  favorable: "#1C7A4B", favorableSuave: "#E6F2EB",
  alerta: "#B3261E",
  pista: "#0C7A6F", pistaSuave: "#E4F6F3", pistaLinea: "#A2DCD4",
};

/**
 * Las ocho filas del comparativo.
 *
 * Cada una es una tarea real del programa, no una función del software. El
 * orden no es casual: arriba lo que la empresa sufre, en medio lo que el
 * facilitador sufre, abajo lo que la Cámara necesita para sustentar el
 * programa ante terceros.
 */
const FILAS = [
  {
    tarea: "Dónde queda lo que la empresa escribió",
    antes: "En un archivo, en el computador de quien asistió ese día.",
    ahora: "En su bitácora, en línea. Se guarda solo, mientras escribe.",
  },
  {
    tarea: "Retomar el trabajo después de la sesión",
    antes: "Hay que encontrar el archivo y acordarse de cuál era la versión buena.",
    ahora: "Entra con su correo y sigue donde quedó, desde cualquier equipo.",
  },
  {
    tarea: "Trabajar entre varias personas de la empresa",
    antes: "Se lo pasan por correo y cada quien edita su copia.",
    ahora: "Varias personas en la misma bitácora, viendo lo mismo.",
  },
  {
    tarea: "Saber cómo va la cohorte",
    antes: "Preguntando una por una, o esperando a la siguiente sesión.",
    ahora: "Tablero con el avance de cada empresa, al día.",
  },
  {
    tarea: "Consolidar lo que respondieron 20 empresas",
    antes: "Abrir 20 archivos y copiar a mano a una hoja de cálculo.",
    ahora: "Ya está consolidado: es la misma base para todas.",
  },
  {
    tarea: "Entregarle a la empresa un informe de su trabajo",
    antes: "Armarlo a mano, empresa por empresa.",
    ahora: "Se genera con lo que ella misma respondió, en un clic.",
  },
  {
    tarea: "Que una empresa no vea lo de su competencia",
    antes: "Depende de a quién se le reenvíe el archivo.",
    ahora: "Cada empresa solo accede a lo suyo. Lo impide la base de datos, no una norma de uso.",
  },
  {
    tarea: "Sustentar el programa con evidencia",
    antes: "Recoger los archivos y contar a mano al final.",
    ahora: "Los datos quedan medibles desde el primer día.",
  },
];

const GANANCIAS = [
  {
    quien: "La empresa",
    puntos: [
      "No vuelve a perder lo que escribió.",
      "Se lleva un informe propio de su diagnóstico.",
      "Puede avanzar entre sesión y sesión, sin esperar al facilitador.",
    ],
  },
  {
    quien: "El facilitador",
    puntos: [
      "Llega a la sesión sabiendo quién avanzó y quién no.",
      "Deja de perseguir archivos por correo y WhatsApp.",
      "Dedica la hora de taller a acompañar, no a recoger formatos.",
    ],
  },
  {
    quien: "La Cámara",
    puntos: [
      "Cifras de participación y avance sin trabajo manual.",
      "El contenido del programa queda como un activo reutilizable.",
      "Una cohorte nueva se abre sin volver a armar los formatos.",
    ],
  },
];

const ADAPTACIONES = [
  ["Imagen institucional", "Logo, colores y tipografía de la Cámara. La aplicación ya separa la identidad visual del contenido: es un cambio de configuración, no un rediseño."],
  ["Contenido de los talleres", "Cada taller es un documento que se define y se publica. Cambiar una pregunta, agregar un ejercicio o reordenar un módulo no exige reprogramar la aplicación."],
  ["Tipos de ejercicio", "Preguntas abiertas, escalas, priorizaciones, matrices, cronogramas y tablas que calculan solas sus indicadores. Si el programa necesita uno nuevo, se construye."],
  ["Funcionalidades a la medida", "Indicadores propios, exportaciones, firmas, integración con los sistemas que ya usan, avisos automáticos. Lo que el programa necesite, se puede construir sobre esta misma base."],
];

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Comparativo · Plataforma frente a formatos de archivo</title>
<style>
  @page { size: Letter; margin: 14mm 15mm 13mm; }

  *{ box-sizing:border-box; margin:0; padding:0 }

  html{ -webkit-print-color-adjust:exact; print-color-adjust:exact }

  body{
    font-family:"Inter",system-ui,sans-serif;
    font-size:10.2pt; line-height:1.5; color:${C.texto};
    font-feature-settings:"cv05","ss01";
  }

  .hoja{ page-break-after:always }
  .hoja:last-child{ page-break-after:auto }

  /* --------------------------------------------------------- encabezados */
  .kicker{
    font-size:7.6pt; font-weight:600; letter-spacing:.1em; text-transform:uppercase;
    color:${C.acento2};
  }
  h1{
    font-family:"Inter Display","Inter",sans-serif;
    font-size:27pt; line-height:1.08; font-weight:800; letter-spacing:-.022em;
    color:${C.acento}; margin:7px 0 10px;
  }
  h2{
    font-family:"Inter Display","Inter",sans-serif;
    font-size:15pt; font-weight:700; letter-spacing:-.015em; color:${C.acento};
    margin:0 0 3px;
  }
  .lead{ font-size:11.6pt; line-height:1.48; color:${C.apagado}; max-width:60ch }
  .lead b{ color:${C.texto}; font-weight:600 }
  .sub{ font-size:9.3pt; color:${C.tenue}; margin-bottom:12px }

  .barra{ height:5px; background:${C.acento}; border-radius:3px; width:74px; margin-bottom:16px }

  /* ------------------------------------------------------------ tarjetas */
  .tres{ display:grid; grid-template-columns:repeat(3,1fr); gap:11px }
  .tarjeta{
    border:1px solid ${C.linea}; border-radius:12px; padding:13px 14px 14px;
    background:${C.superficie2};
  }
  .tarjeta .num{
    font-family:"Inter Display","Inter",sans-serif;
    font-size:19pt; font-weight:800; color:${C.acentoLinea}; line-height:1; margin-bottom:6px;
  }
  .tarjeta h3{ font-size:10.4pt; font-weight:700; color:${C.texto}; margin-bottom:5px; line-height:1.3 }
  .tarjeta p{ font-size:9.2pt; line-height:1.46; color:${C.apagado} }
  .compacta .tarjeta{ padding:11px 12px 12px }
  .compacta .tarjeta .num{ font-size:15pt; margin-bottom:4px }
  .compacta .tarjeta h3{ font-size:10pt }
  .compacta .tarjeta p{ font-size:8.8pt; line-height:1.42 }

  /* --------------------------------------------------------------- franja */
  .franja{
    background:${C.acento}; color:#fff; border-radius:12px; padding:15px 18px;
    display:flex; align-items:center; gap:16px;
  }
  .franja .texto{ font-size:10.6pt; line-height:1.45 }
  .franja b{ font-weight:700 }
  .franja .marca{
    font-family:"Inter Display","Inter",sans-serif;
    font-size:30pt; font-weight:800; line-height:.9; color:${C.acentoLinea};
    white-space:nowrap;
  }
  .franja .marca small{ display:block; font-size:7.4pt; font-weight:600; letter-spacing:.09em;
    text-transform:uppercase; color:#A9C6E6; margin-top:5px }

  /* ---------------------------------------------------------------- tabla */
  table{ width:100%; border-collapse:separate; border-spacing:0; margin-top:4px }
  th{ text-align:left; padding:0 0 7px; vertical-align:bottom }
  th .et{
    font-size:7.6pt; font-weight:700; letter-spacing:.09em; text-transform:uppercase;
  }
  th .nom{ font-size:10.8pt; font-weight:700; letter-spacing:-.01em; display:block; margin-top:1px }
  .col-antes .et, .col-antes .nom{ color:${C.tenue} }
  .col-ahora .et, .col-ahora .nom{ color:${C.acento} }

  td{ padding:8px 11px; vertical-align:top; font-size:9.1pt; line-height:1.42 }
  td.tarea{
    padding-left:0; width:27%; font-weight:650; font-size:9.3pt; color:${C.texto};
  }
  td.antes{ width:34.5%; color:${C.tenue}; background:#FAFBFC }
  td.ahora{ width:38.5%; color:${C.texto}; background:${C.acentoSuave} }
  tbody tr td{ border-top:1px solid ${C.linea2} }
  tbody tr:first-child td{ border-top:1px solid ${C.linea} }
  tbody tr:first-child td.antes{ border-top-left-radius:10px; border-top-right-radius:10px }
  tbody tr:first-child td.ahora{ border-top-left-radius:10px; border-top-right-radius:10px }
  tbody tr:last-child td.antes{ border-bottom-left-radius:10px; border-bottom-right-radius:10px }
  tbody tr:last-child td.ahora{ border-bottom-left-radius:10px; border-bottom-right-radius:10px }
  tbody tr:last-child td{ border-bottom:1px solid ${C.linea2} }
  td.antes, td.ahora{ border-left:1px solid ${C.linea2}; border-right:1px solid ${C.linea2} }

  .mk{ font-weight:800; margin-right:5px }
  .mk.no{ color:#C0806E }
  .mk.si{ color:${C.favorable} }

  /* ---------------------------------------------------------- adaptación */
  .adapta{ border:1px solid ${C.pistaLinea}; background:${C.pistaSuave}; border-radius:12px; padding:13px 15px }
  .adapta h2{ color:${C.pista}; font-size:13.4pt }
  .adapta .intro{ font-size:9.5pt; color:${C.apagado}; margin-bottom:9px; max-width:72ch }
  .adapta dl{ display:grid; grid-template-columns:repeat(2,1fr); gap:7px 16px }
  .adapta dt{ font-size:9.4pt; font-weight:700; color:${C.pista}; margin-bottom:1px }
  .adapta dd{ font-size:8.9pt; line-height:1.44; color:${C.apagado} }

  .prueba{
    margin-top:10px; border-left:3px solid ${C.pista}; padding:2px 0 2px 11px;
    font-size:9.3pt; line-height:1.45; color:${C.texto};
  }
  .prueba b{ color:${C.pista} }

  /* ------------------------------------------------------------- ganancias */
  .gana{ border:1px solid ${C.linea}; border-radius:12px; padding:11px 13px; background:#fff }
  .gana h3{
    font-family:"Inter Display","Inter",sans-serif;
    font-size:11.2pt; font-weight:700; color:${C.acento}; margin-bottom:7px;
    padding-bottom:6px; border-bottom:1px solid ${C.acentoLinea};
  }
  .gana li{ list-style:none; font-size:9.1pt; line-height:1.44; color:${C.apagado};
    padding-left:14px; position:relative; margin-bottom:6px }
  .gana li:last-child{ margin-bottom:0 }
  .gana li::before{
    content:"→"; position:absolute; left:0; top:0; color:${C.acento2}; font-weight:700;
  }

  /* ---------------------------------------------------------------- cierre */
  .cierre{
    border-top:2px solid ${C.acento}; margin-top:auto; padding-top:11px;
    display:flex; justify-content:space-between; align-items:flex-end; gap:20px;
  }
  .cierre .frase{ font-size:10.2pt; line-height:1.45; color:${C.texto}; max-width:52ch }
  .cierre .frase b{ color:${C.acento}; font-weight:700 }
  .cierre .firma{ text-align:right; font-size:8.4pt; line-height:1.5; color:${C.tenue}; white-space:nowrap }
  .cierre .firma .n{
    font-family:"Inter Display","Inter",sans-serif;
    font-size:12.4pt; font-weight:800; color:${C.acento}; letter-spacing:.02em; display:block;
  }

  .pie{ display:block; margin-top:7px; font-size:7.4pt; line-height:1.35; color:${C.tenue} }

  /* ------------------------------------------------------------- capturas */
  .captura{
    border:1px solid ${C.linea}; border-radius:12px; overflow:hidden;
    background:#fff; position:relative;
  }
  /* La pantalla sigue hacia abajo: el desvanecido lo dice sin fingir que la
     captura terminó donde termina el recorte. */
  .captura::after{
    content:""; position:absolute; left:0; right:0; bottom:0; height:10mm;
    background:linear-gradient(to bottom, rgba(241,244,248,0), #F1F4F8 92%);
  }
  .captura .barra-v{
    height:21px; background:${C.superficie2}; border-bottom:1px solid ${C.linea2};
    display:flex; align-items:center; gap:5px; padding-left:10px;
  }
  .captura .punto{ width:7px; height:7px; border-radius:50%; background:${C.linea} }
  .captura img{ display:block; width:100%; }
  /* El tablero es alto; en la página solo cabe —y solo hace falta— su parte
     de arriba: el anillo de avance y las conclusiones. */
  .captura.banda img{ height:52mm; object-fit:cover; object-position:top center }
  /* El recorte caía a mitad de una tarjeta. El desvanecido lo vuelve
     intencional: se entiende que la pantalla sigue hacia abajo. */
  .captura.banda::after{
    content:""; position:absolute; left:0; right:0; bottom:0; height:17mm;
    background:linear-gradient(to bottom, rgba(241,244,248,0), #F1F4F8 88%);
  }
  .epigrafe{
    margin-top:6px; font-size:8.3pt; line-height:1.4; color:${C.tenue};
  }
  .epigrafe b{ color:${C.acento}; font-weight:650 }

  .v{ display:flex; flex-direction:column; min-height:241mm }
  .crece{ flex:1 }
  .sep-s{ height:12px } .sep-m{ height:13px } .sep-l{ height:22px }
</style>
</head>
<body>

<!-- ═══════════════════════════════════════════════ 1 · portada y producto -->
<section class="hoja v">
  <div>
    <div class="barra"></div>
    <div class="kicker">Empresas con Propósito MEGA · Cámara de Comercio del Aburrá Sur</div>
    <h1>Del archivo suelto<br>a la plataforma</h1>
    <p class="lead">
      El programa no cambia: cambia dónde vive el trabajo de las empresas. Hoy vive
      en archivos de Word, Excel y PowerPoint que se reparten por correo.
      <b>Esta es la comparación, tarea por tarea, de lo que eso cuesta y de lo que se
      gana al moverlo a una plataforma.</b>
    </p>
  </div>

  <div class="sep-m"></div>

  <div>
    <div class="captura">
      <div class="barra-v"><i class="punto"></i><i class="punto"></i><i class="punto"></i></div>
      <img src="${CAPTURA_TALLER}" alt="Taller de la Brújula empresarial">
    </div>
    <p class="epigrafe">
      <b>El Módulo 1, tal como lo ve la empresa.</b> El mismo contenido del formato
      actual: los mismos ejercicios, las mismas preguntas. Lo que cambia es que cada
      respuesta queda guardada, el avance se mide solo y nadie tiene que mandar
      nada por correo.
    </p>
  </div>

  <div class="crece"></div>

  <div class="franja">
    <div class="marca">1<small>sola fuente</small></div>
    <div class="texto">
      La plataforma no agrega pasos al programa: <b>quita el paso de recoger, ordenar
      y consolidar archivos.</b> El trabajo de cada empresa queda donde debe estar
      —en un solo lugar, siempre disponible, siempre en su última versión— y el
      facilitador lo ve sin pedirlo.
    </div>
  </div>

  <div class="sep-s"></div>

  <div class="cierre">
    <div class="frase">
      Lo que sigue son <b>ocho tareas reales del programa</b>, comparadas una a una.
    </div>
    <div class="firma">
      <span class="n">ALQUIMIA</span>
      Brújula empresarial
    </div>
  </div>
</section>

<!-- ═══════════════════════════════════════════════════ 2 · el comparativo -->
<section class="hoja v">
  <div>
    <div class="barra"></div>
    <h2 style="font-size:19pt">Tarea por tarea</h2>
    <p class="sub">Las mismas actividades del programa, en los dos formatos.</p>

    <table>
      <thead>
        <tr>
          <th></th>
          <th class="col-antes" style="padding-left:11px">
            <span class="et">Formato actual</span>
            <span class="nom">Word · Excel · PowerPoint</span>
          </th>
          <th class="col-ahora" style="padding-left:11px">
            <span class="et">Propuesta</span>
            <span class="nom">Brújula empresarial</span>
          </th>
        </tr>
      </thead>
      <tbody>
        ${FILAS.map((f) => `
        <tr>
          <td class="tarea">${f.tarea}</td>
          <td class="antes"><span class="mk no">✕</span>${f.antes}</td>
          <td class="ahora"><span class="mk si">✓</span>${f.ahora}</td>
        </tr>`).join("")}
      </tbody>
    </table>
  </div>

  <div class="crece"></div>

  <div style="margin-top:7mm">
    <div class="captura banda">
      <div class="barra-v"><i class="punto"></i><i class="punto"></i><i class="punto"></i></div>
      <img src="${CAPTURA_TABLERO}" alt="Tablero de conclusiones de una bitácora">
    </div>
    <p class="epigrafe">
      <b>Las dos últimas filas, en una pantalla.</b> El avance de la bitácora y las
      conclusiones del módulo se arman con lo que la empresa ya respondió. Nadie
      las transcribe: por eso están listas el mismo día y no tres semanas después.
    </p>
  </div>

  <div class="sep-s"></div>

  <div class="cierre">
    <div class="frase">
      Ninguna de estas filas depende de que las empresas usen mejor el formato.
      <b>Dependen del formato.</b>
    </div>
    <div class="firma">
      <span class="n">ALQUIMIA</span>
      Brújula empresarial
    </div>
  </div>
</section>

<!-- ════════════════════════════════════════ 3 · beneficios y adaptación -->
<section class="hoja v">
  <div>
    <div class="barra"></div>
    <h2 style="font-size:19pt">Qué gana cada quien</h2>
    <p class="sub">El mismo cambio, visto desde los tres lados.</p>
    <div class="tres">
      ${GANANCIAS.map((g) => `
      <div class="gana">
        <h3>${g.quien}</h3>
        <ul>${g.puntos.map((x) => `<li>${x}</li>`).join("")}</ul>
      </div>`).join("")}
    </div>
  </div>

  <div class="sep-m"></div>

  <div class="adapta">
    <h2>Se adapta a lo que ustedes necesiten</h2>
    <p class="intro">
      La plataforma está construida para cambiar: el contenido, la imagen y las
      funciones son piezas independientes del motor que las ejecuta. Ajustarla no
      es rehacerla.
    </p>
    <dl>
      ${ADAPTACIONES.map(([t, d]) => `<div><dt>${t}</dt><dd>${d}</dd></div>`).join("")}
    </dl>
    <p class="prueba">
      <b>Y está probado, no prometido.</b> Sobre este mismo motor ya se montó un
      segundo programa completo y distinto —23 talleres de Lean Manufacturing, con
      ejercicios, indicadores y tablas de cálculo propios— sin rehacer la
      aplicación. Lo que se pida para el MEGA se hace igual.
    </p>
  </div>

  <div class="sep-m"></div>

  <div class="compacta">
    <h2>Cómo se empieza</h2>
    <p class="sub">Sin migración, sin riesgo y sin tocar la cohorte en curso.</p>
    <div class="tres">
      <div class="tarjeta">
        <div class="num">01</div>
        <h3>Una cohorte piloto</h3>
        <p>Se carga la lista de empresas y cada una recibe su acceso por correo.
           Ese mismo día ya hay bitácoras abiertas.</p>
      </div>
      <div class="tarjeta">
        <div class="num">02</div>
        <h3>El contenido que ya existe</h3>
        <p>Los talleres se montan tal como están hoy. No hay que reescribir el
           método ni cambiar la metodología.</p>
      </div>
      <div class="tarjeta">
        <div class="num">03</div>
        <h3>Ajustes sobre la marcha</h3>
        <p>Imagen, ejercicios y reportes se afinan con lo que diga el facilitador
           en las primeras sesiones.</p>
      </div>
    </div>
  </div>

  <div class="crece"></div>

  <div class="cierre">
    <div class="frase">
      El programa ya tiene método, facilitadores y empresas.
      <b>Lo único que le falta es dejar de depender de archivos sueltos.</b>
      <span class="pie">Documento preparado por ALQUIMIA para la Cámara de Comercio
      del Aburrá Sur · Programa Empresas con Propósito MEGA.</span>
    </div>
    <div class="firma">
      <span class="n">ALQUIMIA</span>
      Productos digitales con IA · Medellín<br>
      alquimia7.ia@gmail.com
    </div>
  </div>
</section>
</body>
</html>`;

mkdirSync(dirname(salida), { recursive: true });

const navegador = await chromium.launch();
const pagina = await navegador.newPage();
await pagina.setContent(html, { waitUntil: "load" });
await pagina.emulateMedia({ media: "print" });
await pagina.pdf({
  path: salida,
  format: "Letter",
  printBackground: true,
  preferCSSPageSize: true,
});
await navegador.close();

// El HTML se guarda al lado: sirve para revisar el diseño en el navegador sin
// volver a generar el PDF, y para que un cambio de texto sea verificable.
writeFileSync(salida.replace(/\.pdf$/, ".html"), html);

console.log(`Comparativo generado: ${salida}`);
