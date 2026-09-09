import Link from "next/link";
import { redirect } from "next/navigation";
import { clienteServidor } from "@/lib/supabase/servidor";
import { Invitar } from "./Invitar";

export const metadata = { title: "Equipo · Bitácora MEGA" };

/**
 * Quién puede trabajar en la bitácora de la empresa.
 *
 * El programa habla de «trabajo autónomo por empresas» y el taller lo
 * responde un equipo, no una persona. Hasta aquí solo el script de carga
 * invitaba al contacto principal; esta pantalla deja que quien administra la
 * empresa sume a sus compañeros sin depender de nadie.
 */
export default async function Equipo() {
  const supabase = await clienteServidor();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: propias } = await supabase
    .from("membresias")
    .select("empresa_id, rol, empresas(nombre)")
    .eq("perfil_id", user.id)
    .eq("estado", "activa");

  const empresa = propias?.[0];
  if (!empresa) {
    return (
      <div className="portada">
        <div className="tarjeta-sesion">
          <h1>Todavía no perteneces a una empresa</h1>
          <p className="sub">
            Quien coordina el programa puede vincularte. Si ya te invitaron, revisa el
            correo de invitación.
          </p>
        </div>
      </div>
    );
  }

  const nombreEmpresa =
    (empresa.empresas as unknown as { nombre: string } | null)?.nombre ?? "tu empresa";
  const esPropietario = empresa.rol === "propietario";

  const [{ data: miembros }, { data: pendientes }] = await Promise.all([
    supabase.from("membresias")
      .select("id, rol, perfil_id, perfiles(nombre_completo, cargo)")
      .eq("empresa_id", empresa.empresa_id).eq("estado", "activa"),
    supabase.from("invitaciones")
      .select("id, correo, rol, creado_at")
      .eq("empresa_id", empresa.empresa_id).is("aceptada_at", null)
      .order("creado_at", { ascending: false }),
  ]);

  const rotulo: Record<string, string> = {
    propietario: "Administra",
    miembro: "Responde",
    lector: "Solo lee",
  };

  return (
    <div className="portada" style={{ alignItems: "flex-start", paddingTop: 44 }}>
      <div className="tarjeta-sesion" style={{ maxWidth: 560 }}>
        <h1>Equipo de {nombreEmpresa}</h1>
        <p className="sub">
          Todas estas personas trabajan sobre la misma bitácora. Repártanse los talleres:
          los cambios de cada quien se ven al recargar.
        </p>

        <span className="lbl">Ya en el equipo</span>
        <div className="grid" style={{ gap: 8, margin: "8px 0 20px" }}>
          {(miembros ?? []).map((m) => {
            const p = m.perfiles as unknown as { nombre_completo: string | null; cargo: string | null } | null;
            return (
              <div key={m.id} className="card" style={{ padding: "10px 13px", display: "flex",
                          justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {p?.nombre_completo ?? "Sin nombre todavía"}
                    {m.perfil_id === user.id && (
                      <span style={{ color: "var(--faint)", fontWeight: 400 }}> · tú</span>
                    )}
                  </div>
                  {p?.cargo && (
                    <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{p.cargo}</div>
                  )}
                </div>
                <span className="xp" style={{ color: "var(--muted)" }}>{rotulo[m.rol] ?? m.rol}</span>
              </div>
            );
          })}
        </div>

        {(pendientes ?? []).length > 0 && (
          <>
            <span className="lbl">Invitaciones sin aceptar</span>
            <div className="grid" style={{ gap: 6, margin: "8px 0 20px" }}>
              {(pendientes ?? []).map((i) => (
                <div key={i.id} style={{ display: "flex", justifyContent: "space-between",
                            gap: 10, fontSize: 13.4, color: "var(--muted)" }}>
                  <span>{i.correo}</span>
                  <span className="xp" style={{ color: "var(--med)" }}>pendiente</span>
                </div>
              ))}
            </div>
          </>
        )}

        {esPropietario ? (
          <Invitar empresaId={empresa.empresa_id} />
        ) : (
          <div className="hint">
            Para sumar a alguien más, pídeselo a quien administra la empresa.
          </div>
        )}

        <div className="pie-sesion"><Link href="/">Volver a la bitácora</Link></div>
      </div>
    </div>
  );
}
