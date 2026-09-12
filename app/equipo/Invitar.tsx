"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Formulario para sumar a un compañero al equipo de la empresa. */
export function Invitar({ empresaId }: { empresaId: string }) {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState<"miembro" | "lector">("miembro");
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function invitar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAviso(null);
    setEnviando(true);

    const respuesta = await fetch("/api/invitaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, empresaId, rol }),
    });
    const datos = await respuesta.json().catch(() => ({}));
    setEnviando(false);

    if (!respuesta.ok) {
      setError(datos.error ?? "No se pudo invitar.");
      return;
    }
    setAviso(
      datos.yaTeniaCuenta
        ? `${correo} ya tenía cuenta y quedó vinculado al equipo.`
        : `Invitación enviada a ${correo}.`,
    );
    setCorreo("");
    router.refresh();
  }

  return (
    <form onSubmit={invitar}>
      <span className="lbl">Sumar a alguien</span>

      {error && <div className="error-sesion" style={{ marginTop: 8 }}>{error}</div>}
      {aviso && (
        <div className="hint" style={{ marginTop: 8, borderLeftColor: "var(--fav)" }}>{aviso}</div>
      )}

      <div className="campo-sesion" style={{ marginTop: 10 }}>
        <label htmlFor="correo-invitado">Correo</label>
        <input
          id="correo-invitado"
          type="email"
          value={correo}
          required
          autoComplete="off"
          placeholder="compañero@tuempresa.co"
          onChange={(e) => setCorreo(e.target.value)}
        />
      </div>

      <div className="campo-sesion">
        <label htmlFor="rol-invitado">Qué podrá hacer</label>
        <select
          id="rol-invitado"
          value={rol}
          onChange={(e) => setRol(e.target.value === "lector" ? "lector" : "miembro")}
          style={{
            width: "100%", background: "var(--surface-2)", border: "1px solid var(--line)",
            borderRadius: 10, padding: "10px 12px", fontSize: 15,
          }}
        >
          <option value="miembro">Responder los talleres</option>
          <option value="lector">Solo leer</option>
        </select>
      </div>

      <button className="btn pri btn-ancho" type="submit" disabled={enviando}>
        {enviando ? "Enviando…" : "Enviar invitación"}
      </button>
    </form>
  );
}
