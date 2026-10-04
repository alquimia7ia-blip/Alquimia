/**
 * Emite la siembra de los programas como un guion SQL, en vez de escribirla.
 *
 * Existe porque no siempre hay Postgres alcanzable: en el despliegue real la
 * base solo se toca por la API de Supabase, sin puerto 5432. El SQL que sale
 * de aquí es el mismo que escribiría `pnpm seed`, con las mismas validaciones
 * de Zod, y se puede pegar en el editor SQL del panel.
 *
 *   pnpm seed:sql > siembra.sql
 *
 * Emite **dos programas** bajo dos organizaciones distintas: el de la Cámara
 * de Comercio del Aburrá Sur y el de ALQUIMIA. La separación no es cosmética:
 * el contenido del programa MEGA es de la Cámara y el de Fábrica Lean es de
 * ALQUIMIA, y esa frontera decide qué se puede revender.
 */
import { MODULO_1, MODULOS_PENDIENTES } from "../supabase/seed/modulo-1";
import { MODULO_2 } from "../supabase/seed/modulo-2";
import { MODULO_3 } from "../supabase/seed/modulo-3";
import { MODULO_4 } from "../supabase/seed/modulo-4";
import { MODULO_5 } from "../supabase/seed/modulo-5";
import { LEAN_MODULOS, LEAN_ORGANIZACION, LEAN_PROGRAMA } from "../supabase/seed/lean";
import { validarDefinicion } from "../lib/talleres/esquema";
import { camposEsperados } from "../lib/talleres/progreso";
import { bloques } from "../lib/talleres/rutas";
import type { Fila, TallerSemilla } from "../lib/talleres/tipos";

const CCAS = { slug: "ccas", nombre: "Cámara de Comercio del Aburrá Sur" };
const MEGA = { slug: "mega", nombre: "Empresas con Propósito MEGA", descripcion: null };

type ModuloSemilla = {
  numero: number;
  slug: string;
  pregunta: string;
  titulo: string;
  lead: string;
  publicado: boolean;
  talleres: TallerSemilla[];
};

/** Literal SQL con comillas simples escapadas. */
function lit(v: string | null | undefined): string {
  return v == null ? "null" : `'${v.replace(/'/g, "''")}'`;
}

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

/**
 * `pnpm seed:sql lean` emite solo Fábrica Lean.
 *
 * Reemitir el programa de la Cámara no rompe nada —el upsert es idempotente—
 * pero sube `talleres.version` en los veintiocho talleres que ya corren con
 * dos empresas dentro, y esa columna sirve para saber qué cambió y cuándo.
 * Ensuciarla a cambio de nada no vale la pena.
 */
const soloPrograma = process.argv[2];

const out: string[] = ["begin;", ""];
let totalTalleres = 0;
let totalModulos = 0;

/** Una organización, su programa y los módulos de ese programa. */
function emitir(
  org: { slug: string; nombre: string },
  programa: { slug: string; nombre: string; descripcion: string | null },
  modulos: ModuloSemilla[],
) {
  out.push(`insert into organizaciones (nombre, slug) values (${lit(org.nombre)}, ${lit(org.slug)})
  on conflict (slug) do update set nombre = excluded.nombre;`, "");

  out.push(`insert into programas (organizacion_id, nombre, slug, descripcion)
  select id, ${lit(programa.nombre)}, ${lit(programa.slug)}, ${lit(programa.descripcion)}
  from organizaciones where slug = ${lit(org.slug)}
  on conflict (organizacion_id, slug) do update set
    nombre = excluded.nombre, descripcion = excluded.descripcion;`, "");

  for (const m of modulos) {
    totalModulos++;
    out.push(`insert into modulos (programa_id, numero, slug, pregunta, titulo, lead, publicado)
  select p.id, ${m.numero}, ${lit(m.slug)}, ${lit(m.pregunta)}, ${lit(m.titulo)}, ${lit(m.lead)}, ${m.publicado}
  from programas p join organizaciones o on o.id = p.organizacion_id
  where o.slug = ${lit(org.slug)} and p.slug = ${lit(programa.slug)}
  on conflict (programa_id, numero) do update set
    slug = excluded.slug, pregunta = excluded.pregunta, titulo = excluded.titulo,
    lead = excluded.lead, publicado = excluded.publicado;`, "");

    for (const t of m.talleres) {
      validarDefinicion(t.definicion, `${programa.slug} · módulo ${m.numero} · taller ${t.slug}`);
      const minimo = t.camposMinimos ?? requeridosIniciales(t);
      if (t.camposMinimos != null && t.camposMinimos !== requeridosIniciales(t)) {
        console.error(`  ⚠ ${programa.slug} m${m.numero} t${t.numero}: camposMinimos=${t.camposMinimos} pero la definición espera ${requeridosIniciales(t)}`);
      }
      out.push(`insert into talleres (modulo_id, numero, slug, corto, titulo, lead, definicion, campos_minimos, publicado)
  select m.id, ${t.numero}, ${lit(t.slug)}, ${lit(t.corto)}, ${lit(t.titulo)}, ${lit(t.lead)}, ${lit(JSON.stringify(t.definicion))}::jsonb, ${minimo}, true
  from modulos m join programas p on p.id = m.programa_id join organizaciones o on o.id = p.organizacion_id
  where o.slug = ${lit(org.slug)} and p.slug = ${lit(programa.slug)} and m.numero = ${m.numero}
  on conflict (modulo_id, numero) do update set
    slug = excluded.slug, corto = excluded.corto, titulo = excluded.titulo,
    lead = excluded.lead, definicion = excluded.definicion,
    campos_minimos = excluded.campos_minimos, publicado = excluded.publicado,
    version = talleres.version + 1;`, "");
      totalTalleres++;
    }
  }
}

if (!soloPrograma || soloPrograma === "mega") emitir(CCAS, MEGA, [
  { ...MODULO_1, publicado: true },
  { ...MODULO_2, publicado: true },
  { ...MODULO_3, publicado: true },
  // El 4 se siembra publicado pero sin bitácoras para toda la cohorte: cada
  // empresa lo ve cuando se le crea la suya. Así se puede revisar el módulo
  // con una empresa antes de abrirlo a las demás.
  { ...MODULO_4, publicado: true },
  // El 5 es profundización de ALQUIMIA, no del programa de la Cámara. Mismo
  // trato que el 4: publicado, pero con bitácora solo para quien lo revise.
  { ...MODULO_5, publicado: true },
  ...MODULOS_PENDIENTES.map((m) => ({
    ...m, publicado: false, talleres: [] as TallerSemilla[],
  })),
]);

// Fábrica Lean. Publicado, y como los módulos 4 y 5 del otro programa, sin
// bitácoras para nadie hasta que se creen a mano: publicar no es abrir.
if (!soloPrograma || soloPrograma === "lean") {
  emitir(
    LEAN_ORGANIZACION,
    LEAN_PROGRAMA,
    LEAN_MODULOS.map((m) => ({ ...m, publicado: true })),
  );
}

out.push("commit;");
console.error(
  `✓ ${soloPrograma ? 1 : 2} programa(s), ${totalModulos} módulos, `
  + `${totalTalleres} talleres validados`,
);
console.log(out.join("\n"));
