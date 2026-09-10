/**
 * Comprueba el tablero de conclusiones contra la bitácora de ejemplo.
 *
 * Una lectura equivocada es peor que ninguna: la empresa se la cree. Aquí se
 * fija qué debe concluir cada lector sobre unos datos conocidos, para que un
 * cambio en el motor de campos no altere las conclusiones en silencio.
 *
 *   pnpm tsx scripts/verificar-lecturas.ts
 */
import { EJEMPLO } from "../app/tablero/ejemplo";
import { lecturas, numero } from "../lib/informe/lecturas";
import { MODULO_1 } from "../supabase/seed/modulo-1";
import { camposEsperados, progresoTaller, progresoModulo } from "../lib/talleres/progreso";
import type { DatosInforme } from "../lib/informe/cuerpo";
import type { Fila, ValorCampo } from "../lib/talleres/tipos";

let fallos = 0;
function afirmar(condicion: boolean, mensaje: string) {
  if (condicion) console.log(`  ok · ${mensaje}`);
  else { console.error(`  FALLA · ${mensaje}`); fallos++; }
}

console.log("\nNúmeros escritos a mano");
const casos: [string, number | null][] = [
  ["1.180.000.000", 1180000000],
  ["$ 1.365.000.000", 1365000000],
  ["212.000.000", 212000000],
  ["1.500", 1500],
  ["1,5", 1.5],
  ["1.234,56", 1234.56],
  ["1,234.56", 1234.56],
  ["410", 410],
  ["-45", -45],
  ["", null],
  ["sin dato", null],
];
for (const [texto, esperado] of casos) {
  afirmar(numero(texto) === esperado, `«${texto}» → ${esperado}`);
}

console.log("\nConclusiones sobre la bitácora de ejemplo");
const respuestas = new Map(Object.entries(EJEMPLO.respuestas)) as Map<string, ValorCampo>;
const filas = EJEMPLO.filas as Fila[];
const datos: DatosInforme = {
  empresa: "Panadería de ejemplo",
  modulo: `Módulo ${MODULO_1.numero}`,
  talleres: MODULO_1.talleres.map((t) => ({
    id: t.slug, numero: t.numero, corto: t.corto, titulo: t.titulo, definicion: t.definicion,
  })),
  respuestas, filas,
  avance: progresoModulo(MODULO_1.talleres.map((t) =>
    progresoTaller(
      camposEsperados(t.definicion, filas.filter((f) => f.tallerId === t.slug)),
      respuestas, t.camposMinimos ?? 0))),
};

const l = lecturas(datos);
const buscar = (id: string) => l.find((x) => x.id.startsWith(id));

afirmar(l.length === 6, `se calculan las seis lecturas (fueron ${l.length})`);

const balance = buscar("balance-entorno");
afirmar(!!balance && !balance.incompleta, "el balance del entorno se sostiene con los datos");

const frente = buscar("frente-");
afirmar(!!frente?.titular.includes("Político"),
  "detecta que el frente político-legal es el más adverso");

const margen = buscar("manda-");
afirmar(!!margen?.titular.includes("compradores"),
  "detecta que el poder del comprador manda en el margen");
afirmar(margen?.senal === "alerta", "y lo marca como punto a revisar");

const tendencia = buscar("tendencia-");
afirmar(!!tendencia?.titular.includes("no se mueven en la misma dirección"),
  "detecta la divergencia: ventas suben y utilidad baja");
afirmar(!!tendencia?.detalle?.includes("Margen de utilidad total"),
  "y nombra el margen como la caída más fuerte");
afirmar((tendencia?.cifras?.length ?? 0) === 4,
  `compara los cuatro indicadores (fueron ${tendencia?.cifras?.length ?? 0})`);

const coherencia = buscar("coherencia-");
afirmar(!!coherencia?.titular.includes("está vacío"),
  "detecta que el DOFA no recogió las amenazas marcadas");

const cobertura = buscar("cobertura");
afirmar(!!cobertura?.titular.includes("soporte"),
  "detecta que faltan procesos de soporte por nombrar");

console.log(fallos === 0 ? "\n✓ tablero verificado\n" : `\n✗ ${fallos} fallas\n`);
process.exit(fallos === 0 ? 0 : 1);
