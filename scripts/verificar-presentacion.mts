/**
 * Comprueba que el botón de presentación no se convierta en un agujero.
 *
 * La dirección la escribe quien administra el módulo y termina en el `href`
 * de un enlace. Un `javascript:` ahí dentro se ejecuta con la sesión de quien
 * lo pulse: podría leer la bitácora de la empresa o actuar en su nombre.
 *
 * La tabla `modulos` lo impide con una restricción y la aplicación lo vuelve
 * a comprobar al cargar. Esto prueba la segunda línea, que es la que queda si
 * alguien toca la base.
 */
import { presentacionDe } from "../lib/datos/presentacion";

const PELIGROSAS = [
  "javascript:alert(document.cookie)",
  "JavaScript:alert(1)",
  "  javascript:alert(1)",
  "java\nscript:alert(1)",
  "data:text/html,<script>alert(1)</script>",
  "vbscript:msgbox(1)",
  "file:///etc/passwd",
  "//evil.example.com/robo",
  "/ruta/relativa",
  "",
  "   ",
];

const LEGITIMAS = [
  "https://docs.google.com/presentation/d/1a2b3c/edit",
  "https://drive.google.com/drive/folders/1a2b3c",
  "https://www.youtube.com/watch?v=abc123",
  "https://www.canva.com/design/ABC/view",
  "http://intranet.camara.local/modulo-1",
  "  https://ejemplo.com/con-espacios-alrededor  ",
];

const fallos: string[] = [];

for (const url of PELIGROSAS) {
  const r = presentacionDe(url, null);
  if (r !== null) fallos.push(`se aceptó una dirección peligrosa: ${JSON.stringify(url)} → ${r.url}`);
}

for (const url of LEGITIMAS) {
  const r = presentacionDe(url, null);
  if (r === null) fallos.push(`se rechazó una dirección legítima: ${JSON.stringify(url)}`);
  else if (r.etiqueta !== "Ver presentación") fallos.push(`etiqueta por defecto inesperada: ${r.etiqueta}`);
}

// La etiqueta es del administrador: se respeta, pero vacía no deja el botón mudo.
const conEtiqueta = presentacionDe("https://ejemplo.com", "  Ver el video del módulo  ");
if (conEtiqueta?.etiqueta !== "Ver el video del módulo") {
  fallos.push(`no se respetó la etiqueta propia: ${conEtiqueta?.etiqueta}`);
}
for (const vacia of ["", "   ", null, 42]) {
  if (presentacionDe("https://ejemplo.com", vacia)?.etiqueta !== "Ver presentación") {
    fallos.push(`una etiqueta vacía (${JSON.stringify(vacia)}) dejó el botón sin texto`);
  }
}

if (fallos.length) {
  console.error("✗ El enlace de presentación no está protegido:");
  for (const f of fallos) console.error(`  · ${f}`);
  process.exit(1);
}
console.log(`✓ ${PELIGROSAS.length} direcciones peligrosas rechazadas, ` +
            `${LEGITIMAS.length} legítimas aceptadas, etiqueta con respaldo`);
