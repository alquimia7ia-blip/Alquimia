import type { TallerSemilla } from "@/lib/talleres/tipos";

/**
 * Fábrica Lean · Módulo 2. «¿Cómo fluye?»
 *
 * Dos talleres, y los dos producen una cifra que casi ninguna microempresa de
 * manufactura tiene: el **porcentaje de valor agregado** de su flujo y su
 * **cuello de botella**.
 *
 * El primero suele salir entre el 5 % y el 15 %, y es el dato que más
 * incomoda de todo el programa: significa que de cada hora que el producto
 * pasa en la planta, cincuenta minutos son espera. Nadie lo discute cuando
 * sale de sus propios datos; casi todos lo discuten cuando se lo cuentan como
 * estadística del sector. De ahí que se calcule y no se cite.
 *
 * El segundo es la razón por la que comprar una máquina suele no servir de
 * nada: si no es la máquina del cuello de botella, la planta produce
 * exactamente lo mismo que antes y además con más inventario en proceso.
 */

const t1: TallerSemilla = {
  numero: 1,
  slug: "mapa-del-flujo",
  corto: "Mapa del flujo",
  titulo: "¿Cuánto de tu tiempo agrega valor?",
  lead:
    "El VSM completo se dibuja en una pared con papel. Esta es su versión aritmética: los "
    + "pasos de tu proceso principal, el tiempo que transforma el producto y el tiempo en "
    + "que el producto solo espera.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "mapear",
        bloques: [
          {
            tipo: "nota",
            id: "como",
            cuerpo:
              "**Elige un solo producto o familia** y sigue una unidad de principio a fin. "
              + "No el promedio de la planta: una unidad concreta, la última que entregaste.\n\n"
              + "**Tiempo que agrega valor** es el que transforma el producto: cortar, "
              + "soldar, pintar, ensamblar. Si el cliente lo viera, pagaría por él.\n\n"
              + "**Tiempo de espera** es todo lo demás: la pieza esperando turno, el lote "
              + "en la mesa esperando que alguien lo mueva, el producto esperando "
              + "aprobación, el camión. Incluye las noches y los fines de semana si el "
              + "producto se quedó ahí: para el cliente ese tiempo también pasó.\n\n"
              + "Usa **la misma unidad en toda la tabla** —minutos u horas, pero una sola—. "
              + "La tabla suma, no convierte.",
          },
          {
            tipo: "tabla_calculada",
            id: "flujo",
            ayuda:
              "Una fila por paso, en el orden en que ocurren. El total de cada paso y el "
              + "porcentaje de valor agregado los calcula la tabla.",
            columnas: [
              {
                id: "paso",
                titulo: "Paso del proceso",
                marcador: "Ej.: corte de lámina",
              },
              {
                id: "valor",
                titulo: "Agrega valor",
                unidad: "min",
                pista: "Transforma el producto",
                numerica: true,
                marcador: "0",
              },
              {
                id: "espera",
                titulo: "Espera",
                unidad: "min",
                pista: "El producto está quieto",
                numerica: true,
                marcador: "0",
              },
              {
                id: "total",
                titulo: "Total del paso",
                unidad: "min",
                calculada: {
                  op: "suma",
                  de: [{ de: "columna", id: "valor" }, { de: "columna", id: "espera" }],
                },
                total: true,
              },
            ],
            filasIniciales: 5,
            filasMinimas: 4,
            sugerencias: [
              "Recepción de material",
              "Almacenamiento",
              "Alistamiento",
              "Proceso principal",
              "Inspección",
              "Empaque",
              "Despacho",
            ],
            textoAgregar: "+ Paso",
            indicadores: [
              {
                id: "va",
                titulo: "Valor agregado",
                calculada: {
                  op: "porcentaje",
                  de: [{ de: "total", columna: "valor" }, { de: "total", columna: "total" }],
                },
                formato: "porcentaje",
                principal: true,
                pista: "Del tiempo total, el que el cliente pagaría",
              },
              {
                id: "lead",
                titulo: "Lead time",
                calculada: { op: "suma", de: [{ de: "total", columna: "total" }] },
                unidad: "min",
                pista: "De principio a fin, esperas incluidas",
              },
              {
                id: "espera-total",
                titulo: "Tiempo en espera",
                calculada: { op: "suma", de: [{ de: "total", columna: "espera" }] },
                unidad: "min",
              },
            ],
            veredicto: {
              tipo: "umbral",
              indicador: "va",
              tramos: [
                {
                  hasta: 5,
                  color: "des",
                  texto:
                    "**{valor} de valor agregado.** Casi todo el tiempo que el producto "
                    + "pasa en tu planta es espera. No hace falta trabajar más rápido: "
                    + "hace falta que el producto deje de estar quieto. Ahí está el "
                    + "proyecto más rentable que tienes.",
                },
                {
                  hasta: 15,
                  color: "med",
                  texto:
                    "**{valor} de valor agregado.** Es el rango normal de una planta sin "
                    + "gestión de flujo, y eso quiere decir que el margen de mejora es "
                    + "enorme: cada punto que subas es lead time que le recortas al "
                    + "cliente sin comprar una sola máquina.",
                },
                {
                  hasta: 40,
                  color: "acento",
                  texto:
                    "**{valor} de valor agregado.** Vas bien para el sector. A partir de "
                    + "aquí la mejora ya no está en quitar esperas grandes, sino en "
                    + "balancear la línea contra el takt time.",
                },
                {
                  color: "med",
                  texto:
                    "**{valor} de valor agregado.** Es sospechosamente alto. Casi siempre "
                    + "significa que faltan esperas por registrar: el tiempo entre turnos, "
                    + "la noche que el lote durmió en la mesa, la espera de aprobación. "
                    + "Revisa la columna de espera antes de creerte la cifra.",
                },
              ],
            },
          },
        ],
      },
      {
        id: "atacar",
        titulo: "La espera más larga",
        bloques: [
          {
            tipo: "texto",
            id: "mayor-espera",
            etiqueta: "¿Cuál es el paso con más espera y por qué espera?",
            marcador: "La causa, no el síntoma: «espera turno» no es una causa",
          },
          {
            tipo: "texto",
            id: "sin-inversion",
            etiqueta: "¿Qué podrías hacer la semana entrante, sin comprar nada, para recortarla?",
            marcador: "Cambiar un orden, mover una mesa, avisar antes",
          },
        ],
      },
    ],
  },
};

const t2: TallerSemilla = {
  numero: 2,
  slug: "takt-y-cuello-de-botella",
  corto: "Cuello de botella",
  titulo: "¿A qué ritmo te pide el cliente y a qué ritmo produces?",
  lead:
    "El takt time es el ritmo del cliente: el tiempo disponible dividido por lo que pide. "
    + "Cualquier estación más lenta que ese ritmo es el techo de tu planta, y ninguna "
    + "mejora en las demás estaciones sube ese techo.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "calcular",
        bloques: [
          {
            tipo: "nota",
            id: "como",
            cuerpo:
              "**Tiempo disponible** es el del turno menos lo que ya está comprometido: "
              + "almuerzo, reuniones, aseo, mantenimiento programado. Si el turno es de 8 "
              + "horas y hora y media se va en eso, son 390 minutos, no 480.\n\n"
              + "**Demanda del turno** es lo que el cliente pide, no lo que tú produces. Si "
              + "el cliente pide 60 unidades al día y tú haces 45, la demanda son 60: el "
              + "takt mide la exigencia, no el resultado.\n\n"
              + "**Cycle time de cada estación** es lo que tarda una unidad en salir de esa "
              + "estación cuando todo va bien. Mídelo con cronómetro, tres veces, y toma el "
              + "promedio. Es media hora de trabajo y cambia decisiones de millones.",
          },
          {
            tipo: "tabla_calculada",
            id: "takt",
            ayuda:
              "La holgura es el takt menos el ciclo de la estación. En negativo, esa "
              + "estación no alcanza a cumplir la demanda ni en un día perfecto.",
            parametros: [
              {
                id: "disponible",
                titulo: "Tiempo disponible",
                unidad: "min por turno",
                pista: "Descontando almuerzo, reuniones y aseo",
                marcador: "390",
              },
              {
                id: "demanda",
                titulo: "Demanda del cliente",
                unidad: "unidades por turno",
                pista: "Lo que pide, no lo que logras",
                marcador: "60",
              },
            ],
            columnas: [
              { id: "estacion", titulo: "Estación", marcador: "Ej.: doblado" },
              {
                id: "ciclo",
                titulo: "Cycle time",
                unidad: "min por unidad",
                numerica: true,
                marcador: "0",
                origen: true,
              },
              {
                id: "holgura",
                titulo: "Holgura contra el takt",
                unidad: "min",
                calculada: {
                  op: "resta",
                  de: [{ de: "indicador", id: "takt" }, { de: "columna", id: "ciclo" }],
                },
                decimales: 1,
              },
            ],
            filasIniciales: 4,
            filasMinimas: 3,
            textoAgregar: "+ Estación",
            indicadores: [
              {
                id: "takt",
                titulo: "Takt time",
                calculada: {
                  op: "division",
                  de: [{ de: "parametro", id: "disponible" }, { de: "parametro", id: "demanda" }],
                },
                unidad: "min por unidad",
                decimales: 1,
                principal: true,
                pista: "El ritmo que el cliente impone",
              },
              {
                id: "ciclo-promedio",
                titulo: "Cycle time promedio",
                calculada: { op: "suma", de: [{ de: "promedio", columna: "ciclo" }] },
                unidad: "min",
                decimales: 1,
                pista: "Sirve de referencia; el que manda es el más lento",
              },
            ],
            veredicto: {
              tipo: "fila_maxima",
              columna: "ciclo",
              nombre: "estacion",
              texto:
                "**{fila} es tu cuello de botella: {valor} por unidad.** Tu planta no "
                + "produce más rápido que esa estación, por mucho que mejores las otras. "
                + "Compara esa cifra con el takt time de arriba: si es mayor, no alcanzas "
                + "la demanda ni en un turno perfecto, y toda mejora que no sea en esta "
                + "estación es dinero que no cambia el resultado.",
            },
          },
        ],
      },
      {
        id: "decidir",
        titulo: "Qué hacer con el cuello de botella",
        lead:
          "Hay cuatro salidas y solo una cuesta plata. En ese orden conviene probarlas.",
        bloques: [
          {
            tipo: "tabla",
            id: "opciones",
            ayuda:
              "Una fila por opción que consideres. La última columna es la que decide: si "
              + "no sabes cuánto cuesta ni cuánto ganas, todavía no es una opción, es una "
              + "idea.",
            columnas: [
              {
                id: "opcion",
                titulo: "Opción",
                multilinea: true,
                marcador: "Qué harías con la estación más lenta",
              },
              { id: "costo", titulo: "Qué cuesta", marcador: "En plata o en tiempo" },
              {
                id: "gana",
                titulo: "Cuánto baja el ciclo",
                marcador: "En minutos por unidad",
                requerida: false,
              },
            ],
            filasIniciales: 3,
            filasMinimas: 2,
            sugerencias: [
              "Quitarle a esa estación el trabajo que no agrega valor",
              "Pasar parte del trabajo a una estación con holgura",
              "Reducir el tiempo de alistamiento de esa estación (SMED)",
              "Un segundo operario en esa estación en la hora pico",
              "Comprar capacidad para esa estación",
            ],
          },
          {
            tipo: "texto",
            id: "elegida",
            etiqueta: "¿Con cuál arrancas y cuándo?",
            marcador: "Una, con fecha. Dos a la vez no se terminan",
          },
        ],
      },
    ],
  },
};

export const LEAN_MODULO_2 = {
  numero: 2,
  slug: "lean-como-fluye",
  pregunta: "¿Cómo fluye?",
  titulo: "El flujo de valor y el cuello de botella",
  lead: "Cuánto de tu tiempo agrega valor y qué estación le pone el techo a la planta.",
  talleres: [t1, t2] as TallerSemilla[],
};
