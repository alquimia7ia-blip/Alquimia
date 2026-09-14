"use client";

import { useEffect, useState } from "react";
import type { Lectura, Senal } from "@/lib/informe/lecturas";
import { tresPreguntas, focos, conteo } from "@/lib/informe/preguntas";
import { Grafica } from "./Grafica";

/**
 * Tablero de conclusiones.
 *
 * Se lee mirando, no leyendo: cada conclusión entra como figura y el texto
 * que la explica vive detrás de un desplegable. Lo primero de la pantalla no
 * es un dato sino tres preguntas — una conclusión que no termina en pregunta
 * no cambia ninguna conducta.
 *
 * Nada aquí decide qué concluir; eso vive en lecturas.ts y preguntas.ts.
 *
 * El color de señal nunca viaja solo: cada marca lleva su glifo y su rótulo,
 * porque verde, ámbar y rojo son casi el mismo tono para buena parte de las
 * personas con daltonismo.
 */

const COLOR: Record<Senal, string> = {
  favorable: "var(--fav)", atencion: "var(--med)",
  alerta: "var(--des)", neutro: "var(--faint)",
};
const ICONO: Record<Senal, string> = {
  favorable: "▲", atencion: "◆", alerta: "▼", neutro: "·",
};
const ROTULO: Record<Senal, string> = {
  favorable: "A favor", atencion: "Atención", alerta: "Revisar", neutro: "Sin datos",
};

function Chip({ senal }: { senal: Senal }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
      fontSize: 13.2, fontWeight: 700, color: COLOR[senal],
      background: "var(--surface-2)", border: "1px solid var(--line)",
      borderRadius: 99, padding: "4px 11px",
    }}>
      <span aria-hidden="true">{ICONO[senal]}</span> {ROTULO[senal]}
    </span>
  );
}

/** Anillo de avance. Es el único número grande de la cabecera. */
function Anillo({ pc }: { pc: number }) {
  const r = 34, c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 80 80" style={{ width: 84, height: 84, flex: "none" }} role="img"
         aria-label={`${pc}% del módulo resuelto`}>
      <circle cx="40" cy="40" r={r} fill="none" stroke="var(--line)" strokeWidth="7" />
      <circle cx="40" cy="40" r={r} fill="none" stroke="var(--accent)" strokeWidth="7"
              strokeLinecap="round" strokeDasharray={c}
              strokeDashoffset={c * (1 - pc / 100)}
              transform="rotate(-90 40 40)"
              style={{ transition: "stroke-dashoffset .8s cubic-bezier(.2,.9,.25,1)" }} />
      <text x="40" y="45" textAnchor="middle" fill="var(--text)"
            style={{ fontFamily: "var(--display)", fontSize: 21, fontWeight: 800 }}>
        {pc}%
      </text>
    </svg>
  );
}

function Semaforo({ c }: { c: Record<Senal, number> }) {
  const filas: { s: Senal; n: number }[] = [
    { s: "alerta", n: c.alerta }, { s: "atencion", n: c.atencion },
    { s: "favorable", n: c.favorable },
  ];
  return (
    <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
      {filas.map(({ s, n }) => (
        <span key={s} style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
          <b style={{ fontFamily: "var(--display)", fontSize: 27, fontWeight: 800, color: COLOR[s] }}>
            {n}
          </b>
          <span style={{ fontSize: 14, color: "var(--muted)" }}>
            <span aria-hidden="true">{ICONO[s]}</span> {ROTULO[s].toLowerCase()}
          </span>
        </span>
      ))}
    </div>
  );
}

/** Una pregunta. Cerrada muestra solo la pregunta; abierta, la evidencia. */
function Pregunta({ n, texto, lectura }: { n: number; texto: string; lectura: Lectura }) {
  const [abierta, setAbierta] = useState(false);
  return (
    <article className="card" style={{ borderLeft: `4px solid ${COLOR[lectura.senal]}` }}>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 15, alignItems: "start" }}>
        <span style={{
          width: 38, height: 38, borderRadius: 99, display: "grid", placeItems: "center",
          background: "var(--accent-soft)", color: "var(--accent)", flex: "none",
          fontFamily: "var(--display)", fontWeight: 800, fontSize: 19,
        }}>{n}</span>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontFamily: "var(--display)", fontSize: 21, fontWeight: 700,
                      lineHeight: 1.25, letterSpacing: "-.015em" }}>
            {texto}
          </p>
          <button
            type="button"
            onClick={() => setAbierta(!abierta)}
            aria-expanded={abierta}
            style={{
              marginTop: 11, border: 0, background: "none", padding: 0, cursor: "pointer",
              color: "var(--accent)", fontWeight: 600, fontSize: 14.4,
            }}
          >
            {abierta ? "Ocultar de dónde sale" : "Ver de dónde sale"}
          </button>

          {abierta && (
            <div className="revelado" style={{ marginTop: 13 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center",
                            flexWrap: "wrap", marginBottom: 11 }}>
                <Chip senal={lectura.senal} />
                <span className="lbl" style={{ margin: 0 }}>{lectura.origen}</span>
              </div>
              <p style={{ margin: "0 0 13px", fontSize: 15.6, lineHeight: 1.5 }}>
                {lectura.titular}
              </p>
              {lectura.grafica && <Grafica spec={lectura.grafica} />}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

/** Una conclusión: chip, titular de una línea, figura. El texto largo se pliega. */
function Tarjeta({ l }: { l: Lectura }) {
  return (
    <article className="card" style={{ opacity: l.incompleta ? 0.88 : 1 }}>
      <header style={{ display: "flex", justifyContent: "space-between",
                       alignItems: "baseline", gap: 12, flexWrap: "wrap", marginBottom: 11 }}>
        <h3 style={{ fontSize: 17.5, fontWeight: 700 }}>{l.titulo}</h3>
        <Chip senal={l.senal} />
      </header>

      {l.grafica && <Grafica spec={l.grafica} />}

      <p style={{ margin: "14px 0 0", fontSize: 15.2, lineHeight: 1.5, color: "var(--muted)" }}>
        {l.titular}
      </p>

      {l.detalle && (
        <details className="pista" style={{ marginTop: 12 }}>
          <summary>Detalle</summary>
          <div className="cuerpo">{l.detalle}</div>
        </details>
      )}
    </article>
  );
}

/** El foco de las próximas semanas. Se marca, y lo marcado queda. */
function Foco({ lista, clave }: { lista: ReturnType<typeof focos>; clave: string }) {
  const [hechos, setHechos] = useState<string[]>([]);

  useEffect(() => {
    try {
      const crudo = window.localStorage.getItem(clave);
      if (crudo) setHechos(JSON.parse(crudo) as string[]);
    } catch { /* sin respaldo: la lista arranca vacía, no rota */ }
  }, [clave]);

  const alternar = (id: string) => {
    const siguiente = hechos.includes(id) ? hechos.filter((x) => x !== id) : [...hechos, id];
    setHechos(siguiente);
    try { window.localStorage.setItem(clave, JSON.stringify(siguiente)); } catch { /* ídem */ }
  };

  if (lista.length === 0) return null;
  const faltan = lista.filter((f) => !hechos.includes(f.id)).length;

  return (
    <section className="card" style={{ marginTop: 18 }}>
      <header style={{ display: "flex", justifyContent: "space-between",
                       alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <h2 style={{ fontSize: 19, fontWeight: 700 }}>En qué enfocarte estas semanas</h2>
        <span className="cuenta" style={faltan === 0 ? undefined : { color: "var(--med)" }}>
          {faltan === 0 ? `✓ ${lista.length} de ${lista.length}` : `${lista.length - faltan} de ${lista.length}`}
        </span>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 12 }}>
        {lista.map((f) => {
          const hecho = hechos.includes(f.id);
          return (
            <label key={f.id} style={{
              display: "grid", gridTemplateColumns: "auto 1fr", gap: 12, alignItems: "start",
              padding: "11px 10px", borderRadius: 9, cursor: "pointer",
              background: hecho ? "var(--surface-2)" : undefined,
            }}>
              <input type="checkbox" checked={hecho} onChange={() => alternar(f.id)}
                     style={{ marginTop: 4, width: 19, height: 19, accentColor: "var(--accent)",
                              flex: "none", cursor: "pointer" }} />
              <span style={{ minWidth: 0 }}>
                <span style={{
                  display: "block", fontSize: 15.8, lineHeight: 1.45,
                  textDecoration: hecho ? "line-through" : undefined,
                  color: hecho ? "var(--faint)" : "var(--text)",
                }}>{f.accion}</span>
                <span style={{ fontSize: 13.2, color: COLOR[f.senal], fontWeight: 600 }}>
                  <span aria-hidden="true">{ICONO[f.senal]}</span> {f.origen}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}

export function Tablero({
  lecturas, empresa, modulo, avance, claveFoco, observaciones,
}: {
  lecturas: Lectura[];
  empresa: string;
  modulo: string;
  avance: { resueltos: number; total: number; fraccion: number };
  /** Dónde recordar lo que ya se marcó del foco. Una por bitácora. */
  claveFoco: string;
  /** El recuadro de los profesores. Ausente en el banco de pruebas. */
  observaciones?: React.ReactNode;
}) {
  const pc = Math.round(avance.fraccion * 100);
  const preguntas = tresPreguntas(lecturas);
  const acciones = focos(lecturas);
  const c = conteo(lecturas);
  const yaVistas = new Set(preguntas.map((p) => p.id));
  const resto = lecturas.filter((l) => !yaVistas.has(l.id));

  return (
    <div className="stage">
      <header className="head" style={{ marginBottom: 20 }}>
        <span className="eyebrow">Conclusiones del módulo</span>
        <div style={{ display: "flex", gap: 22, alignItems: "center",
                      flexWrap: "wrap", marginTop: 14 }}>
          <Anillo pc={pc} />
          <div style={{ minWidth: 0, flex: "1 1 280px" }}>
            <h1 style={{ fontFamily: "var(--display)", fontSize: "clamp(25px,3.4vw,33px)",
                         fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1.15 }}>
              {empresa || "Tu bitácora"}
            </h1>
            <p style={{ margin: "7px 0 13px", fontSize: 15.2, color: "var(--muted)" }}>
              {modulo} · {avance.resueltos} de {avance.total} campos
            </p>
            <Semaforo c={c} />
          </div>
        </div>
      </header>

      {lecturas.length === 0 ? (
        <div className="pista" style={{ padding: "14px 16px" }}>
          Todavía no hay respuestas suficientes para concluir nada. Responde unos talleres
          y vuelve.
        </div>
      ) : (
        <>
          {preguntas.length > 0 && (
            <section style={{ marginBottom: 22 }}>
              <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 4 }}>
                Tres preguntas para antes de la próxima sesión
              </h2>
              <p style={{ margin: "0 0 14px", fontSize: 14.6, color: "var(--muted)" }}>
                Salen de cruzar tus propias respuestas. Ninguna la escribiste tú.
              </p>
              <div className="stack">
                {preguntas.map((p, i) => (
                  <Pregunta key={p.id} n={i + 1} texto={p.pregunta} lectura={p.lectura} />
                ))}
              </div>
            </section>
          )}

          <Foco lista={acciones} clave={claveFoco} />

          {resto.length > 0 && (
            <section style={{ marginTop: 22 }}>
              <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>
                El resto del tablero
              </h2>
              <div className="stack">
                {resto.map((l) => <Tarjeta key={l.id} l={l} />)}
              </div>
            </section>
          )}
        </>
      )}

      {observaciones}

      <p style={{ marginTop: 26, fontSize: 13.2, color: "var(--faint)", lineHeight: 1.5 }}>
        Todo esto es aritmética sobre tus respuestas: no hay ningún modelo opinando.
        Cuando una lectura no tiene datos suficientes lo dice, en vez de suponer.
      </p>
    </div>
  );
}
