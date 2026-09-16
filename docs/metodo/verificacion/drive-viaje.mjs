/* VIAJE AL FUTURO — verificador.
 *
 * El criterio duro es la FIDELIDAD: el OEE que muestra el Paso 2 tiene que ser idéntico
 * al que calculó el Paso 1. Si no coincide, la sombra no es espejo y el aplicativo miente.
 * Todo lo demás se contrasta contra esperado-viaje.json, que escribe cal-viaje.py.
 *
 *   node docs/metodo/verificacion/drive-viaje.mjs
 */
import { chromium } from "playwright";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const AQUI = dirname(fileURLToPath(import.meta.url));
const E = JSON.parse(readFileSync(join(AQUI, "esperado-viaje.json"), "utf8"));
const CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

let fallas = 0;
const ok = (nom, cond, det = "") => {
  if (!cond) fallas++;
  console.log(`  [${cond ? "ok" : "FALLA"}] ${nom}${det ? "  " + det : ""}`);
};
const num = (t) => parseFloat(String(t).replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", "."));
const pct = (t) => parseFloat(String(t).replace("%", "").replace(",", ".").trim()) / 100;

const b = await chromium.launch({ executablePath: CHROME });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
const errores = [];
p.on("pageerror", (e) => errores.push(String(e)));
/* El contenedor de verificación no alcanza fonts.googleapis.com: ese error de red es del
   entorno, no del aplicativo, y es el mismo que ya se documentó en los otros gemelos. */
const deLaRed = (t) => /fonts\.g|ERR_CERT|Failed to load resource/.test(t);
p.on("console", (m) => { if (m.type() === "error" && !deLaRed(m.text())) errores.push(m.text()); });
p.on("requestfailed", () => {});

await p.goto("file://" + join(AQUI, "..", "viaje-al-futuro.html"));
await p.waitForSelector(".cuenta");

/* ═══ PASO 1 · la planta real ═══ */
console.log("\nPASO 1 · la planta real");
const oee1 = pct(await p.textContent(".cuenta .tot i"));
ok("el OEE a mano coincide con el cálculo", Math.abs(oee1 - E.manual.OEE) < 0.0006,
   `pantalla ${(oee1 * 100).toFixed(1)}% · esperado ${(E.manual.OEE * 100).toFixed(1)}%`);
const ciTxt = await p.textContent(".cuenta p");
ok("declara el ciclo ideal (el paso más largo)", ciTxt.includes(String(E.CI).replace(".", ",")),
   `CI ${E.CI}`);
const puestos1 = await p.$$eval(".chain .pst", (e) => e.length);
ok("dibuja los 7 puestos de la corrida real", puestos1 === 7, `${puestos1}`);

/* el acordeón y el reparto de segundos entre pasos */
await p.click('[data-ab="0"]');
await p.waitForSelector(".tsk");
const segPasos = await p.$$eval(".tsk span:last-child", (e) => e.map((x) => x.textContent));
ok("al abrir un puesto muestra sus pasos con su tiempo", segPasos.length === 2, segPasos.join(" · "));

/* cambiar un dato tiene que mover el OEE: si no, el formulario no está conectado */
await p.fill('[data-c="buenas"]', "6");
await p.dispatchEvent('[data-c="buenas"]', "change");
await p.waitForTimeout(80);
const oeeBaja = pct(await p.textContent(".cuenta .tot i"));
ok("cambiar las piezas buenas mueve el OEE", oeeBaja < oee1 - 0.02,
   `${(oeeBaja * 100).toFixed(1)}% contra ${(oee1 * 100).toFixed(1)}%`);
await p.fill('[data-c="buenas"]', "8");
await p.dispatchEvent('[data-c="buenas"]', "change");
await p.waitForTimeout(80);
const oeeVuelve = pct(await p.textContent(".cuenta .tot i"));
ok("y vuelve al mismo número al deshacer", Math.abs(oeeVuelve - oee1) < 1e-9);

/* ═══ PASO 2 · la sombra ═══ */
await p.click("#ir2");
await p.waitForSelector(".esp");
console.log("\nPASO 2 · la sombra digital  (el criterio duro)");
const esp = (await p.$$eval(".esp i", (e) => e.map((x) => x.textContent))).map(pct);
ok("la sombra muestra el mismo OEE que el Paso 1",
   esp.length === 2 && esp[0] === esp[1] && Math.abs(esp[0] - oee1) < 1e-9,
   `a mano ${(oee1 * 100).toFixed(1)}% · sombra ${(esp[1] * 100).toFixed(1)}%`);

const cuentas = await p.$$eval(".cuenta .v, .cuenta .tot i",
  (e) => e.map((x) => x.textContent.trim()));
const mmss = (s) => Math.floor(s / 60) + ":" + String(Math.round(s % 60)).padStart(2, "0");
ok("predice la duración del lote con la fórmula del modelo",
   cuentas.includes(mmss(E.lote_predicho)), `esperado ${mmss(E.lote_predicho)}`);
ok("muestra lo que se demoraron de verdad", cuentas.includes(mmss(E.lote_medido)),
   `esperado ${mmss(E.lote_medido)}`);
const falta = E.lote_medido - E.lote_predicho;
const cardTxt = (await p.textContent(".card.a")) || "";
ok("nombra los minutos que no aparecen", cardTxt.includes(mmss(falta)),
   `faltan ${mmss(falta)}`);

/* la apuesta y la proyección */
await p.click("#ap .opt:nth-child(2)");
await p.click("#ver");
await p.waitForSelector(".hero .n");
const proy = num(await p.textContent(".hero .n"));
ok("la proyección del turno coincide con el modelo", proy === E.turno.good,
   `pantalla ${proy} · esperado ${E.turno.good}`);
const acierto = await p.textContent(".hero .v");
ok("califica la apuesta", /atinó|usted dijo/.test(acierto), acierto.trim());

/* ═══ PASO 3 · el gemelo ═══ */
await p.click("#ir3");
await p.waitForSelector("#go");
console.log("\nPASO 3 · el gemelo activo");
const objetivo = await p.textContent("#stage");
ok("la meta sale de sus datos", objetivo.includes(E.meta.toLocaleString("es-CO")),
   `meta ${E.meta}`);
ok("dice lo que produce su línea de hoy",
   objetivo.includes(E.turno.good.toLocaleString("es-CO")), `hoy ${E.turno.good}`);

await p.click("#go");
await p.waitForSelector(".takt b");
const takt0 = await p.textContent(".takt b");
ok("arranca con el reparto de la planta real", Math.abs(num(takt0) - E.takt_base) < 0.05,
   `${takt0.trim()} · esperado ${E.takt_base}`);

/* mover un corte tiene que cambiar el ciclo y la cuenta de gente */
/* el acordeón abre solo en el puesto más lento; sólo hay que abrirlo si está cerrado */
if (!(await p.$(".cutrow:not([disabled])"))) await p.click('.pst[data-k="0"]');
await p.waitForSelector(".cutrow:not([disabled])");
const gente0 = num(await p.textContent(".takt span:nth-child(2) b"));
await p.click(".cutrow:not([disabled])");
await p.waitForTimeout(60);
const gente1 = num(await p.textContent(".takt span:nth-child(2) b"));
ok("partir un puesto contrata una persona", gente1 === gente0 + 1, `${gente0} -> ${gente1}`);

/* ═══ la corrida, el gemelo y la parada ═══ */
await p.click("#correr");
await p.waitForSelector("#pl .bars");
await p.waitForTimeout(2500);
const buenasAntes = num(await p.textContent("#pl .clk span:nth-child(2) b"));
await p.click("#twin");
await p.waitForSelector(".vs");
await p.waitForTimeout(1800);      /* la planta tiene que seguir trabajando aquí */
if (!(await p.$(".cutrow:not([disabled])"))) await p.click(".pst");
await p.click(".cutrow:not([disabled])");
await p.waitForTimeout(60);
await p.click("#ok");
await p.waitForSelector("#rel");
const rel0 = await p.textContent("#rel");
ok("la pantalla de parada arranca en 35 minutos", /^3[45]:/.test(rel0.trim()), rel0.trim());
await p.waitForTimeout(3600);
const rel1 = await p.textContent("#rel");
ok("y el reloj llega a cero", rel1.trim() === "0:00", rel1.trim());
const perdidas = num(await p.textContent("#pp2"));
ok("cuenta las piezas que no van a salir", perdidas > 0, `${perdidas} piezas`);
await p.click("#sigue");
await p.waitForSelector("#pl .clk");
const buenasDespues = num(await p.textContent("#pl .clk span:nth-child(2) b"));
ok("la planta siguió produciendo mientras el jugador estaba en el gemelo",
   buenasDespues > buenasAntes, `${buenasAntes} -> ${buenasDespues}`);
const paradoMin = num(await p.textContent("#pl .clk span:nth-child(3) b"));
ok("reconfigurar cobró 35 minutos exactos", paradoMin === 35, `${paradoMin} min`);

/* ═══ el cierre ═══ */
await p.waitForSelector(".hero .n", { timeout: 40000 });
await p.waitForTimeout(600);
console.log("\nCIERRE");
const final = num(await p.textContent(".hero .n"));
ok("entrega un resultado del turno", final > 0, `${final} buenas`);
const cierre = await p.textContent("#stage");
ok("dice que detuvo la línea y cuánto costó", /Detuvo la línea/.test(cierre) && /35 minutos/.test(cierre));
ok("entrega el reparto para montar en la planta real", /Lo que se lleva a la línea real/.test(cierre));
ok("la escalera lista TODAS las dotaciones, no sólo las que compran algo",
   (await p.$$eval(".graf .gb", (e) => e.length)) === E.por_gente.length,
   `${E.por_gente.length} filas`);
const barras = await p.$$eval(".graf .gb .num", (e) => e.map((x) => x.textContent));
const esperadas = E.por_gente.map((f) => f.good.toLocaleString("es-CO"));
ok("cada fila de la escalera coincide con el calibrador",
   JSON.stringify(barras) === JSON.stringify(esperadas),
   barras.join(",") + " vs " + esperadas.join(","));
const repes = E.por_gente.filter((f) => f.repite).length;
ok("marca las dotaciones donde la persona de más sobra", repes > 0, `${repes} de ${E.por_gente.length}`);

/* costo por pieza: sólo aparece si ellos ponen su costo */
await p.fill("#ch", "12000");
await p.dispatchEvent("#ch", "change");
await p.waitForSelector("#cpz");
const costo = await p.textContent("#cpz");
ok("con el costo puesto calcula el costo por pieza", /^\$/.test(costo.trim()), costo.trim());

/* ═══ celular ═══ */
const desborde = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
ok("sin desborde horizontal en 390 px", desborde <= 0, `${desborde} px`);
ok("sin errores de consola", errores.length === 0, errores.slice(0, 3).join(" | "));

console.log(`\n${"=".repeat(60)}\nfallas: ${fallas}\n${"=".repeat(60)}`);
await b.close();
process.exit(fallas ? 1 : 0);
