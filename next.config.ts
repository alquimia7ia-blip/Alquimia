import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // El informe se sirve como descarga desde un Route Handler, no como página.
  typedRoutes: true,
};

export default nextConfig;
