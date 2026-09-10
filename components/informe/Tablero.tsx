import type { Lectura, Senal } from "@/lib/informe/lecturas";

/**
 * Tablero de conclusiones.
 *
 * Cada lectura se presenta con su señal, su titular y la evidencia que la
 * sostiene. Nada aquí decide qué concluir — eso vive en lecturas.ts; este
 * archivo solo lo dibuja, y se imprime con el mismo CSS del informe.
 */

const COLOR: Record<Senal, string> = {
  favorable: "var(--fav)",
  atencion: "var(--med)",
  alerta: "var(--des)",
  neutro: "var(--faint)",
};

const ICONO: Record<Senal, string> = {
  favorable: "▲", atencion: "◆", alerta: "▼", neutro: "·",
};

const ROTULO: Record<Senal, string> = {
  favorable: "A favor", atencion: "Atención", alerta: "Revisar", neutro: "Sin datos",
};

function Barras({ barras }: { barras: NonNullable<Lectura["barras"]> }) {
  return (
    <div className="bars" style={{ marginTop: 14 }}>
      {barras.map((b, i) => (
        <div className="bar-row" key={i}>
          <span>{b.rotulo}</span>
          <span className="bar">
            <i style={{
              width: `${b.total ? Math.min(100, (b.valor / b.total) * 100) : 0}%`,
              background: b.color ? `var(--${b.color})` : undefined,
            }} />
          </span>
          <span className="pc">{b.valor}/{b.total}</span>
        </div>
      ))}
    </div>
  );
}

function Tarjeta({ l }: { l: Lectura }) {
  return (
    <article className="card lectura" style={{ opacity: l.incompleta ? 0.82 : 1 }}>
      <header style={{ display: "flex", justifyContent: "space-between",
                       alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h3 style={{ fontSize: 16.5, fontWeight: 700 }}>{l.titulo}</h3>
          <p className="lbl" style={{ margin: "5px 0 0" }}>{l.origen}</p>
        </div>
        <span className="xp" style={{ color: COLOR[l.senal], whiteSpace: "nowrap" }}>
          <span aria-hidden="true">{ICONO[l.senal]}</span> {ROTULO[l.senal]}
        </span>
      </header>

      <p style={{ margin: "13px 0 0", fontSize: 15.5, lineHeight: 1.5,
                  borderLeft: `3px solid ${COLOR[l.senal]}`, paddingLeft: 12 }}>
        {l.titular}
      </p>

      {l.cifras && (
        <div className="sum-grid" style={{ marginTop: 14 }}>
          {l.cifras.map((c, i) => (
            <div className="tile" key={i}>
              <div className="n" style={{ color: c.color ? `var(--${c.color})` : undefined }}>{c.n}</div>
              <div className="k">{c.k}</div>
            </div>
          ))}
        </div>
      )}

      {l.barras && l.barras.length > 0 && <Barras barras={l.barras} />}

      {l.detalle && (
        <p style={{ margin: "13px 0 0", fontSize: 13.2, color: "var(--muted)" }}>{l.detalle}</p>
      )}
    </article>
  );
}

export function Tablero({
  lecturas, empresa, modulo, avance,
}: {
  lecturas: Lectura[];
  empresa: string;
  modulo: string;
  avance: { resueltos: number; total: number; fraccion: number };
}) {
  const pc = Math.round(avance.fraccion * 100);
  const alertas = lecturas.filter((l) => l.senal === "alerta").length;

  return (
    <div className="stage">
      <header className="head">
        <span className="eyebrow">Conclusiones del módulo</span>
        <h1 className="h-taller">
          {empresa ? `Lo que dice la bitácora de ${empresa}` : "Lo que dice tu bitácora"}
        </h1>
        <p className="lead">
          {modulo} · {avance.resueltos} de {avance.total} campos resueltos.
          {" "}
          {pc < 40
            ? "Con esta parte respondida, léelo como un adelanto: las conclusiones se afinan a medida que completas."
            : "Nada de esto lo escribiste: sale de cruzar tus propias respuestas."}
        </p>
      </header>

      {pc < 15 && (
        <div className="hint" style={{ marginBottom: 20 }}>
          <b>Vas en {pc}%.</b> El tablero ya funciona, pero con tan pocas respuestas
          dice más sobre lo que falta que sobre tu empresa.
        </div>
      )}

      {alertas > 0 && (
        <div className="sum-grid" style={{ marginBottom: 20 }}>
          <div className="tile">
            <div className="n" style={{ color: "var(--des)" }}>{alertas}</div>
            <div className="k">{alertas === 1 ? "punto a revisar" : "puntos a revisar"}</div>
          </div>
          <div className="tile">
            <div className="n">{lecturas.length}</div>
            <div className="k">lecturas calculadas</div>
          </div>
          <div className="tile">
            <div className="n">{pc}%</div>
            <div className="k">del módulo resuelto</div>
          </div>
        </div>
      )}

      <div className="stack">
        {lecturas.length === 0
          ? <div className="hint">Todavía no hay respuestas suficientes para concluir nada.</div>
          : lecturas.map((l) => <Tarjeta key={l.id} l={l} />)}
      </div>

      <p style={{ marginTop: 26, fontSize: 12.5, color: "var(--faint)", lineHeight: 1.5 }}>
        Estas lecturas se calculan con aritmética sobre tus respuestas: no hay ningún
        modelo opinando. Cuando una no tiene datos suficientes lo dice, en vez de suponer.
      </p>
    </div>
  );
}
