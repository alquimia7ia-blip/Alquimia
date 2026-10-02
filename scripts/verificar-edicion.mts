/**
 * Comprueba que se puede corregir un texto ya escrito.
 *
 * El defecto que motiva esta prueba: `Ficha` estaba declarada dentro del
 * cuerpo de `RenderBloque`, así que cambiaba de identidad en cada render.
 * React no reconcilia un tipo distinto: desmonta el subárbol y lo vuelve a
 * montar. Como `RenderBloque` se repinta con cada tecla —lee el contexto de
 * la bitácora—, el <textarea> de la nota se destruía y se recreaba letra a
 * letra: se perdía el foco y el cursor saltaba. Quien escribía no podía
 * corregir en mitad de una frase.
 *
 * Aquí se escribe una letra en mitad del texto y se afirma que el nodo del
 * DOM sigue siendo el mismo, que conserva el foco y que el cursor quedó
 * justo después de lo insertado.
 *
 * Los imports son dinámicos a propósito: el DOM falso tiene que existir
 * antes de que React lo busque.
 */
import { JSDOM } from "jsdom";
import type { Bloque, ValorCampo } from "../lib/talleres/tipos";

const dom = new JSDOM("<!doctype html><html><body><div id='raiz'></div></body></html>", {
  url: "https://localhost/",
  pretendToBeVisual: true,
});
const g = globalThis as unknown as Record<string, unknown>;
g.window = dom.window;
g.document = dom.window.document;
// `navigator` ya existe en Node y solo tiene getter: se redefine.
Object.defineProperty(globalThis, "navigator",
  { value: dom.window.navigator, configurable: true });
g.HTMLElement = dom.window.HTMLElement;
g.HTMLTextAreaElement = dom.window.HTMLTextAreaElement;
g.Event = dom.window.Event;
g.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const { ProveedorBitacora } = await import("../components/campos/contexto");
const { RenderBloque } = await import("../components/campos/RenderBloque");
const { act, createElement: h, useMemo, useState } = React;

const CAMPO_NOTA = "tend.esp.nota";
const TEXTO = "Impacta directamente nuestro propósito, desde la coherencia";
/** Donde está el cursor cuando alguien corrige en mitad de la frase. */
const CURSOR = TEXTO.indexOf("propósito") + "propó".length;
const ESPERADO = `${TEXTO.slice(0, CURSOR)}s${TEXTO.slice(CURSOR)}`;

const bloque: Bloque = {
  id: "tend",
  tipo: "fichas_escala",
  escala: "impacto_tendencia",
  campoNota: { etiqueta: "¿Cómo impacta a tu empresa?" },
  items: [{ id: "esp", titulo: "Espiritualidad", descripcion: "Búsqueda de sentido." }],
};

function Arnes() {
  const [respuestas, setRespuestas] = useState<Record<string, ValorCampo>>({
    "tend.esp.valoracion": "med",
    [CAMPO_NOTA]: TEXTO,
  });
  // Se imita el contexto real en lo que importa aquí: el valor cambia con
  // cada tecla, así que el árbol entero se vuelve a pintar.
  const ctx = useMemo(() => ({
    valor: (id: string) => respuestas[id] ?? null,
    escribir: (id: string, v: ValorCampo) => setRespuestas((p) => ({ ...p, [id]: v })),
    filas: () => [],
    todasLasFilas: [],
    agregarFila: () => {},
    eliminarFila: () => {},
  }), [respuestas]);
  return h(ProveedorBitacora, { value: ctx }, h(RenderBloque, { bloque }));
}

const raiz = createRoot(document.getElementById("raiz")!);
await act(async () => { raiz.render(h(Arnes)); });

const antes = document.querySelector("textarea");
if (!antes) throw new Error("No se dibujó el campo de nota de la ficha");
if (antes.value !== TEXTO) throw new Error(`La nota no trae lo guardado: "${antes.value}"`);

antes.focus();
antes.setSelectionRange(CURSOR, CURSOR);

// Una tecla en mitad de la frase, tal como la entrega el navegador.
const ponerValor = Object.getOwnPropertyDescriptor(
  dom.window.HTMLTextAreaElement.prototype, "value")!.set!;
await act(async () => {
  ponerValor.call(antes, ESPERADO);
  antes.setSelectionRange(CURSOR + 1, CURSOR + 1);
  antes.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
});

const despues = document.querySelector("textarea")!;
const fallos: string[] = [];
if (despues !== antes) fallos.push("el <textarea> se recreó: React desmontó la ficha");
if (document.activeElement !== despues) fallos.push("se perdió el foco al escribir");
if (despues.selectionStart !== CURSOR + 1) {
  fallos.push(`el cursor saltó a ${despues.selectionStart}, se esperaba ${CURSOR + 1}`);
}
if (despues.value !== ESPERADO) fallos.push(`el texto quedó como "${despues.value}"`);

if (fallos.length) {
  console.error("✗ No se puede corregir un texto ya escrito:");
  for (const f of fallos) console.error(`  · ${f}`);
  process.exit(1);
}
console.log("✓ Corregir en mitad de una frase conserva el nodo, el foco y el cursor");
process.exit(0);
