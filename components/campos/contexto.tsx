"use client";

import { createContext, useContext } from "react";
import type { Fila, ValorCampo } from "@/lib/talleres/tipos";

/**
 * Acceso a la bitácora desde cualquier campo.
 *
 * En el prototipo esto era un objeto global `S` y funciones get/set que
 * recorrían rutas de string. Aquí es un contexto: los campos no saben si
 * detrás hay memoria, Supabase o una bitácora en modo lectura.
 */
export type BitacoraCtx = {
  valor: (campoId: string) => ValorCampo;
  escribir: (campoId: string, valor: ValorCampo) => void;
  /** Filas vivas de un bloque, ya ordenadas. */
  filas: (bloqueId: string) => Fila[];
  /** Todas las filas de la bitácora; el cálculo de progreso las necesita. */
  todasLasFilas: Fila[];
  agregarFila: (bloqueId: string) => void;
  eliminarFila: (filaId: string) => void;
  /** Iniciales de quien respondió por última vez, si se conocen. */
  autor?: (campoId: string) => string | undefined;
  soloLectura?: boolean;
};

const Ctx = createContext<BitacoraCtx | null>(null);

export const ProveedorBitacora = Ctx.Provider;

export function useBitacora(): BitacoraCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Falta <ProveedorBitacora> por encima de este campo");
  return ctx;
}

/** Resalta los **fragmentos** entre asteriscos dobles de los avisos. */
export function conNegritas(texto: string) {
  return texto.split(/\*\*(.+?)\*\*/g).map((parte, i) =>
    i % 2 === 1 ? <b key={i}>{parte}</b> : <span key={i}>{parte}</span>,
  );
}
