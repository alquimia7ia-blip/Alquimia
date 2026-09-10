"use client";

import { useMemo } from "react";
import { clienteNavegador } from "@/lib/supabase/cliente";
import { useBitacoraRemota } from "@/lib/datos/useBitacoraRemota";
import { ProveedorBitacora } from "@/components/campos/contexto";
import { VistaModulo, type TallerVista } from "@/components/bitacora/VistaModulo";
import { bloques } from "@/lib/talleres/rutas";
import type { Fila, ValorCampo } from "@/lib/talleres/tipos";

type Props = {
  bitacoraId: string;
  perfilId: string;
  empresa: string;
  moduloTitulo: string;
  moduloSlug: string;
  talleres: TallerVista[];
  respuestas: Record<string, ValorCampo>;
  filas: Fila[];
};

export function Bitacora({
  bitacoraId, perfilId, empresa, moduloTitulo, moduloSlug, talleres, respuestas, filas,
}: Props) {
  const supabase = useMemo(() => clienteNavegador(), []);

  // A qué taller pertenece cada bloque: la escritura de un campo necesita
  // saberlo, y el campo_id solo lleva el bloque.
  const tallerDeBloque = useMemo(() => {
    const m: Record<string, string> = {};
    for (const t of talleres) for (const b of bloques(t.definicion)) m[b.id] = t.id;
    return m;
  }, [talleres]);

  const bitacora = useBitacoraRemota({
    supabase, bitacoraId, perfilId,
    inicial: { respuestas, filas },
    tallerDeBloque,
  });

  return (
    <ProveedorBitacora value={bitacora}>
      <VistaModulo
        talleres={talleres}
        moduloTitulo={moduloTitulo}
        empresa={empresa}
        estado={bitacora.estado}
        acciones={
          <>
            <a className="btn pri" href={`/${moduloSlug}/tablero`}>Ver conclusiones</a>
            <a className="btn" href={`/api/informe/${bitacoraId}`}>Descargar informe</a>
          </>
        }
        pieRail={
          <>
            <a className="mini" href={`/${moduloSlug}/tablero`}>📊 Conclusiones del módulo</a>
            <a className="mini" href="/equipo">👥 Equipo de la empresa</a>
            <p style={{ fontSize: 11.5, color: "var(--faint)", lineHeight: 1.45, margin: 0 }}>
              Si alguien más de tu empresa está respondiendo ahora mismo, sus cambios
              aparecen al recargar la página.
            </p>
          </>
        }
      />
    </ProveedorBitacora>
  );
}
