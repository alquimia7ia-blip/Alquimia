import { FASES } from "../fuente/lean-crudo";
import type { TallerSemilla } from "@/lib/talleres/tipos";

/**
 * Fábrica Lean · Módulo 4. «¿Y ahora qué?»
 *
 * Tres talleres: el A3, el roadmap de 12·18·24 meses y la cadencia Kaizen.
 *
 * El A3 va primero porque es el formato en que una mejora se puede defender:
 * una página, con el problema medido arriba y el seguimiento abajo. La
 * conferencia lo lista como herramienta y no lo desarrolla; aquí está
 * desarrollado en sus siete casillas, que son las de Toyota.
 *
 * La cadencia va de último y es, de los veintitrés talleres del programa, el
 * que más determina si algo de esto ocurre. Es también la lección que el
 * material de 4DX dejó en el Módulo 4 del programa de la Cámara: sin una
 * reunión fija, corta y con el tablero a la vista, el plan se muere en la
 * semana cuatro, no por malo sino porque nadie volvió a mirarlo.
 */

const t1: TallerSemilla = {
  numero: 1,
  slug: "reporte-a3",
  corto: "Reporte A3",
  titulo: "El A3 de tu mejora",
  lead:
    "Una página, siete casillas. El A3 obliga a lo que una presentación de veinte láminas "
    + "permite esquivar: decir el problema con una cifra, la meta con otra cifra, y la "
    + "causa raíz antes de la solución.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "problema",
        titulo: "1 · El problema",
        lead: "Con cifra y con fecha. «Hay mucho desperdicio» no es un problema, es una queja.",
        bloques: [
          {
            tipo: "nota",
            id: "regla",
            cuerpo:
              "**La regla del A3 es el tamaño.** Cabe en una hoja porque si no cabe, no "
              + "está pensado. Si una casilla se te alarga, casi siempre es que estás "
              + "metiendo dos problemas en un A3: haz dos.\n\n"
              + "Y el orden no se salta. **La casilla de contramedidas se llena después de "
              + "la de causa raíz**, nunca antes. Llenar primero la solución y después "
              + "buscarle una causa que la justifique es el error más común y el más caro.",
          },
          {
            tipo: "texto",
            id: "contexto",
            etiqueta: "Antecedente: ¿por qué esto importa ahora?",
            marcador: "Dos líneas. A quién le afecta y desde cuándo",
          },
          {
            tipo: "texto",
            id: "actual",
            etiqueta: "Situación actual, con cifra",
            marcador:
              "Ej.: 18 % de scrap en la línea 2, medido en las últimas 4 semanas",
          },
          {
            tipo: "texto",
            id: "meta",
            etiqueta: "Meta: de X a Y para cuándo",
            marcador: "Ej.: del 18 % al 8 % de scrap para el 30 de junio",
          },
        ],
      },
      {
        id: "analisis",
        titulo: "2 · El análisis",
        lead:
          "Aquí va lo que viste en el Gemba, no lo que supones desde la oficina. Si no has "
          + "ido a ver, esta casilla no se puede llenar todavía.",
        bloques: [
          {
            tipo: "lista_numerada",
            id: "porques",
            etiqueta: "Los cinco porqués",
            lineas: 5,
            marcador: "¿Por qué ocurre lo anterior?",
            ayuda:
              "Cada línea pregunta por qué ocurre la anterior. Si llegas al quinto y la "
              + "respuesta es «falta de compromiso» o «la gente no hace caso», devuélvete: "
              + "esas no son causas raíz, son formas de culpar. Una causa raíz se puede "
              + "cambiar con una decisión.",
          },
          {
            tipo: "texto",
            id: "causa",
            etiqueta: "Causa raíz",
            marcador: "Una sola frase, la del quinto porqué",
          },
        ],
      },
      {
        id: "accion",
        titulo: "3 · Contramedidas y plan",
        bloques: [
          {
            tipo: "tabla",
            id: "contramedidas",
            ayuda:
              "Una fila por contramedida. Si una contramedida no ataca la causa raíz de "
              + "arriba, sobra: es una buena idea para otro A3.",
            columnas: [
              {
                id: "accion",
                titulo: "Contramedida",
                multilinea: true,
                marcador: "Qué se cambia exactamente",
              },
              { id: "quien", titulo: "Quién", marcador: "Nombre" },
              { id: "cuando", titulo: "Para cuándo", marcador: "Fecha" },
              {
                id: "costo",
                titulo: "Qué cuesta",
                marcador: "Plata u horas",
                requerida: false,
              },
            ],
            filasIniciales: 3,
            filasMinimas: 3,
          },
        ],
      },
      {
        id: "seguimiento",
        titulo: "4 · Seguimiento",
        lead:
          "La casilla que convierte el A3 en gestión. Sin fecha de revisión, un A3 es una "
          + "hoja bonita.",
        bloques: [
          {
            tipo: "texto",
            id: "como-medir",
            etiqueta: "¿Qué cifra vas a volver a medir y cuándo?",
            marcador: "La misma de «situación actual», en la misma forma",
          },
          {
            tipo: "texto",
            id: "si-no-funciona",
            etiqueta: "Si en esa fecha la cifra no se movió, ¿qué harás?",
            marcador: "Decidirlo hoy evita que el A3 se abandone en silencio",
          },
        ],
      },
    ],
  },
};

const t2: TallerSemilla = {
  numero: 2,
  slug: "roadmap",
  corto: "Roadmap",
  titulo: "El roadmap de 12 · 18 · 24 meses",
  lead:
    "Primero disciplina Lean, después digitalización, después IA. El orden es la parte "
    + "importante: cada fase se apoya en la anterior y saltarse la primera es automatizar "
    + "el desperdicio que no quitaste.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "secuencia",
        bloques: [
          {
            tipo: "nota",
            id: "fases",
            cuerpo:
              "Las tres fases y sus hitos, como referencia para llenar el cronograma.\n\n"
              + FASES.map(
                // Los hitos van con su mayúscula: son nombres propios de
                // herramienta —Kanban, IoT, IA— y minusculizarlos los
                // convertía en palabras comunes.
                (f) => `**${f.titulo}**: ${f.hitos.join("; ")}.`,
              ).join("\n\n")
              + "\n\nNo tienes que poner los doce hitos. Pon los que vas a hacer, con mes "
              + "concreto. Un cronograma con doce hitos y ninguna fecha es una lista de "
              + "deseos; con cuatro hitos y cuatro fechas es un plan.",
          },
          {
            tipo: "cronograma",
            id: "plan",
            ayuda:
              "En *fase* escribe a cuál de las tres pertenece el hito: eso hace visible si "
              + "estás intentando saltar a la tecnología antes de tener la disciplina.",
            columnas: [
              {
                id: "hito",
                titulo: "Hito",
                multilinea: true,
                marcador: "Qué queda hecho",
              },
              { id: "fase", titulo: "Fase", marcador: "Fundamentos · digitalización · IA" },
              {
                id: "responsable",
                titulo: "Responsable",
                marcador: "Nombre",
                requerida: false,
              },
            ],
            anios: [2026, 2027, 2028],
            filasIniciales: 5,
            filasMinimas: 4,
            sugerencias: FASES.flatMap((f) => f.hitos),
          },
        ],
      },
      {
        id: "revisar",
        titulo: "La prueba del cronograma",
        bloques: [
          {
            tipo: "texto",
            id: "primer-trimestre",
            etiqueta: "¿Cuántos hitos quedaron en los primeros tres meses?",
            marcador:
              "Si son más de dos, mira la franja de arriba: casi seguro no caben",
          },
          {
            tipo: "texto",
            id: "orden",
            etiqueta: "¿Hay algún hito de digitalización o IA antes de terminar los fundamentos?",
            marcador: "Si lo hay, justifícalo o muévelo. No es una regla arbitraria",
          },
        ],
      },
    ],
  },
};

const t3: TallerSemilla = {
  numero: 3,
  slug: "cadencia-kaizen",
  corto: "Cadencia Kaizen",
  titulo: "La reunión que sostiene todo lo demás",
  lead:
    "De los veintitrés talleres de este programa, este es el que decide si algo ocurre. No "
    + "porque sea el más inteligente, sino porque sin una reunión fija y corta, con el "
    + "tablero a la vista, todo lo anterior se muere en la semana cuatro.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "la-reunion",
        bloques: [
          {
            tipo: "nota",
            id: "como",
            cuerpo:
              "**Corta, fija y de pie.** Veinte minutos, el mismo día y la misma hora cada "
              + "semana, con el tablero delante. Se habla de tres cosas y de nada más: qué "
              + "me comprometí la semana pasada, qué dicen las cifras, a qué me comprometo "
              + "esta semana.\n\n"
              + "**Lo que mata la cadencia** es convertirla en reunión de problemas "
              + "operativos. Si aparece un problema que necesita media hora, se saca de la "
              + "reunión y se le abre un A3. La reunión de cadencia no resuelve problemas: "
              + "verifica compromisos.\n\n"
              + "**Que no se cancele nunca**, aunque falte alguien. La primera vez que se "
              + "cancela por estar ocupados, deja de existir.",
          },
          {
            tipo: "tabla",
            id: "acuerdo",
            ayuda: "Una sola fila: la reunión. Dos reuniones de seguimiento es ninguna.",
            columnas: [
              { id: "dia", titulo: "Día y hora", marcador: "Ej.: lunes 7:30 a.m." },
              { id: "duracion", titulo: "Duración", marcador: "20 minutos" },
              { id: "quienes", titulo: "Quiénes", marcador: "Los que responden por un indicador" },
              { id: "donde", titulo: "Dónde", marcador: "Junto al tablero, en planta" },
            ],
            filasIniciales: 1,
            filasMinimas: 1,
          },
        ],
      },
      {
        id: "tablero",
        titulo: "El tablero de mejoras",
        lead:
          "Una fila por mejora en curso. Si una mejora lleva tres semanas sin cambiar de "
          + "estado, no está en curso: está abandonada y conviene decirlo.",
        bloques: [
          {
            tipo: "tabla",
            id: "mejoras",
            columnas: [
              {
                id: "mejora",
                titulo: "Mejora",
                multilinea: true,
                marcador: "Qué se está cambiando",
              },
              { id: "quien", titulo: "Quién", marcador: "Nombre" },
              { id: "fecha", titulo: "Compromiso", marcador: "Fecha" },
              {
                id: "estado",
                titulo: "Estado",
                marcador: "Propuesta · en curso · hecha",
                requerida: false,
              },
              {
                id: "efecto",
                titulo: "Qué cambió en la cifra",
                marcador: "Se llena al cerrarla",
                requerida: false,
              },
            ],
            filasIniciales: 4,
            filasMinimas: 3,
          },
          {
            tipo: "texto",
            id: "idea-de-quien-hace",
            etiqueta:
              "¿Cómo va a llegar al tablero una idea de quien está en la máquina?",
            marcador:
              "El octavo desperdicio es el talento desaprovechado. Esta es la respuesta a ese",
          },
          {
            tipo: "texto",
            id: "compromiso",
            etiqueta: "La primera acción, de esta semana",
            marcador: "Una, concreta, de quien está leyendo esto",
          },
        ],
      },
    ],
  },
};

export const LEAN_MODULO_4 = {
  numero: 4,
  slug: "lean-y-ahora-que",
  pregunta: "¿Y ahora qué?",
  titulo: "A3, roadmap y cadencia",
  lead: "Una mejora defendible en una página, el camino de dos años y la reunión que lo sostiene.",
  talleres: [t1, t2, t3] as TallerSemilla[],
};
