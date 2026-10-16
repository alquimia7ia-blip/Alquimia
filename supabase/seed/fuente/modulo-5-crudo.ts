/**
 * Áreas del diagnóstico de madurez del Módulo 5.
 *
 * A diferencia de los módulos 1 a 4, este contenido **no sale de una
 * presentación de Esumer**: es material de ALQUIMIA, construido para
 * profundizar el programa. Eso importa por dos razones: se puede reutilizar
 * con cualquier otra cámara sin discutir propiedad intelectual, y no se
 * puede presentar como contenido del programa MEGA.
 *
 * Las afirmaciones están escritas para que una empresa de ocho personas
 * pueda responderlas con evidencia. «¿Existe un CRM?» no sirve: la respuesta
 * honesta sería no, y no diría nada. «¿Se sabe en qué va cada negocio
 * abierto?» sí, porque se puede contestar mirando un cuaderno.
 *
 * Tres afirmaciones por área y no diez: con siete áreas, diez serían setenta
 * clics y el taller no se terminaría. Son las tres que más separan a una
 * empresa que controla el área de una que improvisa en ella.
 */

export type AreaDiagnostico = {
  id: string;
  titulo: string;
  afirmaciones: { id: string; texto: string }[];
};

export const AREAS: AreaDiagnostico[] = [
  {
    id: "comercial",
    titulo: "Comercial · vender",
    afirmaciones: [
      { id: "metas", texto: "Hay una meta de venta por persona y por periodo, y se revisa" },
      { id: "embudo", texto: "Se sabe en qué va cada negocio abierto y quién responde por él" },
      { id: "costo", texto: "Se sabe cuánto cuesta conseguir un cliente nuevo" },
    ],
  },
  {
    id: "mercadeo",
    titulo: "Mercadeo · que nos conozcan",
    afirmaciones: [
      { id: "promesa", texto: "Hay una promesa escrita y es la misma en todos los canales" },
      { id: "origen", texto: "Se sabe por dónde llegaron los clientes del último trimestre" },
      { id: "plan", texto: "Hay un plan de contenidos o de pauta con presupuesto asignado" },
    ],
  },
  {
    id: "operaciones",
    titulo: "Operaciones · entregar",
    afirmaciones: [
      { id: "escrito", texto: "Los pasos del proceso principal están escritos, no solo sabidos" },
      { id: "tiempos", texto: "Se mide el tiempo de entrega y cuántos trabajos hay que rehacer" },
      { id: "calidad", texto: "Hay una revisión de calidad antes de que el cliente reciba" },
    ],
  },
  {
    id: "finanzas",
    titulo: "Finanzas · que la plata alcance",
    afirmaciones: [
      { id: "separadas", texto: "Las cuentas de la empresa y las del dueño están separadas" },
      { id: "margen", texto: "Se conoce el margen de cada producto o servicio, no solo el total" },
      { id: "caja", texto: "Se proyecta la caja de los próximos tres meses" },
    ],
  },
  {
    id: "talento",
    titulo: "Talento · la gente",
    afirmaciones: [
      { id: "cargos", texto: "Cada persona sabe por escrito de qué responde" },
      { id: "induccion", texto: "Quien entra recibe una inducción, no aprende mirando" },
      { id: "desempeno", texto: "El desempeño se conversa en fechas fijas, no cuando hay problema" },
    ],
  },
  {
    id: "tecnologia",
    titulo: "Tecnología y datos",
    afirmaciones: [
      { id: "sistema", texto: "La información del negocio vive en un sistema, no en cabezas y cuadernos" },
      { id: "respaldo", texto: "Hay copia de seguridad de lo que no se puede perder" },
      { id: "decidir", texto: "Se mira algún tablero o reporte antes de decidir" },
    ],
  },
  {
    id: "cumplimiento",
    titulo: "Cumplimiento · lo legal",
    afirmaciones: [
      { id: "sector", texto: "Los requisitos legales del sector están al día y alguien responde por ellos" },
      { id: "contratos", texto: "Hay contrato escrito con los clientes y proveedores principales" },
      { id: "datos", texto: "Se pide autorización para tratar los datos de los clientes (Ley 1581)" },
    ],
  },
];

/** Lo que el ERIC de océano azul invita a hacer con cada atributo. */
export const ERIC = [
  {
    id: "eliminar",
    titulo: "Eliminar",
    subtitulo: "Lo que el sector da por obligatorio y al cliente no le importa",
  },
  {
    id: "reducir",
    titulo: "Reducir",
    subtitulo: "Donde competimos de más y no nos lo pagan",
  },
  {
    id: "incrementar",
    titulo: "Incrementar",
    subtitulo: "Donde el cliente valora mucho y estamos por debajo",
  },
  {
    id: "crear",
    titulo: "Crear",
    subtitulo: "Lo que nadie en el sector ofrece todavía",
  },
] as const;
