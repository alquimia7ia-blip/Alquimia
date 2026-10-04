"use client";

/** Anillo de avance del riel lateral. Mismo radio y mismo 2πr del prototipo. */
const R = 8.6;
const C = 2 * Math.PI * R;

export function AnilloProgreso({ fraccion, completo }: { fraccion: number; completo?: boolean }) {
  return (
    <svg className="ring" viewBox="0 0 22 22" aria-hidden="true">
      <circle className="bg" cx="11" cy="11" r={R} />
      <circle
        className="fg"
        cx="11" cy="11" r={R}
        strokeDasharray={C}
        strokeDashoffset={C * (1 - Math.min(Math.max(fraccion, 0), 1))}
        style={completo ? { stroke: "var(--fav)" } : undefined}
      />
    </svg>
  );
}
