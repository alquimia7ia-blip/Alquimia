"use client";

import type { ValorCampo } from "@/lib/talleres/tipos";

/**
 * Cola de escrituras pendientes.
 *
 * El programa deja tres semanas de trabajo autónomo entre sesiones, buena
 * parte en oficinas con conectividad irregular. Lo que se escribe se guarda
 * primero aquí y se envía cuando se pueda: perder una tarde de trabajo por
 * una caída de red sería la peor forma de estrenar la plataforma.
 *
 * Se guarda por campo, no por documento, así que dos personas trabajando a
 * la vez no se sobreescriben lo que la otra ya envió.
 */
export type Pendiente = { campoId: string; tallerId: string; valor: ValorCampo; en: number };

export class ColaOffline {
  private pendientes = new Map<string, Pendiente>();

  constructor(private clave: string) {
    this.leer();
  }

  private leer() {
    try {
      const crudo = window.localStorage.getItem(this.clave);
      if (!crudo) return;
      for (const p of JSON.parse(crudo) as Pendiente[]) this.pendientes.set(p.campoId, p);
    } catch {
      // Respaldo corrupto: se descarta y se sigue.
    }
  }

  private escribir() {
    try {
      window.localStorage.setItem(this.clave, JSON.stringify([...this.pendientes.values()]));
    } catch {
      // Modo privado o almacenamiento lleno: se trabaja solo en memoria.
    }
  }

  /** Encola una escritura. Una posterior sobre el mismo campo reemplaza la anterior. */
  encolar(p: Pendiente) {
    this.pendientes.set(p.campoId, p);
    this.escribir();
  }

  get tamano() {
    return this.pendientes.size;
  }

  listar(): Pendiente[] {
    return [...this.pendientes.values()];
  }

  /**
   * Quita de la cola lo que se envió, salvo que se haya vuelto a escribir
   * mientras el envío estaba en vuelo — en ese caso lo nuevo se queda.
   */
  confirmar(enviados: Pendiente[]) {
    for (const e of enviados) {
      const actual = this.pendientes.get(e.campoId);
      if (actual && actual.en <= e.en) this.pendientes.delete(e.campoId);
    }
    this.escribir();
  }
}
