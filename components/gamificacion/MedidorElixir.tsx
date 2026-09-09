"use client";

import { nivel, xp } from "@/lib/talleres/progreso";

/** Medidor de avance del módulo, con nivel y XP. Portado del prototipo. */
export function MedidorElixir({
  resueltos, total,
}: { resueltos: number; total: number }) {
  const fraccion = total === 0 ? 0 : resueltos / total;
  return (
    <div className="elixir">
      <div className="elixir-top">
        <span className="lvl">{nivel(fraccion)}</span>
        <span className="xp">{xp(resueltos).toLocaleString("es-CO")} XP</span>
      </div>
      <div className="tube">
        <div className="tube-fill" style={{ width: `${(fraccion * 100).toFixed(1)}%` }} />
      </div>
      <div className="elixir-sub">
        {resueltos} de {total} campos resueltos · {Math.round(fraccion * 100)}%
      </div>
    </div>
  );
}
