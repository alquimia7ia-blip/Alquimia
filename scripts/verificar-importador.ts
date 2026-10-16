/**
 * Comprueba que cada campo que produce el importador existe de verdad en la
 * definición del taller al que dice pertenecer.
 *
 * Un error de correspondencia aquí se vería como respuestas que se importan
 * "bien" y luego no aparecen en pantalla, que es la peor forma de fallar.
 */
import { MODULO_1 } from "../supabase/seed/modulo-1";
import { planDesdeArtifact, resumenPlan } from "../lib/migracion/desdeArtifact";
import { camposEsperados } from "../lib/talleres/progreso";
import { TENDENCIAS, PESTEL, FUERZAS } from "../supabase/seed/fuente/modulo-1-crudo";
import type { Fila } from "../lib/talleres/tipos";

// Estado del prototipo con algo respondido en los once talleres, con la misma
// forma que produce el botón «Respaldo» de docs/taller-mega-modulo-1.html.
const estadoPrototipo = {
  empresa: "Panadería La Espiga",
  t1: {
    tend: Object.fromEntries(
      TENDENCIAS.map(([id], i) => [id, { v: ["fav", "med", "des", "na"][i % 4], nota: i === 0 ? "Nos toca de lleno" : "" }]),
    ),
    extra: [{ t: "Encarecimiento de la harina importada", v: "des", nota: "Insumo principal" }],
  },
  t1b: Object.fromEntries(
    PESTEL.flatMap(([cid, , , items]) =>
      items.map((_, i) => [`${cid}${i}`, ["pos", "neu", "neg", "na"][i % 4]]),
    ),
  ),
  t2: Object.fromEntries(
    FUERZAS.map(([id], i) => [id, { rank: String(i + 1), imp: ["alto", "medio", "bajo"][i % 3], nota: "" }]),
  ),
  t3: ["Mercado local de 12 barrios", "Cuatro competidores directos", "", "", ""],
  t4: { hab: ["Compran a diario", "Pagan en efectivo", "", "", ""], mot: ["Frescura", "", "", "", ""] },
  t5: [
    { n: "Panadería del Parque", f: "Ubicación", d: "Precio alto", p: "Familias", a: "Marca" },
    { n: "", f: "", d: "", p: "", a: "" },
    { n: "", f: "", d: "", p: "", a: "" },
  ],
  t6: ["Frescura del producto", "Cercanía", "", "", ""],
  t7: { prod: ["Gestión de clientes", "Producción de panadería"], sop: ["Talento humano"] },
  t8: {
    anios: ["2023", "2024", "2025"],
    filas: [
      { n: "Nivel de ventas", v: ["120000000", "148000000", "163000000"] },
      { n: "Número de clientes", v: ["800", "950", "1010"] },
      { n: "", v: ["", "", ""] },
    ],
  },
  t9: [
    { a: "2011", h: "Se abrió el primer punto" },
    { a: "2020", h: "Pandemia: se montó domicilio propio" },
    { a: "", h: "" }, { a: "", h: "" }, { a: "", h: "" },
  ],
  t10: [
    { v: "Honestidad", s: "Se dice el precio real desde el principio" },
    { v: "", s: "" }, { v: "", s: "" }, { v: "", s: "" },
  ],
  t11: {
    F: ["Receta propia", "", ""],
    D: ["Sin control de costos", "", ""],
    A: ["Alza de la harina", "", ""],
    O: ["Barrio en crecimiento", "", ""],
  },
  _ts: Date.now(),
};

const plan = planDesdeArtifact(estadoPrototipo);
const resumen = resumenPlan(plan);

// Se resuelven las referencias de fila a identificadores concretos.
const idDeRef = new Map(plan.filas.map((f, i) => [f.ref, `fila-${i}`]));
const resolver = (campoId: string) =>
  campoId.replace(/\{([^}]+)\}/g, (_, ref: string) => idDeRef.get(ref) ?? "SIN-RESOLVER");

const talleresPorSlug = new Map(MODULO_1.talleres.map((t) => [t.slug, t]));

let errores = 0;
console.log(`Respaldo del prototipo: ${resumen.respuestas} respuestas, ` +
            `${resumen.filas} filas, ${resumen.talleres} talleres\n`);
console.log("taller                        campos  ¿todos existen en la definición?");
console.log("─".repeat(72));

for (const [slug, cuantos] of resumen.detalle) {
  const taller = talleresPorSlug.get(slug);
  if (!taller) {
    console.log(`${slug.padEnd(30)}${String(cuantos).padStart(7)}   ✗ NO EXISTE ESE TALLER`);
    errores++;
    continue;
  }
  const filas: Fila[] = plan.filas
    .filter((f) => f.tallerSlug === slug)
    .map((f) => ({ id: idDeRef.get(f.ref)!, bloqueId: f.bloqueId, tallerId: slug, orden: f.orden }));
  const validos = new Set(camposEsperados(taller.definicion, filas).map((c) => c.campoId));

  const huerfanos = plan.respuestas
    .filter((r) => r.tallerSlug === slug)
    .map((r) => resolver(r.campoId))
    .filter((c) => !validos.has(c));

  if (huerfanos.length) errores += huerfanos.length;
  console.log(
    `${slug.padEnd(30)}${String(cuantos).padStart(7)}   ` +
    (huerfanos.length === 0 ? "✓" : `✗ ${huerfanos.length}: ${huerfanos.slice(0, 3).join(", ")}`),
  );
}

console.log("─".repeat(72));
if (errores > 0) {
  console.error(`✗ ${errores} campos importados no corresponden a ningún campo real`);
  process.exit(1);
}
console.log("✓ todo lo que importa el respaldo cae en un campo que existe");
