"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { BitacoraCtx } from "@/components/campos/contexto";
import type { Fila, ValorCampo } from "@/lib/talleres/tipos";
import { ColaOffline, type Pendiente } from "./colaOffline";

const ESPERA_TEXTO = 600;   // ms de reposo antes de enviar un campo de texto
const REINTENTO = 5000;     // ms entre intentos cuando la red falla

export type EstadoGuardado = { texto: string; ocupado?: boolean };

/** Un envío aplazado, con la escritura que tiene en espera. */
type Temporizador = { id: ReturnType<typeof setTimeout>; encolar: () => void };

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
}: Args): BitacoraCtx & { estado: EstadoGuardado; guardarYa: () => Promise<number> } {
  const [respuestas, setRespuestas] = useState(() => new Map(Object.entries(inicial.respuestas)));
  const [filas, setFilas] = useState<Fila[]>(inicial.filas);
  const [estado, setEstado] = useState<EstadoGuardado>({ texto: "Guardado" });

  const cola = useMemo(() => new ColaOffline(`bitacora:${bitacoraId}:pendientes`), [bitacoraId]);
  // Cada temporizador va con la escritura que tiene pendiente. Guardar solo
  // el identificador obligaba a cancelarlo a ciegas, y cancelar sin encolar
  // tira lo escrito: hay que poder ejecutarlo antes de tiempo.
  const temporizadores = useRef(new Map<string, Temporizador>());
  const enviando = useRef(false);

  /** `false` si la red falló y la cola sigue con trabajo. */
  const enviar = useCallback(async (): Promise<boolean> => {
    if (enviando.current || cola.tamano === 0) return true;
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
      return false;
    }
    cola.confirmar(lote);
    setEstado(cola.tamano === 0
      ? { texto: "Guardado" }
      : { texto: "Guardando…", ocupado: true });
    if (cola.tamano > 0) void enviar();
    return true;
  }, [supabase, bitacoraId, perfilId, cola]);

  const escribir = useCallback(
    (campoId: string, valor: ValorCampo, opciones?: { inmediato?: boolean }) => {
      if (soloLectura) return;
      setRespuestas((prev) => new Map(prev).set(campoId, valor));

      const bloqueId = campoId.split(".")[0] ?? campoId;
      const tallerId = tallerDeBloque[bloqueId];
      if (!tallerId) return;

      const encolar = () => cola.encolar({ campoId, tallerId, valor, en: Date.now() });

      const previo = temporizadores.current.get(campoId);
      if (previo) clearTimeout(previo.id);

      // Un clic en una escala es un evento atómico: se envía ya. El texto
      // espera a que la persona deje de escribir, y cada campo tiene su
      // propio temporizador para no arrastrar a los demás.
      if (opciones?.inmediato) {
        encolar();
        void enviar();
      } else {
        setEstado({ texto: "Guardando…", ocupado: true });
        const id = setTimeout(() => {
          temporizadores.current.delete(campoId);
          encolar();
          void enviar();
        }, ESPERA_TEXTO);
        temporizadores.current.set(campoId, { id, encolar });
      }
    },
    [soloLectura, tallerDeBloque, cola, enviar],
  );

  /**
   * Adelanta los temporizadores en vuelo: lo que esperaba a que la persona
   * dejara de escribir pasa a la cola ya mismo.
   *
   * Antes esto solo los cancelaba, y cancelar un temporizador que todavía no
   * encoló es tirar lo escrito: quien tecleaba una frase y cambiaba de
   * pestaña dentro de los 600 ms de reposo la veía en pantalla —el estado de
   * React sí la tenía— pero no llegaba ni a `localStorage`, así que al
   * recargar había desaparecido.
   */
  const adelantar = useCallback(() => {
    for (const { id, encolar } of temporizadores.current.values()) {
      clearTimeout(id);
      encolar();
    }
    temporizadores.current.clear();
  }, []);

  /** Vacía los temporizadores pendientes: al salir del campo o de la pestaña. */
  const descargar = useCallback(() => {
    adelantar();
    void enviar();
  }, [adelantar, enviar]);

  /**
   * Guarda todo lo pendiente y dice cuánto quedó sin guardar.
   *
   * La usa el botón de cerrar sesión: salir con la cola llena deja el trabajo
   * encerrado en el `localStorage` de este navegador, donde solo se recupera
   * si la misma persona vuelve a entrar aquí. Devolver el número permite
   * advertirlo antes, en vez de descubrirlo después.
   */
  const guardarYa = useCallback(async (): Promise<number> => {
    adelantar();
    // Con tope: si la red no está, no se puede esperar indefinidamente. El
    // número que vuelve es justamente para poder avisar.
    const limite = Date.now() + 4000;
    while (cola.tamano > 0 && Date.now() < limite) {
      if (enviando.current) {
        await new Promise((listo) => setTimeout(listo, 120));
        continue;
      }
      if (!(await enviar())) break;   // la red falló; el reintento ya quedó programado
    }
    return cola.tamano;
  }, [adelantar, cola, enviar]);

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
    guardarYa,
  }), [respuestas, filas, escribir, agregarFila, eliminarFila, soloLectura, estado, guardarYa]);
}
