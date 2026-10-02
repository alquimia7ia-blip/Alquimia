/**
 * Da de alta una cohorte a partir de un CSV.
 *
 * Crea empresas, inscripciones, bitácoras del módulo publicado y sus filas
 * iniciales, invita por correo a la persona de contacto y le deja creada la
 * membresía. Es idempotente: volver a correrlo no duplica nada y solo
 * reinvita a quien todavía no ha entrado.
 *
 *   pnpm cohorte -- --csv empresas.csv --cohorte "MEGA 2026-1"
 *
 * El CSV lleva encabezado y estas columnas (el orden no importa):
 *   empresa, nit, correo, nombre, municipio, sector
 */
import { readFileSync } from "node:fs";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { sembrarBitacora } from "../lib/datos/sembrarBitacora";
import type { Definicion } from "../lib/talleres/tipos";

type Registro = Record<string, string>;

/** Lector de CSV con comillas y comas dentro de los campos. */
function leerCsv(texto: string): Registro[] {
  const filas: string[][] = [];
  let fila: string[] = [], celda = "", enComillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i]!;
    if (enComillas) {
      if (c === '"' && texto[i + 1] === '"') { celda += '"'; i++; }
      else if (c === '"') enComillas = false;
      else celda += c;
    } else if (c === '"') enComillas = true;
    else if (c === ",") { fila.push(celda); celda = ""; }
    else if (c === "\n") { fila.push(celda); filas.push(fila); fila = []; celda = ""; }
    else if (c !== "\r") celda += c;
  }
  if (celda || fila.length) { fila.push(celda); filas.push(fila); }

  const encabezado = filas.shift()?.map((h) => h.trim().toLowerCase()) ?? [];
  return filas
    .filter((f) => f.some((c) => c.trim() !== ""))
    .map((f) => Object.fromEntries(encabezado.map((h, i) => [h, (f[i] ?? "").trim()])));
}

function argumento(nombre: string, obligatorio = true): string {
  const i = process.argv.indexOf(`--${nombre}`);
  const v = i >= 0 ? process.argv[i + 1] : undefined;
  if (!v && obligatorio) throw new Error(`Falta --${nombre}`);
  return v ?? "";
}

async function main() {
  const rutaCsv = argumento("csv");
  const nombreCohorte = argumento("cohorte");
  const sitio = process.env.NEXT_PUBLIC_SITIO_URL ?? "http://localhost:3000";

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !clave) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY");
  }
  const db: SupabaseClient = createClient(url, clave, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const registros = leerCsv(readFileSync(rutaCsv, "utf8"));
  if (registros.length === 0) throw new Error("El CSV no trae filas");

  const { data: programa } = await db.from("programas")
    .select("id, organizacion_id").eq("slug", "mega").single();
  if (!programa) throw new Error("No hay programa sembrado; corre `pnpm seed` primero");

  // La cohorte se busca por nombre dentro del programa y se crea si no está.
  const { data: existente } = await db.from("cohortes")
    .select("id").eq("programa_id", programa.id).eq("nombre", nombreCohorte).maybeSingle();
  let cohorteId = existente?.id as string | undefined;
  if (!cohorteId) {
    const { data, error } = await db.from("cohortes")
      .insert({ programa_id: programa.id, nombre: nombreCohorte }).select("id").single();
    if (error) throw error;
    cohorteId = data.id;
    console.log(`Cohorte creada: ${nombreCohorte}`);
  }

  const { data: modulos } = await db.from("modulos")
    .select("id, numero, titulo").eq("programa_id", programa.id).eq("publicado", true)
    .order("numero");
  if (!modulos?.length) throw new Error("No hay ningún módulo publicado");

  const { data: talleres } = await db.from("talleres")
    .select("id, modulo_id, definicion").in("modulo_id", modulos.map((m) => m.id));

  console.log(`Cohorte «${nombreCohorte}» · ${registros.length} empresas · ` +
              `${modulos.length} módulo(s) publicado(s)\n`);

  let nuevas = 0, invitados = 0, yaEstaban = 0;

  for (const r of registros) {
    const nombreEmpresa = r["empresa"];
    const correo = r["correo"]?.toLowerCase();
    if (!nombreEmpresa || !correo) {
      console.warn(`  ⚠ fila sin empresa o sin correo, se omite: ${JSON.stringify(r)}`);
      continue;
    }

    // Empresa (por nombre dentro de la organización; el NIT no siempre viene).
    let { data: empresa } = await db.from("empresas")
      .select("id").eq("organizacion_id", programa.organizacion_id)
      .eq("nombre", nombreEmpresa).maybeSingle();
    if (!empresa) {
      const { data, error } = await db.from("empresas").insert({
        organizacion_id: programa.organizacion_id,
        nombre: nombreEmpresa,
        nit: r["nit"] || null,
        municipio: r["municipio"] || null,
        sector: r["sector"] || null,
      }).select("id").single();
      if (error) throw error;
      empresa = data;
      nuevas++;
    }

    await db.from("inscripciones")
      .upsert({ empresa_id: empresa!.id, cohorte_id: cohorteId },
              { onConflict: "empresa_id,cohorte_id" });

    // Bitácora y semilla, una por módulo publicado.
    for (const m of modulos) {
      const { data: bitacoraPrevia } = await db.from("bitacoras").select("id")
        .eq("empresa_id", empresa!.id).eq("modulo_id", m.id).eq("cohorte_id", cohorteId)
        .maybeSingle();
      if (bitacoraPrevia) continue;
      const { data: bit, error } = await db.from("bitacoras")
        .insert({ empresa_id: empresa!.id, modulo_id: m.id, cohorte_id: cohorteId })
        .select("id").single();
      if (error) throw error;
      await sembrarBitacora(db, bit.id,
        (talleres ?? []).filter((t) => t.modulo_id === m.id)
          .map((t) => ({ id: t.id, definicion: t.definicion as Definicion })));
    }

    // Cuenta e invitación. Si ya entró alguna vez, no se le vuelve a escribir.
    const { data: invitacion, error: errInvitacion } =
      await db.auth.admin.inviteUserByEmail(correo, {
        redirectTo: `${sitio}/invitacion`,
        data: { nombre_completo: r["nombre"] || null },
      });

    let perfilId = invitacion?.user?.id;
    if (errInvitacion) {
      const yaExiste = /already been registered|already exists/i.test(errInvitacion.message);
      if (!yaExiste) {
        console.warn(`  ⚠ ${correo}: ${errInvitacion.message}`);
        continue;
      }
      const { data: lista } = await db.auth.admin.listUsers();
      perfilId = lista?.users.find((u) => u.email?.toLowerCase() === correo)?.id;
      yaEstaban++;
    } else {
      invitados++;
    }
    if (!perfilId) { console.warn(`  ⚠ ${correo}: no se pudo resolver la cuenta`); continue; }

    await db.from("membresias").upsert(
      { perfil_id: perfilId, empresa_id: empresa!.id, rol: "propietario" },
      { onConflict: "perfil_id,empresa_id" });

    await db.from("invitaciones").insert({
      empresa_id: empresa!.id, correo, rol: "propietario",
    });

    console.log(`  ✓ ${nombreEmpresa} · ${correo}`);
  }

  console.log(`\n${nuevas} empresas nuevas · ${invitados} invitaciones enviadas · ` +
              `${yaEstaban} cuentas que ya existían`);
  console.log("Las invitaciones llegan por correo con un enlace para definir contraseña.");
}

main().catch((e) => {
  console.error("\n✗ la carga falló: " + (e instanceof Error ? e.message : String(e)));
  process.exit(1);
});
