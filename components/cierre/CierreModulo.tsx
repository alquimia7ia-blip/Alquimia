"use client";

import { useState } from "react";
import { clienteNavegador } from "@/lib/supabase/cliente";

/**
 * El cierre del módulo: felicitación y tres preguntas.
 *
 * Va al final, después del resumen, cuando la persona ya vio lo que hizo.
 * Felicitar antes de eso sería felicitar por nada.
 *
 * Las tres preguntas no son opcionales por descuido: media respuesta
 * sincera vale más que tres campos llenados por salir del paso, así que se
 * puede enviar con una sola. Lo que no se hace es fingir que no se envió —
 * una vez guardada, se ve y se puede corregir.
 */

export type Valoracion = { gusto: string; falto: string; mejoraria: string };

const PREGUNTAS: { campo: keyof Valoracion; titulo: string; marcador: string }[] = [
  {
    campo: "gusto",
    titulo: "¿Qué te sirvió de este módulo?",
    marcador: "El ejercicio que te hizo ver algo que no habías visto…",
  },
  {
    campo: "falto",
    titulo: "¿Qué no te gustó, o qué le faltó?",
    marcador: "Lo que te pareció confuso, largo, o que sobraba…",
  },
  {
    campo: "mejoraria",
    titulo: "¿Qué mejorarías para la próxima cohorte?",
    marcador: "Si tú lo dictaras, ¿qué cambiarías?",
  },
];

export function CierreModulo({
  bitacoraId, perfilId, modulo, fraccion, inicial,
}: {
  bitacoraId: string;
  perfilId: string;
  modulo: string;
  fraccion: number;
  /** Lo ya respondido. Se puede corregir. */
  inicial?: Valoracion;
}) {
  const [v, setV] = useState<Valoracion>(
    inicial ?? { gusto: "", falto: "", mejoraria: "" },
  );
  const [guardada, setGuardada] = useState(Boolean(inicial));
  const [editando, setEditando] = useState(!inicial);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const pc = Math.round(fraccion * 100);
  const algo = Object.values(v).some((x) => x.trim() !== "");

  const guardar = async () => {
    if (!algo || guardando) return;
    setGuardando(true);
    setError("");
    const supabase = clienteNavegador();
    const { error: e } = await supabase
      .from("valoraciones")
      .upsert(
        {
          bitacora_id: bitacoraId, autor_id: perfilId,
          gusto: v.gusto.trim() || null,
          falto: v.falto.trim() || null,
          mejoraria: v.mejoraria.trim() || null,
        },
        { onConflict: "bitacora_id,autor_id" },
      );
    setGuardando(false);
    if (e) {
      setError(`No se pudo guardar: ${e.message}`);
      return;
    }
    setGuardada(true);
    setEditando(false);
  };

  return (
    <section style={{ marginTop: 26 }}>
      {/* Felicitación */}
      <div className="card" style={{
        borderLeft: "4px solid var(--fav)",
        background: "var(--fav-soft)", borderColor: "var(--fav-line)",
      }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <span aria-hidden="true" style={{ fontSize: 28, lineHeight: 1 }}>🎉</span>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: 21, fontWeight: 700, color: "var(--fav)" }}>
              {pc >= 100
                ? "Terminaste el módulo completo"
                : `Llevas el ${pc}% de ${modulo}`}
            </h2>
            <p style={{ margin: "7px 0 0", fontSize: 16, lineHeight: 1.5 }}>
              {pc >= 100
                ? "Lo que acabas de llenar no es un formulario: es el diagnóstico de tu " +
                  "empresa escrito por ti. Descarga el informe y léelo completo antes de " +
                  "la próxima sesión."
                : "Lo que llevas ya dice cosas sobre tu empresa. Puedes seguir " +
                  "completando cuando quieras: todo queda guardado."}
            </p>
          </div>
        </div>
      </div>

      {/* Las tres preguntas */}
      <div className="card" style={{ marginTop: 14 }}>
        <header style={{ display: "flex", justifyContent: "space-between",
                         alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          <h2 style={{ fontSize: 19, fontWeight: 700 }}>Ayúdanos a mejorar el taller</h2>
          {guardada && !editando && (
            <span className="cuenta full">✓ Enviada</span>
          )}
        </header>
        <p style={{ margin: "6px 0 0", fontSize: 14.6, color: "var(--muted)" }}>
          Tres preguntas, y ninguna obligatoria. Las leen quienes dictan el programa.
        </p>

        {guardada && !editando ? (
          <div style={{ marginTop: 14 }}>
            {PREGUNTAS.filter((p) => v[p.campo].trim() !== "").map((p) => (
              <div key={p.campo} style={{ marginBottom: 12 }}>
                <span className="lbl" style={{ margin: 0 }}>{p.titulo}</span>
                <p style={{ margin: "4px 0 0", fontSize: 15.6, lineHeight: 1.5 }}>
                  {v[p.campo]}
                </p>
              </div>
            ))}
            <button className="btn" type="button" onClick={() => setEditando(true)}>
              Corregir mi respuesta
            </button>
          </div>
        ) : (
          <>
            {PREGUNTAS.map((p, i) => (
              <div key={p.campo} style={{ marginTop: i === 0 ? 14 : 12 }}>
                <span className="lbl" style={{ margin: 0 }}>{i + 1} · {p.titulo}</span>
                <textarea
                  className="f"
                  rows={2}
                  value={v[p.campo]}
                  placeholder={p.marcador}
                  onChange={(ev) => setV({ ...v, [p.campo]: ev.target.value })}
                  style={{ minHeight: 58, marginTop: 6 }}
                />
              </div>
            ))}

            {error && <div className="error-sesion" style={{ marginTop: 12 }}>{error}</div>}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
              {guardada && (
                <button className="btn" type="button" onClick={() => setEditando(false)}>
                  Cancelar
                </button>
              )}
              <button className="btn pri" type="button" onClick={guardar}
                      disabled={!algo || guardando}
                      style={!algo ? { opacity: 0.5, cursor: "default" } : undefined}>
                {guardando ? "Enviando…" : "Enviar"}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
