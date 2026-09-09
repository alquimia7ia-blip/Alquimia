import { VARIABLES, faltantes } from "@/lib/supabase/configuracion";

export const dynamic = "force-dynamic";
export const metadata = { title: "Falta configurar · Bitácora MEGA" };

/** Dice qué variable de entorno falta y dónde se consigue su valor. */
export default function Configuracion() {
  const pendientes = new Set(faltantes());

  return (
    <div className="portada" style={{ alignItems: "flex-start", paddingTop: 48 }}>
      <div className="tarjeta-sesion" style={{ maxWidth: 560 }}>
        <h1>Falta conectar la base de datos</h1>
        <p className="sub">
          La aplicación está desplegada pero todavía no sabe contra qué proyecto de
          Supabase trabajar. Agrega estas variables de entorno y vuelve a desplegar.
        </p>

        <div className="grid" style={{ gap: 10, marginBottom: 16 }}>
          {VARIABLES.map((v) => (
            <div key={v.nombre} className="card" style={{ padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between",
                            alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <code style={{ fontFamily: "var(--mono)", fontSize: 12.5, fontWeight: 600 }}>
                  {v.nombre}
                </code>
                <span className="xp" style={{
                  color: pendientes.has(v.nombre) ? "var(--des)" : "var(--fav)",
                }}>
                  {pendientes.has(v.nombre) ? "falta" : "puesta"}
                </span>
              </div>
              <p style={{ margin: "5px 0 0", fontSize: 12.8, color: "var(--muted)" }}>
                {v.donde}
              </p>
            </div>
          ))}
        </div>

        <div className="hint">
          En Vercel: <b>Project → Settings → Environment Variables</b>. En local, un
          archivo <code>.env.local</code> a partir de <code>.env.example</code>.
          La clave de servicio (<code>SUPABASE_SERVICE_ROLE_KEY</code>) solo hace falta
          para los scripts de siembra y de carga de cohorte, nunca en el navegador.
        </div>
      </div>
    </div>
  );
}
