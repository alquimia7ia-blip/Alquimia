/**
 * Comprueba que salir no se lleva lo último que se escribió.
 *
 * El defecto que motiva esta prueba: un campo de texto no se envía al
 * teclear, espera 600 ms de reposo. `descargar()` —lo que corría al ocultar
 * la pestaña— cancelaba ese temporizador y llamaba a `enviar()`, pero
 * cancelar sin encolar tira la escritura: el valor seguía en el estado de
 * React, visible en pantalla, y no llegaba ni a la cola ni a `localStorage`.
 * Quien escribía una frase y cambiaba de pestaña dentro de esos 600 ms la
 * perdía al recargar, sin ningún aviso.
 *
 * El botón de cerrar sesión convierte ese hueco en pérdida garantizada: se
 * escribe, se pulsa salir, y la última respuesta no se guarda nunca.
 *
 * Se afirman tres cosas:
 *   1. `guardarYa()` envía lo que todavía estaba en reposo.
 *   2. Devuelve 0 cuando la cola quedó limpia, que es lo que deja salir sin
 *      advertencia.
 *   3. Sin red, devuelve cuántas respuestas quedaron pendientes y las deja
 *      en `localStorage`: el aviso del botón se basa en ese número.
 */
import { JSDOM } from "jsdom";
import type { ValorCampo } from "../lib/talleres/tipos";

const dom = new JSDOM("<!doctype html><html><body><div id='raiz'></div></body></html>", {
  url: "https://localhost/",
  pretendToBeVisual: true,
});
const g = globalThis as unknown as Record<string, unknown>;
g.window = dom.window;
g.document = dom.window.document;
Object.defineProperty(globalThis, "navigator",
  { value: dom.window.navigator, configurable: true });
g.HTMLElement = dom.window.HTMLElement;
g.Event = dom.window.Event;
g.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const { useBitacoraRemota } = await import("../lib/datos/useBitacoraRemota");
const { act, createElement: h, useRef } = React;

const BITACORA = "bit-1";
const TALLER = "taller-1";
const CAMPO = "prop.frase";
const TEXTO = "Transformamos ideas en negocios que duran";
const CLAVE_COLA = `bitacora:${BITACORA}:pendientes`;

/** Supabase de mentira: solo registra los upsert y puede fingir caída de red. */
function supabaseFalso({ caido }: { caido: boolean }) {
  const enviados: { campo_id: string; valor: ValorCampo }[] = [];
  return {
    enviados,
    cliente: {
      from() {
        return {
          async upsert(filas: { campo_id: string; valor: ValorCampo }[]) {
            if (caido) return { error: { message: "sin red" } };
            enviados.push(...filas);
            return { error: null };
          },
        };
      },
    },
  };
}

type Mando = { escribir: (v: string) => void; guardarYa: () => Promise<number> };

function montar(supabase: unknown) {
  const mando: { actual: Mando | null } = { actual: null };

  function Arnes() {
    const bit = useBitacoraRemota({
      // El doble es suficiente: el hook solo usa `.from().upsert()`.
      supabase: supabase as never,
      bitacoraId: BITACORA,
      perfilId: "perfil-1",
      inicial: { respuestas: {}, filas: [] },
      tallerDeBloque: { prop: TALLER },
    });
    // Se expone hacia fuera para poder manejarlo desde la prueba.
    const ref = useRef(bit);
    ref.current = bit;
    mando.actual = {
      escribir: (v) => bit.escribir(CAMPO, v),
      guardarYa: bit.guardarYa,
    };
    return null;
  }

  const raiz = createRoot(dom.window.document.getElementById("raiz")!);
  return { mando, raiz, Arnes };
}

function fallar(mensaje: string): never {
  console.error(`✗ ${mensaje}`);
  process.exit(1);
}

// ---------------------------------------------------------------- con red
{
  dom.window.localStorage.clear();
  const { enviados, cliente } = supabaseFalso({ caido: false });
  const { mando, raiz, Arnes } = montar(cliente);

  await act(async () => { raiz.render(h(Arnes)); });

  // Se escribe y NO se espera el reposo de 600 ms: es el instante exacto en
  // que alguien pulsaría «Cerrar sesión».
  await act(async () => { mando.actual!.escribir(TEXTO); });

  if (enviados.length !== 0) {
    fallar(`el texto se envió sin esperar el reposo (${enviados.length} envíos)`);
  }

  let pendientes = -1;
  await act(async () => { pendientes = await mando.actual!.guardarYa(); });

  if (enviados.length !== 1 || enviados[0]!.valor !== TEXTO) {
    fallar(
      "guardarYa() no envió el texto que estaba en reposo: " +
      `${enviados.length} envíos, valor ${JSON.stringify(enviados[0]?.valor)}. ` +
      "Es el defecto original: el temporizador se cancelaba sin encolar.",
    );
  }
  if (pendientes !== 0) fallar(`quedaron ${pendientes} pendientes con red disponible`);

  const cola = JSON.parse(dom.window.localStorage.getItem(CLAVE_COLA) ?? "[]");
  if (cola.length !== 0) fallar(`la cola quedó con ${cola.length} tras guardar bien`);

  await act(async () => { raiz.unmount(); });
  console.log("✓ con red: lo escrito a media frase se guarda antes de salir");
}

// --------------------------------------------------------------- sin red
{
  dom.window.localStorage.clear();
  const { enviados, cliente } = supabaseFalso({ caido: true });
  const { mando, raiz, Arnes } = montar(cliente);

  await act(async () => { raiz.render(h(Arnes)); });
  await act(async () => { mando.actual!.escribir(TEXTO); });

  let pendientes = -1;
  await act(async () => { pendientes = await mando.actual!.guardarYa(); });

  if (enviados.length !== 0) fallar("se contó como enviado algo que la red rechazó");
  if (pendientes !== 1) {
    fallar(`sin red, guardarYa() devolvió ${pendientes} y debía devolver 1: ` +
           "sobre ese número se construye la advertencia del botón");
  }

  const cola = JSON.parse(dom.window.localStorage.getItem(CLAVE_COLA) ?? "[]");
  if (cola.length !== 1 || cola[0].valor !== TEXTO) {
    fallar(`la respuesta no quedó respaldada en localStorage: ${JSON.stringify(cola)}`);
  }

  await act(async () => { raiz.unmount(); });
  console.log("✓ sin red: avisa cuántas quedan y las deja respaldadas");
}

console.log("\nGuardado antes de cerrar sesión: correcto.");

// `enviar()` deja programado un reintento a los 5 s cuando la red falla, y el
// reloj de jsdom mantiene vivo el proceso indefinidamente. Se cierra a mano.
dom.window.close();
process.exit(0);
