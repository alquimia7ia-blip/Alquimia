"use client";

import { useMemo } from "react";
import { clienteNavegador } from "@/lib/supabase/cliente";
import { useBitacoraRemota } from "@/lib/datos/useBitacoraRemota";
import { ProveedorBitacora } from "@/components/campos/contexto";
import { VistaModulo, type TallerVista } from "@/components/bitacora/VistaModulo";
import { CerrarSesion } from "@/components/ui/CerrarSesion";
import { bloques } from "@/lib/talleres/rutas";
import type { Fila, ValorCampo } from "@/lib/talleres/tipos";

/**
 * La bitácora de otra empresa, para leerla.
 *
 * Reutiliza el mismo `VistaModulo` del taller con `soloLectura`, que ya está
 * cableado en cada campo del motor. Que sea la misma pantalla no es pereza:
 * el tutor ve exactamente lo que ve la empresa, sin una segunda
 * representación que pueda divergir de la primera.
 *
 * La bandera es comodidad de interfaz, no la protección. Quien lo intentara
 * por fuera igual no podría escribir: `app.bitacoras_editables()` no incluye
 * las bitácoras de la cohorte, así que la base rechaza el UPDATE.
 */
export function BitacoraAjena({
  bitacoraId, perfilId, empresa, moduloTitulo, moduloSlug, talleres, respuestas, filas,
}: {
  bitacoraId: string;
  perfilId: string;
  empresa: string;
  moduloTitulo: string;
  moduloSlug: string;
  talleres: TallerVista[];
  respuestas: Record<string, ValorCampo>;
  filas: Fila[];
}) {
  const supabase = useMemo(() => clienteNavegador(), []);

  const tallerDeBloque = useMemo(() => {
    const m: Record<string, string> = {};
    for (const t of talleres) for (const b of bloques(t.definicion)) m[b.id] = t.id;
    return m;
  }, [talleres]);

  const bitacora = useBitacoraRemota({
    supabase, bitacoraId, perfilId,
    inicial: { respuestas, filas },
    tallerDeBloque,
    soloLectura: true,
  });

  return (
    <ProveedorBitacora value={bitacora}>
      <VistaModulo
        talleres={talleres}
        moduloTitulo={moduloTitulo}
        modulos={[]}
        moduloSlug={moduloSlug}
        empresa={empresa}
        acciones={<span className="cohorte-aviso">Solo lectura</span>}
        pieRail={
          <>
            <a className="mini" href="/cohorte">🧭 Volver al panel</a>
            {/* Sin `antesDeSalir`: esta vista es de solo lectura, no hay cola
                que vaciar porque nunca se escribe nada. */}
            <CerrarSesion />
            <p style={{ fontSize: 11.5, color: "var(--faint)", lineHeight: 1.45, margin: 0 }}>
              Estás leyendo la bitácora de {empresa}. Tu lectura queda registrada.
            </p>
          </>
        }
      />
    </ProveedorBitacora>
  );
}
