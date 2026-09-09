"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { clienteNavegador } from "@/lib/supabase/cliente";

const VERSION_POLITICA = "2026-09-01";

function Formulario() {
  const router = useRouter();
  const [sesion, setSesion] = useState<"cargando" | "lista" | "sin-enlace">("cargando");
  const [clave, setClave] = useState("");
  const [repetida, setRepetida] = useState("");
  const [tratamiento, setTratamiento] = useState(false);
  const [transferencia, setTransferencia] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // El enlace del correo trae la sesión en el fragmento de la URL; el cliente
  // de Supabase la canjea solo al cargarse.
  useEffect(() => {
    const supabase = clienteNavegador();
    supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session ? "lista" : "sin-enlace");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_, s) => {
      if (s) setSesion("lista");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function definir(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (clave.length < 8) return setError("La contraseña necesita al menos 8 caracteres.");
    if (clave !== repetida) return setError("Las dos contraseñas no coinciden.");
    if (!tratamiento || !transferencia) {
      return setError("Para continuar hay que autorizar ambos tratamientos de datos.");
    }

    setEnviando(true);
    const supabase = clienteNavegador();
    const { data: usuario, error: errClave } = await supabase.auth.updateUser({ password: clave });
    if (errClave || !usuario.user) {
      setError("No se pudo guardar la contraseña. Pide una invitación nueva.");
      setEnviando(false);
      return;
    }

    // Se registran por separado: la transferencia internacional exige
    // autorización propia y hay que poder probarla después.
    await supabase.from("consentimientos").insert([
      { perfil_id: usuario.user.id, tipo: "tratamiento_datos",
        version_politica: VERSION_POLITICA, aceptado: true, agente: navigator.userAgent },
      { perfil_id: usuario.user.id, tipo: "transferencia_internacional",
        version_politica: VERSION_POLITICA, aceptado: true, agente: navigator.userAgent },
    ]);

    router.push("/");
    router.refresh();
  }

  if (sesion === "cargando") {
    return <div className="tarjeta-sesion"><p className="sub">Validando el enlace…</p></div>;
  }

  if (sesion === "sin-enlace") {
    return (
      <div className="tarjeta-sesion">
        <h1>Este enlace ya no sirve</h1>
        <p className="sub">
          Los enlaces de invitación caducan. Pídele uno nuevo a quien coordina el programa,
          o recupera tu contraseña si ya tenías cuenta.
        </p>
        <div className="pie-sesion">
          <Link href="/recuperar">Recuperar contraseña</Link>
          <Link href="/entrar">Entrar</Link>
        </div>
      </div>
    );
  }

  return (
    <form className="tarjeta-sesion" onSubmit={definir}>
      <h1>Define tu contraseña</h1>
      <p className="sub">Es la última vez que necesitas el correo de invitación.</p>

      {error && <div className="error-sesion">{error}</div>}

      <div className="campo-sesion">
        <label htmlFor="clave">Contraseña</label>
        <input id="clave" type="password" value={clave} autoComplete="new-password" required
               onChange={(e) => setClave(e.target.value)} />
      </div>
      <div className="campo-sesion">
        <label htmlFor="repetida">Repítela</label>
        <input id="repetida" type="password" value={repetida} autoComplete="new-password" required
               onChange={(e) => setRepetida(e.target.value)} />
      </div>

      <label className="consentimiento">
        <input type="checkbox" checked={tratamiento}
               onChange={(e) => setTratamiento(e.target.checked)} />
        <span>
          Autorizo el tratamiento de mis datos personales conforme a la{" "}
          <Link href="/politica-de-datos">política de tratamiento de datos</Link>, para
          participar en el programa.
        </span>
      </label>

      <label className="consentimiento">
        <input type="checkbox" checked={transferencia}
               onChange={(e) => setTransferencia(e.target.checked)} />
        <span>
          Autorizo que mis datos se almacenen en servidores ubicados en Estados Unidos,
          país que Colombia no ha declarado con nivel adecuado de protección.
        </span>
      </label>

      <button className="btn pri btn-ancho" type="submit" disabled={enviando}>
        {enviando ? "Guardando…" : "Entrar a mi bitácora"}
      </button>
    </form>
  );
}

export default function Invitacion() {
  return (
    <div className="portada">
      <Suspense fallback={<div className="tarjeta-sesion">Cargando…</div>}>
        <Formulario />
      </Suspense>
    </div>
  );
}
