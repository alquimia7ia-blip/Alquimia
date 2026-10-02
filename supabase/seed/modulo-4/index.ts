import {
  INDICADORES_EJEMPLO, OBJETIVOS_EJEMPLO, PRACTICAS_INFALTABLES,
} from "../fuente/modulo-4-crudo";
import type { TallerSemilla } from "@/lib/talleres/tipos";

/**
 * Módulo 4 · Plan de acción. «¿Cómo lo haremos?»
 *
 * Cierra el programa: el Módulo 2 dejó los atributos de la oferta de valor y
 * el 3 el estado del equipo, y aquí esos atributos se vuelven proyectos con
 * fecha, responsable, presupuesto e indicador. La lámina 5 de la presentación
 * lo dice sin rodeos: quien tiene las tres primeras piezas y no esta termina
 * en «frustración».
 *
 * Los cuatro talleres son los de la presentación. Su lámina 15 remite a unos
 * formatos en Excel que no llegaron, así que las columnas salen de las
 * láminas 16 a 19 —que traen las matrices dibujadas y un ejemplo
 * diligenciado— y no de la hoja de cálculo. Son datos: si el Excel aparece y
 * pide otra columna, se cambia la definición sin tocar código.
 *
 * Material de apoyo: «Las 4 disciplinas de la ejecución» (Covey, McChesney y
 * Huling). De ahí vienen cuatro añadidos que la presentación no trae y que
 * atacan justo lo que hace fracasar un plan de acción: el límite de dos
 * iniciativas «a costa de lo que sea» (Disciplina 1), la meta escrita como
 * «de X a Y para cuándo» (Disciplina 1), la distinción entre indicadores de
 * predicción e históricos (Disciplina 2) y la cadencia fija de revisión
 * (Disciplina 4). Van marcados como apoyo en el texto de cada taller, para
 * que nadie los confunda con el contenido de la Cámara.
 */

const t1: TallerSemilla = {
  numero: 1,
  slug: "priorizacion-de-proyectos",
  corto: "Priorización",
  titulo: "¿Cuáles proyectos primero?",
  lead:
    "Cada atributo de tu oferta de valor pide proyectos que lo hagan realidad. Casi nunca "
    + "alcanza el tiempo ni la plata para todos a la vez, así que el trabajo de hoy no es "
    + "listarlos: es ponerlos en orden.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "proyectos",
        bloques: [
          {
            tipo: "nota",
            id: "aviso-origen",
            cuerpo:
              "Los proyectos salen de los **atributos** que definiste en el Módulo 2 y de las "
              + "**brechas** que encontraste en el Módulo 3. Para cada atributo, pregúntate qué "
              + "tendría que pasar en la empresa para poder cumplirlo de verdad: eso es un "
              + "proyecto.",
          },
          {
            tipo: "matriz_priorizacion",
            id: "matriz",
            ayuda:
              "Califica de 1 a 5 cada criterio. **Impacto**: cuánto mejora la empresa si se "
              + "hace. **Velocidad**: qué tan rápido se puede concretar. **Riesgo de no "
              + "hacerlo**: qué tanto duele dejarlo para después. **Inversión**: cuántos "
              + "recursos exige — y esta se califica igual, pero resta, porque un proyecto "
              + "más costoso no es más urgente por ser costoso.",
            columnas: [
              {
                id: "proyecto",
                titulo: "Proyecto o iniciativa",
                marcador: "Qué van a hacer",
              },
              {
                id: "atributo",
                titulo: "Atributo que sirve",
                marcador: "Del Módulo 2",
              },
            ],
            criterios: [
              {
                id: "impacto",
                titulo: "Impacto",
                ayuda: "5 = transforma la empresa",
              },
              {
                id: "velocidad",
                titulo: "Velocidad",
                ayuda: "5 = se puede hacer ya",
              },
              {
                id: "riesgo",
                titulo: "Riesgo de no hacerlo",
                ayuda: "5 = dejarlo nos cuesta caro",
              },
              {
                id: "inversion",
                titulo: "Inversión",
                ayuda: "5 = exige muchos recursos",
                invertido: true,
              },
            ],
            maximo: 5,
            filasIniciales: 4,
            filasMinimas: 4,
          },
        ],
      },
      {
        id: "foco",
        titulo: "El filtro de las dos",
        lead:
          "Apoyo · 4DX, Disciplina 1. Una empresa que persigue diez proyectos a la vez no "
          + "termina ninguno: el día a día se los come. De la lista de arriba, escoge las dos "
          + "que harás a costa de lo que sea.",
        bloques: [
          {
            tipo: "lista_numerada",
            id: "cruciales",
            etiqueta: "Las dos que se hacen pase lo que pase",
            lineas: 2,
            marcador: "Nombre del proyecto, tal como quedó arriba",
          },
          {
            tipo: "texto",
            id: "a-que-decimos-no",
            etiqueta: "¿A qué le vamos a decir «no» para que estas dos pasen?",
            marcador:
              "Qué se posterga, qué se deja de hacer, a quién hay que avisarle",
          },
        ],
      },
    ],
  },
};

const t2: TallerSemilla = {
  numero: 2,
  slug: "cronograma-de-proyectos",
  corto: "Cronograma",
  titulo: "¿Cuándo queda listo cada uno?",
  lead:
    "Un proyecto sin fecha no es un proyecto, es una intención. Marca el mes en que esperas "
    + "tenerlo concretado, dentro del horizonte 2026–2028.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "cronograma",
        bloques: [
          {
            tipo: "nota",
            id: "aviso-fechas",
            cuerpo:
              "Trae los proyectos del taller anterior **en el orden que te dio la matriz**. "
              + "La franja de la derecha dibuja dónde cae cada fecha: si todo aparece apretado "
              + "en los mismos tres meses, el plan no es ambicioso, es irrealizable.",
          },
          {
            tipo: "cronograma",
            id: "plan",
            ayuda:
              "Escoge el mes y el año en que el proyecto queda **concretado**, no cuando "
              + "arranca. Si no sabes el mes exacto, usa el mes en que tendría que estar "
              + "terminado para no atrasar lo demás.",
            columnas: [
              {
                id: "proyecto",
                titulo: "Proyecto o iniciativa",
                marcador: "Como quedó en la priorización",
              },
              {
                id: "atributo",
                titulo: "Atributo que sirve",
                marcador: "Del Módulo 2",
              },
            ],
            anios: [2026, 2027, 2028],
            filasIniciales: 4,
            filasMinimas: 4,
          },
        ],
      },
    ],
  },
};

const t3: TallerSemilla = {
  numero: 3,
  slug: "desdoble-de-proyectos",
  corto: "Desdoble",
  titulo: "¿Quién hace qué, cuándo y con cuánto?",
  lead:
    "Aquí el proyecto se parte en actividades concretas, cada una con un responsable con "
    + "nombre propio, un mes y un presupuesto. El detalle es lo que separa un plan que se "
    + "ejecuta de uno que se archiva.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "actividades",
        bloques: [
          {
            tipo: "nota",
            id: "aviso-desdoble",
            cuerpo:
              "Registra las actividades **en orden lógico**: lo que hay que hacer primero, "
              + "primero. Un responsable por actividad, y que sea una persona, no un área: "
              + "«mercadeo» no responde por nada, Juliana sí.",
          },
          {
            tipo: "tabla",
            id: "desdoble",
            columnas: [
              { id: "proyecto", titulo: "Proyecto", marcador: "A cuál pertenece" },
              {
                id: "actividad",
                titulo: "Actividad",
                multilinea: true,
                marcador: "Qué hay que hacer exactamente",
              },
              { id: "lider", titulo: "Responsable", marcador: "Nombre o cargo" },
              { id: "mes", titulo: "Mes", marcador: "Cuándo" },
              {
                id: "presupuesto",
                titulo: "Presupuesto ($)",
                numerica: true,
                marcador: "0",
              },
            ],
            filasIniciales: 6,
            filasMinimas: 8,
          },
        ],
      },
      {
        id: "seguimiento",
        titulo: "Seguimiento",
        lead:
          "Esta parte se llena después, cuando el plan ya esté andando. No cuenta para el "
          + "avance del taller: hoy no tendrías qué escribir.",
        bloques: [
          {
            tipo: "lista_numerada",
            id: "avances",
            etiqueta: "Principales avances",
            lineas: 4,
            marcador: "Qué se logró desde la última revisión",
            requerido: false,
          },
          {
            tipo: "lista_numerada",
            id: "retos",
            etiqueta: "Principales retos o dificultades",
            lineas: 3,
            marcador: "Qué está frenando el avance",
            requerido: false,
          },
        ],
      },
    ],
  },
};

const t4: TallerSemilla = {
  numero: 4,
  slug: "objetivos-e-indicadores",
  corto: "Indicadores",
  titulo: "¿Cómo sabremos que lo logramos?",
  lead:
    "Un objetivo por atributo y los indicadores que midan si se está cumpliendo, con su "
    + "línea base, su responsable y cada cuánto se mide. Sin línea base no hay avance que "
    + "mostrar: solo opiniones sobre si vamos mejor.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "tablero",
        bloques: [
          {
            tipo: "nota",
            id: "aviso-indicadores",
            cuerpo:
              "**Apoyo · 4DX, Disciplina 2.** Hay dos clases de indicador y necesitas las dos. "
              + "El **histórico** te dice si ganaste —ventas del mes, utilidad— pero llega "
              + "cuando ya no puedes hacer nada. El de **predicción** mide lo que tu equipo "
              + "sí controla esta semana —visitas hechas, cotizaciones enviadas, "
              + "mantenimientos realizados— y es el que mueve al otro. Si todos tus "
              + "indicadores son históricos, tienes un reporte, no un tablero.",
          },
          {
            tipo: "tabla",
            id: "indicadores",
            ayuda:
              "Un objetivo por atributo. **Línea base** es el valor de hoy, aunque sea "
              + "incómodo; **meta** es a dónde quieres llegar y para cuándo. En **tipo** "
              + "escribe «predicción» o «histórico». Indicadores que trae la presentación "
              + "como ejemplo: " + INDICADORES_EJEMPLO.join(", ").toLowerCase() + ". Y un "
              + "objetivo de ejemplo: «" + OBJETIVOS_EJEMPLO[0] + "».",
            columnas: [
              { id: "atributo", titulo: "Atributo", marcador: "Del Módulo 2" },
              {
                id: "objetivo",
                titulo: "Objetivo estratégico",
                multilinea: true,
                marcador: "Qué esperas transformar",
              },
              { id: "indicador", titulo: "Indicador", marcador: "Qué se mide" },
              { id: "tipo", titulo: "Tipo", marcador: "predicción / histórico" },
              { id: "base", titulo: "Línea base", marcador: "Valor de hoy" },
              { id: "meta", titulo: "Meta", marcador: "A dónde y para cuándo" },
              { id: "frecuencia", titulo: "Frecuencia", marcador: "mensual / trimestral" },
              { id: "responsable", titulo: "Responsable", marcador: "Nombre o cargo" },
              {
                id: "presupuesto",
                titulo: "Presupuesto ($)",
                numerica: true,
                marcador: "0",
                requerida: false,
              },
            ],
            // Sin `sugerencias`: el clic las escribe en la primera columna, y
            // aquí la primera es «atributo». Los indicadores de ejemplo van
            // en la ayuda, donde se leen sin ensuciar una respuesta.
            filasIniciales: 4,
            filasMinimas: 4,
          },
        ],
      },
      {
        id: "meta-mayor",
        titulo: "La meta que manda",
        lead:
          "Apoyo · 4DX, Disciplina 1. Escrita en una sola frase con el molde «de X a Y para "
          + "cuándo», no hay forma de discutir si se cumplió o no.",
        bloques: [
          {
            tipo: "texto",
            id: "mci",
            etiqueta: "La meta crucial de la empresa",
            marcador:
              "Pasar de ___ a ___ antes del ___ de ___ de ____",
            multilinea: false,
          },
          {
            tipo: "texto",
            id: "objetivo-propio",
            etiqueta: "¿Por qué esta meta y no otra?",
            marcador:
              "Qué área de la empresa se beneficiaría más si cambiara, y qué pasa si no cambia",
            requerido: false,
          },
        ],
      },
      {
        id: "cadencia",
        titulo: "La cita para revisar",
        lead:
          "Apoyo · 4DX, Disciplina 4. Un plan sin una reunión fija en el calendario se lo come "
          + "el día a día en tres semanas. Define la cita ahora, con día y hora.",
        bloques: [
          {
            tipo: "texto",
            id: "reunion",
            etiqueta: "¿Cuándo se reúnen a revisar el tablero?",
            marcador: "Día, hora y duración. Por ejemplo: lunes 8:00 a.m., 30 minutos",
            multilinea: false,
          },
          {
            tipo: "texto",
            id: "quien-convoca",
            etiqueta: "¿Quién convoca y no deja que se cancele?",
            marcador: "Nombre y cargo",
            multilinea: false,
          },
        ],
      },
      {
        id: "practicas",
        bloques: [
          {
            tipo: "nota",
            id: "cierre",
            cuerpo:
              "Para cerrar, las seis **prácticas infaltables** de la presentación. "
              + PRACTICAS_INFALTABLES
                .map((p, i) => `**${i + 1}.** ${p.replace(/\.$/, "")}.`)
                .join(" ")
              + " Si tu plan cumple con las seis, está completo.",
          },
          {
            tipo: "texto",
            id: "compromiso",
            etiqueta: "¿Con qué se compromete la empresa al cerrar el programa?",
            marcador: "Una frase. La leerán ustedes mismos en seis meses",
          },
        ],
      },
    ],
  },
};

export const MODULO_4 = {
  numero: 4,
  slug: "plan-de-accion",
  pregunta: "¿Cómo lo haremos?",
  titulo: "Plan de acción",
  lead: "Cuáles son las acciones que nos llevarán a cumplir nuestras declaraciones.",
  talleres: [t1, t2, t3, t4] as TallerSemilla[],
};
