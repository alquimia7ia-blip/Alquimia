"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { clienteNavegador } from "@/lib/supabase/cliente";

/**
 * Cerrar sesión.
 *
 * Hacía falta por una razón concreta del programa: los talleres se responden
 * en sesiones presenciales, a veces en un computador prestado o compartido
 * entre empresas de la misma cohorte. Sin forma de salir, la sesión quedaba
 * abierta para quien se sentara después —y el Taller 8 tiene ventas, márgenes
 * y utilidades—. No es comodidad, es la contraparte de entrar.
 *
 * `antesDeSalir` existe porque la bitácora guarda con un reposo de 600 ms y
 * una cola en `localStorage`: cerrar sesión sin vaciarla deja el trabajo
 * encerrado en este navegador. Devuelve cuántas respuestas quedaron sin
 * guardar, y si queda alguna se avisa antes en vez de perderla en silencio.
 */
export function CerrarSesion({
  antesDeSalir,
  clase = "mini",
}: {
  antesDeSalir?: () => Promise<number>;
  /** `mini` para el pie del riel, `btn` para una barra superior. */
  clase?: "mini" | "btn";
}) {
  const router = useRouter();
  const [saliendo, setSaliendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function salir() {
    setSaliendo(true);
    setError(null);

    if (antesDeSalir) {
      const pendientes = await antesDeSalir();
      if (pendientes > 0) {
        const seguir = window.confirm(
          `Quedan ${pendientes} ${pendientes === 1 ? "respuesta" : "respuestas"} sin guardar ` +
          `porque no hay conexión. Si cierras sesión ahora, solo se recuperan volviendo a ` +
          `entrar con esta misma cuenta en este mismo navegador.\n\n` +
          `¿Cerrar sesión de todos modos?`,
        );
        if (!seguir) { setSaliendo(false); return; }
      }
    }

    // Solo esta sesión, no todas las de la cuenta: quien sale de un computador
    // prestado no tiene por qué quedar expulsado de su propio celular. Además
    // no depende de la red, que es lo que hace falta para poder irse de una
    // máquina ajena aunque el wifi del salón se haya caído.
    const supabase = clienteNavegador();
    await supabase.auth.signOut({ scope: "local" });

    // Comprobado, no supuesto: si la sesión sigue en pie, navegar a /entrar
    // devolvería a la bitácora y la persona se iría creyendo que cerró.
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setError("No se pudo cerrar la sesión. Cierra el navegador para asegurarte.");
      setSaliendo(false);
      return;
    }

    router.replace("/entrar" as Route);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        className={clase}
        onClick={salir}
        disabled={saliendo}
        title="Cierra tu sesión en este navegador"
      >
        <span aria-hidden="true">⎋</span>
        <span>{saliendo ? "Cerrando…" : "Cerrar sesión"}</span>
      </button>
      {error && (
        <p role="alert" style={{ margin: "6px 0 0", fontSize: 12, color: "var(--des)" }}>
          {error}
        </p>
      )}
    </>
  );
}
