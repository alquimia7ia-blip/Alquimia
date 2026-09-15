/**
 * Empaqueta el Módulo 1 en un solo archivo .html que se abre sin servidor.
 *
 * Existe para lo que la plataforma no cubre: mandar el taller por correo,
 * dejarlo en una USB, abrirlo en un salón sin internet. No tiene cuentas ni
 * equipo — guarda en el navegador de quien lo abre — pero es el mismo motor
 * de campos y el mismo contenido que la versión con base de datos, así que
 * no hay una segunda versión que mantener.
 *
 *   pnpm exportar:html
 */
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const salida = resolve(raiz, "docs/brujula-empresarial-borrador.html");
const salidaTablero = resolve(raiz, "docs/brujula-conclusiones-borrador.html");

const comun = {
  bundle: true, write: false, minify: true, format: "iife",
  jsx: "automatic", target: ["es2020"], platform: "browser",
  define: { "process.env.NODE_ENV": '"production"' },
  alias: { "@": raiz },
  loader: { ".ts": "ts", ".tsx": "tsx" },
};

const uno = async (entrada) => (await build({
  ...comun, entryPoints: [resolve(raiz, entrada)],
})).outputFiles[0].text;

// El tema se aplica desde la misma función que usa el interruptor, no desde
// una copia: un archivo con dos reglas de tema distintas es un archivo roto.
const preTema = await uno("scripts/html/pretema.ts");
const js = await uno("scripts/html/entrada.tsx");
const jsTablero = await uno("scripts/html/conclusiones.tsx");
const css = ["app/tokens.css", "app/globals.css"]
  .map((f) => readFileSync(resolve(raiz, f), "utf8")).join("\n");

const FUENTES = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@600;700;800&display=swap";

// El favicon va incrustado: el archivo tiene que verse igual desde una USB.
const ICONO = "data:image/svg+xml;base64," +
  readFileSync(resolve(raiz, "app/icon.svg")).toString("base64");

// Las fuentes se piden a Google, pero cada familia declara alternativas del
// sistema en tokens.css: sin internet el archivo se ve distinto, no roto.
const pagina = (titulo, descripcion, guion) => `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titulo}</title>
<meta name="description" content="${descripcion}">
<link rel="icon" href="${ICONO}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FUENTES}">
<script>${preTema}</script>
<style>
${css}
</style>
</head>
<body>
<div id="raiz"></div>
<script>
${guion}
</script>
</body>
</html>
`;

const html = pagina(
  "Brújula empresarial · Los talleres",
  "Los talleres del programa Empresas con Propósito MEGA, guiados y con avance en vivo.",
  js,
);

const htmlTablero = pagina(
  "Brújula empresarial · Conclusiones",
  "Las conclusiones que salen de cruzar las respuestas de la bitácora.",
  jsTablero,
);

mkdirSync(dirname(salida), { recursive: true });
for (const [ruta, contenido] of [[salida, html], [salidaTablero, htmlTablero]]) {
  writeFileSync(ruta, contenido);
  const kb = (Buffer.byteLength(contenido) / 1024).toFixed(0);
  console.log(`✓ ${ruta.replace(raiz + "/", "")} · ${kb} KB`);
}
