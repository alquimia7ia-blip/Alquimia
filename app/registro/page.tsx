"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { clienteNavegador } from "@/lib/supabase/cliente";

const VERSION_POLITICA = "2026-09-01";

/**
 * Alta de cuenta sin invitación.
 *
 * El programa se presenta en una sesión presencial y la gente entra el mismo
 * día: pedirles que esperen un correo era la mayor fricción de todo el
 * recorrido. Aquí se crea la cuenta en el momento.
 *
 * El correo sí se pide, aunque nadie lo verifique ahora: sin él, la primera
 * persona que olvide su contraseña solo puede resolverlo con alguien
 * reseteándosela a mano, y con noventa personas eso no escala.
 */
export default function Registro() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [autoriza, setAutoriza] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function registrar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (clave.length < 8) return setError("La contraseña necesita al menos 8 caracteres.");
    if (!autoriza) return setError("Para crear la cuenta hay que autorizar el tratamiento de datos.");

    setEnviando(true);
    const supabase = clienteNavegador();
    const { data, error: err } = await supabase.auth.signUp({
      email: correo.trim(),
      password: clave,
      options: { data: { nombre_completo: nombre.trim() } },
    });

    if (err) {
      setError(
        /already registered|already exists/i.test(err.message)
          ? "Ese correo ya tiene cuenta. Entra con tu contraseña o recupérala."
          : `No se pudo crear la cuenta: ${err.message}`,
      );
      setEnviando(false);
      return;
    }

    // Con la confirmación por correo activada, signUp no devuelve sesión aunque
    // el usuario ya quede confirmado por el disparador de la base. En ese caso
    // se entra en el acto con las mismas credenciales: quien se registra no
    // tiene por qué escribirlas dos veces por un ajuste del servidor.
    let sesion = data.session;
    if (!sesion) {
      const { data: entrada } = await supabase.auth.signInWithPassword({
        email: correo.trim(),
        password: clave,
      });
      sesion = entrada.session;
    }

    if (!sesion) {
      setAviso(
        "Tu cuenta quedó creada, pero no se pudo iniciar sesión automáticamente. " +
        "Entra con el correo y la contraseña que acabas de elegir.",
      );
      setEnviando(false);
      return;
    }

    // La transferencia internacional va aparte del tratamiento general:
    // Colombia no reconoce a EE.UU. con nivel adecuado de protección, así que
    // exige autorización propia y hay que poder probarla después.
    await supabase.from("consentimientos").insert([
      { perfil_id: sesion.user.id, tipo: "tratamiento_datos",
        version_politica: VERSION_POLITICA, aceptado: true, agente: navigator.userAgent },
      { perfil_id: sesion.user.id, tipo: "transferencia_internacional",
        version_politica: VERSION_POLITICA, aceptado: true, agente: navigator.userAgent },
    ]);

    router.push("/empresa");
    router.refresh();
  }

  if (aviso) {
    return (
      <div className="portada">
        <div className="tarjeta-sesion">
          <h1>Cuenta creada</h1>
          <p className="sub">{aviso}</p>
          <div className="pie-sesion"><Link href="/entrar">Ir a entrar</Link></div>
        </div>
      </div>
    );
  }

  return (
    <div className="portada">
      <form className="tarjeta-sesion" onSubmit={registrar}>
        <h1>Crea tu cuenta</h1>
        <p className="sub">Programa Empresas con Propósito MEGA</p>

        {error && <div className="error-sesion">{error}</div>}

        <div className="campo-sesion">
          <label htmlFor="nombre">Nombre y apellido</label>
          <input id="nombre" value={nombre} required autoComplete="name"
                 onChange={(e) => setNombre(e.target.value)} />
        </div>
        <div className="campo-sesion">
          <label htmlFor="correo">Correo</label>
          <input id="correo" type="email" value={correo} required autoComplete="email"
                 onChange={(e) => setCorreo(e.target.value)} />
        </div>
        <div className="campo-sesion">
          <label htmlFor="clave">Contraseña</label>
          <input id="clave" type="password" value={clave} required minLength={8}
                 autoComplete="new-password" onChange={(e) => setClave(e.target.value)} />
          <span style={{ fontSize: 12, color: "var(--faint)" }}>Mínimo 8 caracteres.</span>
        </div>

        <label className="consentimiento">
          <input type="checkbox" checked={autoriza}
                 onChange={(e) => setAutoriza(e.target.checked)} />
          <span>
            Autorizo el tratamiento de mis datos personales y su transferencia a servidores
            fuera de Colombia, según la{" "}
            <Link href="/politica-de-datos">política de tratamiento de datos</Link>.
          </span>
        </label>

        <button className="btn pri btn-ancho" type="submit" disabled={enviando}>
          {enviando ? "Creando…" : "Crear cuenta"}
        </button>

        <div className="pie-sesion">
          <Link href="/entrar">¿Ya tienes cuenta? Entra</Link>
        </div>
      </form>
    </div>
  );
}
