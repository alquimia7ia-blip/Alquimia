/* Arma la versión WEB de «Viaje al Futuro» a partir del artifact.
 *
 * El artifact NO lleva <!DOCTYPE>, <html>, <head> ni <body>: la plataforma de Claude pone
 * ese andamiaje al publicar. Fuera de ahí hay que ponerlo a mano, y lo más importante es
 * el <meta viewport>: SIN ÉL UN CELULAR RENDERIZA LA PÁGINA A 980 px Y SE VE DIMINUTA.
 * Ese solo detalle habría dañado el taller.
 *
 *   node docs/metodo/web/construir.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(AQUI, "..", "viaje-al-futuro.html"), "utf8");

const corte = src.indexOf('<div class="wrap">');
if (corte < 0) throw new Error("no encontré <div class=\"wrap\">: cambió la estructura del artifact");
const cabeza = src.slice(0, corte).trim();
const cuerpo = src.slice(corte).trim();

const pagina = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<!-- noindex: el enlace se abre sin cuenta, pero no queremos que salga en buscadores -->
<meta name="robots" content="noindex,nofollow">
<meta name="description" content="De la planta real al gemelo digital en tres pasos. Fábrica de Aprendizaje.">
<meta name="theme-color" content="#F7F6F3">
<meta name="color-scheme" content="light dark">
${cabeza}
</head>
<body>
${cuerpo}
</body>
</html>
`;
writeFileSync(join(AQUI, "index.html"), pagina);
writeFileSync(join(AQUI, "robots.txt"), "User-agent: *\nDisallow: /\n");
console.log("index.html  ", pagina.length, "bytes");
console.log("robots.txt   escrito");
