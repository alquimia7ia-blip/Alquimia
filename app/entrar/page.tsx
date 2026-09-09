"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import Link from "next/link";
import { clienteNavegador } from "@/lib/supabase/cliente";

function Formulario() {
  const router = useRouter();
  const params = useSearchParams();
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    const { error } = await clienteNavegador().auth.signInWithPassword({
      email: correo.trim(),
      password: clave,
    });
    if (error) {
      // Sin detallar si el correo existe: eso filtra quién está en el programa.
      setError("Correo o contraseña incorrectos. Revísalos e inténtalo de nuevo.");
      setEnviando(false);
      return;
    }
    // El destino viene de la URL, así que se limita a rutas internas: un
    // "volver" con http:// externo sería una redirección abierta.
    const volver = params.get("volver");
    const destino = volver && volver.startsWith("/") && !volver.startsWith("//") ? volver : "/";
    router.push(destino as Route);
    router.refresh();
  }

  return (
    <form className="tarjeta-sesion" onSubmit={entrar}>
      <h1>Entra a tu bitácora</h1>
      <p className="sub">Programa Empresas con Propósito MEGA</p>

      {error && <div className="error-sesion">{error}</div>}

      <div className="campo-sesion">
        <label htmlFor="correo">Correo</label>
        <input id="correo" type="email" value={correo} autoComplete="email" required
               onChange={(e) => setCorreo(e.target.value)} />
      </div>
      <div className="campo-sesion">
        <label htmlFor="clave">Contraseña</label>
        <input id="clave" type="password" value={clave} autoComplete="current-password" required
               onChange={(e) => setClave(e.target.value)} />
      </div>

      <button className="btn pri btn-ancho" type="submit" disabled={enviando}>
        {enviando ? "Entrando…" : "Entrar"}
      </button>

      <div className="pie-sesion">
        <Link href="/recuperar">¿Olvidaste la contraseña?</Link>
        <span>¿Sin cuenta? La invitación llega por correo.</span>
      </div>
    </form>
  );
}

export default function Entrar() {
  return (
    <div className="portada">
      <Suspense fallback={<div className="tarjeta-sesion">Cargando…</div>}>
        <Formulario />
      </Suspense>
    </div>
  );
}
