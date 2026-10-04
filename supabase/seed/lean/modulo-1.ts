import { DESPERDICIOS, INDICADORES } from "../fuente/lean-crudo";
import type { TallerSemilla } from "@/lib/talleres/tipos";

/**
 * Fábrica Lean · Módulo 1. «¿Dónde estoy?»
 *
 * Tres talleres y un propósito: salir con una cifra. La conferencia hace
 * cuatro pausas de reflexión y todas terminan en una conversación de mesa que
 * no deja rastro; la segunda de ellas —«¿cuál desperdicio le está costando
 * más dinero a su empresa hoy mismo, aunque nadie lo esté midiendo?»— es el
 * eje de este módulo, y aquí sí deja rastro: un peso al año por desperdicio.
 *
 * El orden importa. Primero se reconoce el desperdicio (T1), que es
 * cualitativo y rápido; después se le pone precio al que más duele (T2), que
 * es lo que convierte una queja en un caso de negocio; y al final se revisa
 * si la empresa tiene con qué medir si mejora (T3). Al revés no funciona:
 * pedir indicadores antes de que el desperdicio tenga nombre produce una
 * lista de métricas que nadie usa.
 */

const t1: TallerSemilla = {
  numero: 1,
  slug: "ocho-desperdicios",
  corto: "Los 8 desperdicios",
  titulo: "¿Qué desperdicio tienes y cada cuánto aparece?",
  lead:
    "Desperdicio es todo lo que el cliente no está dispuesto a pagar. Son ocho y están "
    + "todos en tu operación: el trabajo de hoy no es descubrir si los tienes, es decir "
    + "cada cuánto aparecen y con qué ejemplo concreto.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "reconocer",
        bloques: [
          {
            tipo: "nota",
            id: "aviso",
            cuerpo:
              "Dos reglas para que esto sirva. La primera: **responde con la semana "
              + "pasada**, no con el año en general. «Alguna vez» y «todos los días» son "
              + "respuestas distintas y la diferencia entre las dos es plata. La segunda: "
              + "**el ejemplo es obligatorio en los que marques seguido o diario**. Un "
              + "desperdicio sin ejemplo no se puede atacar, porque nadie sabe dónde "
              + "ocurre. Si en algún desperdicio no se te ocurre el ejemplo, probablemente "
              + "la frecuencia real es menor de la que marcaste.",
          },
          {
            tipo: "fichas_escala",
            id: "mudas",
            escala: "frecuencia",
            ayuda:
              "Cada ficha trae **qué es** el desperdicio y un ejemplo típico de planta. "
              + "Marca la frecuencia y escribe tu propio ejemplo, el de tu operación.",
            items: DESPERDICIOS.map((d) => ({
              id: d.id,
              titulo: d.titulo,
              descripcion: `${d.que}. Por ejemplo: ${d.ejemplo.toLowerCase()}.`,
            })),
            campoNota: { etiqueta: "¿Dónde ocurrió la última vez? Sé concreto" },
          },
        ],
      },
      {
        id: "cerrar",
        titulo: "El que más duele",
        lead:
          "De los ocho, uno se está llevando más plata que los otros. Nómbralo aquí y en "
          + "el taller siguiente le pones la cifra.",
        bloques: [
          {
            tipo: "texto",
            id: "mas-costoso",
            etiqueta: "¿Cuál nos está costando más y cómo lo sabemos?",
            marcador:
              "Si la respuesta es «no lo sabemos», escríbelo: es el hallazgo del taller",
          },
          {
            tipo: "nota",
            id: "ataque",
            cuerpo:
              "Para cuando llegues al módulo de herramientas, con qué se ataca cada uno. "
              + DESPERDICIOS.map((d) => `**${d.titulo.replace(/^\d+ · /, "")}**: ${d.ataque}`)
                .join(". ")
              + ". No elijas herramienta todavía: primero la cifra.",
          },
        ],
      },
    ],
  },
};

const t2: TallerSemilla = {
  numero: 2,
  slug: "costo-del-desperdicio",
  corto: "Costo en pesos",
  titulo: "¿Cuánto cuesta al año el desperdicio?",
  lead:
    "Esta es la cifra que aprueba un proyecto. Mientras el desperdicio se discute en "
    + "adjetivos —«se pierde mucho tiempo»— nadie invierte en eliminarlo; con un número "
    + "anual al lado, la conversación cambia de tono.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "cuantificar",
        bloques: [
          {
            tipo: "nota",
            id: "como",
            cuerpo:
              "**Cómo se llena.** Una fila por desperdicio que valga la pena cuantificar "
              + "—dos o tres bastan, los del taller anterior—. En *cantidad al mes* va lo "
              + "que se pierde: horas de parada, unidades rechazadas, kilos de material. En "
              + "*valor de cada una* va cuánto vale esa unidad perdida: el costo de la hora "
              + "de la línea, el costo de fabricar la pieza que se botó.\n\n"
              + "**No busques exactitud, busca orden de magnitud.** Entre no medirlo y "
              + "estimarlo al 70 %, la estimación gana: el error de una estimación honesta "
              + "es del 30 %, el de no medir es del 100 %. Marca cada celda como dato, "
              + "estimación u opinión y así el informe dirá cuánto peso aguanta la cifra.",
          },
          {
            tipo: "tabla_calculada",
            id: "costo",
            ayuda:
              "El costo al mes y al año los calcula la tabla. No los escribas: si se "
              + "pudieran escribir, se cuadrarían a mano, y la gracia de este taller es "
              + "que la multiplicación sorprenda.",
            columnas: [
              {
                id: "desperdicio",
                titulo: "Desperdicio",
                marcador: "Ej.: paradas por falta de material",
              },
              {
                id: "unidad",
                titulo: "¿Qué se pierde?",
                marcador: "horas · unidades · kg",
                requerida: false,
              },
              {
                id: "cantidad",
                titulo: "Cantidad al mes",
                numerica: true,
                marcador: "0",
                origen: true,
              },
              {
                id: "valor",
                titulo: "Valor de cada una",
                numerica: true,
                marcador: "0",
                formato: "pesos",
                origen: true,
              },
              {
                id: "mes",
                titulo: "Costo al mes",
                calculada: { op: "producto", de: [{ de: "columna", id: "cantidad" }, { de: "columna", id: "valor" }] },
                formato: "pesos",
              },
              {
                id: "anio",
                titulo: "Costo al año",
                calculada: { op: "producto", de: [{ de: "columna", id: "mes" }, { de: "constante", valor: 12 }] },
                formato: "pesos",
                total: true,
              },
            ],
            filasIniciales: 3,
            filasMinimas: 3,
            sugerencias: DESPERDICIOS.map((d) => d.titulo.replace(/^\d+ · /, "")),
            textoAgregar: "+ Otro desperdicio",
            indicadores: [
              {
                id: "total-anio",
                titulo: "Desperdicio al año",
                calculada: { op: "suma", de: [{ de: "total", columna: "anio" }] },
                formato: "pesos",
                principal: true,
                pista: "Lo que cuesta no cambiar nada",
              },
              {
                id: "total-mes",
                titulo: "Al mes",
                calculada: { op: "suma", de: [{ de: "total", columna: "mes" }] },
                formato: "pesos",
              },
            ],
            veredicto: {
              tipo: "fila_maxima",
              columna: "anio",
              nombre: "desperdicio",
              texto:
                "**{fila} es tu desperdicio más caro: {valor} al año.** Ahí es donde un "
                + "proyecto de mejora se paga solo. Cualquier inversión por debajo de esa "
                + "cifra se recupera en menos de un año.",
            },
          },
        ],
      },
      {
        id: "decidir",
        titulo: "Lo que harías con esa plata",
        bloques: [
          {
            tipo: "texto",
            id: "reaccion",
            etiqueta: "¿Te sorprendió la cifra? ¿Por encima o por debajo de lo que creías?",
            marcador: "La reacción honesta sirve: dice si la empresa se estaba midiendo",
          },
          {
            tipo: "texto",
            id: "destino",
            etiqueta: "Si recuperaras la mitad de esa plata en un año, ¿en qué la usarías?",
            marcador: "Una máquina, una persona, pagar una deuda, bajar el precio",
          },
        ],
      },
    ],
  },
};

const t3: TallerSemilla = {
  numero: 3,
  slug: "indicadores-base",
  corto: "Indicadores base",
  titulo: "¿Con qué mides hoy?",
  lead:
    "Siete indicadores sostienen la gestión de una planta. Productividad, eficiencia y "
    + "calidad no están en la lista a propósito: son el resultado de estos siete, no el "
    + "punto de partida.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "revisar",
        bloques: [
          {
            tipo: "nota",
            id: "aviso",
            cuerpo:
              "**No se trata de tenerlos todos.** Una planta de ocho personas que mide bien "
              + "el lead time y el scrap está mejor gestionada que una que dice medir siete "
              + "indicadores y no los revisa. Lo que buscamos aquí es saber cuáles hay, con "
              + "qué cifra de hoy, y cuáles dos vale la pena empezar a medir este trimestre.\n\n"
              + "Si marcas **definido y medido**, escribe la cifra de hoy en la nota. Un "
              + "indicador que se dice medir pero cuyo valor nadie recuerda no está medido.",
          },
          {
            tipo: "fichas_escala",
            id: "base",
            escala: "madurez",
            ayuda:
              "**No existe**: nadie lo calcula. **Se hace, sin método**: alguien lo mira de "
              + "vez en cuando. **Definido y escrito**: hay una forma acordada de "
              + "calcularlo. **Definido y medido**: además se revisa con cifras en fechas "
              + "fijas.",
            items: INDICADORES.map((i) => ({
              id: i.id,
              titulo: i.titulo,
              descripcion: i.que,
            })),
            campoNota: { etiqueta: "Cifra de hoy → meta. Si no la mides, escribe «sin dato»" },
          },
        ],
      },
      {
        id: "elegir",
        titulo: "Los dos que vas a empezar a medir",
        lead:
          "Dos, no siete. Un indicador nuevo necesita quién lo calcula, cada cuánto y "
          + "dónde se revisa; sin esas tres cosas no es un indicador, es una buena "
          + "intención.",
        bloques: [
          {
            tipo: "tabla",
            id: "nuevos",
            columnas: [
              { id: "indicador", titulo: "Indicador", marcador: "De los de arriba" },
              { id: "quien", titulo: "Quién lo calcula", marcador: "Nombre, no cargo" },
              { id: "cada", titulo: "Cada cuánto", marcador: "Diario · semanal · mensual" },
              {
                id: "donde",
                titulo: "Dónde se revisa",
                marcador: "La reunión concreta donde se mira",
                requerida: false,
              },
            ],
            filasIniciales: 2,
            filasMinimas: 2,
            sugerencias: INDICADORES.map((i) => i.titulo),
          },
          {
            tipo: "nota",
            id: "oee-despues",
            cuerpo:
              "El **OEE** no se pide aquí como dato: se calcula en el Módulo 3 a partir de "
              + "cinco cifras que la planta sí tiene. Es el indicador que más se cita de "
              + "memoria y más se equivoca —«la máquina casi no para» suele convivir con un "
              + "OEE del 50 %—, así que ahí lo verás calculado en vez de estimado.",
          },
        ],
      },
    ],
  },
};

export const LEAN_MODULO_1 = {
  numero: 1,
  slug: "lean-donde-estoy",
  pregunta: "¿Dónde estoy?",
  titulo: "Desperdicio, costo y medición",
  lead: "Qué desperdicio tienes, cuánto te cuesta al año y con qué lo medirías.",
  talleres: [t1, t2, t3] as TallerSemilla[],
};
