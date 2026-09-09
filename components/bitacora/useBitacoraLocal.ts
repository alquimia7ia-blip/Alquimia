"use client";

import { useCallback, useMemo, useState } from "react";
import type { BitacoraCtx } from "@/components/campos/contexto";
import { campo } from "@/lib/talleres/rutas";
import type { Definicion, Fila, ValorCampo } from "@/lib/talleres/tipos";

type Semilla = { tallerId: string; definicion: Definicion }[];

/**
 * Bitácora en memoria, con respaldo en localStorage.
 *
 * Sirve para la página /estilos y como red de seguridad de la versión con
 * base de datos: si Supabase no responde, lo escrito no se pierde. La
 * versión conectada usa el mismo contrato (BitacoraCtx), así que los campos
 * no distinguen una de otra.
 */
export function useBitacoraLocal(semilla: Semilla, clave: string): BitacoraCtx {
  const inicial = useMemo(() => {
    if (typeof window !== "undefined") {
      try {
        const crudo = window.localStorage.getItem(clave);
        if (crudo) {
          const d = JSON.parse(crudo) as { respuestas: Record<string, ValorCampo>; filas: Fila[] };
          return { respuestas: new Map(Object.entries(d.respuestas ?? {})), filas: d.filas ?? [] };
        }
      } catch {
        // Un respaldo corrupto no debe impedir abrir el taller.
      }
    }
    // Filas y valores que la definición pide al abrir la bitácora por
    // primera vez. Los encabezados editables se siembran con su valor por
    // defecto —los años del Taller 8— para que el informe no salga sin año.
    const filas: Fila[] = [];
    const respuestas = new Map<string, ValorCampo>();
    for (const { tallerId, definicion } of semilla) {
      for (const s of definicion.secciones) {
        for (const b of s.bloques) {
          const n = "filasIniciales" in b ? (b.filasIniciales ?? 0) : 0;
          for (let i = 0; i < n; i++) {
            filas.push({ id: `${tallerId}-${b.id}-${i}`, bloqueId: b.id, tallerId, orden: i });
          }
          if (b.tipo === "tabla") {
            for (const col of b.columnasEditables ?? []) {
              respuestas.set(campo.encabezado(b.id, col.id), col.valorPorDefecto);
            }
          }
        }
      }
    }
    return { respuestas, filas };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);

  const [respuestas, setRespuestas] = useState(inicial.respuestas);
  const [filas, setFilas] = useState(inicial.filas);

  const persistir = useCallback(
    (r: Map<string, ValorCampo>, f: Fila[]) => {
      try {
        window.localStorage.setItem(
          clave,
          JSON.stringify({ respuestas: Object.fromEntries(r), filas: f }),
        );
      } catch {
        // Modo privado o almacenamiento lleno: se sigue trabajando en memoria.
      }
    },
    [clave],
  );

  const escribir = useCallback((campoId: string, valor: ValorCampo) => {
    setRespuestas((prev) => {
      const siguiente = new Map(prev);
      siguiente.set(campoId, valor);
      persistir(siguiente, filas);
      return siguiente;
    });
  }, [filas, persistir]);

  const agregarFila = useCallback((bloqueId: string) => {
    setFilas((prev) => {
      const delBloque = prev.filter((f) => f.bloqueId === bloqueId);
      const tallerId = delBloque[0]?.tallerId ?? "";
      const orden = delBloque.length ? Math.max(...delBloque.map((f) => f.orden)) + 1 : 0;
      const siguiente = [
        ...prev,
        { id: `${bloqueId}-${crypto.randomUUID()}`, bloqueId, tallerId, orden },
      ];
      persistir(respuestas, siguiente);
      return siguiente;
    });
  }, [respuestas, persistir]);

  const eliminarFila = useCallback((filaId: string) => {
    setFilas((prev) => {
      const siguiente = prev.filter((f) => f.id !== filaId);
      persistir(respuestas, siguiente);
      return siguiente;
    });
  }, [respuestas, persistir]);

  return useMemo<BitacoraCtx>(() => ({
    valor: (campoId) => respuestas.get(campoId) ?? null,
    escribir,
    filas: (bloqueId) => filas.filter((f) => f.bloqueId === bloqueId).sort((a, b) => a.orden - b.orden),
    todasLasFilas: filas,
    agregarFila,
    eliminarFila,
  }), [respuestas, filas, escribir, agregarFila, eliminarFila]);
}
