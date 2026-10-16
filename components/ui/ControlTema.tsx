"use client";

import { useEffect, useState } from "react";

/**
 * Interruptor de tema: sistema, claro, oscuro.
 *
 * Tres estados y no dos, porque la mayoría de la gente ya eligió en su
 * sistema operativo y lo correcto es respetarla; el interruptor existe para
 * quien quiere lo contrario en este sitio concreto. «Sistema» no marca nada
 * en la raíz y deja que prefers-color-scheme decida, que es exactamente el
 * contrato que tokens.css espera.
 */
export type Tema = "sistema" | "claro" | "oscuro";

export const CLAVE_TEMA = "bitacora-mega-tema";

const ORDEN: Tema[] = ["sistema", "claro", "oscuro"];
const ROTULO: Record<Tema, string> = {
  sistema: "Tema del sistema",
  claro: "Tema claro",
  oscuro: "Tema oscuro",
};
const ICONO: Record<Tema, string> = { sistema: "🖥️", claro: "☀️", oscuro: "🌙" };

export function aplicarTema(t: Tema) {
  const raiz = document.documentElement;
  if (t === "sistema") raiz.removeAttribute("data-theme");
  else raiz.dataset.theme = t === "oscuro" ? "dark" : "light";
}

function leer(): Tema {
  try {
    const v = window.localStorage.getItem(CLAVE_TEMA);
    if (v === "claro" || v === "oscuro" || v === "sistema") return v;
  } catch {
    // Ventana privada o almacenamiento bloqueado: se sigue al sistema.
  }
  return "sistema";
}

/** Aplica lo que el navegador tenga guardado. Se llama antes de pintar. */
export function aplicarTemaGuardado() {
  aplicarTema(leer());
}

export function ControlTema() {
  const [tema, setTema] = useState<Tema>("sistema");
  const [montado, setMontado] = useState(false);

  // El valor guardado solo existe en el navegador. Hasta que monta, se
  // dibuja el estado neutro para que el servidor y el cliente coincidan.
  useEffect(() => {
    const guardado = leer();
    setTema(guardado);
    aplicarTema(guardado);
    setMontado(true);
  }, []);

  function siguiente() {
    const t = ORDEN[(ORDEN.indexOf(tema) + 1) % ORDEN.length]!;
    setTema(t);
    aplicarTema(t);
    try {
      window.localStorage.setItem(CLAVE_TEMA, t);
    } catch {
      // No poder recordarlo no impide cambiarlo ahora.
    }
  }

  return (
    <button
      type="button"
      className="mini"
      onClick={siguiente}
      title="Cambia entre el tema del sistema, claro y oscuro"
    >
      <span aria-hidden="true">{montado ? ICONO[tema] : ICONO.sistema}</span>
      <span>{montado ? ROTULO[tema] : "Tema"}</span>
    </button>
  );
}

/**
 * Se ejecuta antes de pintar, para que quien eligió oscuro no vea un
 * fogonazo blanco mientras carga el JavaScript de la página.
 */
export const GUION_TEMA =
  `try{var t=localStorage.getItem('${CLAVE_TEMA}');` +
  `if(t==='oscuro')document.documentElement.dataset.theme='dark';` +
  `else if(t==='claro')document.documentElement.dataset.theme='light';}catch(e){}`;
