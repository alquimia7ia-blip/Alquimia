"use client";

import { useId, useState } from "react";

/**
 * Campo de contraseña con «Mostrar» / «Ocultar».
 *
 * Para qué sirve: escribir una contraseña a ciegas, en un teclado que no es
 * el propio y en una sala con gente al lado, es de los motivos más comunes
 * por los que alguien cree que olvidó su clave. Quien la escribe mal dos
 * veces se va a «¿Olvidaste la contraseña?» y entra en el camino largo —el
 * correo, el enlace, la espera— por un error de digitación que habría visto
 * de inmediato. Este botón corta ese camino.
 *
 * Tres decisiones que no son cosméticas:
 *
 *  - `type="button"`. Dentro de un formulario, un botón sin tipo es un botón
 *    de envío: pulsar «Mostrar» enviaría el formulario con la clave a medio
 *    escribir y lo rechazaría el servidor.
 *  - Arranca siempre oculta y no recuerda la elección. Es lo que se espera de
 *    un campo de contraseña, y el costo de equivocarse al revés —dejarla
 *    visible en un computador compartido, que en este programa es el caso
 *    normal— es mucho mayor que el de volver a pulsar el botón.
 *  - El botón dice lo que va a pasar, con palabras, no con un ojo tachado que
 *    cada quien interpreta al revés. Y lleva `aria-pressed` para que un
 *    lector de pantalla anuncie el estado, no solo la etiqueta.
 */
export function CampoClave({
  id,
  etiqueta,
  valor,
  onChange,
  autoComplete,
  requerido = true,
  ayuda,
}: {
  id: string;
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  /** `current-password` al entrar; `new-password` al definirla. */
  autoComplete: "current-password" | "new-password";
  requerido?: boolean;
  ayuda?: string;
}) {
  const [visible, setVisible] = useState(false);
  const idAyuda = useId();

  return (
    <div className="campo-sesion">
      <label htmlFor={id}>{etiqueta}</label>
      <div className="campo-clave">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={valor}
          autoComplete={autoComplete}
          required={requerido}
          aria-describedby={ayuda ? idAyuda : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className="ver-clave"
          aria-pressed={visible}
          aria-label={visible ? "Ocultar la contraseña" : "Mostrar la contraseña"}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? "Ocultar" : "Mostrar"}
        </button>
      </div>
      {ayuda && <p id={idAyuda} className="ayuda-campo">{ayuda}</p>}
    </div>
  );
}
