/**
 * Comprueba la recuperación de contraseña: las decisiones y el cableado.
 *
 * El recorrido completo —pedir el correo, abrirlo, escribir la clave— solo se
 * ejerce de verdad con un buzón y un servidor. Lo que sí se puede fijar aquí
 * es lo que estaba mal, que no era la criptografía sino el destino y el
 * mensaje:
 *
 *   · El enlace llevaba a `/invitacion`, que pide los dos consentimientos de
 *     datos y los inserta. Recuperar la clave volvía a pedir permisos ya
 *     firmados y duplicaba filas en `consentimientos`.
 *   · El canje ocurría solo en el navegador y con PKCE, así que abrir el
 *     correo en el celular fallaba siempre, y la pantalla anunciaba «este
 *     enlace ya no sirve» sobre un enlace bueno. Ese mensaje manda a repetir
 *     exactamente lo que acaba de fallar.
 *
 * Se afirma:
 *   1. El destino de cada clase de enlace, y que `siguiente` no abre una
 *      redirección a otro dominio.
 *   2. Que cada causa de fallo produce su instrucción, distinta de las demás.
 *   3. Las reglas de la clave nueva y la traducción de lo que rechaza el
 *      servidor.
 *   4. Que el envío calla cuando debe callar —no revela quién tiene cuenta—
 *      y habla cuando el correo no va a llegar.
 *   5. El cableado: quién apunta a dónde y qué pantalla pide consentimientos.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  DESTINOS, MINIMO_CLAVE, destinoDelEnlace, mensajeDeCanje, mensajeDeEnlace,
  mensajeDeEnvio, mensajeDeGuardado, problemaDeClave,
} from "../lib/auth/recuperacion";

let fallos = 0;
function afirmar(condicion: boolean, que: string) {
  if (condicion) console.log(`  ✓ ${que}`);
  else { console.error(`  ✗ ${que}`); fallos++; }
}
// Se lee desde la raíz del repositorio, que es desde donde corre `pnpm verify`.
const fuente = (ruta: string) => readFileSync(resolve(process.cwd(), ruta), "utf8");

// ------------------------------------------------------------- 1 · el destino
console.log("\nA dónde lleva cada enlace");

afirmar(
  destinoDelEnlace({ type: "recovery" }) === "/clave-nueva",
  "recuperar la clave no pasa por la pantalla de invitación",
);
afirmar(destinoDelEnlace({ type: "invite" }) === "/invitacion", "la invitación sí");
afirmar(destinoDelEnlace({ type: "signup" }) === "/invitacion", "y el registro también");
afirmar(
  destinoDelEnlace({ type: null }) === DESTINOS.entrar,
  "un enlace sin tipo cae en la pantalla de entrar, no en una pantalla vacía",
);
afirmar(
  destinoDelEnlace({ type: "recovery", siguiente: "/invitacion" }) === "/invitacion",
  "`siguiente` manda cuando es una ruta interna",
);
for (const hostil of ["//ladron.co", "https://ladron.co", "javascript:alert(1)", ""]) {
  afirmar(
    destinoDelEnlace({ type: "recovery", siguiente: hostil }) === "/clave-nueva",
    `«${hostil || "vacío"}» no desvía el enlace fuera del sitio`,
  );
}

// ------------------------------------------------------------- 2 · el mensaje
console.log("\nPor qué falló, en palabras y con salida");

afirmar(mensajeDeEnlace({}) === null, "sin error no se inventa un aviso");
afirmar(
  /caduc/i.test(mensajeDeEnlace({ error_code: "otp_expired" }) ?? ""),
  "un enlace vencido se nombra como vencido",
);
afirmar(
  /nuevo/i.test(mensajeDeEnlace({ error: "access_denied" }) ?? ""),
  "un enlace inválido dice pedir otro",
);
afirmar(
  mensajeDeEnlace({ error_description: "Email link is invalid or has expired" }) !== null,
  "el aviso también se lee de la descripción, no solo del código",
);

const pkce = mensajeDeCanje("both auth code and code verifier should be non-empty");
afirmar(
  /mismo navegador/i.test(pkce),
  "abrir el correo en otro dispositivo se explica como lo que es",
);
afirmar(
  !/caduc/i.test(pkce),
  "y no se disfraza de enlace vencido: pedir otro correo fallaría igual",
);
afirmar(
  /caduc/i.test(mensajeDeCanje("Token has expired or is invalid")),
  "el token vencido sí se nombra vencido",
);

// --------------------------------------------------------------- 3 · la clave
console.log("\nLa contraseña nueva");

afirmar(problemaDeClave("abc", "abc") !== null, "una clave corta se rechaza antes de la red");
afirmar(
  problemaDeClave("a".repeat(MINIMO_CLAVE), "a".repeat(MINIMO_CLAVE - 1)) !== null,
  "dos claves distintas se rechazan",
);
afirmar(problemaDeClave("ladrillo-azul", "ladrillo-azul") === null, "una buena pasa");

afirmar(
  /distinta/i.test(mensajeDeGuardado({ code: "same_password", message: "New password should be different from the old password." })),
  "repetir la clave anterior se dice tal cual",
);
afirmar(
  /adivinar|fácil/i.test(mensajeDeGuardado({ code: "weak_password", message: "Password is known to be weak" })),
  "una clave débil se explica como débil",
);
afirmar(
  /venció|pide un enlace nuevo/i.test(mensajeDeGuardado({ message: "Auth session missing!" })),
  "sin sesión el remedio es otro enlace, no otra clave",
);

// --------------------------------------------------------------- 4 · el envío
console.log("\nPedir el correo");

afirmar(
  mensajeDeEnvio({ message: "User not found", status: 400 }) === null,
  "no se delata si el correo tiene cuenta o no",
);
afirmar(
  mensajeDeEnvio({ code: "over_email_send_rate_limit", message: "email rate limit exceeded", status: 429 }) !== null,
  "el límite de envíos se avisa: el correo no va a llegar",
);
afirmar(
  mensajeDeEnvio({ message: "Failed to fetch" }) !== null,
  "sin red se dice que es la red, porque reintentar sirve",
);

// ------------------------------------------------------------ 5 · el cableado
console.log("\nQuién apunta a dónde");

const pedir = fuente("app/recuperar/page.tsx");
afirmar(
  pedir.includes("/auth/confirmar") && !pedir.includes("/invitacion"),
  "`/recuperar` manda el enlace al canje de servidor, no a la invitación",
);
afirmar(
  fuente("lib/supabase/middleware.ts").includes('"/auth", "/clave-nueva"'),
  "el canje y la pantalla de clave nueva son públicas: si no, el enlace rebota",
);

const canje = fuente("app/auth/confirmar/route.ts");
afirmar(
  canje.indexOf("verifyOtp") < canje.indexOf("exchangeCodeForSession"),
  "el canje intenta primero el token sin verificador, que sirve en cualquier dispositivo",
);

const nueva = fuente("app/clave-nueva/page.tsx");
afirmar(
  !/type="checkbox"/.test(nueva),
  "la pantalla de clave nueva no vuelve a pedir consentimientos ya firmados",
);
afirmar(
  !/from\("consentimientos"\)/.test(nueva),
  "ni inserta filas duplicadas en `consentimientos`",
);
afirmar(
  /tratamiento_datos/.test(fuente("app/invitacion/page.tsx")),
  "y la invitación, que es la primera entrada, sí los recoge",
);
afirmar(
  fuente("app/invitacion/page.tsx").includes("DESTINOS.recuperacion"),
  "los correos de recuperación ya enviados, que apuntan a `/invitacion`, se reenvían",
);
afirmar(
  fuente("docs/DESPLIEGUE.md").includes("/auth/confirmar"),
  "el despliegue documenta la nueva Redirect URL",
);

console.log(
  fallos === 0 ? "\nRecuperación de contraseña: correcta." : `\n${fallos} comprobación(es) fallaron.`,
);
process.exit(fallos === 0 ? 0 : 1);
