"use client";

import { useState } from "react";
import { MODULO_1 } from "@/supabase/seed/modulo-1";
import { MODULO_2 } from "@/supabase/seed/modulo-2";
import { ProveedorBitacora } from "@/components/campos/contexto";
import { useBitacoraLocal } from "@/components/bitacora/useBitacoraLocal";
import { VistaModulo, type TallerVista } from "@/components/bitacora/VistaModulo";
import type { TallerSemilla } from "@/lib/talleres/tipos";

/**
 * Ancla visual y banco de pruebas del motor de campos.
 *
 * Renderiza los talleres reales contra una bitácora en memoria, sin base de
 * datos ni sesión. Es también el archivo autónomo que se manda por correo o
 * se abre en un salón sin internet.
 *
 * Desde que existe el Módulo 2 lleva los dos, con el mismo selector que la
 * versión con cuentas — pero cambiando de módulo en memoria, porque aquí no
 * hay rutas. Cada módulo guarda en su propia clave del navegador.
 */

type Modulo = {
  numero: number;
  slug: string;
  titulo: string;
  talleres: TallerSemilla[];
};

const MODULOS: Modulo[] = [MODULO_1, MODULO_2];
const LISTA = MODULOS.map((m) => ({ numero: m.numero, slug: m.slug, titulo: m.titulo }));

export default function Estilos() {
  const [slug, setSlug] = useState(MODULOS[0]!.slug);
  const modulo = MODULOS.find((m) => m.slug === slug) ?? MODULOS[0]!;

  // La clave remonta el banco al cambiar de módulo: `useBitacoraLocal` lee el
  // navegador al montarse, así que sin esto el segundo módulo heredaría el
  // estado del primero.
  return <Banco key={modulo.slug} modulo={modulo} onModulo={setSlug} />;
}

function Banco({ modulo, onModulo }: { modulo: Modulo; onModulo: (s: string) => void }) {
  const talleres: TallerVista[] = modulo.talleres.map((t) => ({
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
    `bitacora-mega-estilos-${modulo.slug}`,
  );
  const [empresa, setEmpresa] = useState("");

  return (
    <ProveedorBitacora value={bitacora}>
      <VistaModulo
        talleres={talleres}
        moduloTitulo={`Módulo ${modulo.numero} · ${modulo.titulo}`}
        modulos={LISTA}
        moduloSlug={modulo.slug}
        onModulo={onModulo}
        empresa={empresa}
        onEmpresa={setEmpresa}
        estado={{ texto: "Banco de pruebas · solo este navegador" }}
      />
    </ProveedorBitacora>
  );
}
