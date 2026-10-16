"use client";

import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";
import { usePresencia } from "@/lib/datos/usePresencia";
import type { PersonaCohorte } from "@/lib/datos/cohorte";

/** «hace 3 horas», «hace 2 días», «sin actividad». */
function hace(iso: string | null): { texto: string; frio: boolean } {
  if (!iso) return { texto: "Sin actividad", frio: true };
  const minutos = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutos < 2) return { texto: "Ahora mismo", frio: false };
  if (minutos < 60) return { texto: `Hace ${minutos} min`, frio: false };
  const horas = Math.round(minutos / 60);
  if (horas < 24) return { texto: `Hace ${horas} h`, frio: false };
  const dias = Math.round(horas / 24);
  // Siete días sin tocar nada es la señal que el tutor necesita ver.
  return { texto: `Hace ${dias} ${dias === 1 ? "día" : "días"}`, frio: dias >= 7 };
}

type Props = {
  personas: PersonaCohorte[];
  cohorteId: string | null;
  modulos: { numero: number; slug: string; titulo: string }[];
  moduloSlug: string;
};

export function ListaCohorte({ personas, cohorteId, modulos, moduloSlug }: Props) {
  const presentes = usePresencia(cohorteId);
  const [filtro, setFiltro] = useState("");

  const aguja = filtro.trim().toLowerCase();
  const visibles = aguja
    ? personas.filter((p) =>
        p.nombre.toLowerCase().includes(aguja) || p.empresa.toLowerCase().includes(aguja))
    : personas;

  const conectados = personas.filter((p) => presentes.has(p.perfilId)).length;

  return (
    <div className="stack">
      <div className="cohorte-barra">
        <nav className="cohorte-modulos">
          {modulos.map((m) => (
            <Link
              key={m.slug}
              href={`/cohorte?modulo=${m.slug}` as Route}
              className={`btn ${m.slug === moduloSlug ? "pri" : ""}`}
            >
              {m.numero}. {m.titulo}
            </Link>
          ))}
        </nav>
        <input
          className="f"
          value={filtro}
          placeholder="Buscar persona o empresa"
          onChange={(e) => setFiltro(e.target.value)}
          style={{ maxWidth: 280 }}
        />
      </div>

      <p className="cohorte-resumen">
        <b>{personas.length}</b> {personas.length === 1 ? "persona" : "personas"} en la cohorte
        {conectados > 0 && (
          <>
            {" · "}
            <span className="cohorte-vivo"><span className="dot" /> {conectados} en línea</span>
          </>
        )}
      </p>

      <div className="tw">
        <table className="cohorte-tabla">
          <thead>
            <tr>
              <th>Persona</th>
              <th>Empresa</th>
              <th>Última actividad</th>
              <th>Avance del módulo</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {visibles.map((p) => {
              const enLinea = presentes.get(p.perfilId);
              const act = hace(p.ultimoMovimiento);
              return (
                <tr key={p.perfilId}>
                  <td>
                    <span className="cohorte-persona">
                      <span
                        className={`dot ${enLinea ? "" : "apagado"}`}
                        title={enLinea ? "En la plataforma ahora" : "Desconectada"}
                      />
                      {p.nombre}
                    </span>
                    {enLinea?.taller && (
                      <span className="cohorte-donde">en {enLinea.taller}</span>
                    )}
                  </td>
                  <td>{p.empresa}</td>
                  <td className={act.frio ? "cohorte-frio" : undefined}>{act.texto}</td>
                  <td>
                    <span className="bar" style={{ display: "block", minWidth: 110 }}>
                      <i style={{ width: `${Math.round(p.fraccion * 100)}%` }} />
                    </span>
                    <span className="pc">{Math.round(p.fraccion * 100)}%</span>
                  </td>
                  <td>
                    {p.bitacoraId ? (
                      <Link className="btn" href={`/cohorte/${p.bitacoraId}` as Route}>
                        Ver respuestas
                      </Link>
                    ) : (
                      <span className="cohorte-frio">Sin bitácora</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {visibles.length === 0 && (
              <tr>
                <td colSpan={5} className="cohorte-frio" style={{ textAlign: "center" }}>
                  Nadie coincide con «{filtro}».
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
