/**
 * Genera la bitácora de ejemplo del tablero de conclusiones.
 *
 * Se construye recorriendo las definiciones reales, nunca escribiendo
 * identificadores a mano: un campo_id inventado se vería como una respuesta
 * que no existe y el tablero concluiría de menos, en silencio.
 *
 * La empresa ficticia está diseñada para que las cinco lecturas tengan algo
 * que decir: entorno más adverso que favorable, el poder del comprador
 * apretando el margen, ventas subiendo con utilidad bajando, y un DOFA que
 * no recogió las amenazas que la propia empresa marcó.
 *
 *   pnpm tsx scripts/generar-ejemplo.ts
 */
import { writeFileSync } from "node:fs";
import { MODULO_1 } from "../supabase/seed/modulo-1";
import { campo } from "../lib/talleres/rutas";
import type { Fila, ValorCampo } from "../lib/talleres/tipos";

const R: Record<string, ValorCampo> = {};
const F: Fila[] = [];

const taller = (slug: string) => {
  const t = MODULO_1.talleres.find((x) => x.slug === slug);
  if (!t) throw new Error(`No existe el taller ${slug}`);
  return t;
};
const bloque = (slug: string, id: string) => {
  for (const s of taller(slug).definicion.secciones) {
    for (const b of s.bloques) if (b.id === id) return b;
  }
  throw new Error(`No existe el bloque ${id} en ${slug}`);
};
/** Filas con el mismo identificador que crea useBitacoraLocal. */
const filas = (slug: string, bloqueId: string, n: number) => {
  const ids: string[] = [];
  for (let i = 0; i < n; i++) {
    const id = `${slug}-${bloqueId}-${i}`;
    F.push({ id, bloqueId, tallerId: slug, orden: i });
    ids.push(id);
  }
  return ids;
};

// --- Taller 1 · tendencias: más adversas que favorables -----------------
const tend = bloque("grandes-tendencias", "tend");
if (tend.tipo === "fichas_escala") {
  const plan: Record<string, string> = {
    esp: "na", sin: "fav", pso: "des", gob: "des", sos: "fav", cli: "des",
    dig: "fav", hip: "fav", red: "med", dem: "des", ssa: "med", urb: "des",
    aut: "med", pro: "fav", inm: "des",
  };
  for (const it of tend.items) {
    const v = plan[it.id] ?? "med";
    R[campo.item("tend", it.id, "valoracion")] = v;
  }
  R[campo.item("tend", "dig", "nota")] =
    "Podemos automatizar la toma de pedidos y liberar dos personas del mostrador.";
  R[campo.item("tend", "gob", "nota")] =
    "Cada certificación nueva nos cuesta cerca de doce millones y tres meses.";
}

// --- Taller 1 · PESTEL: el frente político-legal es el que aprieta ------
const pestel = bloque("grandes-tendencias", "pestel");
if (pestel.tipo === "matriz_escala") {
  const sesgo: Record<string, ("pos" | "neu" | "neg")[]> = {
    dg: ["neu", "neg", "pos", "neu", "pos", "neg", "neu", "neu", "pos", "pos"],
    sc: ["pos", "neg", "neu", "neg", "pos", "pos", "neu"],
    ec: ["neu", "pos", "neg", "neg"],
    pl: ["neg", "neg", "neg", "neu", "neg", "neg", "neu", "neg"],
    tc: ["pos", "pos", "neu", "neu", "pos", "pos"],
    gl: ["neg", "neu", "pos", "neg", "neu", "neu", "neg"],
  };
  for (const g of pestel.grupos) {
    const s = sesgo[g.id] ?? [];
    g.filas.forEach((f, i) => {
      const v = s[i];
      if (v) R[campo.matriz("pestel", g.id, f.id)] = v;
    });
  }
}

// --- Taller 2 · el comprador manda y aprieta ---------------------------
const fuerzas = bloque("cinco-fuerzas", "fuerzas");
if (fuerzas.tipo === "ranking_escala") {
  const orden: Record<string, string> = { com: "1", riv: "2", pro: "3", sus: "4", nue: "5" };
  const impacto: Record<string, string> = { com: "alto", riv: "alto", pro: "medio", sus: "bajo", nue: "medio" };
  for (const it of fuerzas.items) {
    if (orden[it.id]) R[campo.item("fuerzas", it.id, "prioridad")] = orden[it.id]!;
    if (impacto[it.id]) R[campo.item("fuerzas", it.id, "impacto")] = impacto[it.id]!;
  }
  R[campo.item("fuerzas", "com", "nota")] =
    "Tres cadenas concentran el 62% de nuestras ventas y renegocian precio cada semestre.";
}

// --- Talleres 3, 4 y 6 · listas ----------------------------------------
[
  ["rasgos-del-mercado", "rasgos", [
    "El mercado local de panificación mueve cerca de 180 mil millones al año en el Valle de Aburrá.",
    "Cuatro competidores industriales y unas noventa panaderías de barrio.",
    "Normatividad sanitaria INVIMA obligatoria y creciente.",
    "Tecnificación baja: la mayoría del barrio amasa a mano.",
    "El canal institucional crece más rápido que el mostrador.",
  ]],
  ["perfil-del-cliente", "habitos", [
    "Compra diaria, de camino al trabajo, entre 6 y 8 de la mañana.",
    "Pago en efectivo o transferencia; la tarjeta casi no aparece.",
    "El pedido institucional se hace por WhatsApp el viernes.",
  ]],
  ["perfil-del-cliente", "motivadores", [
    "Que el pan esté recién salido a la hora que llegan.",
    "Cercanía: no caminan más de tres cuadras.",
    "Confianza en que el precio no cambia cada mes.",
  ]],
  ["atributos-del-sector", "atributos", [
    "Frescura del producto en el momento de la compra",
    "Cumplimiento en la entrega institucional",
    "Precio estable",
    "Cercanía del punto",
    "Variedad de referencias",
  ]],
].forEach(([slug, bloqueId, lineas]) => {
  (lineas as string[]).forEach((t, i) => { R[campo.linea(bloqueId as string, i)] = t; });
  void slug;
});

// --- Taller 5 · competidores -------------------------------------------
const comp = filas("competencia", "competidores", 3);
[
  ["Panificadora industrial del sur", "Precio bajo, cobertura en toda la ciudad",
   "Producto sin frescura, atención impersonal", "Tiendas de barrio y minimercados",
   "Escala y crédito a 60 días"],
  ["Panadería de la esquina", "Clientela fiel, pan recién hecho",
   "No factura electrónicamente, no entrega a domicilio", "Vecinos del barrio",
   "Trato personal y horario extendido"],
  ["Cadena de café y pan", "Marca reconocida, local agradable",
   "Precio alto, poca variedad de pan", "Oficinistas de 25 a 40 años",
   "Experiencia de local y programa de puntos"],
].forEach((fila, i) => {
  const id = comp[i]!;
  const cols = ["nombre", "fortalezas", "debilidades", "perfil", "atributos"];
  fila.forEach((v, j) => { R[campo.fila("competidores", id, cols[j]!)] = v; });
});

// --- Taller 7 · procesos: soporte queda corto a propósito --------------
R[campo.simple("productivos")] = [
  "Gestión de clientes", "Gestión de la producción", "Despacho y ruta", "Control de calidad",
];
R[campo.simple("soporte")] = ["Financiera y contable"];

// --- Taller 8 · ventas suben, utilidad baja ----------------------------
const ind = filas("indicadores", "indicadores", 4);
R[campo.encabezado("indicadores", "a1")] = "2023";
R[campo.encabezado("indicadores", "a2")] = "2024";
R[campo.encabezado("indicadores", "a3")] = "2025";
[
  ["Nivel de ventas", "1.180.000.000", "1.365.000.000", "1.520.000.000"],
  ["Margen de utilidad total", "212.000.000", "191.000.000", "168.000.000"],
  ["Número de clientes", "410", "455", "498"],
  ["Gastos totales", "968.000.000", "1.174.000.000", "1.352.000.000"],
].forEach((fila, i) => {
  const id = ind[i]!;
  const cols = ["nombre", "a1", "a2", "a3"];
  fila.forEach((v, j) => { R[campo.fila("indicadores", id, cols[j]!)] = v; });
});

// --- Taller 9 · hitos ---------------------------------------------------
const hitos = filas("hitos", "hitos", 5);
[
  ["2011", "Abrimos el primer punto con un horno de segunda."],
  ["2016", "Entramos al canal institucional con dos colegios."],
  ["2020", "La pandemia cerró el mostrador; sobrevivimos por domicilios."],
  ["2023", "Compramos la segunda amasadora y duplicamos capacidad."],
  ["2025", "Perdimos un contrato institucional grande por precio."],
].forEach((fila, i) => {
  const id = hitos[i]!;
  R[campo.fila("hitos", id, "anio")] = fila[0]!;
  R[campo.fila("hitos", id, "hecho")] = fila[1]!;
});

// --- Taller 10 · valores ------------------------------------------------
const val = filas("valores", "valores", 4);
[
  ["Frescura", "Nada sale a la venta con más de seis horas de horneado."],
  ["Cumplimiento", "Si prometimos las 6 a.m., está a las 6 a.m."],
  ["Respeto", "Nadie trabaja más de ocho horas sin descanso pago."],
  ["Transparencia", "El precio se avisa con treinta días de anticipación."],
].forEach((fila, i) => {
  const id = val[i]!;
  R[campo.fila("valores", id, "valor")] = fila[0]!;
  R[campo.fila("valores", id, "significado")] = fila[1]!;
});

// --- Taller 11 · DOFA sin amenazas, a propósito ------------------------
["Pan recién hecho a la hora pico", "Ruta de domicilios propia", "Equipo estable hace años"]
  .forEach((t, i) => { R[campo.cuadrante("dofa", "F", i)] = t; });
["Dependemos de tres clientes grandes", "No tenemos costeo por línea de producto"]
  .forEach((t, i) => { R[campo.cuadrante("dofa", "D", i)] = t; });
["Canal institucional creciendo", "Automatizar la toma de pedidos"]
  .forEach((t, i) => { R[campo.cuadrante("dofa", "O", i)] = t; });
// El cuadrante de amenazas queda vacío: es el hallazgo que buscamos mostrar.

const cabecera = `// Generado por scripts/generar-ejemplo.ts. No editar a mano.
//
// Bitácora de una panadería ficticia del Valle de Aburrá, para poder mostrar
// el tablero de conclusiones sin datos de una empresa real.

import type { Fila, ValorCampo } from "@/lib/talleres/tipos";

export const EJEMPLO: { respuestas: Record<string, ValorCampo>; filas: Fila[] } = `;

writeFileSync(
  "app/tablero/ejemplo.ts",
  cabecera + JSON.stringify({ respuestas: R, filas: F }, null, 2) + ";\n",
);
console.log(`✓ app/tablero/ejemplo.ts · ${Object.keys(R).length} respuestas · ${F.length} filas`);
