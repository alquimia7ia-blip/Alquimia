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
const salida = resolve(raiz, "docs/bitacora-mega-modulo-1.html");

const { outputFiles } = await build({
  entryPoints: [resolve(raiz, "scripts/html/entrada.tsx")],
  bundle: true, write: false, minify: true, format: "iife",
  jsx: "automatic", target: ["es2020"], platform: "browser",
  define: { "process.env.NODE_ENV": '"production"' },
  alias: { "@": raiz },
  loader: { ".ts": "ts", ".tsx": "tsx" },
});

const js = outputFiles[0].text;
const css = ["app/tokens.css", "app/globals.css"]
  .map((f) => readFileSync(resolve(raiz, f), "utf8")).join("\n");

const FUENTES = "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,800&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;600&display=swap";

// Las fuentes se piden a Google, pero cada familia declara alternativas del
// sistema en tokens.css: sin internet el archivo se ve distinto, no roto.
const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Bitácora MEGA · Módulo 1 · Entorno empresarial</title>
<meta name="description" content="Los once talleres del Módulo 1 del programa Empresas con Propósito MEGA, guiados y con avance en vivo.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FUENTES}">
<style>
${css}
</style>
</head>
<body>
<div id="raiz"></div>
<script>
${js}
</script>
</body>
</html>
`;

mkdirSync(dirname(salida), { recursive: true });
writeFileSync(salida, html);
const kb = (Buffer.byteLength(html) / 1024).toFixed(0);
console.log(`✓ ${salida.replace(raiz + "/", "")} · ${kb} KB`);
