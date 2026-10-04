import { NextResponse } from "next/server";
import { clienteServidor, clienteServicio } from "@/lib/supabase/servidor";

/**
 * Invita a alguien al equipo de una empresa.
 *
 * La comprobación de permiso se hace con la sesión de quien pide, para que
 * RLS decida: si la consulta no devuelve una membresía de propietario sobre
 * esa empresa, no hay nada que hacer. Solo después se usa la clave de
 * servicio, que salta las políticas y por eso nunca debe decidir nada.
 */
export async function POST(peticion: Request) {
  const supabase = await clienteServidor();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let cuerpo: { correo?: string; empresaId?: string; rol?: string };
  try {
    cuerpo = await peticion.json();
  } catch {
    return NextResponse.json({ error: "Petición inválida" }, { status: 400 });
  }

  const correo = cuerpo.correo?.trim().toLowerCase();
  const empresaId = cuerpo.empresaId;
  const rol = cuerpo.rol === "lector" ? "lector" : "miembro";

  if (!correo || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) {
    return NextResponse.json({ error: "Ese correo no parece válido." }, { status: 400 });
  }
  if (!empresaId) {
    return NextResponse.json({ error: "Falta la empresa." }, { status: 400 });
  }

  // ¿Quien pide es propietario de esa empresa? Lo responde RLS.
  const { data: propia } = await supabase
    .from("membresias")
    .select("id")
    .eq("empresa_id", empresaId)
    .eq("perfil_id", user.id)
    .eq("rol", "propietario")
    .eq("estado", "activa")
    .maybeSingle();

  if (!propia) {
    return NextResponse.json(
      { error: "Solo quien administra la empresa puede invitar." },
      { status: 403 },
    );
  }

  let servicio;
  try {
    servicio = clienteServicio();
  } catch {
    return NextResponse.json(
      { error: "Falta configurar el envío de invitaciones en el servidor." },
      { status: 503 },
    );
  }

  const sitio = process.env.NEXT_PUBLIC_SITIO_URL ?? new URL(peticion.url).origin;

  // Se invita; si la persona ya tenía cuenta, se busca para darle la membresía.
  const { data: invitacion, error } = await servicio.auth.admin.inviteUserByEmail(correo, {
    redirectTo: `${sitio}/invitacion`,
  });

  let perfilId = invitacion?.user?.id;

  if (error) {
    const yaExiste = /already been registered|already exists/i.test(error.message);
    if (!yaExiste) {
      return NextResponse.json(
        { error: "No se pudo enviar la invitación. Inténtalo de nuevo." },
        { status: 502 },
      );
    }
    const { data: lista } = await servicio.auth.admin.listUsers();
    perfilId = lista?.users.find((u) => u.email?.toLowerCase() === correo)?.id;
  }

  if (!perfilId) {
    return NextResponse.json({ error: "No se pudo resolver la cuenta." }, { status: 502 });
  }

  const { error: errMembresia } = await servicio.from("membresias").upsert(
    { perfil_id: perfilId, empresa_id: empresaId, rol, invitado_por: user.id },
    { onConflict: "perfil_id,empresa_id" },
  );
  if (errMembresia) {
    return NextResponse.json({ error: "No se pudo vincular a la empresa." }, { status: 500 });
  }

  await servicio.from("invitaciones").insert({
    empresa_id: empresaId, correo, rol, creada_por: user.id,
  });

  await supabase.from("auditoria_acceso").insert({
    actor_id: user.id, accion: "invitar", recurso: `empresa:${empresaId}`,
    metadatos: { correo, rol },
  });

  return NextResponse.json({ ok: true, yaTeniaCuenta: Boolean(error) });
}
