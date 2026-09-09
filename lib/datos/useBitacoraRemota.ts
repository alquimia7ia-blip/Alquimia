"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { BitacoraCtx } from "@/components/campos/contexto";
import type { Fila, ValorCampo } from "@/lib/talleres/tipos";
import { ColaOffline, type Pendiente } from "./colaOffline";

const ESPERA_TEXTO = 600;   // ms de reposo antes de enviar un campo de texto
const REINTENTO = 5000;     // ms entre intentos cuando la red falla

export type EstadoGuardado = { texto: string; ocupado?: boolean };

type Args = {
  supabase: SupabaseClient;
  bitacoraId: string;
  perfilId: string;
  /** Respuestas y filas ya cargadas en el servidor. */
  inicial: { respuestas: Record<string, ValorCampo>; filas: Fila[] };
  /** Qué taller posee cada bloque, para saber a cuál atribuir la escritura. */
  tallerDeBloque: Record<string, string>;
  soloLectura?: boolean;
};

/**
 * Bitácora respaldada en Supabase, con guardado por campo.
 *
 * El prototipo serializaba el estado entero y lo guardaba con un temporizador
 * global: la última escritura borraba todo lo de la otra persona. Aquí cada
 * campo viaja por su cuenta y tiene su propio temporizador, de modo que dos
 * personas en talleres distintos no se tocan.
 */
export function useBitacoraRemota({
  supabase, bitacoraId, perfilId, inicial, tallerDeBloque, soloLectura,
}: Args): BitacoraCtx & { estado: EstadoGuardado } {
  const [respuestas, setRespuestas] = useState(() => new Map(Object.entries(inicial.respuestas)));
  const [filas, setFilas] = useState<Fila[]>(inicial.filas);
  const [estado, setEstado] = useState<EstadoGuardado>({ texto: "Guardado" });

  const cola = useMemo(() => new ColaOffline(`bitacora:${bitacoraId}:pendientes`), [bitacoraId]);
  const temporizadores = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const enviando = useRef(false);

  const enviar = useCallback(async () => {
    if (enviando.current || cola.tamano === 0) return;
    enviando.current = true;
    const lote = cola.listar();
    setEstado({ texto: "Guardando…", ocupado: true });

    const { error } = await supabase.from("respuestas").upsert(
      lote.map((p) => ({
        bitacora_id: bitacoraId,
        taller_id: p.tallerId,
        campo_id: p.campoId,
        valor: p.valor,
        actualizado_por: perfilId,
      })),
      { onConflict: "bitacora_id,campo_id" },
    );

    enviando.current = false;
    if (error) {
      // Lo escrito sigue en la cola y en localStorage: no se pierde.
      setEstado({ texto: `Sin conexión · ${cola.tamano} por guardar` });
      setTimeout(() => void enviar(), REINTENTO);
      return;
    }
    cola.confirmar(lote);
    setEstado(cola.tamano === 0
      ? { texto: "Guardado" }
      : { texto: "Guardando…", ocupado: true });
    if (cola.tamano > 0) void enviar();
  }, [supabase, bitacoraId, perfilId, cola]);

  const escribir = useCallback(
    (campoId: string, valor: ValorCampo, opciones?: { inmediato?: boolean }) => {
      if (soloLectura) return;
      setRespuestas((prev) => new Map(prev).set(campoId, valor));

      const bloqueId = campoId.split(".")[0] ?? campoId;
      const tallerId = tallerDeBloque[bloqueId];
      if (!tallerId) return;

      const encolar = () => {
        cola.encolar({ campoId, tallerId, valor, en: Date.now() });
        void enviar();
      };

      const previo = temporizadores.current.get(campoId);
      if (previo) clearTimeout(previo);

      // Un clic en una escala es un evento atómico: se envía ya. El texto
      // espera a que la persona deje de escribir, y cada campo tiene su
      // propio temporizador para no arrastrar a los demás.
      if (opciones?.inmediato) {
        encolar();
      } else {
        setEstado({ texto: "Guardando…", ocupado: true });
        temporizadores.current.set(campoId, setTimeout(encolar, ESPERA_TEXTO));
      }
    },
    [soloLectura, tallerDeBloque, cola, enviar],
  );

  /** Vacía los temporizadores pendientes: al salir del campo o de la pestaña. */
  const descargar = useCallback(() => {
    for (const t of temporizadores.current.values()) clearTimeout(t);
    temporizadores.current.clear();
    void enviar();
  }, [enviar]);

  useEffect(() => {
    const alOcultar = () => { if (document.visibilityState === "hidden") descargar(); };
    document.addEventListener("visibilitychange", alOcultar);
    window.addEventListener("online", () => void enviar());
    return () => {
      document.removeEventListener("visibilitychange", alOcultar);
    };
  }, [descargar, enviar]);

  // Al abrir, se intenta enviar lo que quedó pendiente de la sesión anterior.
  useEffect(() => { void enviar(); }, [enviar]);

  const agregarFila = useCallback(async (bloqueId: string) => {
    if (soloLectura) return;
    const tallerId = tallerDeBloque[bloqueId];
    if (!tallerId) return;
    const delBloque = filas.filter((f) => f.bloqueId === bloqueId);
    // Orden fraccionario: insertar no obliga a renumerar las demás filas, así
    // que dos personas agregando a la vez no se pisan.
    const orden = delBloque.length ? Math.max(...delBloque.map((f) => f.orden)) + 1 : 0;

    const { data, error } = await supabase
      .from("filas")
      .insert({ bitacora_id: bitacoraId, taller_id: tallerId, bloque_id: bloqueId, orden,
                creada_por: perfilId })
      .select("id")
      .single();
    if (error || !data) { setEstado({ texto: "No se pudo agregar la fila" }); return; }
    setFilas((prev) => [...prev, { id: data.id as string, bloqueId, tallerId, orden }]);
  }, [soloLectura, tallerDeBloque, filas, supabase, bitacoraId, perfilId]);

  const eliminarFila = useCallback(async (filaId: string) => {
    if (soloLectura) return;
    setFilas((prev) => prev.filter((f) => f.id !== filaId));
    // Borrado suave: una eliminación concurrente no reindexa nada de nadie.
    const { error } = await supabase
      .from("filas").update({ eliminada_at: new Date().toISOString() }).eq("id", filaId);
    if (error) setEstado({ texto: "No se pudo eliminar la fila" });
  }, [soloLectura, supabase]);

  return useMemo(() => ({
    valor: (campoId) => respuestas.get(campoId) ?? null,
    escribir,
    filas: (bloqueId) => filas.filter((f) => f.bloqueId === bloqueId).sort((a, b) => a.orden - b.orden),
    todasLasFilas: filas,
    agregarFila,
    eliminarFila,
    soloLectura,
    estado,
  }), [respuestas, filas, escribir, agregarFila, eliminarFila, soloLectura, estado]);
}
