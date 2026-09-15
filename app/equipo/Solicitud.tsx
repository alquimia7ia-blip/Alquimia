"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clienteNavegador } from "@/lib/supabase/cliente";

/**
 * Aceptar o rechazar a quien pidió entrar a la empresa.
 *
 * La política `membresias_gestiona` ya deja al propietario cambiar las
 * membresías de su empresa, así que esto va directo contra la tabla: no hace
 * falta una ruta de servidor y la base sigue siendo quien decide.
 */
export function Solicitud({ id, nombre }: { id: string; nombre: string }) {
  const router = useRouter();
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function resolver(estado: "activa" | "revocada") {
    setOcupado(true);
    setError(null);
    const { error: err } = await clienteNavegador()
      .from("membresias").update({ estado }).eq("id", id);
    if (err) {
      setError("No se pudo guardar. Inténtalo de nuevo.");
      setOcupado(false);
      return;
    }
    router.refresh();
  }

  return (
    <div className="card" style={{ padding: "10px 13px", display: "flex",
                justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{nombre}</div>
        {error && <div style={{ fontSize: 12, color: "var(--des)" }}>{error}</div>}
      </div>
      <div style={{ display: "flex", gap: 7 }}>
        <button className="btn" disabled={ocupado} onClick={() => resolver("revocada")}>
          Rechazar
        </button>
        <button className="btn pri" disabled={ocupado} onClick={() => resolver("activa")}>
          Aceptar
        </button>
      </div>
    </div>
  );
}
