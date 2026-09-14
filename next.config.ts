import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // El informe se sirve como descarga desde un Route Handler, no como página.
  typedRoutes: true,

  /**
   * Las métricas de las fuentes estándar del PDF, a la fuerza.
   *
   * El informe no incrusta fuentes: usa las catorce estándar del formato, y
   * el motor carga sus métricas con un `require()` armado en tiempo de
   * ejecución (`standard-fonts/Helvetica.cjs`). Un require dinámico es
   * invisible para el rastreador que decide qué archivos suben al servidor,
   * así que la función se desplegaba sin ellos: en local andaba con el
   * node_modules completo y en producción el primer informe respondía 500.
   *
   * Se sube el árbol `js/` completo del motor y no solo la carpeta de las
   * métricas: `Helvetica.cjs` a su vez requiere un trozo compartido en
   * `chunks/`, y perseguir uno por uno los archivos que se piden entre sí es
   * cómo se llega a un tercer 500 en producción. Son ~2 MB de texto.
   *
   * Dos patrones porque el layout de pnpm es anidado y los globs no siempre
   * entran a `.pnpm`.
   */
  outputFileTracingIncludes: {
    "/api/informe/[bitacoraId]": [
      "./node_modules/.pnpm/pdfkit@*/node_modules/pdfkit/js/**",
      "./node_modules/**/pdfkit/js/**",
    ],
  },
};

export default nextConfig;
