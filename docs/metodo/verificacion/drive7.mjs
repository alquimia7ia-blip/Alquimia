import { chromium } from "playwright";
import fs from "fs";

const ESP = JSON.parse(fs.readFileSync(new URL("./esperado.json", import.meta.url)));
const URL_ = "file:///home/user/Alquimia/docs/metodo/sin-parar.html";
const pad = (s, n) => String(s).padEnd(n);
const p4 = v => (v * 100).toFixed(2).padStart(6) + "%";

const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });

const errs = [], fallosRed = [];
p.on("pageerror", e => errs.push("PAGEERROR " + e.message));
p.on("requestfailed", r => fallosRed.push(r.url()));
p.on("console", m => { if (m.type() === "error") errs.push("CONSOLE " + m.text()); });

let fallas = 0;
const mal = t => { fallas++; console.log("  ✗ FALLA: " + t); };
const ancho = async () => p.evaluate(() => document.documentElement.scrollWidth);
const chkAncho = async nom => { const w = await ancho(); if (w > 390) mal("desborde horizontal " + w + "px en " + nom); return w; };

await p.goto(URL_);
await p.waitForFunction(() => window.SINPARAR);

/* ═════ 1 · el motor del navegador contra cal7.py ═════ */
console.log("── motor: navegador contra cal7.py ──");
console.log("  " + pad("caso", 11) + pad("D", 9) + pad("R", 9) + pad("Q", 9) + pad("OEE", 9) + pad("prod", 7) + pad("buenas", 7));
for (const e of ESP) {
  const got = await p.evaluate(([c, w, rx]) =>
    window.SINPARAR.simular(c, w === "W0" ? window.SINPARAR.W0 : window.SINPARAR.W5, rx),
    [e.cortes, e.W, e.relx]);
  const d = k => Math.abs(got[k] - e[k]);
  const ok = d("D") < 1e-6 && d("R") < 1e-6 && d("Q") < 1e-6 && d("OEE") < 1e-6
          && got.out === e.out && got.good === e.good;
  if (!ok) mal(e.nom + " esperado " + JSON.stringify(e) + " obtenido " + JSON.stringify(got));
  console.log("  " + pad(e.nom, 11) + pad(p4(got.D), 9) + pad(p4(got.R), 9) + pad(p4(got.Q), 9)
    + pad(p4(got.OEE), 9) + pad(got.out, 7) + pad(got.good, 7) + (ok ? "=" : "DISTINTO"));
}

/* ═════ 2 · nivel 1 jugado BIEN por la interfaz ═════ */
console.log("\n── nivel 1, jugado bien con clics reales ──");
await p.click("#go");                                   await chkAncho("armado");
await p.click('.cutrow[data-i="4"]');                   // quitar el corte de hoy
await p.click('.cutrow[data-i="5"]');                   // ponerlo un paso más allá  -> C7
const takt1 = (await p.textContent(".met i")).trim();
console.log("  cortes movidos, sale cada: " + takt1 + (takt1 === "28,0 s" ? "  (= cal7.py)" : "  ✗"));
if (takt1 !== "28,0 s") mal("el takt tras recortar no da 28,0 s");
await p.click("#ok");                                   await chkAncho("apuesta");
if (!await p.isDisabled("#go")) mal("el botón arrancar no está bloqueado sin apostar");
await p.click('#q1 .opt:nth-child(2)');                 // 50-65 %
await p.click('#q2 .opt:nth-child(1)');                 // 0 paradas
if (await p.isDisabled("#go")) mal("el botón sigue bloqueado tras apostar");
await p.click("#go");                                   await chkAncho("corrida");
await p.waitForSelector("#next", { timeout: 45000 });   await chkAncho("cierre");
const c1 = await p.evaluate(() => ({ txt: document.querySelector(".hero .v").textContent,
  good: document.querySelector(".hero .n").textContent, pts: document.querySelector("#pts").textContent }));
console.log("  cierre: " + c1.good + " buenas · " + c1.txt + " · " + c1.pts);
if (!/pasó/.test(c1.txt)) mal("jugando bien el nivel 1 debería pasar");
if (c1.good !== "975") mal("esperaba 975 buenas (cal7.py), dio " + c1.good);

/* ═════ 3 · nivel 3: el gemelo es gratis, parar cuesta ═════ */
console.log("\n── nivel 3: gemelo gratis contra parar la planta ──");
await p.click("#next");                                  // -> nivel 2
await p.evaluate(() => { window.SINPARAR.S.nivel = 2; });
await p.click("#go");                                    // objetivo n3 -> armado
await p.click("#ok");                                    // armado -> apuesta
await p.click('#q1 .opt:nth-child(3)'); await p.click('#q2 .opt:nth-child(2)');
await p.click("#go");                                    // arranca la jornada
await p.waitForTimeout(2200);
const a = await p.evaluate(() => ({ clock: window.SINPARAR.S.R.clock, par: window.SINPARAR.S.R.parado,
  out: window.SINPARAR.S.R.out }));
await p.click("#twin");                                  // entra al gemelo
await chkAncho("gemelo");
await p.click("#twin");                                  // corre la predicción
const pred = await p.evaluate(() => document.querySelector(".oee .h i").textContent);
console.log("  el gemelo predice OEE " + pred + " para la configuración actual");
await p.waitForTimeout(1500);
const c = await p.evaluate(() => ({ clock: window.SINPARAR.S.R.clock, par: window.SINPARAR.S.R.parado,
  out: window.SINPARAR.S.R.out }));
console.log("  mientras ensayaba: reloj +" + Math.round(c.clock - a.clock) + " s simulados, "
  + (c.out - a.out) + " piezas más, planta parada " + c.par + " s");
if (c.clock <= a.clock) mal("la planta se detuvo mientras el jugador estaba en el gemelo");
if (c.par !== 0) mal("ensayar en el gemelo cobró parada");
await p.click("#back");
await p.click("#stop");                                  // ahora sí, parar y reconfigurar
await chkAncho("reconfigurar");
await p.click('.cutrow[data-i="6"]');
await p.click("#ok");
await p.waitForTimeout(300);
const d2 = await p.evaluate(() => ({ par: window.SINPARAR.S.R.parado, cmb: window.SINPARAR.S.R.cambios }));
console.log("  tras reconfigurar: " + d2.cmb + " cambio(s), planta parada " + d2.par + " s ("
  + Math.round(d2.par / 60) + " min)");
if (d2.par !== 2100 || d2.cmb !== 1) mal("reconfigurar debía costar 2100 s y contar 1 cambio");
await p.waitForSelector("#next", { timeout: 45000 });
const c3 = await p.evaluate(() => document.querySelector("#stage").textContent.replace(/\s+/g, " "));
console.log("  cierre n3: " + c3.slice(0, 64));
await p.screenshot({ path: "shot-n3-cierre.png", fullPage: true });

/* ═════ 4 · consola ═════ */
const fuentes = fallosRed.filter(u => /fonts\.(googleapis|gstatic)/.test(u));
const otros = fallosRed.filter(u => !/fonts\.(googleapis|gstatic)/.test(u));
const errsReales = errs.filter(t => !/ERR_CERT_AUTHORITY_INVALID|ERR_CONNECTION|Failed to load resource/.test(t));
console.log("\nrecursos que no cargaron: " + fuentes.length + " de Google Fonts (el contenedor no los alcanza)"
  + (otros.length ? " + OTROS: " + otros.join(", ") : ""));
if (otros.length) mal("hay recursos fallidos que no son las fuentes");
console.log("errores de página: " + (errsReales.length ? errsReales.join(" || ") : "ninguno"));
if (errsReales.length) fallas++;
console.log("\nfallas: " + fallas);
await b.close();
process.exit(fallas ? 1 : 0);
