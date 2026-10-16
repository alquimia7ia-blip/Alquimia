/**
 * Comparativo comercial: la plataforma frente a los archivos.
 *
 * La primera versión de este documento era densa: ocho filas, tarjetas,
 * bloques de color y párrafos de tres líneas. Se entendía leyéndolo con
 * calma, que es justo lo que nadie hace en una reunión. Esta versión está
 * escrita para que se entienda de un vistazo y sin diccionario: frases
 * cortas, palabras de todos los días, una idea por línea y mucho blanco
 * alrededor. Si una frase necesita leerse dos veces, está mal escrita.
 *
 * Tres páginas: qué es, en qué se diferencia, y qué se puede cambiar.
 *
 * Se arma como HTML y se imprime con Chromium porque el control tipográfico
 * que pide un documento de venta no se consigue con un .docx generado por
 * programa. La paleta y la tipografía son las de `app/tokens.css`: el
 * documento y el producto tienen que verse de la misma familia.
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
 * `setContent`, que no tiene URL base, así que una ruta relativa no cargaría
 * y el PDF saldría con dos huecos blancos sin avisar. Si falta el archivo, el
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
  texto: "#0F1B2D", apagado: "#48566B", tenue: "#7A8699",
  acento: "#14497E", linea: "#E2E7EE",
  verde: "#1C7A4B",
};

/**
 * Las seis diferencias.
 *
 * Una pregunta y dos respuestas, todas de una línea. Seis y no ocho porque la
 * séptima ya no se lee: en una lista corta cada fila pesa, en una larga todas
 * se vuelven ruido.
 */
const FILAS = [
  {
    pregunta: "¿Dónde queda lo que escribieron?",
    antes: "En un archivo, en un computador.",
    ahora: "En internet. Siempre está ahí.",
  },
  {
    pregunta: "¿Y si quieren seguir mañana?",
    antes: "Hay que buscar cuál era el archivo bueno.",
    ahora: "Entran con su correo y siguen.",
  },
  {
    pregunta: "¿Y si son varias personas?",
    antes: "Cada quien edita su propia copia.",
    ahora: "Todos escriben en el mismo lugar.",
  },
  {
    pregunta: "¿Cómo se sabe quién va atrasado?",
    antes: "Preguntándole a cada empresa.",
    ahora: "Se ve en una pantalla, al instante.",
  },
  {
    pregunta: "¿Quién arma el informe final?",
    antes: "Alguien, a mano, empresa por empresa.",
    ahora: "Se arma solo con lo que ya escribieron.",
  },
  {
    pregunta: "¿Una empresa puede ver lo de otra?",
    antes: "Sí, si alguien le reenvía el archivo.",
    ahora: "No. Cada una ve solo lo suyo.",
  },
];

/** Lo que se puede cambiar. Cuatro, de una línea cada uno. */
const CAMBIOS = [
  ["Los colores y el logo", "Para que se vea de la Cámara, no nuestro."],
  ["Las preguntas", "Se cambian, se quitan o se agregan cuando quieran."],
  ["Los ejercicios", "Tablas, escalas, cronogramas, lo que el taller necesite."],
  ["Lo que falte", "Si lo necesitan y no está, se construye."],
];

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>El mismo taller, dos maneras de hacerlo</title>
<style>
  @page { size: Letter; margin: 20mm 19mm 16mm; }
  *{ box-sizing:border-box; margin:0; padding:0 }
  html{ -webkit-print-color-adjust:exact; print-color-adjust:exact }

  body{
    font-family:"Inter",system-ui,sans-serif;
    font-size:12pt; line-height:1.55; color:${C.texto};
    background:#fff;
  }

  .hoja{ page-break-after:always; display:flex; flex-direction:column; min-height:235mm }
  .hoja:last-child{ page-break-after:auto }
  .crece{ flex:1 }

  .marca{
    font-size:8pt; font-weight:600; letter-spacing:.14em; text-transform:uppercase;
    color:${C.tenue};
  }

  h1{
    font-family:"Inter Display","Inter",sans-serif;
    font-size:33pt; line-height:1.1; font-weight:800; letter-spacing:-.025em;
    color:${C.acento}; margin:10px 0 14px;
  }
  h2{
    font-family:"Inter Display","Inter",sans-serif;
    font-size:23pt; line-height:1.15; font-weight:800; letter-spacing:-.02em;
    color:${C.acento}; margin:0 0 22px;
  }
  .entrada{ font-size:13.5pt; line-height:1.5; color:${C.apagado}; max-width:44ch }

  /* ------------------------------------------------------------- capturas */
  .captura{ border:1px solid ${C.linea}; border-radius:10px; overflow:hidden; position:relative }
  .captura img{ display:block; width:100% }
  .captura.corta img{ height:46mm; object-fit:cover; object-position:top center }
  .captura::after{
    content:""; position:absolute; left:0; right:0; bottom:0; height:9mm;
    background:linear-gradient(to bottom, rgba(255,255,255,0), #fff 92%);
  }
  .pie-img{ margin-top:9px; font-size:10pt; line-height:1.45; color:${C.tenue} }

  /* ----------------------------------------------------------------- filas */
  .fila{ padding:22px 0; border-top:1px solid ${C.linea} }
  .fila:last-of-type{ border-bottom:1px solid ${C.linea} }
  .fila .q{
    font-size:12.6pt; font-weight:700; color:${C.texto}; margin-bottom:9px;
    letter-spacing:-.01em;
  }
  .par{ display:grid; grid-template-columns:1fr 1fr; gap:14px }
  /* Las etiquetas van una sola vez, arriba. Repetirlas en cada fila era
     doce líneas de letra pequeña diciendo lo mismo. */
  .encabezado{ margin-bottom:4px }
  .encabezado span{
    font-size:8pt; font-weight:700; letter-spacing:.12em; text-transform:uppercase;
  }
  .encabezado .a{ color:${C.tenue} }
  .encabezado .b{ color:${C.verde} }
  .antes{ font-size:11pt; color:${C.tenue} }
  .ahora{ font-size:11pt; color:${C.texto}; font-weight:500 }

  /* ---------------------------------------------------------------- cambios */
  .cambio{ display:flex; gap:14px; align-items:baseline; padding:11px 0 }
  .cambio + .cambio{ border-top:1px solid ${C.linea} }
  .cambio .t{ font-size:12.4pt; font-weight:700; width:42%; letter-spacing:-.01em }
  .cambio .d{ font-size:11pt; color:${C.apagado}; flex:1 }

  .nota{
    margin-top:24px; padding-left:14px; border-left:3px solid ${C.acento};
    font-size:11.4pt; line-height:1.5; color:${C.texto}; max-width:62ch;
  }
  .nota b{ color:${C.acento} }

  /* ----------------------------------------------------------------- cierre */
  .remate{
    font-family:"Inter Display","Inter",sans-serif;
    font-size:17pt; line-height:1.3; font-weight:700; letter-spacing:-.02em;
    color:${C.acento}; max-width:40ch;
  }
  .firma{
    margin-top:18px; padding-top:13px; border-top:1px solid ${C.linea};
    display:flex; justify-content:space-between; align-items:baseline;
    font-size:9.4pt; color:${C.tenue};
  }
  .firma .n{ font-weight:800; color:${C.acento}; letter-spacing:.02em; font-size:11pt }
</style>
</head>
<body>

<!-- ═══════════════════════════════════════════════════════════ 1 · qué es -->
<section class="hoja">
  <div class="marca">Brújula empresarial · para la Cámara de Comercio del Aburrá Sur</div>
  <h1>El mismo taller.<br>Dos maneras<br>de hacerlo.</h1>
  <p class="entrada">
    Hoy el taller se llena en archivos de Word, Excel o PowerPoint.
    Esta es la otra manera.
  </p>

  <div class="crece"></div>

  <div>
    <div class="captura">
      <img src="${CAPTURA_TALLER}" alt="El taller en la plataforma">
    </div>
    <p class="pie-img">
      Es el mismo taller de siempre, con las mismas preguntas.
      Lo único que cambia es dónde se escriben.
    </p>
  </div>

  <div class="firma">
    <span class="n">ALQUIMIA</span>
    <span>Medellín</span>
  </div>
</section>

<!-- ═════════════════════════════════════════════════════ 2 · la diferencia -->
<section class="hoja">
  <h2>¿Cuál es la diferencia?</h2>

  <div class="par encabezado">
    <span class="a">Con archivos</span>
    <span class="b">Con la plataforma</span>
  </div>

  ${FILAS.map((f) => `
  <div class="fila">
    <div class="q">${f.pregunta}</div>
    <div class="par">
      <div class="antes">${f.antes}</div>
      <div class="ahora">${f.ahora}</div>
    </div>
  </div>`).join("")}

  <div class="crece"></div>

  <div class="nota">
    Ninguna de estas diferencias se arregla usando mejor los archivos.
    <b>Son del archivo, no de quien lo llena.</b>
  </div>

  <div class="firma">
    <span class="n">ALQUIMIA</span>
    <span>Brújula empresarial</span>
  </div>
</section>

<!-- ═══════════════════════════════════════════════ 3 · se puede cambiar -->
<section class="hoja">
  <h2>Todo se puede cambiar</h2>

  ${CAMBIOS.map(([t, d]) => `
  <div class="cambio">
    <div class="t">${t}</div>
    <div class="d">${d}</div>
  </div>`).join("")}

  <div class="nota">
    <b>Esto ya está probado.</b> Con la misma plataforma hicimos un segundo
    programa completo, de otro tema y con otros ejercicios: 23 talleres de Lean
    Manufacturing. No hubo que empezar de cero.
  </div>

  <div style="margin-top:26px">
    <div class="captura corta">
      <img src="${CAPTURA_TABLERO}" alt="El resumen de una empresa">
    </div>
    <p class="pie-img">
      Y al final, cada empresa recibe su propio resumen. Nadie lo escribe:
      sale de lo que ella misma respondió.
    </p>
  </div>

  <div class="crece"></div>

  <p class="remate">
    El programa ya tiene todo lo demás.<br>
    Solo le falta salir de los archivos.
  </p>

  <div class="firma">
    <span class="n">ALQUIMIA</span>
    <span>alquimia7.ia@gmail.com</span>
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
