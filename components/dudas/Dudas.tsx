"use client";

import { useState } from "react";
import { clienteNavegador } from "@/lib/supabase/cliente";

/**
 * Registro de dudas.
 *
 * Dos sitios, un mismo componente: al pie de cada taller —donde la duda
 * aparece de verdad— y en el tablero, donde se ven todas las del módulo.
 * Al pie de un taller queda registrado a cuál pertenece; desde el tablero,
 * sin taller.
 *
 * Es deliberadamente tonto: no responde nada. Su trabajo es producir la
 * lista real de preguntas de la cohorte, que es lo que decide si vale la
 * pena un asistente y, si vale, con qué material se construye.
 */

export type Duda = {
  id: string;
  cuerpo: string;
  tallerId: string | null;
  estado: "abierta" | "resuelta";
  fecha: string;
  mia: boolean;
};

const dia = (iso: string) =>
  new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short" });

export function Dudas({
  bitacoraId, perfilId, tallerId, iniciales, nombreTaller, compacto,
}: {
  bitacoraId: string;
  perfilId: string;
  /** El taller abierto. Ausente en el tablero. */
  tallerId?: string;
  iniciales: Duda[];
  /** Cómo se llama cada taller, para rotular la lista del tablero. */
  nombreTaller?: (id: string | null) => string;
  /** Al pie del taller: sin lista, solo el campo. */
  compacto?: boolean;
}) {
  const propias = tallerId
    ? iniciales.filter((d) => d.tallerId === tallerId)
    : iniciales;

  const [lista, setLista] = useState(propias);
  const [texto, setTexto] = useState("");
  const [abierto, setAbierto] = useState(!compacto);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const guardar = async () => {
    const cuerpo = texto.trim();
    if (cuerpo === "" || guardando) return;
    setGuardando(true);
    setError("");
    const supabase = clienteNavegador();
    const { data, error: e } = await supabase
      .from("dudas")
      .insert({
        bitacora_id: bitacoraId, autor_id: perfilId, cuerpo,
        taller_id: tallerId ?? null,
      })
      .select("id, cuerpo, taller_id, estado, creado_at")
      .single();
    setGuardando(false);
    if (e || !data) {
      setError(`No se pudo guardar: ${e?.message ?? "sin respuesta del servidor"}`);
      return;
    }
    setLista([...lista, {
      id: data.id, cuerpo: data.cuerpo, tallerId: data.taller_id,
      estado: "abierta", fecha: data.creado_at, mia: true,
    }]);
    setTexto("");
  };

  const borrar = async (id: string) => {
    const supabase = clienteNavegador();
    const { error: e } = await supabase.from("dudas").delete().eq("id", id);
    if (e) { setError(`No se pudo borrar: ${e.message}`); return; }
    setLista(lista.filter((d) => d.id !== id));
  };

  const campo = (
    <>
      {error && <div className="error-sesion" style={{ marginTop: 10 }}>{error}</div>}
      <textarea
        className="f"
        rows={compacto ? 2 : 3}
        value={texto}
        placeholder={compacto
          ? "Ej.: no entendí qué va en «atributos diferenciales»…"
          : "¿Qué te quedó sin entender de este módulo?"}
        onChange={(e) => setTexto(e.target.value)}
        style={{ minHeight: compacto ? 58 : 76, marginTop: 10 }}
      />
      <div style={{ display: "flex", justifyContent: "space-between",
                    alignItems: "center", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13.2, color: "var(--faint)" }}>
          Nadie te la responde aquí: la ven los profesores del programa.
        </span>
        <button className="btn pri" type="button" onClick={guardar}
                disabled={guardando || texto.trim() === ""}
                style={texto.trim() === "" ? { opacity: 0.5, cursor: "default" } : undefined}>
          {guardando ? "Guardando…" : "Anotar la duda"}
        </button>
      </div>
    </>
  );

  // Al pie de un taller: plegado, para no competir con el ejercicio.
  if (compacto) {
    return (
      <section style={{ marginTop: 26 }}>
        <button
          type="button"
          onClick={() => setAbierto(!abierto)}
          aria-expanded={abierto}
          className="mini"
          style={{ width: "auto" }}
        >
          <span aria-hidden="true">💬</span>
          {lista.length > 0
            ? `${lista.length} ${lista.length === 1 ? "duda anotada" : "dudas anotadas"} en este taller`
            : "¿Algo de este taller no te quedó claro?"}
        </button>

        {abierto && (
          <div className="card revelado" style={{ marginTop: 10 }}>
            {lista.map((d) => (
              <div key={d.id} style={{ display: "flex", gap: 10, alignItems: "flex-start",
                                       justifyContent: "space-between", marginBottom: 9 }}>
                <p style={{ margin: 0, fontSize: 15.2, lineHeight: 1.45 }}>{d.cuerpo}</p>
                {d.mia && (
                  <button className="del" type="button" title="Borrar"
                          onClick={() => borrar(d.id)}>×</button>
                )}
              </div>
            ))}
            {campo}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="card" style={{ marginTop: 18 }}>
      <h2 style={{ fontSize: 19, fontWeight: 700 }}>Dudas del módulo</h2>
      <p style={{ margin: "6px 0 0", fontSize: 14.6, color: "var(--muted)" }}>
        Lo que quedó sin resolver. Es lo que el profesor debería atacar en la
        próxima sesión.
      </p>

      {lista.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
          {lista.map((d) => (
            <article key={d.id} style={{
              background: "var(--surface-2)", border: "1px solid var(--line)",
              borderRadius: 10, padding: "11px 13px",
            }}>
              <div style={{ display: "flex", gap: 10, alignItems: "baseline",
                            justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12.6, letterSpacing: ".08em", textTransform: "uppercase",
                               fontWeight: 700, color: "var(--faint)" }}>
                  {nombreTaller?.(d.tallerId) ?? "Del módulo"} · {dia(d.fecha)}
                </span>
                {d.mia && (
                  <button className="del" type="button" title="Borrar"
                          onClick={() => borrar(d.id)}>×</button>
                )}
              </div>
              <p style={{ margin: 0, fontSize: 15.6, lineHeight: 1.5 }}>{d.cuerpo}</p>
            </article>
          ))}
        </div>
      )}

      {campo}
    </section>
  );
}
