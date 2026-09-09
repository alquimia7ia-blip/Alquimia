/**
 * Modelo de contenido de un taller.
 *
 * El prototipo tenía una función `render()` escrita a mano por taller. Con
 * 11 talleres × 4 módulos serían ~44 funciones, y el contenido de los
 * módulos 2 a 4 todavía no existe. Aquí el taller es un documento de datos:
 * publicar un módulo nuevo es insertar filas, no escribir código.
 *
 * Regla al ampliar: si un taller no encaja en los tipos de bloque que hay,
 * se agrega un tipo nuevo — nunca un parámetro más a `tabla`.
 */

/** Identificador de una opción dentro de una escala ('fav', 'neg', 'alto'). */
export type ValorEscala = string;

/**
 * Rol semántico de una opción, para alimentar bloques posteriores.
 * Marcar una tendencia como favorable la propone luego como oportunidad
 * en el DOFA, sin que el DOFA sepa nada de tendencias.
 */
export type Sugerencia = "oportunidad" | "amenaza";

/** Color de la escala; se resuelve contra los tokens CSS del tema. */
export type ColorEscala = "fav" | "med" | "des" | "na" | "acento";

export type OpcionEscala = {
  valor: ValorEscala;
  etiqueta: string;
  color: ColorEscala;
  sugiere?: Sugerencia;
};

export type Escala = {
  id: string;
  opciones: OpcionEscala[];
};

// ---------------------------------------------------------------------
// Bloques
// ---------------------------------------------------------------------

type Base = {
  /** Único dentro del taller. Es el primer segmento de cada campo_id. */
  id: string;
  /** Aviso destacado sobre el bloque. */
  ayuda?: string;
  /** Contenido plegable: las "variables que ayudan a medirla" del Taller 2. */
  detalle?: { titulo: string; cuerpo: string };
  /** Cuánto pesa cada campo del bloque en el progreso. Por defecto 1. */
  peso?: number;
  /** Si es false, los campos no cuentan al denominador. Por defecto true. */
  requerido?: boolean;
};

/** Texto fijo, sin campos. Los avisos del prototipo. */
export type BloqueNota = Base & { tipo: "nota"; cuerpo: string };

/** Un campo suelto de texto. */
export type BloqueTexto = Base & {
  tipo: "texto";
  etiqueta?: string;
  marcador?: string;
  multilinea?: boolean;
};

/** N líneas numeradas. El `lineas()` del prototipo: talleres 3, 4 y 6. */
export type BloqueListaNumerada = Base & {
  tipo: "lista_numerada";
  etiqueta?: string;
  lineas: number;
  marcador?: string;
};

/** Tarjeta con título, descripción, una escala y una nota. Taller 1. */
export type BloqueFichasEscala = Base & {
  tipo: "fichas_escala";
  escala: string;
  items: { id: string; titulo: string; descripcion?: string }[];
  /** Permite que la empresa agregue ítems propios de su sector. */
  permiteAgregar?: boolean;
  campoNota?: { etiqueta: string; requerido?: boolean };
};

/** Filas agrupadas por categoría, una escala por fila. El PESTEL. */
export type BloqueMatrizEscala = Base & {
  tipo: "matriz_escala";
  escala: string;
  grupos: {
    id: string;
    titulo: string;
    filas: { id: string; texto: string }[];
  }[];
};

/** Ranking exclusivo 1..N más una escala. Las cinco fuerzas. */
export type BloqueRankingEscala = Base & {
  tipo: "ranking_escala";
  escala: string;
  items: {
    id: string;
    titulo: string;
    descripcion?: string;
    detalle?: { titulo: string; cuerpo: string };
  }[];
  campoNota?: { etiqueta: string; requerido?: boolean };
};

export type ColumnaTabla = {
  id: string;
  titulo: string;
  multilinea?: boolean;
  numerica?: boolean;
  marcador?: string;
  /** Si es false, la columna no cuenta al progreso. Por defecto true. */
  requerida?: boolean;
};

/** Tabla de filas dinámicas. Competidores, indicadores, valores. */
export type BloqueTabla = Base & {
  tipo: "tabla";
  columnas: ColumnaTabla[];
  /** Filas creadas al abrir la bitácora por primera vez. */
  filasIniciales?: number;
  /** Piso de filas para el denominador del progreso. */
  filasMinimas?: number;
  /** Textos que se insertan de un clic en la primera columna. */
  sugerencias?: string[];
  /** Encabezados editables por la empresa: los años del Taller 8. */
  columnasEditables?: { id: string; valorPorDefecto: string }[];
};

/** Etiquetas que se agregan y se quitan. Los procesos del Taller 7. */
export type BloqueChipsAgregables = Base & {
  tipo: "chips_agregables";
  etiqueta?: string;
  descripcion?: string;
  /** Ejemplos que se insertan de un clic. No son respuestas prellenadas. */
  sugerencias?: string[];
  /** Cuántas etiquetas orientar al usuario a registrar. No afecta el progreso. */
  esperadas?: number;
};

/** Año más hecho, en orden cronológico. Los hitos del Taller 9. */
export type BloqueLineaTiempo = Base & {
  tipo: "linea_tiempo";
  filasIniciales?: number;
  filasMinimas?: number;
  marcadorAnio?: string;
  marcadorHecho?: string;
};

/** Rejilla de cuadrantes. El DOFA. */
export type BloqueCuadrantes = Base & {
  tipo: "cuadrantes";
  cuadrantes: {
    id: string;
    titulo: string;
    subtitulo?: string;
    color: ColorEscala;
    lineas: number;
  }[];
  /**
   * De dónde salen las sugerencias de un clic: recorre las respuestas del
   * módulo buscando opciones marcadas con ese rol semántico.
   * `{ oportunidad: 'O', amenaza: 'A' }` llena esos dos cuadrantes.
   */
  alimentadoPor?: Partial<Record<Sugerencia, string>>;
};

export type Bloque =
  | BloqueNota
  | BloqueTexto
  | BloqueListaNumerada
  | BloqueFichasEscala
  | BloqueMatrizEscala
  | BloqueRankingEscala
  | BloqueTabla
  | BloqueChipsAgregables
  | BloqueLineaTiempo
  | BloqueCuadrantes;

export type TipoBloque = Bloque["tipo"];

export type Seccion = {
  id: string;
  titulo?: string;
  lead?: string;
  bloques: Bloque[];
};

export type Definicion = {
  version: 1;
  secciones: Seccion[];
};

/** Un taller tal como se siembra en la tabla `talleres`. */
export type TallerSemilla = {
  numero: number;
  slug: string;
  corto: string;
  titulo: string;
  lead: string;
  definicion: Definicion;
  camposMinimos?: number;
};

// ---------------------------------------------------------------------
// Estado en memoria
// ---------------------------------------------------------------------

/** Valor de un campo tal como viaja a la columna `valor jsonb`. */
export type ValorCampo = string | string[] | null;

export type Respuesta = {
  campoId: string;
  valor: ValorCampo;
  actualizadoPor?: string | null;
  actualizadoAt?: string;
};

/** Fila dinámica viva de un bloque `tabla` o `linea_tiempo`. */
export type Fila = {
  id: string;
  bloqueId: string;
  tallerId: string;
  orden: number;
};

/** Un campo que la definición espera que exista. */
export type CampoEsperado = {
  campoId: string;
  peso: number;
  requerido: boolean;
};
