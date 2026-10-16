/**
 * Material del programa Fábrica Lean, tal como viene de la conferencia.
 *
 * Fuente: «Lean Manufacturing y su Impacto en la Industria 5.0», conferencia
 * ejecutiva de 32 láminas. Los ocho desperdicios, las trece herramientas, los
 * siete indicadores, los tres pilares, las ocho tecnologías habilitantes, el
 * roadmap de 12·18·24 meses, ADKAR y Kotter salen de ahí literalmente; las
 * seis M del Ishikawa y las cinco S desglosadas son canon Lean que la
 * conferencia nombra sin desarrollar.
 *
 * Está aparte del armado de los talleres por la misma razón que
 * `modulo-1-crudo.ts`: el contenido se revisa contra la presentación sin
 * leer una sola línea de estructura, y la estructura se cambia sin volver a
 * teclear el contenido.
 *
 * Una advertencia sobre la propiedad del material: la conferencia es de
 * ALQUIMIA y las herramientas Lean son dominio público —Ohno, Womack, Shingo,
 * Covey—, así que este programa se puede vender a cualquier empresa de
 * manufactura. No tiene nada de la Cámara de Comercio del Aburrá Sur y no se
 * puede presentar como parte del programa MEGA.
 */

/**
 * Baja la primera letra y deja el resto intacto.
 *
 * Existe porque el `toLowerCase()` que encadenaba estas frases en una nota
 * escribía «el oee» y «sensores iot»: las siglas del material son parte del
 * contenido y no sobreviven a un minusculizado completo.
 */
export const minusculaInicial = (s: string): string =>
  s.charAt(0).toLowerCase() + s.slice(1);

export type Desperdicio = {
  id: string;
  titulo: string;
  /** Qué es, en una línea. */
  que: string;
  /** El ejemplo de la lámina: hace reconocible el desperdicio. */
  ejemplo: string;
  /** Con qué herramienta se ataca. */
  ataque: string;
};

/** Los ocho Muda, en el orden de la conferencia. */
export const DESPERDICIOS: Desperdicio[] = [
  {
    id: "sobreproduccion",
    titulo: "1 · Sobreproducción",
    que: "Producir más, antes o más rápido de lo que el siguiente proceso requiere",
    ejemplo: "Fabricar un lote grande «por si acaso», sin pedido confirmado",
    ataque: "Producción pull, Heijunka y lotes más pequeños",
  },
  {
    id: "esperas",
    titulo: "2 · Esperas",
    que: "Tiempo en que personas, máquinas o material están inactivos",
    ejemplo: "Un operario esperando piezas que llegan tarde de la estación anterior",
    ataque: "Balanceo de línea y sincronización con takt time",
  },
  {
    id: "transporte",
    titulo: "3 · Transporte",
    que: "Movimiento de materiales que no transforma el producto",
    ejemplo: "Trasladar piezas entre bodegas distantes varias veces",
    ataque: "Rediseño del layout en célula",
  },
  {
    id: "inventarios",
    titulo: "4 · Inventarios",
    que: "Exceso de materia prima, producto en proceso o producto terminado",
    ejemplo: "Bodegas llenas de producto que inmoviliza capital de trabajo",
    ataque: "Kanban y reducción del tamaño de lote",
  },
  {
    id: "movimientos",
    titulo: "5 · Movimientos",
    que: "Desplazamientos de personas que no agregan valor",
    ejemplo: "Un operario caminando repetidamente a buscar herramientas",
    ataque: "Diseño ergonómico del puesto de trabajo, 5S",
  },
  {
    id: "defectos",
    titulo: "6 · Defectos",
    que: "Retrabajo, reparación y material perdido",
    ejemplo: "Un lote que hay que volver a hacer porque salió fuera de medida",
    ataque: "Poka-Yoke y Jidoka: detener el defecto en la fuente",
  },
  {
    id: "sobreprocesamiento",
    titulo: "7 · Sobreprocesamiento",
    que: "Hacer más de lo que el cliente pide",
    ejemplo: "Un acabado de más que el cliente no nota y no paga",
    ataque: "Definir el valor desde el cliente, no desde el taller",
  },
  {
    id: "talento",
    titulo: "8 · Talento desaprovechado",
    que: "No usar el conocimiento de quien hace el trabajo",
    ejemplo: "El operario sabe por qué falla la máquina y nadie se lo ha preguntado",
    ataque: "Kaizen con participación y Gemba",
  },
];

export type Herramienta = {
  id: string;
  titulo: string;
  que: string;
  cuando: string;
  beneficio: string;
};

/** Las trece herramientas de la caja Lean, con el texto de la conferencia. */
export const HERRAMIENTAS: Herramienta[] = [
  {
    id: "cinco-s",
    titulo: "5S",
    que: "Clasificar, ordenar, limpiar, estandarizar y disciplina",
    cuando: "Como base, antes de cualquier otra iniciativa Lean",
    beneficio: "Reduce búsquedas, accidentes y tiempo perdido",
  },
  {
    id: "kaizen",
    titulo: "Kaizen",
    que: "Mejora continua e incremental con participación de todo el equipo",
    cuando: "De forma permanente, en eventos estructurados o diarios",
    beneficio: "Cultura de mejora sostenida y de bajo costo",
  },
  {
    id: "kanban",
    titulo: "Kanban",
    que: "Sistema visual de señales para controlar el flujo y el inventario",
    cuando: "Cuando se requiere producción pull, sin sobreproducir",
    beneficio: "Reduce inventario y sincroniza procesos",
  },
  {
    id: "smed",
    titulo: "SMED",
    que: "Reducir drásticamente el tiempo de cambio de referencia",
    cuando: "En líneas con alta variedad y cambios frecuentes",
    beneficio: "Más flexibilidad y lotes mínimos rentables más pequeños",
  },
  {
    id: "tpm",
    titulo: "TPM",
    que: "Mantenimiento productivo total: el operario cuida su máquina",
    cuando: "Cuando las fallas de equipo golpean el OEE de forma recurrente",
    beneficio: "Menos paros no planeados y más vida útil del activo",
  },
  {
    id: "poka-yoke",
    titulo: "Poka-Yoke",
    que: "Mecanismos que hacen físicamente imposible el error",
    cuando: "En puntos del proceso con alto riesgo de error humano",
    beneficio: "Elimina el defecto en la fuente, no al final de la línea",
  },
  {
    id: "jidoka",
    titulo: "Jidoka",
    que: "Automatización con inteligencia: la máquina se detiene ante una anomalía",
    cuando: "En procesos automatizados o semiautomatizados críticos",
    beneficio: "Evita que el defecto avance a las siguientes estaciones",
  },
  {
    id: "heijunka",
    titulo: "Heijunka",
    que: "Nivelación de la producción para evitar picos y valles",
    cuando: "Cuando la demanda es variable y la capacidad es fija",
    beneficio: "Menos sobreproducción, menos esperas, menos estrés en la línea",
  },
  {
    id: "andon",
    titulo: "Andon",
    que: "Señal visual o sonora que avisa una anomalía en tiempo real",
    cuando: "En líneas donde la rapidez de reacción es crítica",
    beneficio: "Acelera la respuesta ante problemas",
  },
  {
    id: "vsm",
    titulo: "Value Stream Mapping",
    que: "Mapa del flujo de material e información de principio a fin",
    cuando: "Al iniciar cualquier proyecto de mejora de proceso",
    beneficio: "Revela el desperdicio escondido en el flujo completo",
  },
  {
    id: "a3",
    titulo: "A3",
    que: "Reporte de una página para estructurar la solución de un problema",
    cuando: "Para documentar y comunicar mejoras de forma estándar",
    beneficio: "Obliga a pensar con rigor y en poco espacio",
  },
  {
    id: "hoshin",
    titulo: "Hoshin Kanri",
    que: "Despliegue de la estrategia desde la dirección hasta el piso de planta",
    cuando: "En la planeación anual de objetivos",
    beneficio: "Conecta la estrategia con la ejecución diaria",
  },
  {
    id: "gemba",
    titulo: "Gemba",
    que: "«El lugar real»: ir a observar el proceso donde ocurre el trabajo",
    cuando: "Antes de decidir sobre un problema operativo",
    beneficio: "Decisiones basadas en hechos, no en suposiciones",
  },
];

/** Los siete indicadores base de la lámina de medición. */
export const INDICADORES = [
  {
    id: "oee",
    titulo: "OEE",
    que: "Efectividad global del equipo: disponibilidad × rendimiento × calidad",
  },
  { id: "lead-time", titulo: "Lead time", que: "Del pedido a la entrega, con espera incluida" },
  { id: "cycle-time", titulo: "Cycle time", que: "Lo que tarda producir una unidad en la estación" },
  { id: "takt-time", titulo: "Takt time", que: "El ritmo al que el cliente pide producto" },
  { id: "scrap", titulo: "Scrap", que: "Porcentaje de material que se desecha" },
  { id: "mtbf", titulo: "MTBF / MTTR", que: "Tiempo medio entre fallas y de reparación" },
  { id: "otif", titulo: "OTIF", que: "Entregas completas y a tiempo (on time in full)" },
] as const;

/** Las cinco S, desglosadas para poder auditarlas. */
export const CINCO_S = [
  {
    id: "seiri",
    titulo: "Seiri · clasificar",
    descripcion: "Lo que no se usa, sale del puesto de trabajo",
  },
  {
    id: "seiton",
    titulo: "Seiton · ordenar",
    descripcion: "Cada cosa tiene un sitio marcado y se devuelve a él",
  },
  {
    id: "seiso",
    titulo: "Seiso · limpiar",
    descripcion: "Limpiar es inspeccionar: la fuga se ve con la máquina limpia",
  },
  {
    id: "seiketsu",
    titulo: "Seiketsu · estandarizar",
    descripcion: "La forma correcta está escrita y a la vista, no sabida",
  },
  {
    id: "shitsuke",
    titulo: "Shitsuke · disciplina",
    descripcion: "Hay auditoría periódica con responsable y fecha",
  },
] as const;

/** Los tres pilares de la Industria 5.0, según la Comisión Europea. */
export const PILARES = [
  {
    id: "personas",
    titulo: "Centrado en las personas",
    descripcion:
      "La tecnología se diseña alrededor de las capacidades y el bienestar de quien "
      + "trabaja, no al revés",
  },
  {
    id: "resiliencia",
    titulo: "Resiliencia",
    descripcion:
      "Capacidad de anticipar una disrupción, resistirla y recuperarse rápido",
  },
  {
    id: "sostenibilidad",
    titulo: "Sostenibilidad",
    descripcion:
      "Producir dentro de los límites del entorno: energía, agua, emisiones y "
      + "economía circular",
  },
] as const;

/** Las ocho tecnologías habilitantes de la lámina «Lean 5.0». */
export const TECNOLOGIAS = [
  { id: "ia", titulo: "Inteligencia artificial", descripcion: "Detección de patrones y decisiones asistidas" },
  { id: "ml", titulo: "Machine learning", descripcion: "Modelos que mejoran con más datos" },
  { id: "iot", titulo: "Internet de las cosas", descripcion: "Sensores conectados en tiempo real" },
  { id: "datos", titulo: "Analítica de datos", descripcion: "Decidir sobre datos y no sobre impresiones" },
  { id: "cobots", titulo: "Robots colaborativos", descripcion: "Cobots que trabajan junto a las personas" },
  { id: "gemelo", titulo: "Gemelos digitales", descripcion: "Simular el proceso antes de tocarlo" },
  { id: "nube", titulo: "Nube y cómputo en el borde", descripcion: "Procesamiento centralizado y local" },
  { id: "trazabilidad", titulo: "Trazabilidad digital", descripcion: "Seguir el lote de principio a fin" },
] as const;

/**
 * Las tres fases del roadmap de la conferencia, con sus hitos.
 *
 * El orden no es negociable y la lámina lo dice en una frase que vale todo el
 * programa: «la digitalización sin disciplina Lean solo automatiza el
 * desperdicio existente».
 */
export const FASES = [
  {
    id: "fundamentos",
    titulo: "0-12 meses · fundamentos Lean",
    hitos: [
      "Diagnóstico y VSM inicial",
      "Priorización de los desperdicios críticos",
      "5S, Kaizen y estandarización",
      "Indicadores base en operación (OEE, lead time)",
    ],
  },
  {
    id: "digitalizacion",
    titulo: "12-18 meses · digitalización",
    hitos: [
      "Kanban digital y tableros",
      "Sensores IoT en los equipos críticos",
      "Piloto de mantenimiento predictivo",
      "Gemelo digital de una línea piloto",
    ],
  },
  {
    id: "industria-5",
    titulo: "18-24 meses · IA e Industria 5.0",
    hitos: [
      "IA aplicada a calidad, a escala",
      "Cobots en tareas de alta fatiga",
      "Cultura centrada en las personas, consolidada",
      "Métricas ambientales en el tablero",
    ],
  },
] as const;

/** ADKAR: el cambio visto persona por persona. */
export const ADKAR = [
  { id: "conciencia", texto: "Entiende por qué hay que cambiar" },
  { id: "deseo", texto: "Quiere que el cambio ocurra" },
  { id: "conocimiento", texto: "Sabe cómo hacerlo distinto" },
  { id: "habilidad", texto: "Puede hacerlo en su puesto, no solo en teoría" },
  { id: "refuerzo", texto: "Algo sostiene el cambio cuando nadie mira" },
] as const;

/** Los grupos sobre los que se diagnostica el cambio. */
export const GRUPOS_CAMBIO = [
  { id: "direccion", titulo: "Dirección" },
  { id: "mandos", titulo: "Mandos medios y supervisión" },
  { id: "piso", titulo: "Piso de planta" },
] as const;

/** Las seis M del diagrama de Ishikawa. */
export const SEIS_M = [
  { id: "mano-de-obra", titulo: "Mano de obra", subtitulo: "Habilidad, carga, rotación, turno" },
  { id: "maquina", titulo: "Máquina", subtitulo: "Desgaste, calibración, mantenimiento" },
  { id: "metodo", titulo: "Método", subtitulo: "Secuencia, parámetros, instrucción" },
  { id: "material", titulo: "Material", subtitulo: "Proveedor, lote, almacenamiento" },
  { id: "medio", titulo: "Medio", subtitulo: "Temperatura, humedad, luz, orden" },
  { id: "medicion", titulo: "Medición", subtitulo: "Instrumento, criterio, quien mide" },
] as const;

/** Casos de la lámina «de Nagoya a Medellín», para la referenciación. */
export const CASOS = [
  "Toyota · mejora continua sostenida por décadas",
  "Bosch · plantas conectadas con IoT y mantenimiento predictivo",
  "Siemens · gemelos digitales que acortan la puesta en marcha",
  "Nestlé · sistema de manufactura global con foco en calidad",
  "Nutresa · nivelación de producción en alimentos frescos",
  "Corona · círculos de calidad y VSM en cerámica",
  "Haceb · TPM autónomo y menos paros no planeados",
  "Postobón · SMED en líneas de embotellado",
  "Argos · reducción de huella de carbono en cemento",
] as const;
