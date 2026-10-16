/**
 * Comprueba el programa Fábrica Lean y la aritmética de las tablas calculadas.
 *
 * Esta prueba existe por una razón concreta: el valor del programa Lean está
 * en siete cifras que la aplicación calcula y la empresa no puede verificar
 * —el OEE, el porcentaje de valor agregado, el takt time, el costo anual del
 * desperdicio, el tiempo convertible de un cambio de referencia, los
 * kilómetros caminados y el pico de demanda—. Una fórmula equivocada no falla
 * ni avisa: devuelve un número plausible, y sobre ese número una planta decide
 * si compra una máquina de cincuenta millones.
 *
 * Se afirma:
 *   1. El OEE, contra un turno calculado a mano.
 *   2. El porcentaje de valor agregado y el lead time del flujo.
 *   3. El takt time y la holgura de cada estación —que es el caso del
 *      indicador de cabecera: una cifra global dentro de cada fila—.
 *   4. El costo del desperdicio y el veredicto que nombra el más caro.
 *   5. SMED, recorrido y Heijunka.
 *   6. Los casos límite: dividir por cero, la fila en blanco, el bloque vacío.
 *   7. Que nada de lo calculado es un campo —no infla el progreso—.
 *   8. Que el esquema rechaza las fórmulas imposibles.
 *   9. La estructura del programa: doce talleres de núcleo y once a la carta.
 *  10. Que el informe exporta el resultado antes de los datos.
 */
import { LEAN_MODULOS, LEAN_NUCLEO } from "../supabase/seed/lean";
import { calcularTabla, formatear, cabecerasDe } from "../lib/talleres/calculo";
import { camposEsperados } from "../lib/talleres/progreso";
import { buscarBloque, campo } from "../lib/talleres/rutas";
import { definicionSchema } from "../lib/talleres/esquema";
import { documentoInforme } from "../lib/informe/documento";
import type {
  BloqueTablaCalculada, Definicion, Fila, ValorCampo,
} from "../lib/talleres/tipos";

let fallos = 0;
function afirmar(condicion: boolean, que: string) {
  if (condicion) console.log(`  ✓ ${que}`);
  else { console.error(`  ✗ ${que}`); fallos++; }
}

/** Redondeo para comparar sin pelear con los decimales de coma flotante. */
const casi = (a: number | null, b: number, tolerancia = 0.05) =>
  a != null && Math.abs(a - b) < tolerancia;

const [M1, M2, M3, M4, M5] = LEAN_MODULOS;

/** Un banco de respuestas en memoria, como el de la bitácora. */
function banco(pares: Record<string, string>) {
  const mapa = new Map<string, ValorCampo>(Object.entries(pares));
  return { mapa, leer: (id: string) => mapa.get(id) };
}

/** Filas sintéticas de un bloque. */
const filasDe = (bloqueId: string, n: number, tallerId = "t"): Fila[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `f${i + 1}`, bloqueId, tallerId, orden: i,
  }));

function bloqueCalculado(def: Definicion, id: string): BloqueTablaCalculada {
  const b = buscarBloque(def, id);
  if (!b || b.tipo !== "tabla_calculada") throw new Error(`no hay tabla_calculada "${id}"`);
  return b;
}

// --------------------------------------------------------------------- 1 · OEE
console.log("\nOEE · el indicador que más se cita de memoria");

const oee = bloqueCalculado(M3!.talleres[0]!.definicion, "oee");
// Un turno de 480 min con 60 de parada: 420 operando → disponibilidad 87,5 %.
// 180 unidades a 2 min de ciclo ideal = 360 min de producción ideal sobre 420
// operando → rendimiento 85,714 %. 171 buenas de 180 → calidad 95 %.
// 0,875 × 0,85714 × 0,95 = 71,25 %.
const turno = banco({
  "oee.parametros.planeado": "480",
  "oee.parametros.paradas": "60",
  "oee.parametros.unidades": "180",
  "oee.parametros.ciclo-ideal": "2",
  "oee.parametros.buenas": "171",
});
const rOee = calcularTabla(oee, [], turno.leer);

afirmar(casi(rOee.indicadores.get("disponibilidad") ?? null, 87.5), "disponibilidad 87,5 %");
afirmar(casi(rOee.indicadores.get("rendimiento") ?? null, 85.714), "rendimiento 85,7 %");
afirmar(casi(rOee.indicadores.get("calidad") ?? null, 95), "calidad 95 %");
afirmar(casi(rOee.indicadores.get("oee") ?? null, 71.25), "OEE 71,25 %, no la media de los tres");
// La media de los tres daría 89,4 %: dieciocho puntos de diferencia. Es el
// error que convierte «la máquina casi no para» en una decisión equivocada.
afirmar(
  (rOee.indicadores.get("oee") ?? 0) < (87.5 + 85.714 + 95) / 3 - 15,
  "y queda muy por debajo del promedio de los tres factores",
);
afirmar(
  rOee.veredicto?.texto.includes("71,3 %") === true
  && rOee.veredicto?.color === "acento",
  "el veredicto ubica el 71 % en el tramo de buena gestión",
);
afirmar(
  cabecerasDe(oee).size === (oee.indicadores ?? []).length,
  "todos los indicadores del OEE son de cabecera: no dependen de filas",
);

// Un turno sin registrar no inventa cifras.
const vacio = calcularTabla(oee, [], banco({}).leer);
afirmar(vacio.vacia && vacio.indicadores.get("oee") == null, "sin datos, el OEE es «—» y no 0");
afirmar(formatear(null, { formato: "porcentaje" }) === "—", "el formato de un nulo es «—»");

// Dividir por cero no puede dar infinito: pasa si alguien escribe 0 unidades.
const cero = calcularTabla(oee, [], banco({
  "oee.parametros.planeado": "480",
  "oee.parametros.paradas": "0",
  "oee.parametros.unidades": "0",
  "oee.parametros.ciclo-ideal": "2",
  "oee.parametros.buenas": "0",
}).leer);
afirmar(cero.indicadores.get("calidad") == null, "0 unidades producidas no da calidad infinita");
afirmar(cero.indicadores.get("oee") == null, "y el OEE queda sin calcular, no en NaN");

// ------------------------------------------------- 2 · valor agregado del flujo
console.log("\nMapa del flujo · el porcentaje de valor agregado");

const flujo = bloqueCalculado(M2!.talleres[0]!.definicion, "flujo");
const pasos = filasDe("flujo", 3);
// 10+5+15 = 30 min de valor; 120+300+30 = 450 de espera. Lead time 480.
const bFlujo = banco({
  "flujo.f1.paso": "Corte", "flujo.f1.valor": "10", "flujo.f1.espera": "120",
  "flujo.f2.paso": "Doblado", "flujo.f2.valor": "5", "flujo.f2.espera": "300",
  "flujo.f3.paso": "Pintura", "flujo.f3.valor": "15", "flujo.f3.espera": "30",
});
const rFlujo = calcularTabla(flujo, pasos, bFlujo.leer);

afirmar(casi(rFlujo.filas[0]!.valores.get("total") ?? null, 130), "el total del paso suma valor y espera");
afirmar(casi(rFlujo.indicadores.get("lead") ?? null, 480), "lead time 480 min");
afirmar(casi(rFlujo.indicadores.get("va") ?? null, 6.25), "valor agregado 6,25 %");
afirmar(
  rFlujo.veredicto?.color === "med",
  "el 6,25 % cae en el tramo «normal, con margen enorme»",
);
// Un flujo con 3 % cae en el tramo rojo; con 60 % en el de «revisa los datos».
const rojo = calcularTabla(flujo, filasDe("flujo", 1), banco({
  "flujo.f1.paso": "Todo", "flujo.f1.valor": "3", "flujo.f1.espera": "97",
}).leer);
afirmar(rojo.veredicto?.color === "des", "con 3 % de valor agregado, el veredicto es rojo");
const alto = calcularTabla(flujo, filasDe("flujo", 1), banco({
  "flujo.f1.paso": "Todo", "flujo.f1.valor": "60", "flujo.f1.espera": "40",
}).leer);
afirmar(
  alto.veredicto?.texto.includes("sospechosamente alto") === true,
  "con 60 % avisa que probablemente faltan esperas por registrar",
);

// Una fila en blanco no se calcula: sin esto la tabla mostraría ceros con
// formato, que se leen como un resultado.
const conBlanco = calcularTabla(flujo, filasDe("flujo", 4), bFlujo.leer);
afirmar(conBlanco.filas[3]!.vacia, "la cuarta fila, sin escribir, queda marcada como vacía");
afirmar(conBlanco.filas[3]!.valores.get("total") == null, "y su total es «—», no 0");
afirmar(casi(conBlanco.indicadores.get("lead") ?? null, 480), "las filas vacías no entran al total");

// -------------------------------------------------------- 3 · takt y cuello
console.log("\nTakt time · la cifra global dentro de cada fila");

const takt = bloqueCalculado(M2!.talleres[1]!.definicion, "takt");
const estaciones = filasDe("takt", 3);
// 390 min disponibles / 60 unidades = 6,5 min por unidad de takt.
const bTakt = banco({
  "takt.parametros.disponible": "390",
  "takt.parametros.demanda": "60",
  "takt.f1.estacion": "Corte", "takt.f1.ciclo": "4",
  "takt.f2.estacion": "Soldadura", "takt.f2.ciclo": "9",
  "takt.f3.estacion": "Pintura", "takt.f3.ciclo": "5",
});
const rTakt = calcularTabla(takt, estaciones, bTakt.leer);

afirmar(casi(rTakt.indicadores.get("takt") ?? null, 6.5), "takt time 6,5 min por unidad");
afirmar(casi(rTakt.filas[0]!.valores.get("holgura") ?? null, 2.5), "Corte tiene 2,5 min de holgura");
afirmar(
  casi(rTakt.filas[1]!.valores.get("holgura") ?? null, -2.5),
  "Soldadura queda en −2,5: no alcanza la demanda ni en un turno perfecto",
);
afirmar(
  rTakt.veredicto?.texto.includes("Soldadura") === true,
  "el veredicto nombra la estación más lenta, no la cifra sola",
);
afirmar(cabecerasDe(takt).has("takt"), "el takt es indicador de cabecera");
afirmar(
  !cabecerasDe(takt).has("ciclo-promedio"),
  "el ciclo promedio no lo es: depende de las filas",
);
// Sin parámetros no hay takt, y entonces la holgura tampoco se inventa.
const sinTakt = calcularTabla(takt, estaciones, banco({
  "takt.f1.estacion": "Corte", "takt.f1.ciclo": "4",
}).leer);
afirmar(
  sinTakt.filas[0]!.valores.get("holgura") == null,
  "sin tiempo disponible ni demanda, la holgura queda en «—»",
);

// ------------------------------------------------ 4 · costo del desperdicio
console.log("\nCosto del desperdicio · la cifra que aprueba un proyecto");

const costo = bloqueCalculado(M1!.talleres[1]!.definicion, "costo");
const mudas = filasDe("costo", 2);
const bCosto = banco({
  "costo.f1.desperdicio": "Reproceso", "costo.f1.cantidad": "40", "costo.f1.valor": "35000",
  "costo.f2.desperdicio": "Paradas", "costo.f2.cantidad": "12", "costo.f2.valor": "180000",
});
const rCosto = calcularTabla(costo, mudas, bCosto.leer);

afirmar(casi(rCosto.filas[0]!.valores.get("mes") ?? null, 1_400_000), "40 × $35.000 = $1.400.000 al mes");
afirmar(casi(rCosto.filas[0]!.valores.get("anio") ?? null, 16_800_000), "y $16.800.000 al año");
afirmar(
  casi(rCosto.indicadores.get("total-anio") ?? null, 16_800_000 + 25_920_000),
  "el total anual suma las dos filas: $42.720.000",
);
afirmar(
  rCosto.veredicto?.texto.includes("Paradas") === true
  && rCosto.veredicto?.texto.includes("25.920.000") === true,
  "el veredicto nombra el desperdicio más caro con su cifra",
);
afirmar(
  formatear(rCosto.totales.get("anio") ?? null, { formato: "pesos" }).startsWith("$"),
  "los pesos se muestran con signo y sin decimales",
);

// ------------------------------------------ 5 · SMED, recorrido y Heijunka
console.log("\nSMED, recorrido y nivelación");

const smed = bloqueCalculado(M5!.talleres[6]!.definicion, "cambio");
const rSmed = calcularTabla(smed, filasDe("cambio", 3), banco({
  "cambio.f1.actividad": "Buscar llaves", "cambio.f1.interno": "0", "cambio.f1.externo": "12",
  "cambio.f2.actividad": "Desmontar", "cambio.f2.interno": "18", "cambio.f2.externo": "0",
  "cambio.f3.actividad": "Calibrar", "cambio.f3.interno": "30", "cambio.f3.externo": "0",
}).leer);
afirmar(casi(rSmed.indicadores.get("total") ?? null, 60), "el cambio completo son 60 min");
afirmar(casi(rSmed.indicadores.get("parada") ?? null, 48), "48 de ellos con la máquina parada");
afirmar(casi(rSmed.indicadores.get("convertible") ?? null, 20), "20 % convertible a externo");
afirmar(rSmed.veredicto?.color === "med", "y el veredicto lo pone en el tramo intermedio");

const recorrido = bloqueCalculado(M5!.talleres[5]!.definicion, "trayectos");
const rRec = calcularTabla(recorrido, filasDe("trayectos", 2), banco({
  "trayectos.f1.trayecto": "Al estante", "trayectos.f1.metros": "24", "trayectos.f1.veces": "18",
  "trayectos.f2.trayecto": "A bodega", "trayectos.f2.metros": "120", "trayectos.f2.veces": "3",
}).leer);
// 24×18 = 432 m/turno y 120×3 = 360 → 792 m/turno × 250 turnos = 198 km.
afirmar(casi(rRec.indicadores.get("metros-turno") ?? null, 792), "792 metros por turno");
afirmar(casi(rRec.indicadores.get("km") ?? null, 198), "198 km al año");
afirmar(
  rRec.veredicto?.texto.includes("Al estante") === true,
  "el veredicto señala el trayecto que más pesa, no el más largo",
);

const heijunka = bloqueCalculado(M5!.talleres[9]!.definicion, "nivelacion");
const rHei = calcularTabla(heijunka, filasDe("nivelacion", 3), banco({
  "nivelacion.parametros.capacidad": "100",
  "nivelacion.f1.periodo": "Semana 1", "nivelacion.f1.demanda": "60",
  "nivelacion.f2.periodo": "Semana 2", "nivelacion.f2.demanda": "150",
  "nivelacion.f3.periodo": "Semana 3", "nivelacion.f3.demanda": "90",
}).leer);
afirmar(casi(rHei.indicadores.get("promedio") ?? null, 100), "la demanda promedio son 100 unidades");
afirmar(
  casi(rHei.filas[1]!.valores.get("desviacion") ?? null, -50),
  "la semana del pico queda 50 unidades por encima de la capacidad",
);
afirmar(
  rHei.veredicto?.texto.includes("Semana 2") === true,
  "el veredicto nombra el periodo pico",
);

// -------------------------------------------- 6 · nada calculado es un campo
console.log("\nProgreso · lo calculado no cuenta como respuesta");

const camposCosto = camposEsperados(M1!.talleres[1]!.definicion, mudas);
afirmar(
  camposCosto.some((c) => c.campoId === campo.fila("costo", "f1", "cantidad")),
  "las columnas que se teclean sí son campos",
);
afirmar(
  !camposCosto.some((c) => c.campoId.endsWith(".mes") || c.campoId.endsWith(".anio")),
  "las columnas calculadas no son campos",
);
afirmar(
  camposCosto.filter((c) => c.campoId.endsWith(".origen")).every((c) => !c.requerido),
  "el origen del dato nunca es requerido",
);

const camposOee = camposEsperados(M3!.talleres[0]!.definicion, []);
afirmar(
  camposOee.filter((c) => c.campoId.startsWith("oee.parametros.")).length === 5,
  "los cinco parámetros del OEE son los campos del bloque",
);
afirmar(
  !camposOee.some((c) => c.campoId.includes("disponibilidad")),
  "y los indicadores no aparecen entre los campos",
);

// ------------------------------------------ 7 · el esquema rechaza lo imposible
console.log("\nEsquema · las fórmulas que no pueden existir");

const conBloque = (b: unknown): Definicion =>
  ({ version: 1, secciones: [{ id: "s", bloques: [b] }] }) as Definicion;
const rechaza = (b: unknown, que: string) =>
  afirmar(!definicionSchema.safeParse(conBloque(b)).success, que);

rechaza({
  tipo: "tabla_calculada", id: "x",
  columnas: [
    { id: "a", titulo: "A", numerica: true },
    { id: "b", titulo: "B", calculada: { op: "suma", de: [{ de: "total", columna: "a" }] } },
  ],
}, "una columna no puede usar el total de una columna");

rechaza({
  tipo: "tabla_calculada", id: "x",
  columnas: [
    { id: "a", titulo: "A", numerica: true },
    { id: "b", titulo: "B", calculada: { op: "suma", de: [{ de: "columna", id: "c" }] } },
    { id: "c", titulo: "C", numerica: true },
  ],
}, "ni una columna declarada después",

);
rechaza({
  tipo: "tabla_calculada", id: "x",
  columnas: [
    { id: "a", titulo: "A", numerica: true },
    {
      id: "b", titulo: "B",
      calculada: { op: "suma", de: [{ de: "indicador", id: "i" }] },
    },
  ],
  indicadores: [
    { id: "i", titulo: "I", calculada: { op: "suma", de: [{ de: "total", columna: "a" }] } },
  ],
}, "ni un indicador que dependa de la tabla —sería circular");

rechaza({
  tipo: "tabla_calculada", id: "x",
  columnas: [
    { id: "a", titulo: "A" },
    { id: "b", titulo: "B", calculada: { op: "suma", de: [{ de: "columna", id: "a" }] } },
  ],
}, "una fórmula no puede operar sobre una columna de texto");

rechaza({
  tipo: "tabla_calculada", id: "x",
  columnas: [{ id: "a", titulo: "A", numerica: true }],
  indicadores: [
    { id: "i", titulo: "I", calculada: { op: "suma", de: [{ de: "parametro", id: "no" }] } },
  ],
}, "ni referirse a un parámetro que no existe");

rechaza({
  tipo: "tabla_calculada", id: "x",
  columnas: [{ id: "a", titulo: "A", numerica: true }],
  indicadores: [
    { id: "i", titulo: "I", calculada: { op: "suma", de: [{ de: "total", columna: "a" }] } },
  ],
  veredicto: {
    tipo: "umbral", indicador: "i",
    tramos: [
      { hasta: 50, color: "des", texto: "bajo" },
      { hasta: 20, color: "fav", texto: "alto" },
    ],
  },
}, "los tramos del veredicto tienen que ir de menor a mayor");

rechaza({
  tipo: "tabla_calculada", id: "x",
  columnas: [
    { id: "b", titulo: "B", calculada: { op: "suma", de: [{ de: "constante", valor: 1 }] } },
  ],
}, "un bloque sin nada que teclear no es válido");

afirmar(
  definicionSchema.safeParse(conBloque({
    tipo: "tabla_calculada", id: "x",
    columnas: [
      { id: "a", titulo: "A", numerica: true },
      { id: "b", titulo: "B", calculada: { op: "producto", de: [{ de: "columna", id: "a" }, { de: "constante", valor: 12 }] } },
    ],
  })).success,
  "y la forma correcta sí pasa",
);

// ----------------------------------------------- 8 · estructura del programa
console.log("\nEstructura · doce talleres de núcleo y once a la carta");

afirmar(LEAN_MODULOS.length === 5, "cinco módulos");
afirmar(LEAN_NUCLEO === 12, "doce talleres en los cuatro módulos del núcleo");
afirmar(M5!.talleres.length === 11, "once talleres de profundización");
afirmar(
  LEAN_MODULOS.every((m) => m.slug.startsWith("lean-")),
  "todos los slugs de módulo llevan prefijo: no chocan con los del otro programa",
);

const slugs = LEAN_MODULOS.flatMap((m) => m.talleres.map((t) => `${m.slug}/${t.slug}`));
afirmar(new Set(slugs).size === slugs.length, "no hay dos talleres con el mismo slug");
afirmar(
  LEAN_MODULOS.every((m) => m.talleres.every((t, i) => t.numero === i + 1)),
  "los talleres van numerados sin huecos dentro de cada módulo",
);
afirmar(
  LEAN_MODULOS.flatMap((m) => m.talleres).every((t) => t.lead.length > 40),
  "cada taller explica para qué sirve antes de pedir una respuesta",
);

// Los siete bloques calculados del programa, que son su razón de ser.
const calculados = LEAN_MODULOS.flatMap((m) =>
  m.talleres.flatMap((t) =>
    t.definicion.secciones.flatMap((s) =>
      s.bloques.filter((b) => b.tipo === "tabla_calculada"))));
afirmar(calculados.length === 7, "siete bloques calculados: los siete ejercicios con cifra");
afirmar(
  calculados.every((b) => (b as BloqueTablaCalculada).indicadores?.length),
  "todos producen al menos un indicador",
);
afirmar(
  calculados.filter((b) => (b as BloqueTablaCalculada).veredicto).length === 7,
  "y todos concluyen con un veredicto en palabras",
);

// ------------------------------------------------------------- 9 · el informe
console.log("\nInforme · el resultado antes de los datos");

const docu = documentoInforme({
  empresa: "Taller de prueba",
  modulo: "Módulo 3 · Herramientas",
  programa: "Fábrica Lean",
  talleres: [{
    id: "t", numero: 1, corto: "OEE", titulo: "OEE",
    definicion: M3!.talleres[0]!.definicion,
  }],
  respuestas: turno.mapa,
  filas: [],
  avance: { resueltos: 5, total: 5, fraccion: 1 },
});
const nodos = docu.talleres[0]!.nodos;
const primerParrafo = nodos.find((n) => n.tipo === "parrafo");

afirmar(docu.programa === "Fábrica Lean", "el informe lleva el nombre del programa correcto");
afirmar(
  primerParrafo?.tipo === "parrafo" && primerParrafo.texto.includes("71,3 %"),
  "el veredicto del OEE abre el bloque en el informe",
);
const tablaInd = nodos.find((n) => n.tipo === "tabla");
afirmar(
  tablaInd?.tipo === "tabla" && tablaInd.filas.some((f) => f[0] === "OEE"),
  "la tabla de indicadores lleva el OEE",
);
afirmar(
  tablaInd?.tipo === "tabla"
  && !tablaInd.filas.some((f) => f[0] === "Tiempo operando" || f[0] === "Producto de los tres"),
  "y no los pasos intermedios, que están marcados como ocultos",
);
afirmar(
  nodos.some((n) => n.tipo === "lista" && n.items.some((i) => i.includes("Tiempo planeado"))),
  "los datos de partida quedan en el informe para poder auditar la cifra",
);

// Un módulo del núcleo entero, por si algún bloque rompe el armado.
for (const m of LEAN_MODULOS) {
  const doc = documentoInforme({
    empresa: "X", modulo: m.titulo, programa: "Fábrica Lean",
    talleres: m.talleres.map((t, i) => ({
      id: `t${i}`, numero: t.numero, corto: t.corto, titulo: t.titulo,
      definicion: t.definicion,
    })),
    respuestas: new Map(), filas: [],
    avance: { resueltos: 0, total: 1, fraccion: 0 },
  });
  afirmar(doc.talleres.length === m.talleres.length, `el informe del ${m.slug} se arma vacío`);
}

console.log(
  fallos === 0
    ? "\nPrograma Fábrica Lean: correcto."
    : `\n${fallos} comprobación(es) fallaron.`,
);
process.exit(fallos === 0 ? 0 : 1);
