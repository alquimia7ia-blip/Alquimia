import { escala } from "./escalas";
import { bloques } from "./rutas";
import type { Definicion, Sugerencia, ValorCampo } from "./tipos";

/**
 * Sugerencias para los cuadrantes, tomadas de lo que la empresa ya respondió.
 *
 * En el prototipo esto estaba cableado a TENDENCIAS, PESTEL y FUERZAS. Aquí
 * recorre cualquier bloque con escala y recoge las opciones marcadas con un
 * rol semántico, así que los módulos 2 a 4 heredan la función sin escribir
 * una línea de código nuevo.
 */
export type Sugerencias = Record<Sugerencia, string[]>;

export function sugerenciasDelModulo(
  definiciones: Definicion[],
  respuestas: Map<string, ValorCampo>,
  limitePorRol = 10,
): Sugerencias {
  const salida: Sugerencias = { oportunidad: [], amenaza: [] };

  const anotar = (rol: Sugerencia | undefined, texto: string) => {
    if (!rol || !texto) return;
    if (salida[rol].includes(texto)) return;
    salida[rol].push(texto);
  };

  const rolDe = (escalaId: string, campoId: string) => {
    const v = respuestas.get(campoId);
    if (typeof v !== "string" || !v) return undefined;
    return escala(escalaId).opciones.find((o) => o.valor === v)?.sugiere;
  };

  for (const def of definiciones) {
    for (const b of bloques(def)) {
      if (b.tipo === "fichas_escala") {
        for (const it of b.items) {
          anotar(rolDe(b.escala, `${b.id}.${it.id}.valoracion`), it.titulo);
        }
      } else if (b.tipo === "matriz_escala") {
        for (const g of b.grupos) {
          for (const f of g.filas) {
            anotar(rolDe(b.escala, `${b.id}.${g.id}.${f.id}`), f.texto);
          }
        }
      } else if (b.tipo === "ranking_escala") {
        for (const it of b.items) {
          anotar(rolDe(b.escala, `${b.id}.${it.id}.impacto`), it.titulo);
        }
      }
    }
  }

  return {
    oportunidad: salida.oportunidad.slice(0, limitePorRol),
    amenaza: salida.amenaza.slice(0, limitePorRol),
  };
}
