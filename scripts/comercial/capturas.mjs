/**
 * Capturas del producto para las piezas comerciales.
 *
 * Se toman de los archivos autónomos de `docs/` —el taller y el tablero
 * exportados con `pnpm exportar:html`— y no de la aplicación desplegada, por
 * una razón práctica: abren sin servidor, sin base de datos y sin cuentas, así
 * que la imagen se puede regenerar en cualquier parte y sale siempre igual.
 *
 * Dos retoques antes de disparar, los dos sobre cosas que existen solo en el
 * archivo de demostración y no en el producto: la etiqueta «banco de pruebas»
 * y los botones de la página de ensayo. Nada de lo que se ve está maquillado:
 * las respuestas marcadas se marcan de verdad, pulsando.
 *
 *   node scripts/comercial/capturas.mjs
 */
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const { chromium } = createRequire(import.meta.url)("playwright");

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const destino = resolve(raiz, "docs/comercial/capturas");
mkdirSync(destino, { recursive: true });

const VENTANA = { width: 1340, height: 860 };

/** Oculta lo que pertenece al archivo de prueba, no al producto. */
const limpiar = () => {
  document.querySelectorAll("*").forEach((n) => {
    if (n.children.length === 0 && /Banco de pruebas/i.test(n.textContent ?? "")) {
      (n.closest("div,span,p") ?? n).style.visibility = "hidden";
    }
  });
  document.querySelectorAll("button").forEach((b) => {
    if (/datos de ejemplo|imprimir/i.test(b.textContent ?? "")) b.style.visibility = "hidden";
  });
  window.scrollTo(0, 0);
};

const navegador = await chromium.launch();

// ------------------------------------------------------- el taller en uso
const taller = await navegador.newPage({ viewport: VENTANA, deviceScaleFactor: 2 });
await taller.goto(`file://${resolve(raiz, "docs/brujula-empresarial-borrador.html")}`);
await taller.waitForTimeout(2000);

// Tres respuestas para que no se vea una pantalla en blanco. Se pulsan de
// verdad: así la captura muestra los colores de estado que calcula la propia
// aplicación —favorable, medio, no favorable— y no un dibujo de ellos.
for (const [posicion, opcion] of [[0, "Alto · favorable"], [1, "Medio"], [2, "Alto · no favorable"]]) {
  const boton = taller.locator(`button:has-text("${opcion}")`).nth(posicion);
  if (await boton.count()) await boton.click().catch(() => {});
  await taller.waitForTimeout(150);
}
await taller.evaluate(limpiar);
await taller.waitForTimeout(600);
await taller.screenshot({ path: resolve(destino, "taller.png") });

// --------------------------------------------- el tablero de conclusiones
const tablero = await navegador.newPage({ viewport: VENTANA, deviceScaleFactor: 2 });
await tablero.goto(`file://${resolve(raiz, "docs/brujula-conclusiones-borrador.html")}`);
await tablero.waitForTimeout(1500);
const ejemplo = tablero.locator('button:has-text("ejemplo")').first();
if (await ejemplo.count()) { await ejemplo.click(); await tablero.waitForTimeout(1500); }
await tablero.evaluate(limpiar);
await tablero.waitForTimeout(400);
await tablero.screenshot({ path: resolve(destino, "tablero.png") });

await navegador.close();
console.log(`Capturas en ${destino}`);
