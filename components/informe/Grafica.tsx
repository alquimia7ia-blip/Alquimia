"use client";

import { useId, useState } from "react";
import type { Grafica as Spec, Barra } from "@/lib/informe/lecturas";

/**
 * Las figuras del tablero.
 *
 * Tres formas, y ninguna decide nada: el lector dice qué figura sostiene su
 * conclusión y aquí solo se dibuja. Todas llevan el valor escrito al lado de
 * la marca, no solo el color — los tonos de estado (verde, ámbar, rojo) son
 * indistinguibles para buena parte de las personas con daltonismo, así que
 * el color nunca es el único portador del dato.
 *
 * SVG a mano en vez de una librería: son barras, y una dependencia de 90 kB
 * para dibujar rectángulos se paga en cada carga del tablero.
 */

const tono = (c?: string) => (c ? `var(--${c})` : "var(--accent)");

function Tooltip({ texto, x }: { texto: string; x: number }) {
  return (
    <div
      role="tooltip"
      style={{
        position: "absolute", left: `${x}%`, bottom: "calc(100% + 8px)",
        transform: "translateX(-50%)", background: "var(--text)", color: "var(--ground)",
        padding: "7px 11px", borderRadius: 8, fontSize: 13.5, fontWeight: 600,
        whiteSpace: "nowrap", pointerEvents: "none", zIndex: 5, boxShadow: "var(--shadow)",
      }}
    >
      {texto}
    </div>
  );
}

/** Dos cantidades enfrentadas sobre una misma línea. Oportunidades y amenazas. */
function Balance({ a, b }: { a: Barra; b: Barra }) {
  const [sobre, setSobre] = useState<string | null>(null);
  const total = a.valor + b.valor;
  if (total === 0) return null;
  const pa = (a.valor / total) * 100;

  return (
    <div style={{ position: "relative", marginTop: 4 }}>
      {sobre && <Tooltip texto={sobre} x={sobre.startsWith(a.rotulo) ? pa / 2 : pa + (100 - pa) / 2} />}
      <div style={{ display: "flex", height: 30, borderRadius: 8, overflow: "hidden", gap: 2 }}>
        {[a, b].map((s) => (
          <div
            key={s.rotulo}
            onMouseEnter={() => setSobre(`${s.rotulo}: ${s.valor} de ${total}`)}
            onMouseLeave={() => setSobre(null)}
            style={{
              width: `${(s.valor / total) * 100}%`, background: tono(s.color),
              cursor: "default", transition: "filter .15s ease",
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, gap: 12 }}>
        {[a, b].map((s) => (
          <span key={s.rotulo} style={{ fontSize: 14.4, color: "var(--muted)" }}>
            <b style={{ color: tono(s.color), fontFamily: "var(--display)", fontSize: 20 }}>
              {s.valor}
            </b>{" "}
            {s.rotulo.toLowerCase()}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Barras horizontales con el valor escrito. La forma de casi toda evidencia. */
function Barras({ series, sufijo }: { series: Barra[]; sufijo?: string }) {
  const [sobre, setSobre] = useState<number | null>(null);
  const visibles = series.filter((s) => s.total > 0);
  if (visibles.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
      {visibles.map((s, i) => {
        const pc = Math.min(100, (s.valor / s.total) * 100);
        return (
          <div key={i}
               onMouseEnter={() => setSobre(i)} onMouseLeave={() => setSobre(null)}
               style={{ display: "grid", gridTemplateColumns: "minmax(90px,1fr) minmax(80px,2fr) auto",
                        gap: 12, alignItems: "center", fontSize: 14.6 }}>
            <span style={{ color: sobre === i ? "var(--text)" : "var(--muted)", transition: ".15s ease" }}>
              {s.rotulo}
            </span>
            <span style={{ height: 12, borderRadius: 99, background: "var(--line-2)", overflow: "hidden" }}>
              <span style={{
                display: "block", height: "100%", width: `${pc}%`, borderRadius: 99,
                background: tono(s.color),
                transition: "width .6s cubic-bezier(.2,.9,.25,1), filter .15s ease",
                filter: sobre === i ? "brightness(1.12)" : undefined,
              }} />
            </span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 13.6, color: "var(--muted)",
                           fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
              {s.valor}/{s.total}{sufijo && sobre === i ? ` ${sufijo}` : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Variación de cada indicador entre el primer año y el último.
 *
 * La línea del centro es el cero y lo que importa de un vistazo es de qué
 * lado cae cada barra. Un solo tono, a propósito: pintar de verde lo que
 * sube diría que subir es bueno, y «gastos totales +40%» no lo es. El
 * tablero no sabe el signo de cada indicador, así que no lo afirma — el
 * lado de la línea y el número dicen lo que hay.
 */
function Cambios({ series }: { series: { rotulo: string; ini: number; fin: number; cambio: number }[] }) {
  const id = useId();
  const [sobre, setSobre] = useState<number | null>(null);
  const tope = Math.max(20, ...series.map((s) => Math.abs(s.cambio)));
  const fmt = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(Math.abs(n) < 10 ? 1 : 0)}%`;
  const miles = (n: number) => n.toLocaleString("es-CO", { maximumFractionDigits: 0 });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 4 }}>
      {series.map((s, i) => {
        const largo = (Math.abs(s.cambio) / tope) * 50;
        const baja = s.cambio < -2;
        const color = "var(--accent)";
        return (
          <div key={`${id}-${i}`}
               onMouseEnter={() => setSobre(i)} onMouseLeave={() => setSobre(null)}
               style={{ display: "grid", gridTemplateColumns: "minmax(90px,1fr) minmax(120px,2fr) 72px",
                        gap: 12, alignItems: "center", fontSize: 14.6 }}>
            <span style={{ color: sobre === i ? "var(--text)" : "var(--muted)", transition: ".15s ease" }}>
              {s.rotulo}
            </span>
            <span style={{ position: "relative", height: 16 }}>
              <span style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1,
                             background: "var(--line)" }} />
              <span style={{
                position: "absolute", top: 2, bottom: 2, borderRadius: 4,
                left: baja || s.cambio < 0 ? `${50 - largo}%` : "50%",
                width: `${Math.max(largo, 1.5)}%`, background: color,
                transition: "width .6s cubic-bezier(.2,.9,.25,1)",
                filter: sobre === i ? "brightness(1.12)" : undefined,
              }} />
            </span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 14, fontWeight: 600, color,
                           textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
              {fmt(s.cambio)}
            </span>
            {sobre === i && (
              <span style={{ gridColumn: "1 / -1", fontSize: 13.2, color: "var(--faint)",
                             fontFamily: "var(--mono)", marginTop: -4 }}>
                {miles(s.ini)} → {miles(s.fin)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function Grafica({ spec }: { spec: Spec }) {
  if (spec.tipo === "balance") return <Balance a={spec.a} b={spec.b} />;
  if (spec.tipo === "barras") return <Barras series={spec.series} sufijo={spec.sufijo} />;
  return <Cambios series={spec.series} />;
}
