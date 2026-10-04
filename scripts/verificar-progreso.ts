/**
 * Comprueba que el progreso calculado en TypeScript (lo que ve la empresa)
 * y el calculado en SQL (lo que ve el facilitador en su panel) coinciden.
 *
 * Si divergieran, la empresa vería un porcentaje y el docente otro sobre la
 * misma bitácora. Por eso se verifica con datos reales y no de palabra.
 */
import { Client } from "pg";
import { camposEsperados, progresoTaller } from "../lib/talleres/progreso";
import type { Definicion, Fila, ValorCampo } from "../lib/talleres/tipos";

const cadena =
  process.env.DATABASE_URL ??
  process.env.DATABASE_URL_LOCAL ??
  "postgresql://postgres@/bitacora?host=/var/run/postgresql&port=5433";

const ORG = "00000000-0000-4000-8000-00000000e001";
const EMP = "00000000-0000-4000-8000-00000000e002";
const COH = "00000000-0000-4000-8000-00000000e003";
const BIT = "00000000-0000-4000-8000-00000000e004";

async function main() {
  const db = new Client({ connectionString: cadena });
  await db.connect();

  const { rows: talleres } = await db.query<{
    id: string; numero: number; corto: string; definicion: Definicion; campos_minimos: number;
  }>(`select t.id, t.numero, t.corto, t.definicion, t.campos_minimos
      from talleres t join modulos m on m.id = t.modulo_id
      where m.numero = 1 order by t.numero`);

  if (talleres.length === 0) throw new Error("no hay talleres sembrados; corre `pnpm seed`");

  const { rows: [mod] } = await db.query<{ id: string; programa_id: string }>(
    "select id, programa_id from modulos where numero = 1");

  // Bitácora de prueba, con respuestas repartidas de forma desigual.
  await db.query("delete from bitacoras where id = $1", [BIT]);
  await db.query(
    `insert into empresas (id, organizacion_id, nombre) values ($1, $2, 'Empresa de prueba')
     on conflict (id) do nothing`, [EMP, (await db.query("select id from organizaciones limit 1")).rows[0].id]);
  await db.query(
    `insert into cohortes (id, programa_id, nombre) values ($1, $2, 'Cohorte de prueba')
     on conflict (id) do nothing`, [COH, mod!.programa_id]);
  await db.query(
    "insert into bitacoras (id, empresa_id, modulo_id, cohorte_id) values ($1,$2,$3,$4)",
    [BIT, EMP, mod!.id, COH]);

  const filas: Fila[] = [];
  const respuestas = new Map<string, ValorCampo>();

  // Se responde una fracción distinta de cada taller para que un error de
  // redondeo o de piso salte en al menos uno.
  for (const [i, t] of talleres.entries()) {
    const fraccionObjetivo = (i + 1) / (talleres.length + 1);

    // Filas iniciales, como las crearía la aplicación al abrir la bitácora.
    for (const seccion of t.definicion.secciones) {
      for (const b of seccion.bloques) {
        const n = "filasIniciales" in b ? (b.filasIniciales ?? 0) : 0;
        for (let k = 0; k < n; k++) {
          const { rows: [f] } = await db.query<{ id: string }>(
            `insert into filas (bitacora_id, taller_id, bloque_id, orden)
             values ($1,$2,$3,$4) returning id`, [BIT, t.id, b.id, k]);
          filas.push({ id: f!.id, bloqueId: b.id, tallerId: t.id, orden: k });
        }
      }
    }

    const esperados = camposEsperados(t.definicion, filas.filter((f) => f.tallerId === t.id));
    const aResponder = esperados.filter((e) => e.requerido)
      .slice(0, Math.round(esperados.filter((e) => e.requerido).length * fraccionObjetivo));

    for (const e of aResponder) {
      respuestas.set(e.campoId, "sí");
      await db.query(
        `insert into respuestas (bitacora_id, taller_id, campo_id, valor) values ($1,$2,$3,$4::jsonb)`,
        [BIT, t.id, e.campoId, JSON.stringify("sí")]);
    }
    // Un campo en blanco: ni TypeScript ni SQL deben contarlo como resuelto.
    await db.query(
      `insert into respuestas (bitacora_id, taller_id, campo_id, valor) values ($1,$2,$3,$4::jsonb)`,
      [BIT, t.id, `${t.numero}.campo.en.blanco`, JSON.stringify("   ")]);
  }

  const { rows: sql } = await db.query<{ taller_numero: number; resueltos: string; total: string }>(
    `select taller_numero, resueltos, total from vista_progreso_taller
     where bitacora_id = $1 order by taller_numero`, [BIT]);

  console.log("taller                      TypeScript        SQL     ¿coinciden?");
  console.log("─".repeat(64));
  let fallas = 0;
  for (const t of talleres) {
    const esperados = camposEsperados(t.definicion, filas.filter((f) => f.tallerId === t.id));
    const ts = progresoTaller(esperados, respuestas, t.campos_minimos);
    const fila = sql.find((s) => s.taller_numero === t.numero)!;
    const igual = ts.resueltos === Number(fila.resueltos) && ts.total === Number(fila.total);
    if (!igual) fallas++;
    console.log(
      `${t.numero}. ${t.corto}`.padEnd(28) +
      `${ts.resueltos}/${ts.total}`.padStart(11) +
      `${fila.resueltos}/${fila.total}`.padStart(11) +
      (igual ? "        ✓" : "        ✗ DIVERGEN"));
  }
  console.log("─".repeat(64));

  await db.query("delete from bitacoras where id = $1", [BIT]);
  await db.end();

  if (fallas > 0) {
    console.error(`\n✗ ${fallas} talleres divergen entre el cliente y el panel`);
    process.exit(1);
  }
  console.log("✓ el progreso del cliente y el del panel coinciden en los 11 talleres");
}

main().catch((e) => { console.error(e); process.exit(1); });
