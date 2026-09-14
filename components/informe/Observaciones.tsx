"use client";

import { useState } from "react";
import { clienteNavegador } from "@/lib/supabase/cliente";

/**
 * Observaciones del programa.
 *
 * Dos orígenes en un mismo recuadro: lo que el facilitador escribe desde su
 * panel, y lo que la empresa anota de lo que oyó en la sesión. Se guardan en
 * `comentarios` con la columna `origen`, así que cuando exista el panel del
 * facilitador sus comentarios caen aquí sin tocar esta pantalla.
 */

export type Observacion = {
  id: string;
  cuerpo: string;
  origen: "empresa" | "facilitador";
  autor: string;
  fecha: string;
  mia: boolean;
};

const dia = (iso: string) =>
  new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short" });

export function Observaciones({
  bitacoraId, perfilId, iniciales,
}: { bitacoraId: string; perfilId: string; iniciales: Observacion[] }) {
  const [lista, setLista] = useState(iniciales);
  const [texto, setTexto] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const guardar = async () => {
    const cuerpo = texto.trim();
    if (cuerpo === "" || guardando) return;
    setGuardando(true);
    setError("");
    const supabase = clienteNavegador();
    const { data, error: e } = await supabase
      .from("comentarios")
      .insert({ bitacora_id: bitacoraId, autor_id: perfilId, cuerpo, origen: "empresa" })
      .select("id, cuerpo, origen, creado_at")
      .single();
    setGuardando(false);
    if (e || !data) {
      setError(`No se pudo guardar: ${e?.message ?? "sin respuesta del servidor"}`);
      return;
    }
    setLista([...lista, {
      id: data.id, cuerpo: data.cuerpo, origen: "empresa",
      autor: "Tú", fecha: data.creado_at, mia: true,
    }]);
    setTexto("");
  };

  const borrar = async (id: string) => {
    const supabase = clienteNavegador();
    const { error: e } = await supabase.from("comentarios").delete().eq("id", id);
    if (e) { setError(`No se pudo borrar: ${e.message}`); return; }
    setLista(lista.filter((o) => o.id !== id));
  };

  return (
    <section className="card" style={{ marginTop: 18 }}>
      <h2 style={{ fontSize: 19, fontWeight: 700 }}>Observaciones del programa</h2>
      <p style={{ margin: "6px 0 14px", fontSize: 14.6, color: "var(--muted)" }}>
        Lo que dijeron los profesores en la sesión, y lo que ellos dejen escrito.
      </p>

      {lista.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
          {lista.map((o) => (
            <article key={o.id} style={{
              background: o.origen === "facilitador" ? "var(--pista-soft)" : "var(--surface-2)",
              border: `1px solid ${o.origen === "facilitador" ? "var(--pista-line)" : "var(--line)"}`,
              borderRadius: 10, padding: "12px 14px",
            }}>
              <div style={{ display: "flex", gap: 10, alignItems: "baseline",
                            justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{
                  fontSize: 12.6, letterSpacing: ".08em", textTransform: "uppercase",
                  fontWeight: 700,
                  color: o.origen === "facilitador" ? "var(--pista)" : "var(--faint)",
                }}>
                  {o.origen === "facilitador" ? "Profesor" : o.autor} · {dia(o.fecha)}
                </span>
                {o.mia && (
                  <button className="del" type="button" title="Borrar"
                          onClick={() => borrar(o.id)}>×</button>
                )}
              </div>
              <p style={{ margin: 0, fontSize: 15.6, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                {o.cuerpo}
              </p>
            </article>
          ))}
        </div>
      )}

      {error && <div className="error-sesion">{error}</div>}

      <textarea
        className="f"
        rows={3}
        value={texto}
        placeholder="Anota aquí lo que te señaló el profesor…"
        onChange={(e) => setTexto(e.target.value)}
        style={{ minHeight: 76 }}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
        <button className="btn pri" type="button" onClick={guardar}
                disabled={guardando || texto.trim() === ""}
                style={texto.trim() === "" ? { opacity: 0.5, cursor: "default" } : undefined}>
          {guardando ? "Guardando…" : "Guardar observación"}
        </button>
      </div>
    </section>
  );
}
