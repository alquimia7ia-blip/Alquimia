"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { camposEsperados, progresoTaller, progresoModulo, nivel, xp } from "@/lib/talleres/progreso";
import { sugerenciasDelModulo } from "@/lib/talleres/sugerencias";
import { campo, bloques } from "@/lib/talleres/rutas";
import type { Bloque, Definicion, ValorCampo } from "@/lib/talleres/tipos";
import { useBitacora } from "@/components/campos/contexto";
import { RenderBloque } from "@/components/campos/RenderBloque";
import { AnilloProgreso } from "@/components/gamificacion/AnilloProgreso";
import { MedidorElixir } from "@/components/gamificacion/MedidorElixir";
import { useConfeti } from "@/components/gamificacion/Confeti";
import { useToast } from "@/components/ui/Toast";
import { ControlTema } from "@/components/ui/ControlTema";

export type TallerVista = {
  id: string;
  numero: number;
  slug: string;
  corto: string;
  titulo: string;
  lead: string;
  definicion: Definicion;
  camposMinimos: number;
};

type Props = {
  talleres: TallerVista[];
  moduloTitulo: string;
  /** Módulos entre los que se puede saltar. */
  modulos?: { numero: number; slug: string; titulo: string }[];
  moduloSlug?: string;
  /** Sin esto el salto navega a /<slug>. El archivo autónomo, que no tiene
   *  rutas, lo usa para cambiar de módulo en memoria. */
  onModulo?: (slug: string) => void;
  empresa: string;
  onEmpresa?: (nombre: string) => void;
  /** Texto del indicador de guardado: "Guardado", "Guardando…", "Sin conexión". */
  estado?: { texto: string; ocupado?: boolean };
  acciones?: React.ReactNode;
  /** Pie del riel: enlaces al equipo y aviso sobre el trabajo simultáneo. */
  pieRail?: React.ReactNode;
};

export function VistaModulo({
  talleres, moduloTitulo, modulos, moduloSlug, onModulo, empresa, onEmpresa, estado, acciones, pieRail,
}: Props) {
  const bit = useBitacora();
  const [actual, setActual] = useState(0);
  const { lanzar, Lienzo } = useConfeti();
  const { avisar, Toast } = useToast();
  const celebrados = useRef<Set<string>>(new Set());
  const primeraPintura = useRef(true);

  // Un mapa de respuestas para el cálculo de progreso. Se reconstruye en cada
  // render: con ~170 campos el costo es despreciable y evita estado duplicado.
  const respuestas = useMemo(() => {
    const m = new Map<string, ValorCampo>();
    for (const t of talleres) {
      for (const c of camposEsperados(t.definicion, bit.todasLasFilas.filter((f) => f.tallerId === t.id))) {
        m.set(c.campoId, bit.valor(c.campoId));
      }
    }
    return m;
  }, [talleres, bit]);

  const avances = useMemo(
    () => talleres.map((t) => {
      const filas = bit.todasLasFilas.filter((f) => f.tallerId === t.id);
      return progresoTaller(camposEsperados(t.definicion, filas), respuestas, t.camposMinimos);
    }),
    [talleres, respuestas, bit],
  );

  const total = useMemo(() => progresoModulo(avances), [avances]);

  // Confeti al completar un taller, nunca en la primera pintura: al volver a
  // una bitácora ya terminada no tiene sentido celebrar de nuevo.
  useEffect(() => {
    const completos = new Set(
      talleres.filter((t, i) => avances[i]!.total > 0 && avances[i]!.fraccion >= 1).map((t) => t.id),
    );
    if (!primeraPintura.current) {
      for (const id of completos) {
        if (!celebrados.current.has(id)) {
          const t = talleres.find((x) => x.id === id)!;
          avisar(`✦ Taller completo · ${t.corto}`);
          lanzar();
        }
      }
    }
    celebrados.current = completos;
    primeraPintura.current = false;
  }, [avances, talleres, avisar, lanzar]);

  const esResumen = actual >= talleres.length;
  const taller = talleres[actual];

  const ir = (i: number) => {
    setActual(Math.max(0, Math.min(talleres.length, i)));
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };

  return (
    <div className="app">
      <aside className="rail">
        <div className="brand">
          <Brujula />
          <div>
            <div className="brand-t">Brújula empresarial</div>
            <div className="brand-s">{moduloTitulo}</div>
          </div>
        </div>

        <SelectorModulos modulos={modulos} actual={moduloSlug} onModulo={onModulo} />

        <MedidorElixir resueltos={total.resueltos} total={total.total} />

        <div className="ruta-h">Ruta del módulo</div>
        <nav>
          <ul className="ruta">
            {talleres.map((t, i) => (
              <li key={t.id}>
                <button
                  className={`st ${avances[i]!.fraccion >= 1 ? "done" : ""}`}
                  aria-current={i === actual}
                  type="button"
                  onClick={() => ir(i)}
                >
                  <span className="st-n">{String(t.numero).padStart(2, "0")}</span>
                  <span className="st-t">{t.corto}</span>
                  <AnilloProgreso fraccion={avances[i]!.fraccion} completo={avances[i]!.fraccion >= 1} />
                </button>
              </li>
            ))}
            <li>
              <button className="st" aria-current={esResumen} type="button" onClick={() => ir(talleres.length)}>
                <span className="st-n">✦</span>
                <span className="st-t">Resumen y entrega</span>
                <AnilloProgreso fraccion={total.fraccion} completo={total.fraccion >= 1} />
              </button>
            </li>
          </ul>
        </nav>

        <div className="rail-foot">
          <ControlTema />
          {pieRail}
        </div>
      </aside>

      <div className="main">
        <header className="top">
          <div className="ident">
            <input
              value={empresa}
              placeholder="Nombre de tu empresa"
              autoComplete="organization"
              readOnly={!onEmpresa}
              onChange={(e) => onEmpresa?.(e.target.value)}
            />
          </div>
          {estado && (
            <span className="saved">
              <span className={`dot ${estado.ocupado ? "busy" : ""}`} />
              <span>{estado.texto}</span>
            </span>
          )}
          {acciones}
        </header>

        <main className="stage">
          <div className="head">
            <span className="eyebrow">
              {esResumen ? "Cierre del módulo" : `Taller ${taller!.numero} de ${talleres.length}`}
            </span>
            <h1 className="h-taller">
              {esResumen ? "Tu módulo, de una sola mirada" : taller!.titulo}
            </h1>
            <p className="lead">
              {esResumen
                ? "Todo lo que respondieron, listo para revisar, imprimir o entregar."
                : taller!.lead}
            </p>
          </div>

          <div className="anim">
            {esResumen
              ? <Resumen talleres={talleres} avances={avances} total={total} />
              : <CuerpoTaller taller={taller!} respuestas={respuestas} talleres={talleres} />}
          </div>

          <div className="nav">
            <button className="btn" type="button" onClick={() => ir(actual - 1)}
                    style={actual === 0 ? { visibility: "hidden" } : undefined}>
              ← Anterior
            </button>
            <button className="btn pri" type="button" onClick={() => ir(actual + 1)}
                    style={esResumen ? { visibility: "hidden" } : undefined}>
              Siguiente →
            </button>
          </div>
        </main>
      </div>

      <Lienzo />
      <Toast />
    </div>
  );
}

/**
 * La ayuda va arriba, siempre.
 *
 * El contenido traía las notas donde el autor las escribió, a veces al final
 * de la sección. Una instrucción que se lee cuando ya llenaste los campos no
 * sirve de nada, así que suben al principio de su sección —justo debajo de la
 * pregunta— conservando el orden relativo entre ellas.
 */
function conAyudaArriba(bs: Bloque[]): Bloque[] {
  const notas = bs.filter((b) => b.tipo === "nota");
  if (notas.length === 0 || notas.length === bs.length) return bs;
  return [...notas, ...bs.filter((b) => b.tipo !== "nota")];
}

function CuerpoTaller({
  taller, respuestas, talleres,
}: { taller: TallerVista; respuestas: Map<string, ValorCampo>; talleres: TallerVista[] }) {
  const bit = useBitacora();

  // Sugerencias para los cuadrantes, tomadas de todo el módulo.
  const sugerencias = useMemo(
    () => sugerenciasDelModulo(talleres.map((t) => t.definicion), respuestas),
    [talleres, respuestas],
  );

  const cuadrantes = [...bloques(taller.definicion)].find((b) => b.tipo === "cuadrantes");

  return (
    <div className="stack">
      {taller.definicion.secciones.map((s) => (
        <div className="stack" key={s.id}>
          {s.titulo && <h2 style={{ fontSize: 20, marginTop: 16 }}>{s.titulo}</h2>}
          {s.lead && <p className="lead" style={{ marginTop: 4 }}>{s.lead}</p>}
          {conAyudaArriba(s.bloques).map((b) => <RenderBloque key={b.id} bloque={b} />)}
        </div>
      ))}

      {cuadrantes?.tipo === "cuadrantes" && cuadrantes.alimentadoPor && (
        <PanelSugerencias
          bloqueId={cuadrantes.id}
          destinos={cuadrantes.alimentadoPor}
          lineas={Object.fromEntries(cuadrantes.cuadrantes.map((q) => [q.id, q.lineas]))}
          sugerencias={sugerencias}
          onInsertar={(cuadranteId, texto, lineasCuadrante) => {
            for (let i = 0; i < lineasCuadrante; i++) {
              const id = campo.cuadrante(cuadrantes.id, cuadranteId, i);
              const v = bit.valor(id);
              if (typeof v !== "string" || v.trim() === "") { bit.escribir(id, texto); return; }
            }
          }}
        />
      )}
    </div>
  );
}

function PanelSugerencias({
  destinos, lineas, sugerencias, onInsertar,
}: {
  bloqueId: string;
  destinos: Partial<Record<"oportunidad" | "amenaza", string>>;
  lineas: Record<string, number>;
  sugerencias: { oportunidad: string[]; amenaza: string[] };
  onInsertar: (cuadranteId: string, texto: string, lineas: number) => void;
}) {
  const grupos = ([
    ["oportunidad", "Hacia oportunidades", "var(--fav)"],
    ["amenaza", "Hacia amenazas", "var(--des)"],
  ] as const).filter(([rol]) => destinos[rol] && sugerencias[rol].length > 0);

  if (grupos.length === 0) {
    return (
      <div className="hint">
        Cuando marquen impactos en los talleres anteriores, aquí aparecerán sugerencias
        tomadas de sus propias respuestas.
      </div>
    );
  }

  return (
    <div className="card">
      <span className="lbl">Traído de sus propias respuestas · un clic lo inserta</span>
      {grupos.map(([rol, titulo, color]) => (
        <div key={rol} style={{ marginTop: 10 }}>
          <span style={{ fontSize: 12.5, color, fontWeight: 600 }}>{titulo}</span>
          <div className="sugs">
            {sugerencias[rol].map((t) => (
              <button key={t} className="sug" type="button"
                onClick={() => onInsertar(destinos[rol]!, t, lineas[destinos[rol]!] ?? 3)}>
                {t}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Resumen({
  talleres, avances, total,
}: {
  talleres: TallerVista[];
  avances: { resueltos: number; total: number; fraccion: number }[];
  total: { resueltos: number; total: number; fraccion: number };
}) {
  const completos = avances.filter((a) => a.total > 0 && a.fraccion >= 1).length;
  return (
    <div className="stack">
      <div className="sum-grid">
        <div className="tile">
          <div className="n">{Math.round(total.fraccion * 100)}%</div>
          <div className="k">del módulo resuelto</div>
        </div>
        <div className="tile">
          <div className="n">{xp(total.resueltos).toLocaleString("es-CO")}</div>
          <div className="k">XP · nivel {nivel(total.fraccion)}</div>
        </div>
        <div className="tile">
          <div className="n">{completos}</div>
          <div className="k">de {talleres.length} talleres completos</div>
        </div>
        <div className="tile">
          <div className="n">{total.total - total.resueltos}</div>
          <div className="k">campos por resolver</div>
        </div>
      </div>

      <div className="card">
        <span className="lbl">Avance taller por taller</span>
        <div className="bars" style={{ marginTop: 10 }}>
          {talleres.map((t, i) => (
            <div className="bar-row" key={t.id}>
              <span>{t.numero}. {t.corto}</span>
              <span className="bar">
                <i style={{
                  width: `${(avances[i]!.fraccion * 100).toFixed(0)}%`,
                  background: avances[i]!.fraccion >= 1 ? "var(--fav)" : "var(--accent)",
                }} />
              </span>
              <span className="pc">{Math.round(avances[i]!.fraccion * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Salto entre módulos.
 *
 * Hasta que se publicó el Módulo 2 no existía: con un solo módulo el riel
 * bastaba. Se dibuja solo cuando hay más de uno, así que el archivo autónomo
 * —que lleva un módulo y ningún enlace— no cambia.
 */
function SelectorModulos({
  modulos, actual, onModulo,
}: {
  modulos?: { numero: number; slug: string; titulo: string }[];
  actual?: string;
  onModulo?: (slug: string) => void;
}) {
  if (!modulos || modulos.length < 2) return null;
  return (
    <>
      <div className="ruta-h">Programa</div>
      <nav className="modulos" aria-label="Módulos del programa">
        {modulos.map((m) => {
          const contenido = (
            <>
              <span className="mod-n">{m.numero}</span>
              <span className="mod-t">{m.titulo}</span>
            </>
          );
          const marcado = m.slug === actual ? "true" : undefined;
          return onModulo ? (
            <button key={m.slug} className="mod" type="button" aria-current={marcado}
                    onClick={() => onModulo(m.slug)}>
              {contenido}
            </button>
          ) : (
            <a key={m.slug} className="mod" href={`/${m.slug}`} aria-current={marcado}>
              {contenido}
            </a>
          );
        })}
      </nav>
    </>
  );
}

function Brujula() {
  return (
    <svg className="marca" viewBox="0 0 36 36" aria-hidden="true">
      <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="2"
              opacity=".35" />
      <path d="M18 1.5v3M18 31.5v3M1.5 18h3M31.5 18h3" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" opacity=".35" />
      <path d="M18 6.5 25 18l-7 11.5L11 18Z" fill="var(--accent)" opacity=".22" />
      <path d="M18 6.5 25 18H11Z" fill="var(--accent)" />
    </svg>
  );
}
