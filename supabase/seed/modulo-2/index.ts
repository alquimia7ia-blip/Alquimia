import {
  CAPACIDADES_EJEMPLO,
  ACTIVOS_EJEMPLO,
  ATRIBUTOS_EJEMPLO,
  PROVEEDORES_EJEMPLO,
  CLIENTES_EJEMPLO,
  CONEXOS_EJEMPLO,
  COMPLEMENTARIOS_EJEMPLO,
} from "../fuente/modulo-2-crudo";
import type { TallerSemilla } from "@/lib/talleres/tipos";

/**
 * Los cuatro talleres del Módulo 2, como datos.
 *
 * Ni un tipo de bloque nuevo: los diez que ya existían cubren el módulo
 * entero. Esa era la prueba del modelo de contenido —si un taller no
 * cabía, tocaba agregar un tipo— y la pasó.
 */

const t1: TallerSemilla = {
  numero: 1,
  slug: "cadena-productiva",
  corto: "Cadena productiva",
  titulo: "¿Quién está antes y quién después de tu empresa?",
  lead:
    "Diseña tu propia cadena: proveedores y clientes, directos e indirectos, más los " +
    "competidores y los productos o servicios complementarios. La cadena es donde " +
    "aparecen las oportunidades de negocio que hoy no ves.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "hacia-atras",
        titulo: "Encadenamiento hacia atrás",
        bloques: [
          {
            tipo: "nota",
            id: "aviso-atras",
            cuerpo:
              "Empieza por lo que **entra** a tu empresa. Incluye a los proveedores de tus " +
              "proveedores cuando los conozcas: ahí suele estar el margen que otro se lleva.",
          },
          {
            tipo: "chips_agregables",
            id: "proveedores",
            etiqueta: "Proveedores y eslabones hacia atrás",
            textoAgregar: "+ Agregar proveedor",
            descripcion: "Agrega uno por uno. Toca un ejemplo para insertarlo y edítalo después.",
            sugerencias: PROVEEDORES_EJEMPLO,
            esperadas: 5,
          },
          {
            tipo: "lista_numerada",
            id: "oport-atras",
            etiqueta: "Oportunidades de negocio hacia atrás",
            lineas: 3,
            marcador: "Ej.: producir un insumo que hoy compras",
            requerido: false,
          },
        ],
      },
      {
        id: "mi-empresa",
        titulo: "Tu empresa",
        bloques: [
          {
            tipo: "texto",
            id: "en-que-negocio",
            etiqueta: "¿En qué negocio estamos?",
            marcador:
              "No el producto: el negocio. Una panadería puede estar en el negocio del " +
              "desayuno, no en el del pan.",
          },
          {
            tipo: "texto",
            id: "producto-terminado",
            etiqueta: "Producto o servicio terminado que entregas",
            marcador: "Lo que sale de tu empresa hacia el siguiente eslabón",
          },
        ],
      },
      {
        id: "hacia-adelante",
        titulo: "Encadenamiento hacia adelante",
        bloques: [
          {
            tipo: "chips_agregables",
            id: "clientes",
            etiqueta: "Clientes directos e indirectos",
            textoAgregar: "+ Agregar cliente",
            descripcion: "Quién te compra, y quién le compra a quien te compra.",
            sugerencias: CLIENTES_EJEMPLO,
            esperadas: 4,
          },
          {
            tipo: "chips_agregables",
            id: "complementarios",
            etiqueta: "Productos y servicios complementarios",
            textoAgregar: "+ Agregar complementario",
            descripcion: "Lo que el cliente consume junto a lo tuyo, aunque no lo vendas tú.",
            sugerencias: COMPLEMENTARIOS_EJEMPLO,
            esperadas: 3,
          },
          {
            tipo: "lista_numerada",
            id: "oport-adelante",
            etiqueta: "Oportunidades de negocio hacia adelante",
            lineas: 3,
            marcador: "Ej.: prestar tú el servicio que hoy presta otro después de tu venta",
            requerido: false,
          },
        ],
      },
      {
        id: "entorno-cadena",
        titulo: "Competencia y demanda",
        bloques: [
          {
            tipo: "chips_agregables",
            id: "conexos",
            etiqueta: "Competidores y conexos",
            textoAgregar: "+ Agregar competidor",
            descripcion: "Quién pelea por el mismo cliente, incluidos los sustitutos.",
            sugerencias: CONEXOS_EJEMPLO,
            esperadas: 3,
          },
          {
            tipo: "texto",
            id: "demanda",
            etiqueta: "Demanda y necesidades insatisfechas",
            marcador: "¿Qué está pidiendo el mercado que hoy nadie está resolviendo bien?",
          },
        ],
      },
    ],
  },
};

const t2: TallerSemilla = {
  numero: 2,
  slug: "capacidades-activos",
  corto: "Capacidades y activos",
  titulo: "¿Qué sabes hacer mejor que los demás y con qué cuentas?",
  lead:
    "Identifica los tangibles e intangibles con los que cuenta la empresa y que le " +
    "garantizan diferenciación en el mercado. Registra solo los que consideres relevantes.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "capacidades",
        titulo: "Capacidades distintivas",
        bloques: [
          {
            tipo: "nota",
            id: "que-es-capacidad",
            cuerpo:
              "Una **capacidad** es el conocimiento, las habilidades y los procedimientos que " +
              "tiene el talento humano de la empresa y que la hacen destacable en el medio. " +
              "No es lo que tienes: es lo que sabes hacer.",
          },
          {
            tipo: "tabla",
            id: "capacidades",
            columnas: [
              { id: "nombre", titulo: "Capacidad", marcador: "Nombre" },
              {
                id: "significado",
                titulo: "Qué significa para la empresa",
                multilinea: true,
                marcador: "Por qué te hace destacable frente a los demás",
              },
            ],
            filasIniciales: 4,
            filasMinimas: 4,
            sugerencias: CAPACIDADES_EJEMPLO,
          },
        ],
      },
      {
        id: "activos",
        titulo: "Activos estratégicos",
        bloques: [
          {
            tipo: "nota",
            id: "que-es-activo",
            cuerpo:
              "Un **activo** puede ser tangible (infraestructura, tecnología, recursos) o " +
              "intangible (metodologías, innovaciones, conocimiento propio, reputación). " +
              "Es estratégico solo si te sostiene la diferencia.",
          },
          {
            tipo: "tabla",
            id: "activos",
            columnas: [
              { id: "activo", titulo: "Activo", marcador: "Tangible o intangible" },
              {
                id: "por-que",
                titulo: "Por qué es estratégico",
                multilinea: true,
                marcador: "Qué te permite hacer que otro no puede",
              },
            ],
            filasIniciales: 5,
            filasMinimas: 5,
            sugerencias: ACTIVOS_EJEMPLO,
          },
        ],
      },
    ],
  },
};

const t3: TallerSemilla = {
  numero: 3,
  slug: "atributos-de-valor",
  corto: "Atributos de valor",
  titulo: "¿Por qué te eligen a ti y no al de al lado?",
  lead:
    "Los atributos son las cualidades que el comprador valora al decidir su inclinación por " +
    "tu producto o servicio. Identifícalos y califica de 1 a 5 qué tanto los valora el " +
    "cliente, cómo estás tú, cómo está tu principal competidor y cómo está el mercado.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "atributos",
        bloques: [
          {
            tipo: "nota",
            id: "aviso-atributos",
            cuerpo:
              "Incluye también atributos que **todavía no tienes** pero que necesitas crear. " +
              "Las cuatro notas van de 1 a 5: **Importancia** es cuánto lo valora el " +
              "cliente; **Mi empresa**, **Competidor** y **Mercado**, qué tan bien lo " +
              "cumple cada uno. La comparación es la que te dice cuáles **crear**, " +
              "cuáles **fortalecer** y cuáles solo **mantener**.",
          },
          {
            tipo: "tabla",
            id: "atributos",
            columnas: [
              { id: "atributo", titulo: "Atributo", marcador: "Nombre" },
              {
                id: "descripcion",
                titulo: "Descripción",
                multilinea: true,
                marcador: "Qué valora exactamente el cliente",
              },
              { id: "importancia", titulo: "Importancia", numerica: true, marcador: "1-5" },
              { id: "mi-empresa", titulo: "Mi empresa", numerica: true, marcador: "1-5" },
              { id: "competidor", titulo: "Competidor", numerica: true, marcador: "1-5" },
              { id: "mercado", titulo: "Mercado", numerica: true, marcador: "1-5" },
            ],
            filasIniciales: 3,
            filasMinimas: 3,
            sugerencias: ATRIBUTOS_EJEMPLO,
          },
        ],
      },
    ],
  },
};

const t4: TallerSemilla = {
  numero: 4,
  slug: "definiciones-estrategicas",
  corto: "Definiciones estratégicas",
  titulo: "¿Para qué existe tu empresa y para quién?",
  lead:
    "Una estrategia clara tiene foco: declaraciones únicas de valor que te diferencian, la " +
    "necesidad que satisfaces y hasta dónde llegas. Cuatro frases, no cuatro páginas.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "declaraciones",
        bloques: [
          {
            tipo: "nota",
            id: "ejemplos-proposito",
            cuerpo:
              "Tres propósitos reales, para calibrar el tamaño de la frase. " +
              "**Disney:** «Crear felicidad». " +
              "**Samsung:** «Dedicar nuestro talento y tecnología a crear productos y " +
              "servicios que contribuyan a una mejor sociedad». " +
              "**Crepes & Waffles:** «Un arte que transforma el alimento en amor y alegría, " +
              "nutre el alma y el cuerpo, cautiva paladares, conquista corazones».",
          },
          {
            tipo: "texto",
            id: "proposito",
            etiqueta: "1 · Propósito de la empresa",
            marcador: "El sentido o la esencia por la que la empresa existe",
          },
          {
            tipo: "texto",
            id: "propuesta-valor",
            etiqueta: "2 · Propuesta de valor",
            marcador:
              "Una sola frase que integre los atributos que te diferencian en el mercado",
          },
          {
            tipo: "texto",
            id: "cliente-objetivo",
            etiqueta: "3 · Cliente objetivo",
            marcador: "Describe las características del cliente al que le apuntas",
          },
          {
            tipo: "texto",
            id: "alcance-geografico",
            etiqueta: "4 · Alcance geográfico",
            marcador: "Local, regional, nacional o internacional — y hasta dónde, en concreto",
            multilinea: false,
          },
        ],
      },
    ],
  },
};

export const MODULO_2 = {
  numero: 2,
  slug: "direccion-estrategica",
  pregunta: "¿Dónde?",
  titulo: "Dirección estratégica",
  lead: "¿Quiénes somos, con qué contamos y qué declaramos ante el mercado?",
  talleres: [t1, t2, t3, t4] as TallerSemilla[],
};
