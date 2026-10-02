/**
 * Comprueba que cada tabla, columna y relación que la aplicación consulta
 * existe de verdad en el esquema.
 *
 * PostgREST resuelve los nombres en tiempo de ejecución: una columna mal
 * escrita en un `.select()` no la ve el compilador de TypeScript y solo
 * aparece cuando una empresa abre la página. Esto la caza antes.
 *
 *   pnpm verify:consultas
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";

const cadena =
  process.env.DATABASE_URL ??
  process.env.DATABASE_URL_LOCAL ??
  "postgresql://postgres@/bitacora?host=/var/run/postgresql&port=5433";

const RAICES = ["app", "lib", "scripts", "components"];

function archivos(dir: string): string[] {
  const salida: string[] = [];
  for (const entrada of readdirSync(dir)) {
    if (entrada === "node_modules" || entrada.startsWith(".")) continue;
    const ruta = join(dir, entrada);
    if (statSync(ruta).isDirectory()) salida.push(...archivos(ruta));
    else if (/\.tsx?$/.test(entrada)) salida.push(ruta);
  }
  return salida;
}

type Uso = { archivo: string; tabla: string; columnas: string[]; relaciones: [string, string][] };

/** Separa un `select()` en columnas propias y relaciones embebidas. */
function partirSelect(sel: string): { columnas: string[]; relaciones: [string, string][] } {
  const columnas: string[] = [];
  const relaciones: [string, string][] = [];
  // Se corta por comas de primer nivel, respetando los paréntesis.
  let nivel = 0, actual = "";
  for (const c of sel) {
    if (c === "(") nivel++;
    if (c === ")") nivel--;
    if (c === "," && nivel === 0) { columnas.push(actual); actual = ""; }
    else actual += c;
  }
  if (actual.trim()) columnas.push(actual);

  const propias: string[] = [];
  for (const bruto of columnas) {
    const pieza = bruto.trim();
    const emb = pieza.match(/^(\w+)\s*\(([^)]*)\)$/);
    if (emb) {
      for (const sub of emb[2]!.split(",")) {
        if (sub.trim()) relaciones.push([emb[1]!, sub.trim()]);
      }
    } else if (pieza && pieza !== "*") {
      propias.push(pieza.replace(/^.*:/, "").trim());
    }
  }
  return { columnas: propias, relaciones };
}

async function main() {
  const usos: Uso[] = [];
  for (const raiz of RAICES) {
    for (const archivo of archivos(raiz)) {
      const texto = readFileSync(archivo, "utf8");
      const re = /\.from\("(\w+)"\)([\s\S]{0,300}?)\.select\("([^"]*)"\)/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(texto))) {
        const { columnas, relaciones } = partirSelect(m[3]!);
        usos.push({ archivo, tabla: m[1]!, columnas, relaciones });
      }
      // Payloads de escritura: las claves son nombres de columna.
      const reEscritura = /\.from\("(\w+)"\)\s*\.(insert|upsert|update)\(\s*\{([^}]*)\}/g;
      while ((m = reEscritura.exec(texto))) {
        const claves = [...m[3]!.matchAll(/(?:^|[\s,{])(\w+)\s*:/g)].map((x) => x[1]!);
        usos.push({ archivo, tabla: m[1]!, columnas: claves, relaciones: [] });
      }
    }
  }

  const db = new Client({ connectionString: cadena });
  await db.connect();

  const { rows: cols } = await db.query<{ table_name: string; column_name: string }>(
    `select table_name, column_name from information_schema.columns
     where table_schema = 'public'`);
  const porTabla = new Map<string, Set<string>>();
  for (const c of cols) {
    if (!porTabla.has(c.table_name)) porTabla.set(c.table_name, new Set());
    porTabla.get(c.table_name)!.add(c.column_name);
  }

  // Relaciones que PostgREST puede resolver: las claves foráneas declaradas.
  const { rows: fks } = await db.query<{ origen: string; destino: string }>(
    `select c.conrelid::regclass::text as origen, c.confrelid::regclass::text as destino
     from pg_constraint c where c.contype = 'f'`);
  const relacionadas = new Set(fks.flatMap((f) => [`${f.origen}->${f.destino}`, `${f.destino}->${f.origen}`]));

  await db.end();

  let errores = 0;
  const revisadas = new Set<string>();

  for (const u of usos) {
    const columnasTabla = porTabla.get(u.tabla);
    if (!columnasTabla) {
      console.log(`✗ ${u.archivo}: la tabla "${u.tabla}" no existe`);
      errores++;
      continue;
    }
    for (const col of u.columnas) {
      if (!columnasTabla.has(col)) {
        console.log(`✗ ${u.archivo}: ${u.tabla}.${col} no existe`);
        errores++;
      }
    }
    for (const [tablaRel, col] of u.relaciones) {
      const colsRel = porTabla.get(tablaRel);
      if (!colsRel) {
        console.log(`✗ ${u.archivo}: la relación embebida "${tablaRel}" no es una tabla`);
        errores++;
      } else if (!colsRel.has(col)) {
        console.log(`✗ ${u.archivo}: ${tablaRel}.${col} no existe (embebida desde ${u.tabla})`);
        errores++;
      } else if (!relacionadas.has(`${u.tabla}->${tablaRel}`)) {
        console.log(`✗ ${u.archivo}: no hay clave foránea entre ${u.tabla} y ${tablaRel}, ` +
                    `PostgREST no podrá embeberla`);
        errores++;
      }
    }
    revisadas.add(u.tabla);
  }

  const total = usos.reduce((s, u) => s + u.columnas.length + u.relaciones.length, 0);
  console.log(`\n${usos.length} consultas · ${total} columnas y relaciones · ` +
              `${revisadas.size} tablas`);
  if (errores > 0) {
    console.error(`✗ ${errores} referencias no existen en el esquema`);
    process.exit(1);
  }
  console.log("✓ toda columna y relación que consulta la aplicación existe en el esquema");
}

main().catch((e) => { console.error(e); process.exit(1); });
