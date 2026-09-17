"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Cliente del navegador. Usa la clave anónima: RLS decide qué se ve. */
export function clienteNavegador() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
