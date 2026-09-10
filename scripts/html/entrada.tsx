/** Punto de entrada del archivo HTML autónomo. Solo monta la página. */
import { createRoot } from "react-dom/client";
import Estilos from "@/app/estilos/page";

const raiz = document.getElementById("raiz");
if (raiz) createRoot(raiz).render(<Estilos />);
