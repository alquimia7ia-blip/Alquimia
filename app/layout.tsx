import type { Metadata } from "next";
import "./globals.css";
import { GUION_TEMA } from "@/components/ui/ControlTema";

export const metadata: Metadata = {
  title: "Brújula empresarial",
  description:
    "Los talleres del programa Empresas con Propósito MEGA, guiados y con avance en vivo.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@600;700;800&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: GUION_TEMA }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
