"use client";

import { useMemo } from "react";
import { clienteNavegador } from "@/lib/supabase/cliente";
import { useBitacoraRemota } from "@/lib/datos/useBitacoraRemota";
import { ProveedorBitacora } from "@/components/campos/contexto";
import { VistaModulo, type TallerVista } from "@/components/bitacora/VistaModulo";
import { Dudas, type Duda } from "@/components/dudas/Dudas";
import { CierreModulo, type Valoracion } from "@/components/cierre/CierreModulo";
import { Presentacion } from "@/components/bitacora/Presentacion";
import { CerrarSesion } from "@/components/ui/CerrarSesion";
import { usePublicarPresencia, type Presente } from "@/lib/datos/usePresencia";
import type { Presentacion as DatosPresentacion } from "@/lib/datos/presentacion";
import { bloques } from "@/lib/talleres/rutas";
import type { Fila, ValorCampo } from "@/lib/talleres/tipos";

type Props = {
  bitacoraId: string;
  perfilId: string;
  empresa: string;
  moduloTitulo: string;
  moduloSlug: string;
  modulos: { numero: number; slug: string; titulo: string; programa?: string }[];
  presentacion: DatosPresentacion | null;
  /** Quién soy, para anunciarme en el canal de la cohorte. */
  presencia: Omit<Presente, "perfilId">  & { cohorteId: string };
  /** Si facilito alguna cohorte, aparece la entrada al panel. */
  facilita: boolean;
  talleres: TallerVista[];
  dudas: Duda[];
  valoracion?: Valoracion;
  avance: { resueltos: number; total: number; fraccion: number };
  respuestas: Record<string, ValorCampo>;
  filas: Fila[];
};

export function Bitacora({
  bitacoraId, perfilId, empresa, moduloTitulo, moduloSlug, modulos,
  talleres, respuestas, filas, dudas, valoracion, avance, presentacion,
  presencia, facilita,
}: Props) {
  const supabase = useMemo(() => clienteNavegador(), []);

  // A qué taller pertenece cada bloque: la escritura de un campo necesita
  // saberlo, y el campo_id solo lleva el bloque.
  const tallerDeBloque = useMemo(() => {
    const m: Record<string, string> = {};
    for (const t of talleres) for (const b of bloques(t.definicion)) m[b.id] = t.id;
    return m;
  }, [talleres]);

  // Anunciarse en el canal de la cohorte. Solo viajan nombre y empresa.
  usePublicarPresencia(presencia.cohorteId, {
    perfilId, nombre: presencia.nombre, empresa: presencia.empresa,
  });

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
        modulos={modulos}
        moduloSlug={moduloSlug}
        pieResumen={
          <CierreModulo
            bitacoraId={bitacoraId}
            perfilId={perfilId}
            modulo={moduloTitulo}
            fraccion={avance.fraccion}
            inicial={valoracion}
          />
        }
        pieTaller={(tallerId) => (
          <Dudas
            key={tallerId}
            bitacoraId={bitacoraId}
            perfilId={perfilId}
            tallerId={tallerId}
            iniciales={dudas}
            compacto
          />
        )}
        empresa={empresa}
        estado={bitacora.estado}
        acciones={
          <>
            <Presentacion presentacion={presentacion} />
            <a className="btn pri" href={`/${moduloSlug}/tablero`}>Ver conclusiones</a>
            <a className="btn" href={`/api/informe/${bitacoraId}`}>Descargar informe</a>
          </>
        }
        pieRail={
          <>
            <a className="mini" href={`/${moduloSlug}/tablero`}>📊 Conclusiones del módulo</a>
            <a className="mini" href="/equipo">👥 Equipo de la empresa</a>
            {facilita && <a className="mini" href="/cohorte">🧭 Panel de la cohorte</a>}
            <CerrarSesion antesDeSalir={bitacora.guardarYa} />
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
