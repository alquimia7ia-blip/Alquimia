"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { clienteNavegador } from "@/lib/supabase/cliente";
import {
  MINIMO_CLAVE, mensajeDeEnlace, mensajeDeGuardado, problemaDeClave,
} from "@/lib/auth/recuperacion";

/**
 * Definir una contraseña nueva tras abrir el enlace del correo.
 *
 * Antes esto caía en `/invitacion`, que es otra cosa: esa pantalla pide los
 * dos consentimientos de datos y los inserta, de modo que recuperar la clave
 * volvía a pedir permisos ya firmados y duplicaba las filas de
 * `consentimientos`. Quien solo olvidó la contraseña no tiene por qué
 * autorizar nada otra vez; esta pantalla pide lo único que falta.
 *
 * La sesión puede llegar de dos maneras y las dos se contemplan:
 *
 *  - En cookies, porque `/auth/confirmar` ya canjeó el token en el servidor.
 *    Es la vía normal y la que funciona al abrir el correo en otro
 *    dispositivo.
 *  - En el fragmento (`#access_token=…`), que nunca viaja al servidor y que
 *    el cliente de Supabase canjea solo al cargarse. Las plantillas de
 *    correo antiguas siguen mandando eso, y los enlaces ya enviados también.
 */
function Formulario() {
  const router = useRouter();
  const parametros = useSearchParams();
  const [sesion, setSesion] = useState<"cargando" | "lista" | "sin-enlace">("cargando");
  const [clave, setClave] = useState("");
  const [repetida, setRepetida] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Lo que el servidor no pudo canjear llega como aviso en la URL, ya
  // traducido a una instrucción.
  const avisoServidor = parametros.get("aviso");
  const avisoEnlace = mensajeDeEnlace({
    error: parametros.get("error"),
    error_code: parametros.get("error_code"),
    error_description: parametros.get("error_description"),
  });

  useEffect(() => {
    const supabase = clienteNavegador();
    let vivo = true;
    supabase.auth.getSession().then(({ data }) => {
      if (vivo) setSesion(data.session ? "lista" : "sin-enlace");
    });
    // El canje del fragmento termina después del primer render: sin esto, un
    // enlace bueno se anunciaba como vencido durante una fracción de segundo.
    const { data: sub } = supabase.auth.onAuthStateChange((_, s) => {
      if (s) setSesion("lista");
    });
    return () => { vivo = false; sub.subscription.unsubscribe(); };
  }, []);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    const problema = problemaDeClave(clave, repetida);
    if (problema) return setError(problema);

    setError(null);
    setGuardando(true);
    const { error: err } = await clienteNavegador().auth.updateUser({ password: clave });
    if (err) {
      setError(mensajeDeGuardado(err));
      setGuardando(false);
      return;
    }

    // Queda con sesión abierta: pedirle entrar de nuevo con la clave que
    // acaba de escribir no agrega seguridad, solo un paso más.
    router.push("/");
    router.refresh();
  }

  if (sesion === "cargando") {
    return <div className="tarjeta-sesion"><p className="sub">Validando el enlace…</p></div>;
  }

  if (sesion === "sin-enlace") {
    return (
      <div className="tarjeta-sesion">
        <h1>No pudimos abrir el enlace</h1>
        <p className="sub">
          {avisoServidor ?? avisoEnlace
            ?? "Los enlaces de recuperación caducan en una hora y sirven una sola vez. "
               + "Pide uno nuevo y ábrelo desde el mismo dispositivo donde lo pediste."}
        </p>
        <div className="pie-sesion">
          <Link href="/recuperar">Pedir otro enlace</Link>
          <Link href="/entrar">Entrar</Link>
        </div>
      </div>
    );
  }

  return (
    <form className="tarjeta-sesion" onSubmit={guardar}>
      <h1>Define tu contraseña nueva</h1>
      <p className="sub">
        Al guardarla entras directo a tu bitácora. Mínimo {MINIMO_CLAVE} caracteres.
      </p>

      {error && <div className="error-sesion">{error}</div>}

      <div className="campo-sesion">
        <label htmlFor="clave">Contraseña nueva</label>
        <input id="clave" type="password" value={clave} autoComplete="new-password" required
               onChange={(e) => setClave(e.target.value)} />
      </div>
      <div className="campo-sesion">
        <label htmlFor="repetida">Repítela</label>
        <input id="repetida" type="password" value={repetida} autoComplete="new-password" required
               onChange={(e) => setRepetida(e.target.value)} />
      </div>

      <button className="btn pri btn-ancho" type="submit" disabled={guardando}>
        {guardando ? "Guardando…" : "Guardar y entrar"}
      </button>
      <div className="pie-sesion"><Link href="/entrar">Volver a entrar</Link></div>
    </form>
  );
}

export default function ClaveNueva() {
  return (
    <div className="portada">
      <Suspense fallback={<div className="tarjeta-sesion">Cargando…</div>}>
        <Formulario />
      </Suspense>
    </div>
  );
}
