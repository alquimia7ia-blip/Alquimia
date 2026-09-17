import type { Escala } from "./tipos";

/**
 * Escalas de valoración, compartidas entre talleres y entre módulos.
 *
 * `sugiere` es lo que convierte el DOFA en algo genérico: marcar una
 * tendencia como favorable la propone después como oportunidad, sin que el
 * bloque de cuadrantes sepa nada de tendencias ni del PESTEL.
 */
export const ESCALAS: Record<string, Escala> = {
  // Taller 1 · grandes tendencias
  impacto_tendencia: {
    id: "impacto_tendencia",
    opciones: [
      { valor: "fav", etiqueta: "Alto · favorable", color: "fav", sugiere: "oportunidad" },
      { valor: "med", etiqueta: "Medio", color: "med" },
      { valor: "des", etiqueta: "Alto · no favorable", color: "des", sugiere: "amenaza" },
      { valor: "na", etiqueta: "No aplica", color: "na" },
    ],
  },
  // Taller 1 · tablero PESTEL
  efecto: {
    id: "efecto",
    opciones: [
      { valor: "pos", etiqueta: "Positivo", color: "fav", sugiere: "oportunidad" },
      { valor: "neu", etiqueta: "Neutro", color: "med" },
      { valor: "neg", etiqueta: "Negativo", color: "des", sugiere: "amenaza" },
      { valor: "na", etiqueta: "No aplica", color: "na" },
    ],
  },
  // Taller 2 · efecto de cada fuerza sobre la rentabilidad.
  // Un efecto muy alto es una amenaza: la fuerza aprieta el margen.
  efecto_rentabilidad: {
    id: "efecto_rentabilidad",
    opciones: [
      { valor: "alto", etiqueta: "Muy alto", color: "des", sugiere: "amenaza" },
      { valor: "medio", etiqueta: "Medio", color: "med" },
      { valor: "bajo", etiqueta: "Bajo", color: "fav", sugiere: "oportunidad" },
    ],
  },
};

export function escala(id: string): Escala {
  const e = ESCALAS[id];
  if (!e) throw new Error(`Escala desconocida: ${id}`);
  return e;
}

export function opcion(escalaId: string, valor: string) {
  return escala(escalaId).opciones.find((o) => o.valor === valor);
}
