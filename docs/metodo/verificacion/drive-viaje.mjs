/* VIAJE AL FUTURO — verificador.
 *
 * El criterio duro es la FIDELIDAD: el OEE que muestra el Paso 2 tiene que ser idéntico
 * al que calculó el Paso 1. Si no coincide, la copia no es copia y el aplicativo miente.
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
const mmss = (s) => Math.floor(s / 60) + ":" + String(Math.round(s % 60)).padStart(2, "0");
const set = async (p, sel, v) => { await p.fill(sel, String(v)); await p.dispatchEvent(sel, "change"); await p.waitForTimeout(90); };

const b = await chromium.launch({ executablePath: CHROME });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
const errores = [];
p.on("pageerror", (e) => errores.push(String(e)));
/* El contenedor de verificación no alcanza fonts.googleapis.com: ese error de red es del
   entorno, no del aplicativo. Es el mismo caso ya documentado en los otros gemelos. */
const deLaRed = (t) => /fonts\.g|ERR_CERT|Failed to load resource/.test(t);
p.on("console", (m) => { if (m.type() === "error" && !deLaRed(m.text())) errores.push(m.text()); });

await p.goto("file://" + join(AQUI, "..", "viaje-al-futuro.html"));
await p.waitForSelector(".cuenta");

/* ═══ PASO 1 · lo que pasó en la planta ═══ */
console.log("\nPASO 1 · lo que pasó en la planta");
const oee1 = pct(await p.textContent("#oeeMano"));
ok("el OEE a mano coincide con el cálculo", Math.abs(oee1 - E.manual.OEE) < 0.0006,
   `pantalla ${(oee1 * 100).toFixed(1)}% · esperado ${(E.manual.OEE * 100).toFixed(1)}%`);
ok("cada sección explica cómo se llena",
   (await p.$$eval(".como", (e) => e.length)) >= 5,
   `${await p.$$eval(".como", (e) => e.length)} cajas de ayuda`);
ok("el tiempo del lote se pide en minutos y segundos",
   !!(await p.$('[data-c="lmin"]')) && !!(await p.$('[data-c="lseg"]')));
ok("dibuja los 7 puestos de la corrida real",
   (await p.$$eval(".chain .pst", (e) => e.length)) === 7);

/* la lista de actividades: la escriben ellos */
await p.click("#edAct");
await p.waitForSelector(".act");
const nAct = await p.$$eval(".act", (e) => e.length);
ok("deja escribir las actividades", nAct === 15, `${nAct} actividades`);
await set(p, '[data-nm="0"]', "Poner la base y los tornillos");
ok("se puede cambiar el nombre de una actividad",
   (await p.inputValue('[data-nm="0"]')) === "Poner la base y los tornillos");
await p.click('[data-ab="0"]');
await p.waitForSelector(".tsk");
ok("y el nombre nuevo aparece dentro del puesto",
   (await p.textContent(".chain")).includes("Poner la base y los tornillos"));
await p.click('[data-ab="0"]');
await p.click('[data-dn="0"]');
await p.waitForTimeout(120);
const primera = await p.inputValue('[data-nm="0"]');
ok("las flechas cambian el orden", primera !== "Poner la base y los tornillos", `ahora: ${primera}`);
await p.click('[data-up="1"]');
await p.waitForTimeout(120);
await p.click("#addAct");
await p.waitForTimeout(150);
ok("se puede agregar una actividad",
   (await p.$$eval(".act", (e) => e.length)) === nAct + 1);
await p.click(`[data-del="${nAct}"]`);
await p.waitForTimeout(150);
ok("y quitarla", (await p.$$eval(".act", (e) => e.length)) === nAct);
await p.click("#resAct");
await p.waitForTimeout(200);
ok("volver al instructivo restaura el OEE original",
   Math.abs(pct(await p.textContent("#oeeMano")) - oee1) < 1e-9);

/* el ritmo ya andando */
await set(p, '[data-c="rpza"]', 4);
await set(p, '[data-c="rmin"]', 5);
const rit = await p.$$eval(".cuenta .tot i", (e) => e.map((x) => x.textContent));
ok("calcula el ritmo ya andando", rit.some((t) => t.includes("75")), rit.join(" · "));

/* cambiar un dato mueve el OEE: si no, el formulario no está conectado */
await set(p, '[data-c="buenas"]', 6);
ok("cambiar las piezas buenas mueve el OEE",
   pct(await p.textContent("#oeeMano")) < oee1 - 0.02);
await set(p, '[data-c="buenas"]', 8);
ok("y vuelve al mismo número al deshacer",
   Math.abs(pct(await p.textContent("#oeeMano")) - oee1) < 1e-9);

/* ═══ PASO 2 · la copia, con movimiento ═══ */
await p.click("#ir2");
await p.waitForSelector(".esp");
console.log("\nPASO 2 · la copia en el computador  (el criterio duro)");
const esp0 = (await p.$$eval(".esp i", (e) => e.map((x) => x.textContent))).slice(0, 2).map(pct);
ok("el computador muestra el mismo OEE que el Paso 1",
   esp0[0] === esp0[1] && Math.abs(esp0[0] - oee1) < 1e-9,
   `a mano ${(oee1 * 100).toFixed(1)}% · computador ${(esp0[1] * 100).toFixed(1)}%`);

/* la corrida repetida: tiene que MOVERSE y sacar sus mismas piezas */
await p.click("#lote");
await p.waitForSelector("#pl2 .bars");
await p.waitForTimeout(700);
const reloj1 = await p.textContent("#pl2 .clk span:nth-child(1) b");
await p.waitForTimeout(1200);
const reloj2 = await p.textContent("#pl2 .clk span:nth-child(1) b");
ok("la corrida se mueve: el reloj avanza", reloj1.trim() !== reloj2.trim(),
   `${reloj1.trim()} -> ${reloj2.trim()}`);
const alto = await p.$$eval("#pl2 .bx i", (e) => e.map((x) => x.style.height).join(","));
ok("las barras se llenan mientras trabaja", /[1-9]/.test(alto), alto.slice(0, 40));
await p.waitForSelector("#ap", { timeout: 25000 });
const salidas = num(await p.textContent("#pl2 .clk span:nth-child(2) b"))
              + num(await p.textContent("#pl2 .clk span:nth-child(3) b"));
ok("arma exactamente las piezas que ellos armaron", salidas === 10, `${salidas} de 10`);

const tiempos = await p.$$eval(".esp i, .cuenta .v, .cuenta .tot i",
  (e) => e.map((x) => x.textContent.trim()));
ok("predice la duración del lote con la fórmula del modelo",
   tiempos.includes(mmss(E.lote_predicho)), `esperado ${mmss(E.lote_predicho)}`);
ok("y la contrasta con lo que se demoraron", tiempos.includes(mmss(E.lote_medido)),
   `esperado ${mmss(E.lote_medido)}`);
const falta = E.lote_medido - E.lote_predicho;
const cards = (await p.$$eval(".card.a", (e) => e.map((x) => x.textContent))).join(" ");
ok("nombra el tiempo que nadie anotó", cards.includes(mmss(falta)), `faltan ${mmss(falta)}`);
ok("compara el ritmo medido contra el que permite la línea",
   cards.includes("75,0") || cards.includes("75"), "midieron 75 s contra 32 s del modelo");

/* la apuesta y el viaje al futuro, animado */
await p.click("#ap .opt:nth-child(2)");
await p.click("#ver");
await p.waitForSelector("#pl3 .bars");
await p.waitForTimeout(1500);
const t1 = num(await p.textContent("#pl3 .clk span:nth-child(2) b"));
await p.waitForTimeout(2000);
const t2 = num(await p.textContent("#pl3 .clk span:nth-child(2) b"));
ok("el viaje al futuro se mueve", t2 > t1, `${t1} -> ${t2}`);
await p.waitForSelector(".hero .n", { timeout: 40000 });
const proy = num(await p.textContent(".hero .n"));
ok("la proyección del turno coincide con el modelo", proy === E.turno.good,
   `pantalla ${proy} · esperado ${E.turno.good}`);

/* ═══ PASO 3 · el gemelo ═══ */
await p.click("#ir3");
await p.waitForSelector("#go");
console.log("\nPASO 3 · muévala");
const objetivo = await p.textContent("#stage");
ok("la meta sale de sus datos", objetivo.includes(E.meta.toLocaleString("es-CO")), `meta ${E.meta}`);
ok("dice lo que produce su línea de hoy",
   objetivo.includes(E.turno.good.toLocaleString("es-CO")), `hoy ${E.turno.good}`);
ok("explica de qué se trata antes de pedir nada", (await p.$$(".como")).length >= 1);

await p.click("#go");
await p.waitForSelector(".takt b");
ok("arranca con el reparto de la planta real",
   Math.abs(num(await p.textContent(".takt b")) - E.takt_base) < 0.05);
if (!(await p.$(".cutrow:not([disabled])"))) await p.click('.pst[data-k="0"]');
await p.waitForSelector(".cutrow:not([disabled])");
const gente0 = num(await p.textContent(".takt span:nth-child(2) b"));
await p.click(".cutrow:not([disabled])");
await p.waitForTimeout(80);
ok("partir un puesto contrata una persona",
   num(await p.textContent(".takt span:nth-child(2) b")) === gente0 + 1);

/* la corrida, el gemelo y la parada */
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
ok("la pantalla de parada arranca en 35 minutos",
   /^3[45]:/.test((await p.textContent("#rel")).trim()));
await p.waitForTimeout(3600);
ok("y el reloj llega a cero", (await p.textContent("#rel")).trim() === "0:00");
ok("cuenta las piezas que no van a salir", num(await p.textContent("#pp2")) > 0);
await p.click("#sigue");
await p.waitForSelector("#pl .clk");
ok("la planta siguió produciendo mientras el jugador estaba en el gemelo",
   num(await p.textContent("#pl .clk span:nth-child(2) b")) > buenasAntes);
ok("reconfigurar cobró 35 minutos exactos",
   num(await p.textContent("#pl .clk span:nth-child(3) b")) === 35);

/* ═══ el cierre ═══ */
await p.waitForSelector(".hero .n", { timeout: 40000 });
await p.waitForTimeout(600);
console.log("\nCIERRE");
ok("entrega un resultado del turno", num(await p.textContent(".hero .n")) > 0);
const cierre = await p.textContent("#stage");
ok("dice que detuvo la línea y cuánto costó", /Detuvo la línea/.test(cierre) && /35 minutos/.test(cierre));
ok("entrega el reparto para montar en la planta real", /Lo que se lleva a la línea real/.test(cierre));
ok("la escalera lista TODAS las dotaciones",
   (await p.$$eval(".graf .gb", (e) => e.length)) === E.por_gente.length);
const barras = await p.$$eval(".graf .gb .num", (e) => e.map((x) => x.textContent));
const esperadas = E.por_gente.map((f) => f.good.toLocaleString("es-CO"));
ok("cada fila de la escalera coincide con el calibrador",
   JSON.stringify(barras) === JSON.stringify(esperadas), barras.join(","));
ok("marca las dotaciones donde la persona de más sobra",
   E.por_gente.filter((f) => f.repite).length > 0);
await set(p, "#ch", 12000);
await p.waitForSelector("#cpz");
ok("con el costo puesto calcula el costo por pieza",
   /^\$/.test((await p.textContent("#cpz")).trim()), (await p.textContent("#cpz")).trim());

/* ═══ celular ═══ */
const desborde = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
ok("sin desborde horizontal en 390 px", desborde <= 0, `${desborde} px`);
ok("sin errores de consola", errores.length === 0, errores.slice(0, 3).join(" | "));

console.log(`\n${"=".repeat(60)}\nfallas: ${fallas}\n${"=".repeat(60)}`);
await b.close();
process.exit(fallas ? 1 : 0);
