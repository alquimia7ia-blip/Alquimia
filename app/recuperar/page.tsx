"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { clienteNavegador } from "@/lib/supabase/cliente";
import { mensajeDeEnvio } from "@/lib/auth/recuperacion";

function Formulario() {
  const parametros = useSearchParams();
  const [correo, setCorreo] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Si el enlace anterior no se pudo canjear, `/auth/confirmar` manda aquí
  // con el motivo: es la pantalla donde se puede actuar sobre él.
  const aviso = parametros.get("aviso");

  async function pedir(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    const { error: err } = await clienteNavegador().auth.resetPasswordForEmail(
      correo.trim(),
      // El enlace va a la ruta de servidor, no a una pantalla: allí se canjea
      // el token y se abre la sesión en cookies, que es lo que hace que el
      // correo sirva al abrirlo en el celular. La ruta decide el destino por
      // el `type` del enlace, así que basta registrar esta URL —sin
      // parámetros— en los Redirect URLs de Supabase.
      { redirectTo: `${window.location.origin}/auth/confirmar` },
    );
    // Se responde igual exista o no la cuenta: lo contrario revelaría quién
    // participa en el programa. El límite de envíos sí se dice, porque
    // callarlo deja a la persona esperando un correo que no va a llegar.
    const mensaje = err ? mensajeDeEnvio(err) : null;
    if (mensaje) setError(mensaje);
    else setEnviado(true);
    setEnviando(false);
  }

  if (enviado) {
    return (
      <div className="tarjeta-sesion">
        <h1>Revisa tu correo</h1>
        <p className="sub">
          Si ese correo tiene cuenta, le llegará un enlace para definir una contraseña
          nueva. Caduca en una hora y sirve una sola vez. Revisa también la carpeta de
          no deseados.
        </p>
        <div className="pie-sesion"><Link href="/entrar">Volver a entrar</Link></div>
      </div>
    );
  }

  return (
    <form className="tarjeta-sesion" onSubmit={pedir}>
      <h1>Recuperar contraseña</h1>
      <p className="sub">Te enviamos un enlace para definir una nueva.</p>

      {aviso && <div className="error-sesion">{aviso}</div>}
      {error && <div className="error-sesion">{error}</div>}

      <div className="campo-sesion">
        <label htmlFor="correo">Correo</label>
        <input id="correo" type="email" value={correo} required autoComplete="email"
               onChange={(e) => setCorreo(e.target.value)} />
      </div>
      <button className="btn pri btn-ancho" type="submit" disabled={enviando}>
        {enviando ? "Enviando…" : "Enviar enlace"}
      </button>
      <div className="pie-sesion"><Link href="/entrar">Volver a entrar</Link></div>
    </form>
  );
}

export default function Recuperar() {
  return (
    <div className="portada">
      <Suspense fallback={<div className="tarjeta-sesion">Cargando…</div>}>
        <Formulario />
      </Suspense>
    </div>
  );
}
