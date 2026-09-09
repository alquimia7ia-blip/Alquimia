"use client";

import { escala as buscarEscala } from "@/lib/talleres/escalas";
import { useBitacora } from "./contexto";

/**
 * Fila de opciones excluyentes. Un segundo clic sobre la opción marcada la
 * desmarca: en el prototipo eso permitía corregir sin recargar y se conserva.
 */
export function Escala({ campoId, escalaId }: { campoId: string; escalaId: string }) {
  const { valor, escribir, soloLectura } = useBitacora();
  const actual = valor(campoId);

  return (
    <div className="chips">
      {buscarEscala(escalaId).opciones.map((o) => (
        <button
          key={o.valor}
          type="button"
          className="chip"
          data-v={o.color}
          aria-pressed={actual === o.valor}
          disabled={soloLectura}
          onClick={() => escribir(campoId, actual === o.valor ? "" : o.valor, { inmediato: true })}
        >
          {o.etiqueta}
        </button>
      ))}
    </div>
  );
}

/** Prioridad 1..N, excluyente dentro del bloque. Las cinco fuerzas. */
export function Ranking({
  campoId, maximo, usados,
}: { campoId: string; maximo: number; usados: string[] }) {
  const { valor, escribir, soloLectura } = useBitacora();
  const actual = valor(campoId);

  return (
    <div className="chips">
      {Array.from({ length: maximo }, (_, i) => String(i + 1)).map((n) => {
        const marcado = actual === n;
        // Un número ya usado por otra fuerza se atenúa, pero sigue disponible:
        // el prototipo no bloqueaba y reordenar a mitad de camino es normal.
        const repetido = !marcado && usados.includes(n);
        return (
          <button
            key={n}
            type="button"
            className="chip rank"
            aria-pressed={marcado}
            disabled={soloLectura}
            style={repetido ? { opacity: 0.45 } : undefined}
            onClick={() => escribir(campoId, marcado ? "" : n, { inmediato: true })}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
