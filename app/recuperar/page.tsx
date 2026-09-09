"use client";

import { useState } from "react";
import Link from "next/link";
import { clienteNavegador } from "@/lib/supabase/cliente";

export default function Recuperar() {
  const [correo, setCorreo] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function pedir(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    await clienteNavegador().auth.resetPasswordForEmail(correo.trim(), {
      redirectTo: `${window.location.origin}/invitacion?modo=recuperar`,
    });
    // Se responde igual exista o no la cuenta: lo contrario revelaría quién
    // participa en el programa.
    setEnviado(true);
    setEnviando(false);
  }

  return (
    <div className="portada">
      <div className="tarjeta-sesion">
        <h1>Recuperar contraseña</h1>
        {enviado ? (
          <>
            <p className="sub">
              Si ese correo tiene cuenta, le llegará un enlace para definir una contraseña
              nueva. Revisa también la carpeta de no deseados.
            </p>
            <div className="pie-sesion"><Link href="/entrar">Volver a entrar</Link></div>
          </>
        ) : (
          <form onSubmit={pedir}>
            <p className="sub">Te enviamos un enlace para definir una nueva.</p>
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
        )}
      </div>
    </div>
  );
}
