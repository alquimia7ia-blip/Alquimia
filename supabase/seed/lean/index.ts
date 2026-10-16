import { LEAN_MODULO_1 } from "./modulo-1";
import { LEAN_MODULO_2 } from "./modulo-2";
import { LEAN_MODULO_3 } from "./modulo-3";
import { LEAN_MODULO_4 } from "./modulo-4";
import { LEAN_MODULO_5 } from "./modulo-5";

/**
 * Programa Fábrica Lean.
 *
 * Segundo programa de la plataforma y la primera prueba real de que esto es
 * un producto y no un entregable: no hay una línea de código específica de
 * este taller. El motor de bloques, el autoguardado, el aislamiento entre
 * empresas, el informe en PDF y el panel del facilitador son los mismos; lo
 * único que se escribió fue contenido y un tipo de bloque nuevo que, siendo
 * genérico, también sirve al programa de la Cámara.
 *
 * **Propiedad del contenido.** Sale de la conferencia ejecutiva «Lean
 * Manufacturing y su Impacto en la Industria 5.0», de ALQUIMIA, sobre
 * herramientas de dominio público —Ohno, Womack, Shingo, Nakajima—. No tiene
 * nada de la Cámara de Comercio del Aburrá Sur, así que se puede vender a
 * cualquier empresa de manufactura, y por lo mismo **no se puede presentar
 * como parte del programa MEGA**. Vive bajo la organización ALQUIMIA por eso.
 *
 * **Por qué los slugs llevan prefijo.** `modulos.slug` es único por programa,
 * no en toda la tabla, y la ruta de la aplicación es `/[moduloSlug]`. Dos
 * programas con un módulo «donde-estoy» cada uno serían dos filas para la
 * misma URL. `cargarBitacora` ya resuelve el empate por la bitácora de quien
 * consulta, pero el prefijo hace que el empate no ocurra.
 */

export const LEAN_ORGANIZACION = {
  slug: "alquimia",
  nombre: "ALQUIMIA",
};

export const LEAN_PROGRAMA = {
  slug: "fabrica-lean",
  nombre: "Fábrica Lean",
  descripcion:
    "Lean Manufacturing e Industria 5.0: del desperdicio medido al roadmap de dos años.",
};

/**
 * Los cinco módulos.
 *
 * Los cuatro primeros son el núcleo —doce talleres— y el quinto es
 * profundización a la carta, con once más. La razón de esa partición está
 * escrita en `modulo-5.ts`: con veintitrés talleres obligatorios nadie
 * termina, y un taller sin terminar no produce ninguna respuesta.
 */
export const LEAN_MODULOS = [
  LEAN_MODULO_1,
  LEAN_MODULO_2,
  LEAN_MODULO_3,
  LEAN_MODULO_4,
  LEAN_MODULO_5,
];

/** Cuántos talleres cuentan para terminar el programa. */
export const LEAN_NUCLEO = LEAN_MODULOS.slice(0, 4).reduce(
  (n, m) => n + m.talleres.length,
  0,
);
