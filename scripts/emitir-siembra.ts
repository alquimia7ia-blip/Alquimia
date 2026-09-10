/**
 * Emite la siembra del programa como un guion SQL, en vez de escribirla.
 *
 * Existe porque no siempre hay Postgres alcanzable: en el despliegue real la
 * base solo se toca por la API de Supabase, sin puerto 5432. El SQL que sale
 * de aquí es el mismo que escribiría `pnpm seed`, con las mismas validaciones
 * de Zod, y se puede pegar en el editor SQL del panel.
 *
 *   pnpm seed:sql > siembra.sql
 */
import { MODULO_1, MODULOS_PENDIENTES } from "../supabase/seed/modulo-1";
import { validarDefinicion } from "../lib/talleres/esquema";
import { camposEsperados } from "../lib/talleres/progreso";
import { bloques } from "../lib/talleres/rutas";
import type { Fila, TallerSemilla } from "../lib/talleres/tipos";

const ORG = { slug: "ccas", nombre: "Cámara de Comercio del Aburrá Sur" };
const PROGRAMA = { slug: "mega", nombre: "Empresas con Propósito MEGA" };

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

const out: string[] = ["begin;", ""];

out.push(`insert into organizaciones (nombre, slug) values (${lit(ORG.nombre)}, ${lit(ORG.slug)})
  on conflict (slug) do update set nombre = excluded.nombre;`, "");

out.push(`insert into programas (organizacion_id, nombre, slug)
  select id, ${lit(PROGRAMA.nombre)}, ${lit(PROGRAMA.slug)} from organizaciones where slug = ${lit(ORG.slug)}
  on conflict (organizacion_id, slug) do update set nombre = excluded.nombre;`, "");

const modulos = [
  { ...MODULO_1, publicado: true },
  ...MODULOS_PENDIENTES.map((m) => ({ ...m, publicado: false, talleres: [] as TallerSemilla[] })),
];

let total = 0;
for (const m of modulos) {
  out.push(`insert into modulos (programa_id, numero, slug, pregunta, titulo, lead, publicado)
  select p.id, ${m.numero}, ${lit(m.slug)}, ${lit(m.pregunta)}, ${lit(m.titulo)}, ${lit(m.lead)}, ${m.publicado}
  from programas p join organizaciones o on o.id = p.organizacion_id
  where o.slug = ${lit(ORG.slug)} and p.slug = ${lit(PROGRAMA.slug)}
  on conflict (programa_id, numero) do update set
    slug = excluded.slug, pregunta = excluded.pregunta, titulo = excluded.titulo,
    lead = excluded.lead, publicado = excluded.publicado;`, "");

  for (const t of m.talleres) {
    validarDefinicion(t.definicion, `taller ${t.numero} · ${t.slug}`);
    const minimo = t.camposMinimos ?? requeridosIniciales(t);
    if (t.camposMinimos != null && t.camposMinimos !== requeridosIniciales(t)) {
      console.error(`  ⚠ taller ${t.numero}: camposMinimos=${t.camposMinimos} pero la definición espera ${requeridosIniciales(t)}`);
    }
    out.push(`insert into talleres (modulo_id, numero, slug, corto, titulo, lead, definicion, campos_minimos, publicado)
  select m.id, ${t.numero}, ${lit(t.slug)}, ${lit(t.corto)}, ${lit(t.titulo)}, ${lit(t.lead)}, ${lit(JSON.stringify(t.definicion))}::jsonb, ${minimo}, true
  from modulos m join programas p on p.id = m.programa_id join organizaciones o on o.id = p.organizacion_id
  where o.slug = ${lit(ORG.slug)} and p.slug = ${lit(PROGRAMA.slug)} and m.numero = ${m.numero}
  on conflict (modulo_id, numero) do update set
    slug = excluded.slug, corto = excluded.corto, titulo = excluded.titulo,
    lead = excluded.lead, definicion = excluded.definicion,
    campos_minimos = excluded.campos_minimos, publicado = excluded.publicado,
    version = talleres.version + 1;`, "");
    total++;
  }
}

out.push("commit;");
console.error(`✓ ${modulos.length} módulos, ${total} talleres validados`);
console.log(out.join("\n"));
