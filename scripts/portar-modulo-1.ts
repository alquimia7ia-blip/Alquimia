/**
 * Siembra el contenido del programa MEGA.
 *
 * Traduce las constantes del prototipo (docs/taller-mega-modulo-1.html) a
 * filas de `talleres`, validando cada definición con Zod antes de escribir:
 * un error de autoría falla aquí y no delante de una empresa.
 *
 *   pnpm seed                          → contra la base local
 *   DATABASE_URL=postgres://… pnpm seed → contra Supabase
 *
 * Es idempotente: se puede correr las veces que haga falta.
 */
import { Client } from "pg";
import { MODULO_1, MODULOS_PENDIENTES } from "../supabase/seed/modulo-1";
import { validarDefinicion } from "../lib/talleres/esquema";
import { camposEsperados } from "../lib/talleres/progreso";
import { bloques } from "../lib/talleres/rutas";
import type { Fila, TallerSemilla } from "../lib/talleres/tipos";

const ORG = { slug: "ccas", nombre: "Cámara de Comercio del Aburrá Sur" };
const PROGRAMA = { slug: "mega", nombre: "Empresas con Propósito MEGA" };

const cadena =
  process.env.DATABASE_URL ??
  process.env.DATABASE_URL_LOCAL ??
  "postgresql://postgres@/bitacora?host=/var/run/postgresql&port=5433";

/** Campos que la definición espera cuando la bitácora se abre por primera vez. */
function requeridosIniciales(t: TallerSemilla): number {
  const filas: Fila[] = [];
  for (const b of bloques(t.definicion)) {
    const n = "filasIniciales" in b ? (b.filasIniciales ?? 0) : 0;
    for (let i = 0; i < n; i++) {
      filas.push({ id: `semilla-${i}`, bloqueId: b.id, tallerId: "", orden: i });
    }
  }
  return camposEsperados(t.definicion, filas).filter((c) => c.requerido).length;
}

async function main() {
  const db = new Client({ connectionString: cadena });
  await db.connect();
  console.log(`→ ${cadena.replace(/:[^:@/]+@/, ":···@")}`);

  try {
    await db.query("begin");

    const { rows: [org] } = await db.query<{ id: string }>(
      `insert into organizaciones (nombre, slug) values ($1, $2)
       on conflict (slug) do update set nombre = excluded.nombre
       returning id`,
      [ORG.nombre, ORG.slug],
    );

    const { rows: [programa] } = await db.query<{ id: string }>(
      `insert into programas (organizacion_id, nombre, slug) values ($1, $2, $3)
       on conflict (organizacion_id, slug) do update set nombre = excluded.nombre
       returning id`,
      [org!.id, PROGRAMA.nombre, PROGRAMA.slug],
    );

    // Módulo 1: publicado. Los otros tres quedan en borrador, visibles en la
    // ruta del programa pero sin talleres hasta que llegue su contenido.
    const modulos = [
      { ...MODULO_1, publicado: true },
      ...MODULOS_PENDIENTES.map((m) => ({ ...m, publicado: false, talleres: [] as TallerSemilla[] })),
    ];

    let totalTalleres = 0;
    for (const m of modulos) {
      const { rows: [modulo] } = await db.query<{ id: string }>(
        `insert into modulos (programa_id, numero, slug, pregunta, titulo, lead, publicado)
         values ($1, $2, $3, $4, $5, $6, $7)
         on conflict (programa_id, numero) do update set
           slug = excluded.slug, pregunta = excluded.pregunta, titulo = excluded.titulo,
           lead = excluded.lead, publicado = excluded.publicado
         returning id`,
        [programa!.id, m.numero, m.slug, m.pregunta, m.titulo, m.lead, m.publicado],
      );

      for (const t of m.talleres) {
        validarDefinicion(t.definicion, `taller ${t.numero} · ${t.slug}`);

        const minimo = t.camposMinimos ?? requeridosIniciales(t);
        if (t.camposMinimos != null && t.camposMinimos !== requeridosIniciales(t)) {
          // El mínimo es el piso del denominador del progreso. Si no coincide
          // con lo que la definición pide, la empresa vería un porcentaje y el
          // panel del facilitador otro.
          console.warn(
            `  ⚠ taller ${t.numero}: camposMinimos=${t.camposMinimos} pero la ` +
            `definición espera ${requeridosIniciales(t)} campos requeridos`,
          );
        }

        await db.query(
          `insert into talleres
             (modulo_id, numero, slug, corto, titulo, lead, definicion, campos_minimos, publicado)
           values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, true)
           on conflict (modulo_id, numero) do update set
             slug = excluded.slug, corto = excluded.corto, titulo = excluded.titulo,
             lead = excluded.lead, definicion = excluded.definicion,
             campos_minimos = excluded.campos_minimos, publicado = excluded.publicado,
             version = talleres.version + 1`,
          [modulo!.id, t.numero, t.slug, t.corto, t.titulo, t.lead,
           JSON.stringify(t.definicion), minimo],
        );
        totalTalleres++;
      }
      console.log(
        `  módulo ${m.numero} · ${m.titulo}` +
        (m.talleres.length ? ` — ${m.talleres.length} talleres` : " — borrador, sin contenido aún"),
      );
    }

    await db.query("commit");
    console.log(`\n✓ ${modulos.length} módulos y ${totalTalleres} talleres sembrados`);
  } catch (e) {
    await db.query("rollback");
    throw e;
  } finally {
    await db.end();
  }
}

main().catch((e) => {
  console.error("\n✗ la siembra falló:\n" + (e instanceof Error ? e.message : String(e)));
  process.exit(1);
});
