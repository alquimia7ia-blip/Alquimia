"use client";

import { campo } from "@/lib/talleres/rutas";
import { opcion } from "@/lib/talleres/escalas";
import {
  MESES, puntaje, puestos, puntajeMaximo, type NotasFila,
} from "@/lib/talleres/priorizacion";
import {
  calcularFlujo, cifra, pesos, rotuloMes, type Flujo,
} from "@/lib/talleres/flujo";
import { calcularTabla, entradasDe, formatear, visiblesDe } from "@/lib/talleres/calculo";
import type {
  Bloque, ColorEscala, CriterioPriorizacion, Fila,
  IndicadorCalculo, ParametroCalculo,
} from "@/lib/talleres/tipos";
import { useBitacora, conNegritas } from "./contexto";
import { Texto } from "./Texto";
import { Escala, Nota, Ranking } from "./Escala";

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

/**
 * La fórmula del puntaje, a la vista.
 *
 * No es decoración. El orden que sale de esta matriz decide en qué gasta la
 * empresa el año siguiente, y una cifra que aparece sin explicación se
 * acepta o se descarta en bloque. Escrita, se puede discutir criterio por
 * criterio en la asesoría, que es para lo que sirve.
 */
function Formula({
  criterios, maximo, tope,
}: { criterios: CriterioPriorizacion[]; maximo: number; tope: number }) {
  const invertidos = criterios.filter((c) => c.invertido);
  return (
    <div className="hint">
      <b>Cómo se calcula el puntaje.</b>{" "}
      Cada criterio se califica de 1 a {maximo} y se suman: máximo {tope} puntos.
      {invertidos.length > 0 && (
        <>
          {" "}
          {invertidos.map((c) => c.titulo.toLowerCase()).join(" y ")}{" "}
          {invertidos.length === 1 ? "entra invertido" : "entran invertidos"} ({maximo + 1} − nota),
          porque exigir más recursos no vuelve más prioritario a un proyecto.
        </>
      )}{" "}
      El número de la izquierda es el orden de ejecución que resulta. Si no te
      cuadra, la discusión es sobre las notas, no sobre la suma.
    </div>
  );
}

/**
 * De dónde viene el número de esta celda.
 *
 * Tres estados y un cuarto implícito —sin marcar—, que es el que tiene todo
 * hoy. No se exige: quien no sepa qué poner deja la celda como está y el
 * taller sigue contando igual.
 */
const ORIGENES = [
  { v: "dato", etiqueta: "Dato", titulo: "Medido: sale de un registro, una factura o un informe" },
  { v: "estimacion", etiqueta: "Estimación", titulo: "Calculado a partir de algo que sí se midió" },
  { v: "opinion", etiqueta: "Opinión", titulo: "Lo que creemos, sin medición detrás" },
] as const;

function Origen({ campoId }: { campoId: string }) {
  const { valor, escribir, soloLectura } = useBitacora();
  const actual = valor(campoId);
  if (soloLectura && typeof actual !== "string") return null;

  return (
    <div className="origen" role="group" aria-label="Origen del dato">
      {ORIGENES.map((o) => (
        <button
          key={o.v}
          type="button"
          className="origen-op"
          data-o={o.v}
          aria-pressed={actual === o.v}
          disabled={soloLectura}
          title={o.titulo}
          onClick={() => escribir(campoId, actual === o.v ? "" : o.v, { inmediato: true })}
        >
          {o.etiqueta}
        </button>
      ))}
    </div>
  );
}

/** Textos que se insertan de un clic en la primera columna de una tabla. */
function Sugerencias({
  bloqueId, columna, textos, filas,
}: { bloqueId: string; columna: string; textos?: string[]; filas: Fila[] }) {
  const bit = useBitacora();
  if (!textos?.length || bit.soloLectura) return null;
  return (
    <div>
      <span className="lbl">Sugerencias · un clic las agrega</span>
      <div className="sugs">
        {textos.map((s) => (
          <button key={s} className="sug" type="button"
            onClick={() => {
              const libre = filas.find((f) => !bit.valor(campo.fila(bloqueId, f.id, columna)));
              if (libre) bit.escribir(campo.fila(bloqueId, libre.id, columna), s);
              else bit.agregarFila(bloqueId);
            }}>{s}</button>
        ))}
      </div>
    </div>
  );
}

/**
 * Lo que el flujo de caja quiere decir, en una frase.
 *
 * El valle y no el saldo final: un plan que cierra el año con diez millones
 * y pasa por menos cero en mayo quiebra en mayo. La tabla sola deja ese
 * dato enterrado entre doce columnas.
 */
function Veredicto({ flujo, mesInicial }: { flujo: Flujo; mesInicial?: number }) {
  if (flujo.meses.every((m) => m.entradas === 0 && m.salidas === 0)) {
    return (
      <div className="hint">
        Llena las filas mes a mes y aquí aparecerá el mes más apretado del plan.
      </div>
    );
  }
  const valle = flujo.valle;
  if (flujo.primerMesEnRojo === null) {
    return (
      <div className="hint" style={{ borderLeftColor: "var(--fav)" }}>
        <b>La caja aguanta el horizonte completo.</b>{" "}
        El mes más apretado es {rotuloMes(valle?.indice ?? 0, mesInicial)}, con{" "}
        ${pesos(valle?.saldo ?? 0)} de saldo.
      </div>
    );
  }
  return (
    <div className="hint" style={{ borderLeftColor: "var(--des)" }}>
      <b>La caja se vuelve negativa en {rotuloMes(flujo.primerMesEnRojo, mesInicial)}.</b>{" "}
      El punto más bajo es {rotuloMes(valle?.indice ?? 0, mesInicial)}, con{" "}
      ${pesos(valle?.saldo ?? 0)}. O consigues ${pesos(Math.abs(valle?.saldo ?? 0))} antes
      de ese mes, o mueves proyectos del cronograma. El plan como está no se puede pagar.
    </div>
  );
}

/**
 * Los datos globales de una tabla calculada.
 *
 * Van arriba y aparte de la tabla porque no son una fila más: el tiempo
 * disponible del turno y la demanda del cliente no describen una estación,
 * la gobiernan. Puestos como columna se teclearían repetidos en cada fila,
 * y entonces cada fila tendría su propio takt time.
 */
function Parametros({
  bloqueId, parametros,
}: { bloqueId: string; parametros: ParametroCalculo[] }) {
  if (parametros.length === 0) return null;
  return (
    <div className="card calc-params">
      {parametros.map((p) => (
        <div className="calc-param" key={p.id}>
          <span className="lbl">
            {p.titulo}
            {p.unidad && <i className="calc-unidad"> · {p.unidad}</i>}
          </span>
          {p.pista && <span className="calc-pista">{p.pista}</span>}
          <Texto campoId={campo.parametro(bloqueId, p.id)} marcador={p.marcador ?? "0"}
                 multilinea={false} numerica />
        </div>
      ))}
    </div>
  );
}

/**
 * Las cifras que resumen el bloque.
 *
 * Es el entregable del taller: lo que la empresa no tenía antes de abrirlo.
 * Se muestran grandes y con la unidad, y el principal se destaca —en el OEE
 * hay cuatro cifras y solo una se lleva a la reunión—.
 */
function Indicadores({
  indicadores, valores,
}: { indicadores: IndicadorCalculo[]; valores: Map<string, number | null> }) {
  if (indicadores.length === 0) return null;
  return (
    <div className="calc-inds">
      {indicadores.map((ind) => (
        <div className={`calc-ind ${ind.principal ? "principal" : ""}`} key={ind.id}>
          <span className="calc-ind-t">{ind.titulo}</span>
          <b>{formatear(valores.get(ind.id) ?? null, ind)}</b>
          {ind.pista && <span className="calc-pista">{ind.pista}</span>}
        </div>
      ))}
    </div>
  );
}

/**
 * Lo que la tabla concluye, en una frase.
 *
 * Un OEE del 48 % no significa nada para quien lo ve por primera vez. «Por
 * debajo del mínimo con el que una planta se considera gestionada» sí, y es
 * la diferencia entre un número y una decisión.
 */
function Dictamen({
  dictamen, vacia, textoVacio,
}: {
  dictamen: { texto: string; color: ColorEscala } | null;
  vacia: boolean;
  textoVacio: string;
}) {
  if (vacia) return <div className="hint">{textoVacio}</div>;
  if (!dictamen) return null;
  return (
    <div className="hint" style={{ borderLeftColor: tokenColor(dictamen.color) }}>
      {conNegritas(dictamen.texto)}
    </div>
  );
}

/** Año y mes en que el proyecto queda concretado. */
function Fecha({
  bloqueId, filaId, anios,
}: { bloqueId: string; filaId: string; anios: number[] }) {
  const bit = useBitacora();
  const campoAnio = campo.fila(bloqueId, filaId, "anio");
  const campoMes = campo.fila(bloqueId, filaId, "mes");
  const anio = bit.valor(campoAnio);
  const mes = bit.valor(campoMes);

  return (
    <div className="crono-sel">
      <select className="f" value={typeof mes === "string" ? mes : ""}
              disabled={bit.soloLectura}
              onChange={(e) => bit.escribir(campoMes, e.target.value, { inmediato: true })}>
        <option value="">Mes…</option>
        {MESES.map((m, i) => <option key={m} value={String(i)}>{m}</option>)}
      </select>
      <select className="f" value={typeof anio === "string" ? anio : ""}
              disabled={bit.soloLectura}
              onChange={(e) => bit.escribir(campoAnio, e.target.value, { inmediato: true })}>
        <option value="">Año…</option>
        {anios.map((a) => <option key={a} value={String(a)}>{a}</option>)}
      </select>
    </div>
  );
}

/**
 * El horizonte dibujado, con el mes elegido marcado.
 *
 * Los dos selectores ya guardan el dato; esto existe para que el plan se lea
 * como plan. Doce proyectos con sus fechas en texto son doce datos sueltos;
 * en la franja se ve de un golpe si todo se prometió para el mismo trimestre,
 * que es el error más común al cerrar este taller.
 */
function Franja({
  bloqueId, filaId, anios,
}: { bloqueId: string; filaId: string; anios: number[] }) {
  const bit = useBitacora();
  const anio = bit.valor(campo.fila(bloqueId, filaId, "anio"));
  const mes = bit.valor(campo.fila(bloqueId, filaId, "mes"));
  const iMes = typeof mes === "string" && mes !== "" ? Number(mes) : null;

  return (
    <div className="crono-franja" aria-hidden="true">
      {anios.map((a) => (
        <span key={a} className={`crono-anio ${String(a) === anio ? "activo" : ""}`}>
          <i className="crono-rotulo">{String(a).slice(2)}</i>
          {MESES.map((m, i) => (
            <i key={m}
               className={`crono-mes ${String(a) === anio && i === iMes ? "hito" : ""}`}
               title={`${m} ${a}`} />
          ))}
        </span>
      ))}
    </div>
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

/**
 * Una ficha de `fichas_escala`: escala arriba y nota debajo.
 *
 * Vive en el módulo y no dentro de `RenderBloque` a propósito. Un componente
 * declarado dentro de otro cambia de identidad en cada render, y React
 * entonces no reconcilia: desmonta el subárbol y lo vuelve a montar. Como
 * `RenderBloque` se vuelve a pintar con cada tecla —lee el contexto de la
 * bitácora—, el <textarea> de la nota se destruía y se recreaba letra a
 * letra: se perdía el cursor y se reiniciaba la animación de `.revelado`.
 * El efecto para quien escribe era no poder corregir un texto ya escrito.
 *
 * Una ficha sin responder enseña qué es; una respondida enseña dónde
 * desarrollarla. Nunca las dos cosas, para que la página no crezca.
 */
function Ficha({
  escala, cabecera, campoValor, campoNota, notaEtiqueta, descripcion,
}: {
  escala: string;
  cabecera: React.ReactNode;
  campoValor: string;
  campoNota: string;
  notaEtiqueta?: string;
  descripcion?: string;
}) {
  const bit = useBitacora();
  const v = bit.valor(campoValor);
  const marca = typeof v === "string" ? opcion(escala, v)?.color : undefined;
  return (
    <div className={`trend ${v ? "set" : ""}`}
         style={{ ["--mark" as string]: tokenColor(marca) }}>
      <div className="trend-cab">
        <div style={{ minWidth: 0, flex: 1 }}>
          {cabecera}
          {descripcion && !v && <div className="trend-d">{descripcion}</div>}
        </div>
        {v ? <span className="tick" aria-label="Respondida">✓</span> : null}
      </div>
      <Escala campoId={campoValor} escalaId={escala} />
      {notaEtiqueta && v && (
        <div className="revelado">
          <Texto campoId={campoNota} marcador={notaEtiqueta} />
        </div>
      )}
    </div>
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
                escala={b.escala}
                notaEtiqueta={b.campoNota?.etiqueta}
                cabecera={<div className="trend-t">{it.titulo}</div>}
                campoValor={campo.item(b.id, it.id, "valoracion")}
                campoNota={campo.item(b.id, it.id, "nota")}
                descripcion={it.descripcion}
              />
            ))}

            {propias.map((f) => (
              <Ficha
                key={f.id}
                escala={b.escala}
                notaEtiqueta={b.campoNota?.etiqueta}
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
                {b.textoAgregar ?? "+ Agregar uno propio"}
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
            {/* El ancho mínimo se calcula: con seis columnas la tabla se
                apretaba hasta partir cada palabra en su propia línea. Ahora
                pide el espacio que necesita y el contenedor se desplaza. */}
            <table style={{
              minWidth: Math.max(
                640,
                b.columnas.reduce((n, c) => n + (c.numerica ? 132 : 224), 0) + 48,
              ),
            }}>
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
                        {c.origen && <Origen campoId={campo.origen(b.id, f.id, c.id)} />}
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
          <Sugerencias bloqueId={b.id} columna={b.columnas[0]!.id}
                       textos={b.sugerencias} filas={filas} />
        </div>
      );
    }

    case "matriz_priorizacion": {
      const filas = bit.filas(b.id);
      const notasDe = (filaId: string): NotasFila =>
        Object.fromEntries(b.criterios.map((cr) => {
          const v = bit.valor(campo.fila(b.id, filaId, cr.id));
          const n = typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
          return [cr.id, Number.isFinite(n) ? n : null];
        }));

      const puntajes = filas.map((f) => ({
        filaId: f.id,
        puntaje: puntaje(notasDe(f.id), b.criterios, b.maximo),
      }));
      const puesto = puestos(puntajes);
      const tope = puntajeMaximo(b.criterios, b.maximo);

      return (
        <div className="stack">
          <Ayuda texto={b.ayuda} />
          <Formula criterios={b.criterios} maximo={b.maximo} tope={tope} />
          <div className="tw">
            <table style={{
              minWidth: b.columnas.reduce((n, c) => n + (c.numerica ? 132 : 224), 0)
                + b.criterios.length * 170 + 190,
            }}>
              <thead>
                <tr>
                  <th className="pri-puesto">#</th>
                  {b.columnas.map((c) => <th key={c.id}>{c.titulo}</th>)}
                  {b.criterios.map((cr) => (
                    <th key={cr.id}>
                      {cr.titulo}
                      {cr.invertido && <span className="pri-inv" title="Una nota alta resta prioridad">↓</span>}
                      {cr.ayuda && <span className="pri-ayuda">{cr.ayuda}</span>}
                    </th>
                  ))}
                  <th>Puntaje</th>
                  {!bit.soloLectura && <th />}
                </tr>
              </thead>
              <tbody>
                {filas.map((f, i) => {
                  const p = puntajes[i]!.puntaje;
                  return (
                    <tr key={f.id}>
                      <td className="pri-puesto">{puesto.get(f.id) ?? "—"}</td>
                      {b.columnas.map((c) => (
                        <td key={c.id}>
                          <Texto campoId={campo.fila(b.id, f.id, c.id)} marcador={c.marcador}
                                 multilinea={c.multilinea ?? false} numerica={c.numerica}
                                 filas={c.multilinea ? 2 : 1} />
                        </td>
                      ))}
                      {b.criterios.map((cr) => (
                        <td key={cr.id}>
                          <Nota campoId={campo.fila(b.id, f.id, cr.id)} maximo={b.maximo} />
                        </td>
                      ))}
                      <td>
                        {p == null ? (
                          <span className="pri-sin">Sin calificar</span>
                        ) : (
                          <span className="pri-pts">
                            <b>{p}</b>
                            <i style={{ width: `${(p / tope) * 100}%` }} />
                          </span>
                        )}
                      </td>
                      {!bit.soloLectura && (
                        <td>
                          <button className="del" type="button" title="Eliminar"
                            onClick={() => bit.eliminarFila(f.id)}>×</button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!bit.soloLectura && (
            <button className="padd" type="button" onClick={() => bit.agregarFila(b.id)}>
              + Proyecto
            </button>
          )}
          <Sugerencias bloqueId={b.id} columna={b.columnas[0]!.id}
                       textos={b.sugerencias} filas={filas} />
        </div>
      );
    }

    case "flujo_caja": {
      const celda = (conceptoId: string, mes: number) =>
        campo.matriz(b.id, conceptoId, String(mes));
      const serie = Array.from({ length: b.meses }, (_, m) => ({
        entradas: b.entradas.reduce((s, con) => s + cifra(bit.valor(celda(con.id, m))), 0),
        salidas: b.salidas.reduce((s, con) => s + cifra(bit.valor(celda(con.id, m))), 0),
      }));
      const f = calcularFlujo(cifra(bit.valor(campo.simple(`${b.id}.inicial`))), serie);
      const meses = Array.from({ length: b.meses }, (_, m) => m);

      const fila = (
        con: { id: string; titulo: string }, clase: string,
      ) => (
        <tr key={con.id}>
          <th scope="row" className="flujo-concepto">{con.titulo}</th>
          {meses.map((m) => (
            <td key={m} className={clase}>
              <Texto campoId={celda(con.id, m)} marcador="0" multilinea={false} numerica />
            </td>
          ))}
        </tr>
      );

      return (
        <div className="stack">
          <Ayuda texto={b.ayuda} />
          <div className="flujo-inicial">
            <span className="lbl" style={{ marginBottom: 0 }}>
              {b.etiquetaInicial ?? "Con cuánta caja arrancas"}
            </span>
            <Texto campoId={campo.simple(`${b.id}.inicial`)} marcador="0"
                   multilinea={false} numerica />
          </div>

          <Veredicto flujo={f} mesInicial={b.mesInicial} />

          <div className="tw">
            <table className="flujo" style={{ minWidth: 220 + b.meses * 104 }}>
              <thead>
                <tr>
                  <th />
                  {meses.map((m) => (
                    <th key={m} className={f.primerMesEnRojo === m ? "flujo-rojo" : ""}>
                      {rotuloMes(m, b.mesInicial)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.entradas.map((con) => fila(con, "flujo-entra"))}
                {b.salidas.map((con) => fila(con, "flujo-sale"))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row" className="flujo-concepto">Saldo del mes</th>
                  {f.meses.map((m) => (
                    <td key={m.indice} className={`flujo-calc ${m.neto < 0 ? "neg" : ""}`}>
                      {pesos(m.neto)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="flujo-concepto">Saldo acumulado</th>
                  {f.meses.map((m) => (
                    <td key={m.indice}
                        className={`flujo-calc fuerte ${m.acumulado < 0 ? "neg" : ""}`}>
                      {pesos(m.acumulado)}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      );
    }

    case "tabla_calculada": {
      const filas = bit.filas(b.id);
      const r = calcularTabla(b, filas, (campoId) => bit.valor(campoId));
      const entradas = entradasDe(b);
      const conTotal = b.columnas.filter((c) => c.total);
      // La primera columna de texto: es donde entran las sugerencias y donde
      // el pie de la tabla pone la palabra «Total».
      const primera = entradas.find((c) => !c.numerica) ?? entradas[0];

      return (
        <div className="stack">
          <Ayuda texto={b.ayuda} />
          <Parametros bloqueId={b.id} parametros={b.parametros ?? []} />
          <Indicadores indicadores={visiblesDe(b)} valores={r.indicadores} />
          <Dictamen
            dictamen={r.veredicto}
            vacia={r.vacia}
            textoVacio="Llena los datos y aquí aparecerá el resultado."
          />

          {b.columnas.length > 0 && (
            <>
              <div className="tw">
                <table style={{
                  minWidth: b.columnas.reduce(
                    (n, c) => n + (c.numerica || c.calculada ? 142 : 224), 0) + 56,
                }}>
                  <thead>
                    <tr>
                      {b.columnas.map((c) => (
                        <th key={c.id} className={c.calculada ? "calc-th" : undefined}>
                          {c.titulo}
                          {c.unidad && <i className="calc-unidad"> · {c.unidad}</i>}
                          {c.pista && <span className="pri-ayuda">{c.pista}</span>}
                        </th>
                      ))}
                      {!bit.soloLectura && <th />}
                    </tr>
                  </thead>
                  <tbody>
                    {r.filas.map((fc) => (
                      <tr key={fc.id}>
                        {b.columnas.map((c) =>
                          c.calculada ? (
                            <td key={c.id} className="flujo-calc">
                              {formatear(fc.valores.get(c.id) ?? null, c)}
                            </td>
                          ) : (
                            <td key={c.id}>
                              <Texto campoId={campo.fila(b.id, fc.id, c.id)} marcador={c.marcador}
                                     multilinea={c.multilinea ?? false} numerica={c.numerica}
                                     filas={c.multilinea ? 2 : 1} />
                              {c.origen && <Origen campoId={campo.origen(b.id, fc.id, c.id)} />}
                            </td>
                          ),
                        )}
                        {!bit.soloLectura && (
                          <td>
                            <button className="del" type="button" title="Eliminar"
                              onClick={() => bit.eliminarFila(fc.id)}>×</button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  {conTotal.length > 0 && (
                    <tfoot>
                      <tr>
                        {b.columnas.map((c) => (
                          <td key={c.id}
                              className={c.total ? "flujo-calc fuerte" : "calc-pie"}>
                            {c.total
                              ? formatear(r.totales.get(c.id) ?? null, c)
                              : c.id === primera?.id ? "Total" : ""}
                          </td>
                        ))}
                        {!bit.soloLectura && <td />}
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
              {!bit.soloLectura && (
                <button className="padd" type="button" onClick={() => bit.agregarFila(b.id)}>
                  {b.textoAgregar ?? "+ Fila en blanco"}
                </button>
              )}
              {primera && (
                <Sugerencias bloqueId={b.id} columna={primera.id}
                             textos={b.sugerencias} filas={filas} />
              )}
            </>
          )}
        </div>
      );
    }

    case "cronograma": {
      const filas = bit.filas(b.id);
      return (
        <div className="stack">
          <Ayuda texto={b.ayuda} />
          <div className="tw">
            <table style={{
              minWidth: b.columnas.reduce((n, c) => n + (c.numerica ? 132 : 224), 0)
                + b.anios.length * 190 + 240,
            }}>
              <thead>
                <tr>
                  {b.columnas.map((c) => <th key={c.id}>{c.titulo}</th>)}
                  <th>Queda concretado en</th>
                  <th>Horizonte {b.anios[0]}–{b.anios[b.anios.length - 1]}</th>
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
                    <td><Fecha bloqueId={b.id} filaId={f.id} anios={b.anios} /></td>
                    <td><Franja bloqueId={b.id} filaId={f.id} anios={b.anios} /></td>
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
            <button className="padd" type="button" onClick={() => bit.agregarFila(b.id)}>
              + Proyecto
            </button>
          )}
          <Sugerencias bloqueId={b.id} columna={b.columnas[0]!.id}
                       textos={b.sugerencias} filas={filas} />
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
                }}>{b.textoAgregar ?? "+ Agregar"}</button>
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
