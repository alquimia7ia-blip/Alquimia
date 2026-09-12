import {
  TENDENCIAS,
  PESTEL,
  FUERZAS,
  IND_SUGERIDOS,
  VALORES_SUGERIDOS,
  PROC_PROD,
  PROC_SOP,
} from "../fuente/modulo-1-crudo";
import type { TallerSemilla } from "@/lib/talleres/tipos";

/**
 * Los once talleres del Módulo 1, como datos.
 *
 * Cada taller del prototipo era una función `render()`. Aquí es un
 * documento de bloques: publicar el Módulo 2 será insertar filas.
 */

const t1: TallerSemilla = {
  numero: 1,
  slug: "grandes-tendencias",
  corto: "Grandes tendencias",
  titulo: "¿Qué olas del entorno van a mover tu empresa?",
  lead:
    "Marca el grado de relación e impacto que cada gran tendencia puede tener sobre el " +
    "modelo de operación de la empresa. Después baja al tablero PESTEL y califica cada " +
    "fuerza del entorno.",
  camposMinimos: TENDENCIAS.length + PESTEL.reduce((s, p) => s + p[3].length, 0),
  definicion: {
    version: 1,
    secciones: [
      {
        id: "tendencias",
        bloques: [
          {
            tipo: "nota",
            id: "aviso-tendencias",
            cuerpo:
              "Puedes **agregar tendencias propias** de tu sector al final de la lista. " +
              "Si una tendencia no toca tu negocio, márcala como **No aplica**: " +
              "descartar también es analizar.",
          },
          {
            tipo: "fichas_escala",
            id: "tend",
            escala: "impacto_tendencia",
            permiteAgregar: true,
            textoAgregar: "+ Agregar una tendencia de mi sector",
            campoNota: {
              etiqueta: "¿Cómo se traduce esta tendencia en tu operación?",
              requerido: false,
            },
            items: TENDENCIAS.map(([id, titulo, descripcion]) => ({
              id,
              titulo,
              descripcion,
            })),
          },
        ],
      },
      {
        id: "pestel",
        titulo: "Tablero PESTEL · cómo altera cada fuerza tu operación",
        lead:
          "Seis frentes del entorno, con los hechos que el módulo pone sobre la mesa. " +
          "Un clic por fila.",
        bloques: [
          {
            tipo: "matriz_escala",
            id: "pestel",
            escala: "efecto",
            grupos: PESTEL.map(([id, titulo, , items]) => ({
              id,
              titulo,
              filas: items.map((texto, i) => ({ id: String(i), texto })),
            })),
          },
        ],
      },
    ],
  },
};

const t2: TallerSemilla = {
  numero: 2,
  slug: "cinco-fuerzas",
  corto: "Cinco fuerzas",
  titulo: "¿Quién manda en la rentabilidad de tu mercado?",
  lead:
    "Ordena las cinco fuerzas de 1 a 5 según su importancia para tu empresa —1 la más " +
    "importante— y califica el efecto que cada una tiene sobre tu rentabilidad.",
  camposMinimos: FUERZAS.length * 2,
  definicion: {
    version: 1,
    secciones: [
      {
        id: "fuerzas",
        bloques: [
          {
            tipo: "ranking_escala",
            id: "fuerzas",
            escala: "efecto_rentabilidad",
            campoNota: {
              etiqueta:
                "¿Por qué? Nombra las variables concretas que miden esta fuerza en tu negocio.",
              requerido: false,
            },
            items: FUERZAS.map(([id, titulo, descripcion, ayuda]) => ({
              id,
              titulo,
              descripcion,
              detalle: { titulo: "Variables que ayudan a medirla", cuerpo: ayuda },
            })),
          },
        ],
      },
    ],
  },
};

const t3: TallerSemilla = {
  numero: 3,
  slug: "rasgos-del-mercado",
  corto: "Rasgos del mercado",
  titulo: "¿Cómo es, en cifras, el mercado donde estás?",
  lead:
    "Describe los rasgos del mercado en el que participa la empresa: tamaño en ventas o " +
    "volúmenes, competidores, normatividad y nivel de tecnificación.",
  camposMinimos: 5,
  definicion: {
    version: 1,
    secciones: [
      {
        id: "mercado",
        bloques: [
          {
            tipo: "nota",
            id: "aviso-mercado",
            cuerpo:
              "Busca cifras de magnitud —una **estimación educada** basta— en revistas " +
              "especializadas, gremios, entrevistas o trabajos de grado: pesos o unidades, " +
              "por segmento de precio, por geografía y por canal. **Asigna a alguien del " +
              "área comercial** la tarea de construir y actualizar esta información.",
          },
          {
            tipo: "lista_numerada",
            id: "rasgos",
            lineas: 5,
            marcador:
              "Un rasgo del mercado por línea: tamaño, competidores, normatividad, tecnificación…",
          },
        ],
      },
    ],
  },
};

const t4: TallerSemilla = {
  numero: 4,
  slug: "perfil-del-cliente",
  corto: "Perfil del cliente",
  titulo: "¿Qué mueve a la gente que te compra?",
  lead:
    "Acuerden los rasgos del perfil de sus clientes: por un lado los hábitos, por otro lo " +
    "que realmente los motiva a comprar.",
  camposMinimos: 10,
  definicion: {
    version: 1,
    secciones: [
      {
        id: "cliente",
        bloques: [
          {
            tipo: "lista_numerada",
            id: "habitos",
            etiqueta: "Hábitos de los clientes",
            lineas: 5,
            marcador: "Frecuencia, ocasión, canal, forma de pago…",
          },
          {
            tipo: "lista_numerada",
            id: "motivadores",
            etiqueta: "Motivadores de compra",
            lineas: 5,
            marcador: "Precio, cercanía, confianza, urgencia, estatus…",
          },
          {
            tipo: "nota",
            id: "aviso-segmentos",
            cuerpo:
              "Piensa el mercado en cuatro grupos: **clientes actuales**; **no clientes " +
              "cercanos posibles**; **no clientes que te consideraron y no te eligieron**; y " +
              "**no clientes que no te han visto**. Define qué datos querrías tener en la " +
              "hoja de vida o CRM de un cliente.",
          },
        ],
      },
    ],
  },
};

const t5: TallerSemilla = {
  numero: 5,
  slug: "competencia",
  corto: "Competencia",
  titulo: "¿Qué le estás aprendiendo a tu competencia?",
  lead:
    "Conoce en detalle a los competidores relevantes: dos fortalezas, dos debilidades, el " +
    "perfil de su cliente y sus atributos diferenciales.",
  camposMinimos: 15,
  definicion: {
    version: 1,
    secciones: [
      {
        id: "competidores",
        bloques: [
          {
            tipo: "tabla",
            id: "competidores",
            filasIniciales: 3,
            filasMinimas: 3,
            columnas: [
              { id: "nombre", titulo: "Competidor", marcador: "Nombre" },
              { id: "fortalezas", titulo: "2 fortalezas", multilinea: true },
              { id: "debilidades", titulo: "2 debilidades", multilinea: true },
              { id: "perfil", titulo: "Perfil de su cliente", multilinea: true },
              { id: "atributos", titulo: "2 atributos diferenciales", multilinea: true },
            ],
          },
        ],
      },
    ],
  },
};

const t6: TallerSemilla = {
  numero: 6,
  slug: "atributos-del-sector",
  corto: "Atributos del sector",
  titulo: "¿Qué pesa cuando alguien decide comprar?",
  lead:
    "Identifica los atributos —las características distintivas que los clientes contemplan " +
    "y valoran al momento de decidir la compra en tu sector.",
  camposMinimos: 5,
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
              "Ejemplos de atributos: **precio, servicio, calidad, referencias, garantía, " +
              "cercanía, plazo de entrega, financiación**. Escribe los de tu sector, no los genéricos.",
          },
          {
            tipo: "lista_numerada",
            id: "atributos",
            lineas: 5,
            marcador: "Un atributo por línea",
          },
        ],
      },
    ],
  },
};

const t7: TallerSemilla = {
  numero: 7,
  slug: "procesos-clave",
  corto: "Procesos clave",
  titulo: "¿Cuáles son los procesos que sostienen la empresa?",
  lead:
    "Separa los procesos productivos —los que crean y entregan valor al cliente— de los " +
    "procesos de soporte que hacen posible la operación.",
  camposMinimos: 2,
  definicion: {
    version: 1,
    secciones: [
      {
        id: "procesos",
        bloques: [
          {
            tipo: "chips_agregables",
            id: "productivos",
            etiqueta: "Procesos productivos",
            textoAgregar: "+ Agregar proceso",
            descripcion: "La cadena que va del cliente al producto entregado.",
            sugerencias: PROC_PROD,
            esperadas: 3,
          },
          {
            tipo: "chips_agregables",
            id: "soporte",
            etiqueta: "Procesos de soporte",
            textoAgregar: "+ Agregar proceso",
            descripcion: "Lo que sostiene la operación por detrás.",
            sugerencias: PROC_SOP,
            esperadas: 3,
          },
          {
            tipo: "nota",
            id: "aviso-procesos",
            cuerpo:
              "Apunta a **al menos tres procesos por grupo**. Si un proceso no tiene un " +
              "responsable con nombre propio, todavía no es un proceso.",
          },
        ],
      },
    ],
  },
};

const anioActual = new Date().getFullYear();

const t8: TallerSemilla = {
  numero: 8,
  slug: "indicadores",
  corto: "Indicadores",
  titulo: "¿Con qué números sabes si vas bien?",
  lead:
    "Registra los datos clave con los que monitoreas los resultados de la empresa y su " +
    "evolución en los últimos tres años.",
  camposMinimos: 12,
  definicion: {
    version: 1,
    secciones: [
      {
        id: "indicadores",
        bloques: [
          {
            tipo: "tabla",
            id: "indicadores",
            filasIniciales: 3,
            filasMinimas: 3,
            sugerencias: IND_SUGERIDOS,
            columnas: [
              { id: "nombre", titulo: "Indicador", marcador: "Nombre del indicador" },
              { id: "a1", titulo: "Año 1", numerica: true, marcador: "—" },
              { id: "a2", titulo: "Año 2", numerica: true, marcador: "—" },
              { id: "a3", titulo: "Año 3", numerica: true, marcador: "—" },
            ],
            columnasEditables: [
              { id: "a1", valorPorDefecto: String(anioActual - 3) },
              { id: "a2", valorPorDefecto: String(anioActual - 2) },
              { id: "a3", valorPorDefecto: String(anioActual - 1) },
            ],
          },
        ],
      },
    ],
  },
};

const t9: TallerSemilla = {
  numero: 9,
  slug: "hitos",
  corto: "Hitos",
  titulo: "¿Qué decisiones marcaron tu historia?",
  lead:
    "Registra cronológicamente los hechos más relevantes: las decisiones, situaciones " +
    "críticas o cambios que definieron a la empresa.",
  camposMinimos: 10,
  definicion: {
    version: 1,
    secciones: [
      {
        id: "hitos",
        bloques: [
          {
            tipo: "nota",
            id: "aviso-hitos",
            cuerpo:
              "Ejemplos: **2001** se creó la empresa · **2005** se abrió una nueva línea de " +
              "producto · **2016** ruptura con un socio · **2020** la pandemia del COVID-19.",
          },
          {
            tipo: "linea_tiempo",
            id: "hitos",
            filasIniciales: 5,
            filasMinimas: 5,
            marcadorAnio: "Año",
            marcadorHecho: "¿Qué pasó y qué cambió a partir de ahí?",
          },
        ],
      },
    ],
  },
};

const t10: TallerSemilla = {
  numero: 10,
  slug: "valores",
  corto: "Valores",
  titulo: "¿Cuál es el ADN que te hace irrepetible?",
  lead:
    "Elige tres o cuatro valores por los que se destacará la empresa. Las personas que " +
    "trabajan allí deben respetarlos y destacarse por ellos.",
  camposMinimos: 8,
  definicion: {
    version: 1,
    secciones: [
      {
        id: "valores",
        bloques: [
          {
            tipo: "tabla",
            id: "valores",
            filasIniciales: 4,
            filasMinimas: 4,
            sugerencias: VALORES_SUGERIDOS,
            columnas: [
              { id: "valor", titulo: "Valor", marcador: "Valor" },
              {
                id: "significado",
                titulo: "Qué significa exactamente dentro de la empresa",
                multilinea: true,
                marcador: "Descríbelo como una conducta observable, no como una palabra bonita.",
              },
            ],
          },
          {
            tipo: "nota",
            id: "aviso-valores",
            cuerpo:
              "Un valor sirve cuando **te obliga a decir que no** a algo rentable. Si no " +
              "descarta nada, es un adorno.",
          },
        ],
      },
    ],
  },
};

const t11: TallerSemilla = {
  numero: 11,
  slug: "dofa",
  corto: "DOFA",
  titulo: "El cierre: dentro y fuera de tu empresa",
  lead:
    "Reúne lo interno —fortalezas y debilidades— y lo externo —amenazas y oportunidades. " +
    "Todo lo que marcaste en los talleres anteriores desemboca aquí.",
  camposMinimos: 12,
  definicion: {
    version: 1,
    secciones: [
      {
        id: "dofa",
        bloques: [
          {
            tipo: "cuadrantes",
            id: "dofa",
            alimentadoPor: { oportunidad: "O", amenaza: "A" },
            cuadrantes: [
              { id: "F", titulo: "Fortalezas", subtitulo: "Internas · lo que hoy haces mejor que otros", color: "fav", lineas: 3 },
              { id: "D", titulo: "Debilidades", subtitulo: "Internas · lo que te frena por dentro", color: "des", lineas: 3 },
              { id: "O", titulo: "Oportunidades", subtitulo: "Externas · lo que el entorno te abre", color: "acento", lineas: 3 },
              { id: "A", titulo: "Amenazas", subtitulo: "Externas · lo que el entorno te puede quitar", color: "med", lineas: 3 },
            ],
          },
        ],
      },
    ],
  },
};

export const MODULO_1 = {
  numero: 1,
  slug: "donde",
  pregunta: "¿Dónde?",
  titulo: "Análisis interno y externo",
  lead: "¿Quiénes somos y en qué negocio estamos?",
  talleres: [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11] as TallerSemilla[],
};

/**
 * Los bloques del programa cuyo contenido todavía no llega.
 *
 * El Módulo 2 salió de aquí cuando llegó su presentación: ahora es
 * `supabase/seed/modulo-2`, «Dirección estratégica». Las declaraciones de
 * propósito y propuesta de valor —lo que era «¿Para qué?»— quedaron dentro
 * de ese módulo, así que los dos pendientes son estos.
 */
export const MODULOS_PENDIENTES = [
  { numero: 3, slug: "con-quien", pregunta: "¿Con quién?", titulo: "Personas, liderazgo y cultura",
    lead: "Con qué personas nos acompañaremos para desarrollar las acciones." },
  { numero: 4, slug: "como", pregunta: "¿Cómo?", titulo: "Mapa estratégico y proyectos",
    lead: "Cuáles son las acciones que nos llevarán a cumplir nuestras declaraciones." },
];
