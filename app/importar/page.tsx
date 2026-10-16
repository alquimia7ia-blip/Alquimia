"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clienteNavegador } from "@/lib/supabase/cliente";
import { planDesdeArtifact, resumenPlan, type Plan } from "@/lib/migracion/desdeArtifact";

/**
 * Trae al modelo nuevo el respaldo JSON del prototipo.
 *
 * Quien ya diligenció la bitácora en el archivo HTML no debería empezar de
 * cero: se elige el archivo, se muestra qué trae y solo entonces se importa.
 */
export default function Importar() {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [nombreArchivo, setNombreArchivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [importando, setImportando] = useState(false);

  async function elegir(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    setError(null);
    setNombreArchivo(archivo.name);
    try {
      const crudo = JSON.parse(await archivo.text());
      const p = planDesdeArtifact(crudo);
      if (p.respuestas.length === 0) {
        setError("El archivo no trae respuestas reconocibles del Módulo 1.");
        setPlan(null);
        return;
      }
      setPlan(p);
    } catch {
      setError("No se pudo leer el archivo. Debe ser el JSON del botón «Respaldo».");
      setPlan(null);
    }
  }

  async function importar() {
    if (!plan) return;
    setImportando(true);
    setError(null);
    const supabase = clienteNavegador();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Se cerró la sesión. Vuelve a entrar."); setImportando(false); return; }

    const { data: bitacora } = await supabase
      .from("bitacoras").select("id, modulo_id").limit(1).maybeSingle();
    if (!bitacora) {
      setError("Tu cuenta todavía no tiene una bitácora abierta.");
      setImportando(false);
      return;
    }

    const { data: talleres } = await supabase
      .from("talleres").select("id, slug").eq("modulo_id", bitacora.modulo_id);
    const idPorSlug = new Map((talleres ?? []).map((t) => [t.slug, t.id as string]));

    // Primero las filas, para conocer sus identificadores reales.
    const idPorRef = new Map<string, string>();
    for (const f of plan.filas) {
      const tallerId = idPorSlug.get(f.tallerSlug);
      if (!tallerId) continue;
      const { data, error: err } = await supabase.from("filas")
        .insert({ bitacora_id: bitacora.id, taller_id: tallerId,
                  bloque_id: f.bloqueId, orden: f.orden, creada_por: user.id })
        .select("id").single();
      if (err || !data) { setError("No se pudieron crear las filas."); setImportando(false); return; }
      idPorRef.set(f.ref, data.id as string);
    }

    const filas = plan.respuestas.flatMap((r) => {
      const tallerId = idPorSlug.get(r.tallerSlug);
      if (!tallerId) return [];
      const campoId = r.campoId.replace(/\{([^}]+)\}/g,
        (_, ref: string) => idPorRef.get(ref) ?? "");
      if (campoId.includes("..")) return [];   // referencia que no se resolvió
      return [{ bitacora_id: bitacora.id, taller_id: tallerId, campo_id: campoId,
                valor: r.valor, actualizado_por: user.id }];
    });

    const { error: errRespuestas } = await supabase.from("respuestas")
      .upsert(filas, { onConflict: "bitacora_id,campo_id" });
    if (errRespuestas) {
      setError("No se pudieron guardar las respuestas importadas.");
      setImportando(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  const resumen = plan ? resumenPlan(plan) : null;

  return (
    <div className="portada" style={{ alignItems: "flex-start", paddingTop: 48 }}>
      <div className="tarjeta-sesion" style={{ maxWidth: 520 }}>
        <h1>Traer lo que ya respondieron</h1>
        <p className="sub">
          Si diligenciaron el Módulo 1 en el archivo HTML, descarguen ahí el
          <b> Respaldo</b> y súbanlo acá. Lo que ya esté escrito en la plataforma se
          conserva; solo se completa lo que falte.
        </p>

        {error && <div className="error-sesion">{error}</div>}

        <div className="campo-sesion">
          <label htmlFor="archivo">Archivo de respaldo (.json)</label>
          <input id="archivo" type="file" accept="application/json,.json" onChange={elegir} />
        </div>

        {resumen && (
          <>
            <div className="hint" style={{ margin: "4px 0 14px" }}>
              <b>{nombreArchivo}</b> trae <b>{resumen.respuestas} respuestas</b> repartidas
              en {resumen.talleres} talleres
              {resumen.filas > 0 && <> y {resumen.filas} filas de tablas</>}.
              {plan?.empresa && <> Empresa: <b>{plan.empresa}</b>.</>}
            </div>
            <button className="btn pri btn-ancho" type="button"
                    onClick={importar} disabled={importando}>
              {importando ? "Importando…" : "Importar a mi bitácora"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
