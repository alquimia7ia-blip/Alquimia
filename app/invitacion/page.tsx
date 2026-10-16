"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { clienteNavegador } from "@/lib/supabase/cliente";
import {
  DESTINOS, mensajeDeEnlace, mensajeDeGuardado, problemaDeClave,
} from "@/lib/auth/recuperacion";

const VERSION_POLITICA = "2026-09-01";

/**
 * Esta pantalla es solo para la primera entrada: define la clave **y** recoge
 * los dos consentimientos de datos. Recuperar una contraseña olvidada pasa
 * por `/clave-nueva`, que no vuelve a pedir permisos ya firmados ni duplica
 * las filas de `consentimientos`.
 */
function Formulario() {
  const router = useRouter();
  const parametros = useSearchParams();
  const [sesion, setSesion] = useState<"cargando" | "lista" | "sin-enlace">("cargando");
  const [clave, setClave] = useState("");
  const [repetida, setRepetida] = useState("");
  const [tratamiento, setTratamiento] = useState(false);
  const [transferencia, setTransferencia] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const recuperando = parametros.get("modo") === "recuperar"
    || parametros.get("type") === "recovery";

  // Los correos de recuperación que ya se enviaron apuntan aquí con
  // `?modo=recuperar`, y esta pantalla ignoraba ese parámetro: pedía los dos
  // consentimientos otra vez. Se reenvían a su pantalla con `location`, no
  // con el router, porque hay que arrastrar el fragmento `#access_token=…`
  // —ahí viene la sesión en las plantillas antiguas— y el router lo descarta.
  useEffect(() => {
    if (!recuperando) return;
    const { search, hash } = window.location;
    window.location.replace(`${DESTINOS.recuperacion}${search}${hash}`);
  }, [recuperando]);

  // El enlace del correo trae la sesión en el fragmento de la URL; el cliente
  // de Supabase la canjea solo al cargarse. Si vino por `/auth/confirmar`, ya
  // está en las cookies y `getSession()` la encuentra de entrada.
  useEffect(() => {
    if (recuperando) return;
    const supabase = clienteNavegador();
    let vivo = true;
    supabase.auth.getSession().then(({ data }) => {
      if (vivo) setSesion(data.session ? "lista" : "sin-enlace");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_, s) => {
      if (s) setSesion("lista");
    });
    return () => { vivo = false; sub.subscription.unsubscribe(); };
  }, [recuperando]);

  async function definir(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const problema = problemaDeClave(clave, repetida);
    if (problema) return setError(problema);
    if (!tratamiento || !transferencia) {
      return setError("Para continuar hay que autorizar ambos tratamientos de datos.");
    }

    setEnviando(true);
    const supabase = clienteNavegador();
    const { data: usuario, error: errClave } = await supabase.auth.updateUser({ password: clave });
    if (errClave || !usuario.user) {
      // Decir por qué: «pide una invitación nueva» es el consejo equivocado
      // cuando el problema es que la clave es la misma o demasiado débil.
      setError(errClave
        ? mensajeDeGuardado(errClave)
        : "No se pudo guardar la contraseña. Pide una invitación nueva.");
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

  if (recuperando || sesion === "cargando") {
    return <div className="tarjeta-sesion"><p className="sub">Validando el enlace…</p></div>;
  }

  if (sesion === "sin-enlace") {
    return (
      <div className="tarjeta-sesion">
        <h1>No pudimos abrir el enlace</h1>
        <p className="sub">
          {parametros.get("aviso")
            ?? mensajeDeEnlace({
              error: parametros.get("error"),
              error_code: parametros.get("error_code"),
              error_description: parametros.get("error_description"),
            })
            ?? "Los enlaces de invitación caducan. Pídele uno nuevo a quien coordina el "
               + "programa, o recupera tu contraseña si ya tenías cuenta."}
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
