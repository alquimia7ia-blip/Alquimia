"use client";

import { useEffect, useMemo, useState } from "react";
import { clienteNavegador } from "@/lib/supabase/cliente";

/**
 * Quién está en la plataforma ahora mismo.
 *
 * Usa la presencia de Supabase Realtime: cada pestaña abierta se anuncia en
 * el canal de su cohorte y el panel escucha. No hay tabla ni consulta: el
 * estado vive en el canal mientras haya alguien conectado y desaparece solo
 * cuando se cierra la pestaña.
 *
 * Qué viaja por aquí importa. Por omisión, cualquier usuario autenticado que
 * adivine el nombre del canal puede escucharlo, así que el mensaje se limita
 * a nombre, empresa y en qué taller está la persona. **Nunca respuestas.**
 * Endurecerlo es Realtime Authorization, y es tarea aparte; mientras no
 * exista, todo lo que se publique aquí hay que tratarlo como visible para
 * cualquiera de la cohorte.
 */

export type Presente = {
  perfilId: string;
  nombre: string;
  empresa: string;
  taller?: string;
};

const canalDe = (cohorteId: string) => `cohorte:${cohorteId}`;

/** Anuncia a quien esté usando el taller. Devuelve nada: solo publica. */
export function usePublicarPresencia(
  cohorteId: string | null,
  yo: Presente | null,
  taller?: string,
) {
  const supabase = useMemo(() => clienteNavegador(), []);
  // El taller cambia al navegar entre talleres; serializar evita volver a
  // suscribirse con cada render por una referencia nueva del objeto.
  const firma = yo ? `${yo.perfilId}|${yo.nombre}|${yo.empresa}|${taller ?? ""}` : "";

  useEffect(() => {
    if (!cohorteId || !yo) return;
    const canal = supabase.channel(canalDe(cohorteId), {
      config: { presence: { key: yo.perfilId } },
    });
    canal.subscribe((estado) => {
      if (estado === "SUBSCRIBED") {
        void canal.track({ ...yo, taller });
      }
    });
    return () => { void supabase.removeChannel(canal); };
  }, [supabase, cohorteId, firma]); // eslint-disable-line react-hooks/exhaustive-deps
}

/** Escucha quién está conectado. Para el panel del facilitador. */
export function usePresencia(cohorteId: string | null): Map<string, Presente> {
  const supabase = useMemo(() => clienteNavegador(), []);
  const [presentes, setPresentes] = useState<Map<string, Presente>>(new Map());

  useEffect(() => {
    if (!cohorteId) return;
    const canal = supabase.channel(canalDe(cohorteId));

    const refrescar = () => {
      const estado = canal.presenceState<Presente>();
      const m = new Map<string, Presente>();
      for (const [clave, entradas] of Object.entries(estado)) {
        const ultima = entradas[entradas.length - 1];
        if (ultima) m.set(clave, ultima);
      }
      setPresentes(m);
    };

    canal
      .on("presence", { event: "sync" }, refrescar)
      .on("presence", { event: "join" }, refrescar)
      .on("presence", { event: "leave" }, refrescar)
      .subscribe();

    return () => { void supabase.removeChannel(canal); };
  }, [supabase, cohorteId]);

  return presentes;
}
