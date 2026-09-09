"use client";

import { useState } from "react";
import { MODULO_1 } from "@/supabase/seed/modulo-1";
import { ProveedorBitacora } from "@/components/campos/contexto";
import { useBitacoraLocal } from "@/components/bitacora/useBitacoraLocal";
import { VistaModulo, type TallerVista } from "@/components/bitacora/VistaModulo";

/**
 * Ancla visual y banco de pruebas del motor de campos.
 *
 * Renderiza los 11 talleres reales del Módulo 1 contra una bitácora en
 * memoria, sin base de datos ni sesión. Sirve para comparar contra el
 * prototipo antes de dar por buena la migración, y para probar un tipo de
 * bloque nuevo cuando lleguen los módulos 2 a 4.
 */
export default function Estilos() {
  const talleres: TallerVista[] = MODULO_1.talleres.map((t) => ({
    id: t.slug,
    numero: t.numero,
    slug: t.slug,
    corto: t.corto,
    titulo: t.titulo,
    lead: t.lead,
    definicion: t.definicion,
    camposMinimos: t.camposMinimos ?? 0,
  }));

  const bitacora = useBitacoraLocal(
    talleres.map((t) => ({ tallerId: t.id, definicion: t.definicion })),
    "bitacora-mega-estilos",
  );
  const [empresa, setEmpresa] = useState("");

  return (
    <ProveedorBitacora value={bitacora}>
      <VistaModulo
        talleres={talleres}
        moduloTitulo={`Módulo ${MODULO_1.numero} · Análisis`}
        empresa={empresa}
        onEmpresa={setEmpresa}
        estado={{ texto: "Banco de pruebas · solo este navegador" }}
      />
    </ProveedorBitacora>
  );
}
