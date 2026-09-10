"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { clienteNavegador } from "@/lib/supabase/cliente";

/**
 * A qué empresa pertenece quien acaba de registrarse.
 *
 * Es la única pregunta que el registro no puede evitar: la bitácora es de la
 * empresa, no de la persona. Un campo y una lista de las que ya existen, para
 * que dos personas del mismo sitio no terminen en dos empresas distintas
 * escritas casi igual.
 *
 * Quien nombra una empresa nueva la administra. Quien se suma a una existente
 * queda a la espera de que su propietario lo acepte — si no, bastaría con
 * adivinar el nombre de un competidor para entrar a ver sus cifras.
 */
export default function Empresa() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [existentes, setExistentes] = useState<string[]>([]);
  const [estado, setEstado] = useState<"escribiendo" | "pendiente">("escribiendo");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    clienteNavegador().rpc("empresas_de_la_cohorte").then(({ data }) => {
      if (Array.isArray(data)) setExistentes(data.map((e: { nombre: string }) => e.nombre));
    });
  }, []);

  async function continuar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);

    const { data, error: err } = await clienteNavegador()
      .rpc("unirse_a_empresa", { nombre_empresa: nombre });

    if (err) {
      setError(err.message);
      setEnviando(false);
      return;
    }

    const resultado = String(data ?? "");
    if (resultado === "pendiente") {
      setEstado("pendiente");
      setEnviando(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  if (estado === "pendiente") {
    return (
      <div className="portada">
        <div className="tarjeta-sesion">
          <h1>Falta que te acepten</h1>
          <p className="sub">
            <b>{nombre}</b> ya está registrada. Quien la administra tiene que aceptarte
            desde la pantalla de equipo — avísale y vuelve a entrar después.
          </p>
          <div className="pie-sesion"><Link href="/entrar">Volver a entrar</Link></div>
        </div>
      </div>
    );
  }

  const coincide = existentes.find(
    (e) => e.toLowerCase().trim() === nombre.toLowerCase().trim(),
  );

  return (
    <div className="portada">
      <form className="tarjeta-sesion" onSubmit={continuar}>
        <h1>¿Cuál es tu empresa?</h1>
        <p className="sub">La bitácora es de la empresa: varias personas trabajan sobre la misma.</p>

        {error && <div className="error-sesion">{error}</div>}

        <div className="campo-sesion">
          <label htmlFor="empresa">Nombre de la empresa</label>
          <input id="empresa" value={nombre} required autoComplete="organization"
                 placeholder="Como aparece en la cámara de comercio"
                 onChange={(e) => setNombre(e.target.value)} />
        </div>

        {coincide ? (
          <div className="hint">
            <b>{coincide}</b> ya está registrada. Vas a entrar como miembro, en cuanto
            quien la administra te acepte.
          </div>
        ) : nombre.trim().length > 1 ? (
          <div className="hint" style={{ borderLeftColor: "var(--fav)" }}>
            Vas a crear <b>{nombre.trim()}</b> y quedarás como su administrador. Después
            podrás sumar a tus compañeros.
          </div>
        ) : null}

        {existentes.length > 0 && (
          <>
            <span className="lbl" style={{ marginTop: 16 }}>Empresas ya registradas</span>
            <div className="sugs">
              {existentes.map((e) => (
                <button type="button" key={e} className="sug" onClick={() => setNombre(e)}>{e}</button>
              ))}
            </div>
          </>
        )}

        <button className="btn pri btn-ancho" type="submit" disabled={enviando}>
          {enviando ? "Un momento…" : "Continuar"}
        </button>
      </form>
    </div>
  );
}
