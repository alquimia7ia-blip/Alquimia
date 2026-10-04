import { CINCO_S, HERRAMIENTAS, TECNOLOGIAS, minusculaInicial } from "../fuente/lean-crudo";
import type { TallerSemilla } from "@/lib/talleres/tipos";

/**
 * Fábrica Lean · Módulo 3. «¿Con qué?»
 *
 * Cuatro talleres: el OEE, la elección de herramienta, las 5S en un área
 * piloto y la madurez digital.
 *
 * El OEE va primero y calculado, no estimado, por una razón concreta: es el
 * indicador que más se cita de memoria en una planta y el que más se
 * equivoca. «La máquina casi no para» conviven perfectamente con un OEE del
 * 50 %, porque el OEE multiplica tres factores y basta que uno esté en 70 %
 * para que el resultado se hunda. Verlo multiplicado cambia la conversación
 * sobre qué máquina comprar.
 *
 * El orden del módulo respeta la advertencia de la conferencia: primero la
 * disciplina Lean, después la tecnología. Por eso la madurez digital es el
 * último taller y no el primero —«la digitalización sin disciplina Lean solo
 * automatiza el desperdicio existente»—.
 */

const t1: TallerSemilla = {
  numero: 1,
  slug: "oee",
  corto: "OEE",
  titulo: "¿Cuál es el OEE de tu equipo crítico?",
  lead:
    "Disponibilidad × rendimiento × calidad. Son cinco cifras que tu planta ya tiene y una "
    + "multiplicación que casi nadie hace. El resultado suele estar treinta puntos por "
    + "debajo de lo que la gente cree.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "medir",
        bloques: [
          {
            tipo: "nota",
            id: "como",
            cuerpo:
              "**Elige una sola máquina o línea**: la que más condiciona tu producción. "
              + "Toma **un turno concreto y reciente**, no un promedio del mes: el promedio "
              + "esconde justo el turno malo que explica el problema.\n\n"
              + "Las cinco cifras:\n\n"
              + "**Tiempo planeado**: los minutos que la máquina debía producir en ese "
              + "turno.\n\n"
              + "**Minutos parada**: todo lo que no produjo y debía producir —falla, falta "
              + "de material, cambio de referencia, espera de operario—. El cambio de "
              + "referencia cuenta: es tiempo en que la máquina no produce.\n\n"
              + "**Unidades producidas**: todas las que salieron, buenas y malas.\n\n"
              + "**Tiempo de ciclo ideal**: lo que tarda la máquina en hacer una unidad a "
              + "su velocidad de diseño, no a la que la tienen puesta. Está en la ficha "
              + "técnica.\n\n"
              + "**Unidades buenas**: las que pasaron a la primera, sin retrabajo. Una "
              + "pieza que se reprocesó y quedó bien **no** es buena para el OEE: costó dos "
              + "veces.",
          },
          {
            tipo: "tabla_calculada",
            id: "oee",
            parametros: [
              {
                id: "planeado",
                titulo: "Tiempo planeado",
                unidad: "min",
                pista: "Lo que debía producir en el turno",
                marcador: "480",
              },
              {
                id: "paradas",
                titulo: "Minutos parada",
                unidad: "min",
                pista: "Fallas, falta de material, cambios",
                marcador: "60",
              },
              {
                id: "unidades",
                titulo: "Unidades producidas",
                pista: "Buenas y malas",
                marcador: "0",
              },
              {
                id: "ciclo-ideal",
                titulo: "Ciclo ideal",
                unidad: "min por unidad",
                pista: "Velocidad de diseño, de la ficha técnica",
                marcador: "0",
              },
              {
                id: "buenas",
                titulo: "Unidades buenas",
                pista: "A la primera, sin retrabajo",
                marcador: "0",
              },
            ],
            // Sin tabla: el OEE son cinco datos del turno, no una lista de
            // filas. Los pasos intermedios van ocultos porque «tiempo
            // operando» y «producción ideal» no se llevan a una reunión.
            columnas: [],
            indicadores: [
              {
                id: "operando",
                titulo: "Tiempo operando",
                calculada: {
                  op: "resta",
                  de: [{ de: "parametro", id: "planeado" }, { de: "parametro", id: "paradas" }],
                },
                oculto: true,
              },
              {
                id: "ideal",
                titulo: "Producción ideal",
                calculada: {
                  op: "producto",
                  de: [
                    { de: "parametro", id: "unidades" },
                    { de: "parametro", id: "ciclo-ideal" },
                  ],
                },
                oculto: true,
              },
              {
                id: "disponibilidad",
                titulo: "Disponibilidad",
                calculada: {
                  op: "porcentaje",
                  de: [{ de: "indicador", id: "operando" }, { de: "parametro", id: "planeado" }],
                },
                formato: "porcentaje",
                pista: "Del tiempo planeado, el que produjo",
              },
              {
                id: "rendimiento",
                titulo: "Rendimiento",
                calculada: {
                  op: "porcentaje",
                  de: [{ de: "indicador", id: "ideal" }, { de: "indicador", id: "operando" }],
                },
                formato: "porcentaje",
                pista: "Qué tan cerca fue de su velocidad de diseño",
              },
              {
                id: "calidad",
                titulo: "Calidad",
                calculada: {
                  op: "porcentaje",
                  de: [
                    { de: "parametro", id: "buenas" },
                    { de: "parametro", id: "unidades" },
                  ],
                },
                formato: "porcentaje",
                pista: "Lo que salió bien a la primera",
              },
              {
                id: "bruto",
                titulo: "Producto de los tres",
                calculada: {
                  op: "producto",
                  de: [
                    { de: "indicador", id: "disponibilidad" },
                    { de: "indicador", id: "rendimiento" },
                    { de: "indicador", id: "calidad" },
                  ],
                },
                oculto: true,
              },
              {
                id: "oee",
                titulo: "OEE",
                calculada: {
                  op: "division",
                  de: [{ de: "indicador", id: "bruto" }, { de: "constante", valor: 10000 }],
                },
                formato: "porcentaje",
                principal: true,
                pista: "Disponibilidad × rendimiento × calidad",
              },
            ],
            veredicto: {
              tipo: "umbral",
              indicador: "oee",
              tramos: [
                {
                  hasta: 40,
                  color: "des",
                  texto:
                    "**OEE de {valor}.** La máquina está entregando menos de la mitad de "
                    + "lo que puede. Antes de pensar en comprar otra, mira cuál de los "
                    + "tres factores te está hundiendo el resultado: casi siempre hay uno "
                    + "muy por debajo de los otros dos, y arreglar ese es gratis comparado "
                    + "con una máquina nueva.",
                },
                {
                  hasta: 65,
                  color: "med",
                  texto:
                    "**OEE de {valor}.** Es lo típico de una planta sin gestión Lean, así "
                    + "que no es un fracaso: es el punto de partida. El factor más bajo de "
                    + "los tres te dice por dónde empezar —paradas, velocidad o calidad— y "
                    + "no hay que atacar los tres a la vez.",
                },
                {
                  hasta: 85,
                  color: "acento",
                  texto:
                    "**OEE de {valor}.** Buena gestión. A partir de aquí la mejora se "
                    + "vuelve fina: TPM para las paradas que quedan y Poka-Yoke para el "
                    + "defecto que se resiste.",
                },
                {
                  color: "fav",
                  texto:
                    "**OEE de {valor}.** Está en el rango que se considera de clase "
                    + "mundial, y precisamente por eso conviene auditar los datos: lo más "
                    + "común es que falten minutos de parada por registrar o que el ciclo "
                    + "ideal esté puesto por debajo del de la ficha técnica.",
                },
              ],
            },
          },
        ],
      },
      {
        id: "interpretar",
        titulo: "Cuál de los tres factores te hunde el resultado",
        bloques: [
          {
            tipo: "texto",
            id: "factor-bajo",
            etiqueta: "¿Cuál de los tres salió más bajo y a qué lo atribuyes?",
            marcador: "Disponibilidad, rendimiento o calidad. Y por qué",
          },
          {
            tipo: "texto",
            id: "parada-principal",
            etiqueta: "De los minutos parada, ¿cuál es la causa que más pesa?",
            marcador: "Falla, falta de material, cambio de referencia, espera",
          },
        ],
      },
    ],
  },
};

const t2: TallerSemilla = {
  numero: 2,
  slug: "elegir-la-herramienta",
  corto: "Qué herramienta",
  titulo: "¿Qué herramienta ataca tu desperdicio?",
  lead:
    "Trece herramientas probadas y un error clásico: empezar por la que está de moda. Se "
    + "elige al revés —del desperdicio a la herramienta— y se ejecuta de a una.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "priorizar",
        bloques: [
          {
            tipo: "nota",
            id: "catalogo",
            cuerpo:
              "Las trece herramientas, para elegir con criterio.\n\n"
              + HERRAMIENTAS.map(
                (h) => `**${h.titulo}**: ${h.que}. Cuándo: ${minusculaInicial(h.cuando)}.`,
              ).join("\n\n")
              + "\n\nUn aviso de la conferencia que vale repetir: **5S como «limpieza de "
              + "una vez» no es 5S**, y un **Poka-Yoke instalado sin entender la causa "
              + "raíz** trata el síntoma. Las dos son las formas más comunes de gastar "
              + "esfuerzo sin resultado.",
          },
          {
            tipo: "matriz_priorizacion",
            id: "candidatas",
            ayuda:
              "Una fila por herramienta que estés considerando. En *desperdicio que ataca* "
              + "va el del Módulo 1: si una herramienta no ataca ninguno de los tuyos, "
              + "bórrala de la lista aunque sea excelente.",
            columnas: [
              {
                id: "herramienta",
                titulo: "Herramienta",
                marcador: "De las trece de arriba",
              },
              {
                id: "desperdicio",
                titulo: "Desperdicio que ataca",
                marcador: "El de tu operación, no el teórico",
              },
            ],
            criterios: [
              {
                id: "impacto",
                titulo: "Impacto",
                ayuda: "Cuánto desperdicio elimina de verdad",
              },
              {
                id: "velocidad",
                titulo: "Velocidad",
                ayuda: "Qué tan rápido se ven resultados",
              },
              {
                id: "inversion",
                titulo: "Inversión",
                ayuda: "Plata y horas que exige",
                invertido: true,
              },
              {
                id: "riesgo",
                titulo: "Riesgo de parar la operación",
                ayuda: "Qué tanto puede estorbar mientras se implanta",
                invertido: true,
              },
            ],
            maximo: 5,
            filasIniciales: 4,
            filasMinimas: 3,
            sugerencias: HERRAMIENTAS.map((h) => h.titulo),
          },
        ],
      },
      {
        id: "comprometer",
        titulo: "La primera, con responsable",
        lead:
          "El orden de arriba es una propuesta de la aritmética. Si no te cuadra, la "
          + "discusión es sobre las notas, no sobre la suma.",
        bloques: [
          {
            tipo: "tabla",
            id: "arranque",
            columnas: [
              { id: "herramienta", titulo: "Herramienta", marcador: "La número 1" },
              { id: "donde", titulo: "Dónde arranca", marcador: "Área o línea concreta" },
              { id: "quien", titulo: "Quién responde", marcador: "Nombre" },
              { id: "cuando", titulo: "Primera semana", marcador: "Fecha" },
            ],
            filasIniciales: 1,
            filasMinimas: 1,
          },
          {
            tipo: "texto",
            id: "senal",
            etiqueta: "¿Cómo sabrás en un mes si funcionó?",
            marcador: "Una señal medible, no «se siente mejor»",
          },
        ],
      },
    ],
  },
};

const t3: TallerSemilla = {
  numero: 3,
  slug: "cinco-s",
  corto: "5S",
  titulo: "Las 5S en un área piloto",
  lead:
    "5S es la base de todo lo demás y la que más se hace mal: una jornada de aseo con "
    + "fotos y a los dos meses todo igual. La diferencia entre las dos versiones es la "
    + "quinta S, la que nadie hace.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "elegir-area",
        bloques: [
          {
            tipo: "nota",
            id: "una-area",
            cuerpo:
              "**Una sola área, la más visible.** 5S en toda la planta a la vez no se "
              + "termina; en un área que todos ven, el resultado se vuelve el argumento "
              + "para la siguiente. Elige donde más se busquen cosas, no donde más desorden "
              + "haya: lo que se mide aquí es tiempo perdido buscando, no estética.",
          },
          {
            tipo: "texto",
            id: "area",
            etiqueta: "Área piloto y por qué esa",
            marcador: "Ej.: mesa de alistamiento, porque ahí se busca herramienta todo el día",
            multilinea: false,
          },
          {
            tipo: "fichas_escala",
            id: "auditoria",
            escala: "madurez",
            ayuda:
              "Califica **el área piloto de hoy**, no la planta entera ni la intención. "
              + "**No existe**: no se hace. **Se hace, sin método**: depende de quién esté "
              + "de turno. **Definido y escrito**: hay una forma acordada y está a la "
              + "vista. **Definido y medido**: además se audita con fecha y responsable.",
            items: CINCO_S.map((s) => ({
              id: s.id,
              titulo: s.titulo,
              descripcion: s.descripcion,
            })),
            campoNota: { etiqueta: "Qué falta exactamente para subir un nivel" },
          },
        ],
      },
      {
        id: "sostener",
        titulo: "La quinta S: la que decide",
        lead:
          "Las cuatro primeras se hacen en un sábado. La quinta es una rutina con "
          + "responsable y fecha, y es la única razón por la que un 5S dura más de dos "
          + "meses.",
        bloques: [
          {
            tipo: "tabla",
            id: "rutina",
            columnas: [
              { id: "que", titulo: "Qué se audita", marcador: "Ej.: tablero de herramienta completo" },
              { id: "quien", titulo: "Quién", marcador: "Nombre" },
              { id: "cada", titulo: "Cada cuánto", marcador: "Semanal · quincenal" },
              {
                id: "evidencia",
                titulo: "Qué queda como evidencia",
                marcador: "Foto, lista firmada",
                requerida: false,
              },
            ],
            filasIniciales: 2,
            filasMinimas: 2,
          },
          {
            tipo: "texto",
            id: "medida",
            etiqueta: "¿Qué tiempo vas a medir antes y después?",
            marcador: "Ej.: minutos buscando herramienta en un turno. Mídelo esta semana",
          },
        ],
      },
    ],
  },
};

const t4: TallerSemilla = {
  numero: 4,
  slug: "madurez-digital",
  corto: "Madurez digital",
  titulo: "¿Qué tecnología y para atacar qué?",
  lead:
    "Va de último a propósito. La conferencia lo dice en una frase que conviene tomarse "
    + "en serio: la digitalización sin disciplina Lean solo automatiza el desperdicio que "
    + "ya tenías, y además lo vuelve más difícil de ver.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "ubicarse",
        bloques: [
          {
            tipo: "nota",
            id: "aviso",
            cuerpo:
              "**«No nos aplica» es una respuesta legítima y conviene usarla.** Una planta "
              + "de ocho personas no necesita un gemelo digital, y calificarse «básico» en "
              + "algo que no necesita la hace parecer atrasada en una carrera en la que no "
              + "está compitiendo. Lo que importa de esta lámina no es el puntaje: es "
              + "encontrar la única tecnología que atacaría un desperdicio que ya tienes "
              + "medido.",
          },
          {
            tipo: "fichas_escala",
            id: "tecnologias",
            escala: "madurez_digital",
            items: TECNOLOGIAS.map((t) => ({
              id: t.id,
              titulo: t.titulo,
              descripcion: t.descripcion,
            })),
            campoNota: { etiqueta: "Si ya la usas, ¿en qué exactamente?" },
          },
        ],
      },
      {
        id: "elegir",
        titulo: "Una sola, el próximo trimestre",
        lead:
          "La pregunta de la conferencia, pero con la respuesta escrita: si pudieras "
          + "implementar solo UNA tecnología el próximo trimestre, ¿cuál y qué desperdicio "
          + "atacaría?",
        bloques: [
          {
            tipo: "tabla",
            id: "piloto",
            ayuda:
              "Una sola fila. Un piloto de bajo riesgo es el que, si falla, no para la "
              + "producción y se puede desmontar en un día.",
            columnas: [
              { id: "tecnologia", titulo: "Tecnología", marcador: "De las ocho de arriba" },
              {
                id: "desperdicio",
                titulo: "Desperdicio que atacaría",
                marcador: "El del Módulo 1, con su cifra",
              },
              {
                id: "piloto",
                titulo: "El piloto de 90 días",
                multilinea: true,
                marcador: "Qué exactamente, en qué máquina o área",
              },
              {
                id: "costo",
                titulo: "Qué cuesta probarlo",
                marcador: "En plata y en horas",
                requerida: false,
              },
            ],
            filasIniciales: 1,
            filasMinimas: 1,
            sugerencias: TECNOLOGIAS.map((t) => t.titulo),
          },
          {
            tipo: "texto",
            id: "sin-tecnologia",
            etiqueta: "¿Y si no compras nada? ¿Qué parte de eso se puede hacer a mano primero?",
            marcador:
              "Casi siempre se puede: un tablero de papel antes del tablero digital",
          },
          {
            tipo: "nota",
            id: "ia-generativa",
            cuerpo:
              "Un caso de uso que ya está ocurriendo y no cuesta infraestructura: los "
              + "equipos de ingeniería industrial usan asistentes de IA generativa para "
              + "redactar reportes A3, sintetizar hallazgos de auditorías 5S y sacar "
              + "primeras versiones de procedimientos. No sustituye el Gemba —hay que ir a "
              + "ver—, pero libera las horas administrativas que hoy impiden ir.",
          },
        ],
      },
    ],
  },
};

export const LEAN_MODULO_3 = {
  numero: 3,
  slug: "lean-con-que",
  pregunta: "¿Con qué?",
  titulo: "Herramientas, confiabilidad y tecnología",
  lead: "El OEE calculado, la herramienta que ataca tu desperdicio y qué tecnología sigue.",
  talleres: [t1, t2, t3, t4] as TallerSemilla[],
};
