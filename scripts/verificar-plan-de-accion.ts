/**
 * Comprueba la aritmética del Módulo 4 y lo que el taller cuenta como avance.
 *
 * El puntaje de la matriz de priorización decide en qué orden una empresa
 * gasta el año siguiente, y es la clase de número que nadie recalcula a mano:
 * si la inversión sumara en vez de restar, el taller recomendaría con toda
 * seriedad empezar por el proyecto más caro y menos rentable, y se vería
 * igual de convincente en pantalla.
 *
 * Se afirma:
 *   1. La suma de criterios, con el invertido invertido.
 *   2. Que una fila sin calificar completa no recibe puntaje ni puesto.
 *   3. Los puestos: orden descendente, empates compartiendo puesto.
 *   4. Que el puntaje y el puesto no son campos — no inflan el progreso.
 *   5. Que el informe exporta la matriz ya ordenada.
 */
import { MODULO_4 } from "../supabase/seed/modulo-4";
import { MODULO_5 } from "../supabase/seed/modulo-5";
import { calcularFlujo, cifra, rotuloMes } from "../lib/talleres/flujo";
import { sugerenciasDelModulo } from "../lib/talleres/sugerencias";
import { puntaje, puestos, puntajeMaximo, MESES } from "../lib/talleres/priorizacion";
import { camposEsperados } from "../lib/talleres/progreso";
import { buscarBloque } from "../lib/talleres/rutas";
import { documentoInforme } from "../lib/informe/documento";
import type {
  BloqueMatrizPriorizacion, CriterioPriorizacion, Fila, ValorCampo,
} from "../lib/talleres/tipos";

let fallos = 0;
function afirmar(condicion: boolean, que: string) {
  if (condicion) console.log(`  ✓ ${que}`);
  else { console.error(`  ✗ ${que}`); fallos++; }
}

// ------------------------------------------------------------ 1 · el puntaje
console.log("\nPuntaje de la matriz de priorización");

const t1 = MODULO_4.talleres[0]!;
const matriz = buscarBloque(t1.definicion, "matriz") as BloqueMatrizPriorizacion;
const criterios = matriz.criterios;

afirmar(matriz.tipo === "matriz_priorizacion", "el Taller 1 trae la matriz de priorización");
afirmar(
  criterios.filter((c) => c.invertido).map((c) => c.id).join() === "inversion",
  "la inversión es el único criterio invertido",
);

const todo5 = { impacto: 5, velocidad: 5, riesgo: 5, inversion: 5 };
const barato = { impacto: 5, velocidad: 5, riesgo: 5, inversion: 1 };

afirmar(
  puntaje(todo5, criterios, 5) === 16,
  "cinco en todo da 16 y no 20: la inversión alta resta (5+5+5+1)",
);
afirmar(
  puntaje(barato, criterios, 5) === 20,
  "el proyecto de alto impacto y baja inversión saca el máximo, 20",
);
afirmar(
  puntajeMaximo(criterios, 5) === 20,
  "el puntaje máximo posible es 20",
);
afirmar(
  puntaje(barato, criterios, 5)! > puntaje(todo5, criterios, 5)!,
  "entre dos proyectos iguales, el más barato va primero",
);

// ------------------------------------------------- 2 · filas sin calificar
console.log("\nFilas incompletas");

afirmar(
  puntaje({ impacto: 5, velocidad: 4, riesgo: 3, inversion: null }, criterios, 5) === null,
  "falta una nota y no hay puntaje, en vez de un puntaje bajo que engañe",
);
afirmar(
  puntaje({ impacto: 5, velocidad: 4, riesgo: 3 }, criterios, 5) === null,
  "un criterio ausente del todo tampoco se asume en cero",
);

// --------------------------------------------------------- 3 · los puestos
console.log("\nOrden de ejecución");

const orden = puestos([
  { filaId: "a", puntaje: 12 },
  { filaId: "b", puntaje: 20 },
  { filaId: "c", puntaje: null },
  { filaId: "d", puntaje: 20 },
  { filaId: "e", puntaje: 7 },
]);

afirmar(orden.get("b") === 1 && orden.get("d") === 1, "dos empatados comparten el puesto 1");
afirmar(orden.get("a") === 3, "tras un empate en 1 el siguiente es 3, no 2");
afirmar(orden.get("e") === 4, "el último califica cuarto");
afirmar(!orden.has("c"), "la fila sin calificar no recibe puesto, ni el último");

// ------------------------------------------ 4 · el progreso no se infla
console.log("\nProgreso");

const filaMatriz: Fila[] = [
  { id: "f1", bloqueId: "matriz", tallerId: "t1", orden: 0 },
];
const campos = camposEsperados(t1.definicion, filaMatriz).map((c) => c.campoId);

afirmar(
  campos.filter((c) => c.startsWith("matriz.f1.")).length
    === matriz.columnas.length + criterios.length,
  `una fila aporta ${matriz.columnas.length + criterios.length} campos: sus columnas y sus criterios`,
);
afirmar(
  !campos.some((c) => c.endsWith(".puntaje") || c.endsWith(".puesto")),
  "el puntaje y el puesto no son campos: se calculan, no se responden",
);

const t3 = MODULO_4.talleres[2]!;
const seguimiento = camposEsperados(t3.definicion, [])
  .filter((c) => c.campoId.startsWith("avances.") || c.campoId.startsWith("retos."));
afirmar(
  seguimiento.length > 0 && seguimiento.every((c) => !c.requerido),
  "el seguimiento del Taller 3 no es requerido: hoy no habría qué escribir",
);

const t2 = MODULO_4.talleres[1]!;
const filaCrono: Fila[] = [{ id: "g1", bloqueId: "plan", tallerId: "t2", orden: 0 }];
const camposCrono = camposEsperados(t2.definicion, filaCrono).map((c) => c.campoId);
afirmar(
  camposCrono.includes("plan.g1.anio") && camposCrono.includes("plan.g1.mes"),
  "el cronograma pide año y mes por fila",
);

// ------------------------------------------------ 5 · el informe ordena
console.log("\nInforme");

const respuestas = new Map<string, ValorCampo>([
  ["matriz.f1.proyecto", "Montar el CRM"],
  ["matriz.f1.atributo", "Servicio"],
  ["matriz.f1.impacto", "3"], ["matriz.f1.velocidad", "3"],
  ["matriz.f1.riesgo", "3"], ["matriz.f1.inversion", "3"],
  ["matriz.f2.proyecto", "Certificar la planta"],
  ["matriz.f2.atributo", "Calidad"],
  ["matriz.f2.impacto", "5"], ["matriz.f2.velocidad", "5"],
  ["matriz.f2.riesgo", "5"], ["matriz.f2.inversion", "1"],
  ["matriz.f3.proyecto", "Sin calificar todavía"],
  ["plan.g1.proyecto", "Montar el CRM"],
  ["plan.g1.anio", "2026"], ["plan.g1.mes", "5"],
]);

const filas: Fila[] = [
  { id: "f1", bloqueId: "matriz", tallerId: "T1", orden: 0 },
  { id: "f2", bloqueId: "matriz", tallerId: "T1", orden: 1 },
  { id: "f3", bloqueId: "matriz", tallerId: "T1", orden: 2 },
];

const informe = documentoInforme({
  empresa: "Prueba",
  modulo: "Módulo 4 · Plan de acción",
  talleres: [{
    id: "T1", numero: 1, corto: t1.corto, titulo: t1.titulo,
    definicion: t1.definicion, camposMinimos: 0,
  }],
  respuestas,
  filas,
  avance: { resueltos: 0, total: 0, fraccion: 0 },
});

const json = JSON.stringify(informe);
const iCertificar = json.indexOf("Certificar la planta");
const iCrm = json.indexOf("Montar el CRM");

afirmar(iCertificar > 0 && iCrm > 0, "el informe exporta los dos proyectos calificados");
afirmar(
  iCertificar < iCrm,
  "y el de mayor puntaje aparece primero, aunque se haya escrito después",
);
afirmar(
  json.includes("\"1\"") && json.includes("\"20\""),
  "con su puesto y su puntaje",
);
afirmar(MESES[5] === "junio", "el mes 5 es junio: el índice es base cero");


// ===================================================================
// Módulo 5 · Profundización
// ===================================================================
console.log("\nMódulo 5 · flujo de caja");

// Un plan que cierra el año bien y revienta a mitad de camino: el caso que
// el saldo final esconde y que es la razón de ser del bloque.
const caja = calcularFlujo(5_000_000, [
  { entradas: 10_000_000, salidas: 9_000_000 },   // +1.000.000 → 6.000.000
  { entradas: 10_000_000, salidas: 20_000_000 },  // −10.000.000 → −4.000.000
  { entradas: 30_000_000, salidas: 9_000_000 },   // +21.000.000 → 17.000.000
]);

afirmar(caja.saldoFinal === 17_000_000, "el saldo final acumula bien");
afirmar(caja.primerMesEnRojo === 1, "detecta el mes en que la caja se vuelve negativa");
afirmar(caja.valle?.saldo === -4_000_000, "el valle es el punto más bajo, no el final");
afirmar(
  caja.saldoFinal > 0 && caja.primerMesEnRojo !== null,
  "un plan puede cerrar en positivo y aun así quebrar en el camino: eso es lo que avisa",
);

const sinRojo = calcularFlujo(1_000_000, [{ entradas: 5, salidas: 4 }]);
afirmar(sinRojo.primerMesEnRojo === null, "sin mes en rojo no inventa uno");

afirmar(cifra("1.500.000") === 1500000, "lee los miles con punto, como se escribe en Colombia");
afirmar(cifra("$ 2,300,000") === 2300000, "y con coma, y con el signo de pesos");
afirmar(cifra("") === 0 && cifra("abc") === 0, "lo vacío o ilegible vale cero, no NaN");
afirmar(rotuloMes(13, 0) === "feb", "el rótulo da la vuelta al año");

console.log("\nMódulo 5 · el diagnóstico alimenta el cruce DOFA");

const t5madurez = MODULO_5.talleres[0]!;
const sug = sugerenciasDelModulo(
  [t5madurez.definicion],
  new Map<string, ValorCampo>([
    ["madurez.finanzas.caja", "no"],        // debilidad
    ["madurez.comercial.metas", "medido"],  // fortaleza
    ["madurez.mercadeo.promesa", "informal"], // ni una ni otra
  ]),
);

afirmar(
  sug.debilidad.length === 1 && sug.debilidad[0]!.includes("caja"),
  "un área sin método entra como debilidad",
);
afirmar(
  sug.fortaleza.length === 1 && sug.fortaleza[0]!.includes("meta de venta"),
  "un área medida entra como fortaleza",
);
afirmar(
  sug.oportunidad.length === 0 && sug.amenaza.length === 0,
  "y nada se cuela a las casillas del entorno, que son del Módulo 1",
);

const cruce = MODULO_5.talleres[1]!;
const dofa = buscarBloque(cruce.definicion, "dofa");
afirmar(
  dofa?.tipo === "cuadrantes"
    && dofa.alimentadoPor?.fortaleza === "f" && dofa.alimentadoPor?.debilidad === "d"
    && dofa.alimentadoPor?.oportunidad === undefined,
  "el cruce declara solo los dos cuadrantes que puede llenar solo",
);

console.log("\nMódulo 5 · el origen del dato no infla el progreso");

const t5flujo = MODULO_5.talleres[4]!;
const filaCrit: Fila[] = [{ id: "c1", bloqueId: "criticos", tallerId: "t5", orden: 0 }];
const camposT5 = camposEsperados(t5flujo.definicion, filaCrit);
const origenes = camposT5.filter((c) => c.campoId.endsWith(".origen"));

afirmar(origenes.length === 1, "la columna marcada genera su campo de origen");
afirmar(origenes.every((c) => !c.requerido), "y no cuenta al denominador del taller");
afirmar(
  camposT5.some((c) => c.campoId === "flujo.ventas.11"),
  "el flujo pide los doce meses de cada concepto",
);
afirmar(
  !camposT5.some((c) => c.campoId.includes("acumulado") || c.campoId.includes("saldo")),
  "el saldo no es un campo: se calcula",
);

console.log(
  fallos === 0 ? "\nMódulos 4 y 5: correctos." : `\n${fallos} comprobación(es) fallaron.`,
);
process.exit(fallos === 0 ? 0 : 1);
