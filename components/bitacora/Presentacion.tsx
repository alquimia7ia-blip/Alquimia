import type { Presentacion as Datos } from "@/lib/datos/presentacion";

/**
 * Botón a la presentación del módulo.
 *
 * Abre en una pestaña nueva a propósito: quien está llenando la bitácora no
 * debe perder lo que escribió por ir a mirar una diapositiva. `rel="noopener"`
 * impide que la página de destino alcance `window.opener` y manipule esta.
 *
 * No valida la dirección. Ya llega limpia de `cargarBitacora`, y detrás está
 * la restricción de la tabla: comprobar aquí otra vez invitaría a creer que
 * este es el lugar donde se comprueba, y no lo es.
 */
export function Presentacion({ presentacion }: { presentacion: Datos | null }) {
  if (!presentacion) return null;
  return (
    <a
      className="btn"
      href={presentacion.url}
      target="_blank"
      rel="noopener noreferrer"
      title="Se abre en una pestaña nueva; no pierdes lo que llevas escrito"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
      {presentacion.etiqueta}
    </a>
  );
}
