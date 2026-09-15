"use client";

import { useEffect, useRef } from "react";
import { useBitacora } from "./contexto";

/** Crece con el contenido, como el autosize() del prototipo. */
function useAutosize(activo: boolean) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const ajustar = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  };
  useEffect(() => { if (activo) ajustar(); });
  return { ref, ajustar };
}

type Props = {
  campoId: string;
  marcador?: string;
  multilinea?: boolean;
  numerica?: boolean;
  filas?: number;
  className?: string;
};

export function Texto({ campoId, marcador, multilinea = true, numerica, filas = 1, className }: Props) {
  const { valor, escribir, soloLectura } = useBitacora();
  const v = valor(campoId);
  const texto = typeof v === "string" ? v : "";
  const { ref, ajustar } = useAutosize(multilinea);

  if (!multilinea) {
    return (
      <input
        className={`f ${numerica ? "num" : ""} ${className ?? ""}`}
        value={texto}
        placeholder={marcador}
        readOnly={soloLectura}
        inputMode={numerica ? "numeric" : undefined}
        onChange={(e) => escribir(campoId, e.target.value)}
      />
    );
  }

  return (
    <textarea
      ref={ref}
      className={`f ${className ?? ""}`}
      rows={filas}
      value={texto}
      placeholder={marcador}
      readOnly={soloLectura}
      onChange={(e) => { escribir(campoId, e.target.value); ajustar(); }}
    />
  );
}
