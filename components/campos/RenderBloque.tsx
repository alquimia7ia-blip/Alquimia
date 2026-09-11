"use client";

import { campo } from "@/lib/talleres/rutas";
import { opcion } from "@/lib/talleres/escalas";
import type { Bloque, ColorEscala } from "@/lib/talleres/tipos";
import { useBitacora, conNegritas } from "./contexto";
import { Texto } from "./Texto";
import { Escala, Ranking } from "./Escala";

/**
 * Un bloque, renderizado.
 *
 * Esto sustituye las once funciones render() del prototipo. Cada rama
 * produce exactamente la misma marca HTML que aquel, para que el CSS
 * portado siga aplicando sin retoques.
 */

const tokenColor = (c?: ColorEscala) =>
  c && c !== "acento" ? `var(--${c})` : "var(--accent)";

function Ayuda({ texto }: { texto?: string }) {
  if (!texto) return null;
  // Plegada: la instrucción sigue a un clic, pero no compite con el trabajo.
  return (
    <details className="pista">
      <summary>
          <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.6v.6" strokeLinecap="round" /></svg>
          Cómo llenarlo
        </summary>
      <div className="cuerpo">{conNegritas(texto)}</div>
    </details>
  );
}

/** Contador vivo del bloque. Ver "4 de 11" avanzar es la mitad del juego. */
function Cuenta({ hechos, total }: { hechos: number; total: number }) {
  return (
    <span className={`cuenta ${hechos >= total ? "full" : ""}`}>
      {hechos >= total ? `✓ ${total} de ${total}` : `${hechos} de ${total}`}
    </span>
  );
}

function Detalle({ detalle }: { detalle?: { titulo: string; cuerpo: string } }) {
  if (!detalle) return null;
  return (
    <details className="ayuda" style={{ marginTop: 10 }}>
      <summary>{detalle.titulo}</summary>
      <p>{detalle.cuerpo}</p>
    </details>
  );
}

export function RenderBloque({ bloque: b }: { bloque: Bloque }) {
  const bit = useBitacora();

  switch (b.tipo) {
    case "nota":
      // También plegada: el aviso del autor está, pero no ocupa media pantalla.
      return (
        <details className="pista">
          <summary>
          <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.6v.6" strokeLinecap="round" /></svg>
          Cómo llenarlo
        </summary>
          <div className="cuerpo">{conNegritas(b.cuerpo)}</div>
        </details>
      );

    case "texto":
      return (
        <div>
          {b.etiqueta && <span className="lbl">{b.etiqueta}</span>}
          <Ayuda texto={b.ayuda} />
          <Texto campoId={campo.simple(b.id)} marcador={b.marcador} multilinea={b.multilinea ?? true} />
        </div>
      );

    case "lista_numerada":
      return (
        <div className={b.etiqueta ? "card" : undefined}>
          {b.etiqueta && <span className="lbl">{b.etiqueta}</span>}
          <Ayuda texto={b.ayuda} />
          <div className="grid">
            {Array.from({ length: b.lineas }, (_, i) => (
              <div className="row-n" key={i}>
                <span className="idx">{i + 1}</span>
                <Texto campoId={campo.linea(b.id, i)} marcador={b.marcador} />
              </div>
            ))}
          </div>
        </div>
      );

    case "fichas_escala": {
      const propias = bit.filas(b.id);
      const hechos =
        b.items.filter((it) => bit.valor(campo.item(b.id, it.id, "valoracion"))).length +
        propias.filter((f) => bit.valor(campo.fila(b.id, f.id, "valoracion"))).length;

      // Una ficha sin responder enseña qué es; una respondida enseña dónde
      // desarrollarla. Nunca las dos cosas, para que la página no crezca.
      const Ficha = ({
        clave, cabecera, campoValor, campoNota, descripcion,
      }: {
        clave: string; cabecera: React.ReactNode; campoValor: string;
        campoNota: string; descripcion?: string;
      }) => {
        const v = bit.valor(campoValor);
        const marca = typeof v === "string" ? opcion(b.escala, v)?.color : undefined;
        return (
          <div key={clave} className={`trend ${v ? "set" : ""}`}
               style={{ ["--mark" as string]: tokenColor(marca) }}>
            <div className="trend-cab">
              <div style={{ minWidth: 0, flex: 1 }}>
                {cabecera}
                {descripcion && !v && <div className="trend-d">{descripcion}</div>}
              </div>
              {v ? <span className="tick" aria-label="Respondida">✓</span> : null}
            </div>
            <Escala campoId={campoValor} escalaId={b.escala} />
            {b.campoNota && v && (
              <div className="revelado">
                <Texto campoId={campoNota} marcador={b.campoNota.etiqueta} />
              </div>
            )}
          </div>
        );
      };

      return (
        <div className="stack">
          <div className="bloque-cab">
            <Cuenta hechos={hechos} total={b.items.length + propias.length} />
          </div>
          <Ayuda texto={b.ayuda} />
          <div className="grid" style={{ gap: 10 }}>
            {b.items.map((it) => (
              <Ficha
                key={it.id}
                clave={it.id}
                cabecera={<div className="trend-t">{it.titulo}</div>}
                campoValor={campo.item(b.id, it.id, "valoracion")}
                campoNota={campo.item(b.id, it.id, "nota")}
                descripcion={it.descripcion}
              />
            ))}

            {propias.map((f) => (
              <Ficha
                key={f.id}
                clave={f.id}
                cabecera={
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Texto
                      campoId={campo.fila(b.id, f.id, "titulo")}
                      marcador="Tendencia propia de tu sector"
                      multilinea={false}
                    />
                    <button className="del" type="button" title="Eliminar"
                      onClick={() => bit.eliminarFila(f.id)}>×</button>
                  </div>
                }
                campoValor={campo.fila(b.id, f.id, "valoracion")}
                campoNota={campo.fila(b.id, f.id, "nota")}
              />
            ))}
          </div>
          {b.permiteAgregar && !bit.soloLectura && (
            <div>
              <button className="padd" type="button" onClick={() => bit.agregarFila(b.id)}>
                + Agregar una tendencia de mi sector
              </button>
            </div>
          )}
        </div>
      );
    }

    case "matriz_escala":
      return (
        <div className="stack">
          <Ayuda texto={b.ayuda} />
          {b.grupos.map((g) => {
            const hechos = g.filas.filter((f) => bit.valor(campo.matriz(b.id, g.id, f.id))).length;
            return (
              <div className="card" key={g.id}>
                <div style={{ display: "flex", justifyContent: "space-between",
                              alignItems: "baseline", gap: 10, marginBottom: 12 }}>
                  <h3 style={{ fontSize: 16, textTransform: "uppercase",
                               letterSpacing: ".06em", color: "var(--accent)" }}>{g.titulo}</h3>
                  <Cuenta hechos={hechos} total={g.filas.length} />
                </div>
                <div className="grid" style={{ gap: 9 }}>
                  {g.filas.map((f) => (
                    <div key={f.id} style={{ display: "flex", gap: 12, justifyContent: "space-between",
                                             alignItems: "center", flexWrap: "wrap", paddingBottom: 9,
                                             borderBottom: "1px solid var(--line-2)" }}>
                      <span style={{ fontSize: 16.2, flex: "1 1 280px", lineHeight: 1.4 }}>{f.texto}</span>
                      <Escala campoId={campo.matriz(b.id, g.id, f.id)} escalaId={b.escala} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );

    case "ranking_escala": {
      const usados = b.items
        .map((it) => bit.valor(campo.item(b.id, it.id, "prioridad")))
        .filter((v): v is string => typeof v === "string" && v !== "");
      return (
        <div className="stack">
          <Ayuda texto={b.ayuda} />
          {b.items.map((it, i) => {
            const prioridad = bit.valor(campo.item(b.id, it.id, "prioridad"));
            return (
            <div className="force" key={it.id}>
              <div className="force-n">{prioridad || i + 1}</div>
              <div>
                <h3>{it.titulo}</h3>
                {/* Igual que en las fichas: la explicación se retira cuando ya
                    cumplió su función, y la fuerza queda en una sola línea. */}
                {it.descripcion && !prioridad && <p>{it.descripcion}</p>}
                <div className="ctrl">
                  <span className="mini-lbl">Prioridad</span>
                  <Ranking campoId={campo.item(b.id, it.id, "prioridad")}
                           maximo={b.items.length} usados={usados} />
                </div>
                <div className="ctrl">
                  <span className="mini-lbl">Efecto en rentabilidad</span>
                  <Escala campoId={campo.item(b.id, it.id, "impacto")} escalaId={b.escala} />
                </div>
                {b.campoNota && bit.valor(campo.item(b.id, it.id, "prioridad")) ? (
                  <div className="revelado" style={{ marginTop: 11 }}>
                    <Texto campoId={campo.item(b.id, it.id, "nota")}
                           marcador={b.campoNota.etiqueta} filas={2} />
                  </div>
                ) : null}
                <Detalle detalle={it.detalle} />
              </div>
            </div>
            );
          })}
        </div>
      );
    }

    case "tabla": {
      const filas = bit.filas(b.id);
      const titulo = (col: { id: string; titulo: string }) => {
        const editable = b.columnasEditables?.find((c) => c.id === col.id);
        if (!editable) return col.titulo;
        return <Texto campoId={campo.encabezado(b.id, col.id)}
                      marcador={editable.valorPorDefecto} multilinea={false} numerica />;
      };
      return (
        <div className="stack">
          <Ayuda texto={b.ayuda} />
          <div className="tw">
            <table>
              <thead>
                <tr>
                  {b.columnas.map((c) => <th key={c.id}>{titulo(c)}</th>)}
                  {!bit.soloLectura && <th />}
                </tr>
              </thead>
              <tbody>
                {filas.map((f) => (
                  <tr key={f.id}>
                    {b.columnas.map((c) => (
                      <td key={c.id}>
                        <Texto campoId={campo.fila(b.id, f.id, c.id)} marcador={c.marcador}
                               multilinea={c.multilinea ?? false} numerica={c.numerica}
                               filas={c.multilinea ? 2 : 1} />
                      </td>
                    ))}
                    {!bit.soloLectura && (
                      <td>
                        <button className="del" type="button" title="Eliminar"
                          onClick={() => bit.eliminarFila(f.id)}>×</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!bit.soloLectura && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="padd" type="button" onClick={() => bit.agregarFila(b.id)}>
                + Fila en blanco
              </button>
            </div>
          )}
          {b.sugerencias && !bit.soloLectura && (
            <div>
              <span className="lbl">Sugerencias · un clic las agrega</span>
              <div className="sugs">
                {b.sugerencias.map((s) => (
                  <button key={s} className="sug" type="button"
                    onClick={() => {
                      const primeraCol = b.columnas[0]!.id;
                      const libre = filas.find((f) => !bit.valor(campo.fila(b.id, f.id, primeraCol)));
                      if (libre) bit.escribir(campo.fila(b.id, libre.id, primeraCol), s);
                      else bit.agregarFila(b.id);
                    }}>{s}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    case "chips_agregables": {
      const actuales = bit.valor(b.id);
      const lista = Array.isArray(actuales) ? actuales : [];
      const agregar = (t: string) => {
        const limpio = t.trim();
        if (limpio && !lista.includes(limpio)) bit.escribir(b.id, [...lista, limpio]);
      };
      return (
        <div className="card">
          {b.etiqueta && <span className="lbl">{b.etiqueta}</span>}
          {b.descripcion && (
            <p style={{ color: "var(--muted)", fontSize: 13.3, margin: "0 0 12px" }}>
              {b.descripcion}
            </p>
          )}
          <div className="plist">
            {lista.map((p, i) => (
              <span className="ptag" key={`${p}-${i}`}>
                {p}
                {!bit.soloLectura && (
                  <button type="button" title="Quitar"
                    onClick={() => bit.escribir(b.id, lista.filter((_, k) => k !== i))}>×</button>
                )}
              </span>
            ))}
            {!bit.soloLectura && (
              <button className="padd" type="button"
                onClick={() => {
                  const t = window.prompt("Nombre del proceso");
                  if (t) agregar(t);
                }}>+ Agregar proceso</button>
            )}
          </div>
          {b.sugerencias && !bit.soloLectura && (
            <div className="sugs" style={{ marginTop: 10 }}>
              {b.sugerencias.filter((s) => !lista.includes(s)).map((s) => (
                <button key={s} className="sug" type="button" onClick={() => agregar(s)}>{s}</button>
              ))}
            </div>
          )}
        </div>
      );
    }

    case "linea_tiempo": {
      const filas = bit.filas(b.id);
      return (
        <div className="stack">
          <Ayuda texto={b.ayuda} />
          <div className="tl">
            {filas.map((f) => (
              <div className="hito" key={f.id}>
                <Texto campoId={campo.fila(b.id, f.id, "anio")} marcador={b.marcadorAnio}
                       multilinea={false} numerica />
                <Texto campoId={campo.fila(b.id, f.id, "hecho")} marcador={b.marcadorHecho} />
                {!bit.soloLectura && (
                  <button className="del" type="button" title="Eliminar"
                    onClick={() => bit.eliminarFila(f.id)}>×</button>
                )}
              </div>
            ))}
          </div>
          {!bit.soloLectura && (
            <div>
              <button className="padd" type="button" onClick={() => bit.agregarFila(b.id)}>
                + Agregar hito
              </button>
            </div>
          )}
        </div>
      );
    }

    case "cuadrantes":
      return (
        <div className="stack">
          <Ayuda texto={b.ayuda} />
          <div className="dofa">
            {b.cuadrantes.map((q) => (
              <div className={`q ${q.color}`} key={q.id}>
                <h3>{q.titulo}</h3>
                {q.subtitulo && <div className="qs">{q.subtitulo}</div>}
                <div className="grid" style={{ gap: 8 }}>
                  {Array.from({ length: q.lineas }, (_, i) => (
                    <Texto key={i} campoId={campo.cuadrante(b.id, q.id, i)} marcador={`${i + 1}.`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
  }
}
