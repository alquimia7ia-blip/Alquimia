import { campo } from "@/lib/talleres/rutas";
import type { ValorCampo } from "@/lib/talleres/tipos";

/**
 * Traduce el respaldo JSON del prototipo al modelo nuevo.
 *
 * El botón «Respaldo» de docs/taller-mega-modulo-1.html produce el estado
 * completo con rutas como `t5.0.n`. Aquí se convierte a campo_id estables y
 * a filas con identificador propio. Es una tabla de correspondencia y nada
 * más, pero evita que quien ya diligenció el prototipo empiece de cero.
 */

export type Plan = {
  empresa: string;
  /** Filas a crear, en orden. La clave `ref` las ata a sus respuestas. */
  filas: { ref: string; tallerSlug: string; bloqueId: string; orden: number }[];
  /** `campoId` puede llevar `{ref}`, que se reemplaza por el id de la fila creada. */
  respuestas: { tallerSlug: string; campoId: string; valor: ValorCampo }[];
};

type Crudo = Record<string, unknown>;
const obj = (v: unknown): Crudo => (v && typeof v === "object" ? (v as Crudo) : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const str = (v: unknown): string => (typeof v === "string" ? v : "");

/** Los identificadores de categoría del PESTEL son de dos letras. */
const partirClavePestel = (clave: string) => ({
  grupo: clave.slice(0, 2),
  fila: clave.slice(2),
});

export function planDesdeArtifact(crudo: unknown): Plan {
  const S = obj(crudo);
  const plan: Plan = { empresa: str(S["empresa"]), filas: [], respuestas: [] };

  const R = (tallerSlug: string, campoId: string, valor: ValorCampo) => {
    if (valor === null || valor === "" || (Array.isArray(valor) && valor.length === 0)) return;
    plan.respuestas.push({ tallerSlug, campoId, valor });
  };
  const F = (tallerSlug: string, bloqueId: string, orden: number) => {
    const ref = `${bloqueId}-${orden}`;
    plan.filas.push({ ref, tallerSlug, bloqueId, orden });
    return ref;
  };

  // Taller 1 · tendencias fijas y propias
  const t1 = obj(S["t1"]);
  for (const [id, valor] of Object.entries(obj(t1["tend"]))) {
    const v = obj(valor);
    R("grandes-tendencias", campo.item("tend", id, "valoracion"), str(v["v"]));
    R("grandes-tendencias", campo.item("tend", id, "nota"), str(v["nota"]));
  }
  arr(t1["extra"]).forEach((e, i) => {
    const x = obj(e);
    if (!str(x["t"])) return;
    const ref = F("grandes-tendencias", "tend", i);
    R("grandes-tendencias", campo.fila("tend", `{${ref}}`, "titulo"), str(x["t"]));
    R("grandes-tendencias", campo.fila("tend", `{${ref}}`, "valoracion"), str(x["v"]));
    R("grandes-tendencias", campo.fila("tend", `{${ref}}`, "nota"), str(x["nota"]));
  });

  // Taller 1 · tablero PESTEL. La clave vieja pegaba categoría e índice.
  for (const [clave, valor] of Object.entries(obj(S["t1b"]))) {
    const { grupo, fila } = partirClavePestel(clave);
    R("grandes-tendencias", campo.matriz("pestel", grupo, fila), str(valor));
  }

  // Taller 2 · cinco fuerzas
  for (const [id, valor] of Object.entries(obj(S["t2"]))) {
    const f = obj(valor);
    R("cinco-fuerzas", campo.item("fuerzas", id, "prioridad"), str(f["rank"]));
    R("cinco-fuerzas", campo.item("fuerzas", id, "impacto"), str(f["imp"]));
    R("cinco-fuerzas", campo.item("fuerzas", id, "nota"), str(f["nota"]));
  }

  // Talleres de líneas numeradas
  arr(S["t3"]).forEach((v, i) => R("rasgos-del-mercado", campo.linea("rasgos", i), str(v)));
  const t4 = obj(S["t4"]);
  arr(t4["hab"]).forEach((v, i) => R("perfil-del-cliente", campo.linea("habitos", i), str(v)));
  arr(t4["mot"]).forEach((v, i) => R("perfil-del-cliente", campo.linea("motivadores", i), str(v)));
  arr(S["t6"]).forEach((v, i) => R("atributos-del-sector", campo.linea("atributos", i), str(v)));

  // Taller 5 · competidores
  arr(S["t5"]).forEach((c, i) => {
    const x = obj(c);
    const ref = F("competencia", "competidores", i);
    const mapa: [string, string][] = [
      ["n", "nombre"], ["f", "fortalezas"], ["d", "debilidades"],
      ["p", "perfil"], ["a", "atributos"],
    ];
    for (const [viejo, nuevo] of mapa) {
      R("competencia", campo.fila("competidores", `{${ref}}`, nuevo), str(x[viejo]));
    }
  });

  // Taller 7 · procesos
  const t7 = obj(S["t7"]);
  R("procesos-clave", "productivos", arr(t7["prod"]).map(str).filter(Boolean));
  R("procesos-clave", "soporte", arr(t7["sop"]).map(str).filter(Boolean));

  // Taller 8 · indicadores, con los años del encabezado
  const t8 = obj(S["t8"]);
  arr(t8["anios"]).forEach((a, j) => {
    R("indicadores", campo.encabezado("indicadores", `a${j + 1}`), str(a));
  });
  arr(t8["filas"]).forEach((f, i) => {
    const x = obj(f);
    const ref = F("indicadores", "indicadores", i);
    R("indicadores", campo.fila("indicadores", `{${ref}}`, "nombre"), str(x["n"]));
    arr(x["v"]).forEach((v, j) => {
      R("indicadores", campo.fila("indicadores", `{${ref}}`, `a${j + 1}`), str(v));
    });
  });

  // Taller 9 · hitos
  arr(S["t9"]).forEach((h, i) => {
    const x = obj(h);
    const ref = F("hitos", "hitos", i);
    R("hitos", campo.fila("hitos", `{${ref}}`, "anio"), str(x["a"]));
    R("hitos", campo.fila("hitos", `{${ref}}`, "hecho"), str(x["h"]));
  });

  // Taller 10 · valores
  arr(S["t10"]).forEach((v, i) => {
    const x = obj(v);
    const ref = F("valores", "valores", i);
    R("valores", campo.fila("valores", `{${ref}}`, "valor"), str(x["v"]));
    R("valores", campo.fila("valores", `{${ref}}`, "significado"), str(x["s"]));
  });

  // Taller 11 · DOFA
  const t11 = obj(S["t11"]);
  for (const q of ["F", "D", "A", "O"]) {
    arr(t11[q]).forEach((v, i) => R("dofa", campo.cuadrante("dofa", q, i), str(v)));
  }

  // Filas sin ninguna respuesta no aportan nada: se descartan.
  const usadas = new Set(
    plan.respuestas.flatMap((r) => {
      const m = r.campoId.match(/\{([^}]+)\}/);
      return m ? [m[1]!] : [];
    }),
  );
  plan.filas = plan.filas.filter((f) => usadas.has(f.ref));

  return plan;
}

/** Cuántas respuestas trae el respaldo, para avisar antes de importar. */
export function resumenPlan(plan: Plan) {
  const porTaller = new Map<string, number>();
  for (const r of plan.respuestas) {
    porTaller.set(r.tallerSlug, (porTaller.get(r.tallerSlug) ?? 0) + 1);
  }
  return {
    respuestas: plan.respuestas.length,
    filas: plan.filas.length,
    talleres: porTaller.size,
    detalle: [...porTaller.entries()].sort(),
  };
}
