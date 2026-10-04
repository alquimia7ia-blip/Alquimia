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
 *
 * Los cuatro roles son las cuatro casillas del DOFA. Al principio solo
 * existían los dos externos, porque los únicos bloques que alimentaban algo
 * eran del entorno —tendencias, PESTEL, fuerzas—. El diagnóstico de madurez
 * por área mira hacia dentro: un área sin método es una debilidad, no una
 * amenaza, y meterla en la casilla equivocada le enseñaría el DOFA al revés
 * a quien lo está aprendiendo.
 */
export type Sugerencia = "oportunidad" | "amenaza" | "fortaleza" | "debilidad";

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
  /** Texto del botón de agregar. Por defecto, genérico. */
  textoAgregar?: string;
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
  /**
   * Añade a la celda un selector de *dato · estimación · opinión*.
   *
   * En el informe final una cifra contable y una corazonada se ven
   * exactamente igual, y sobre las dos se toman decisiones iguales. Marcar
   * el origen es la forma más barata de que la empresa —y el tutor— sepan
   * cuánto peso aguanta cada número. Nunca cuenta al progreso: es una
   * anotación, no una respuesta que se exige.
   */
  origen?: boolean;
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

/** Un criterio de la matriz de priorización. */
export type CriterioPriorizacion = {
  id: string;
  titulo: string;
  /** Qué significa calificar alto en este criterio. Va como ayuda de columna. */
  ayuda?: string;
  /**
   * Para los criterios donde calificar alto debe **restar** prioridad: la
   * inversión requerida. Un proyecto carísimo no se vuelve urgente por ser
   * caro, así que su nota entra invertida (`maximo + 1 − nota`).
   */
  invertido?: boolean;
};

/**
 * Proyectos calificados contra varios criterios, con puntaje y orden.
 *
 * No es una `tabla` con columnas numéricas: lo que el Taller 1 del Módulo 4
 * pide es «identificar el orden de ejecución», y ese orden es el resultado,
 * no un dato que la empresa teclee. El bloque suma los criterios —invirtiendo
 * los que lo pidan— y ordena solo. La fórmula se muestra en pantalla: un
 * puntaje que nadie puede reconstruir no se puede discutir en una asesoría,
 * y esta matriz existe para discutirse.
 */
export type BloqueMatrizPriorizacion = Base & {
  tipo: "matriz_priorizacion";
  /** Columnas de texto que describen la fila: el proyecto y su atributo. */
  columnas: ColumnaTabla[];
  criterios: CriterioPriorizacion[];
  /** Nota máxima de cada criterio. Con 5, un criterio invertido da 6 − nota. */
  maximo: number;
  filasIniciales?: number;
  filasMinimas?: number;
  sugerencias?: string[];
};

/**
 * Cuándo queda concretado cada proyecto, dentro de un horizonte de años.
 *
 * El Taller 2 del Módulo 4 es una rejilla de meses de 2026 a 2028 donde se
 * marca la fecha de cierre de cada proyecto. Un año suelto no sirve —la
 * diferencia entre enero y diciembre del mismo año es todo el plan— y la
 * `linea_tiempo` que ya existe guarda año y hecho, sin mes ni proyecto. De
 * ahí el tipo propio: año y mes por fila, y la posición dibujada en la
 * franja del horizonte para que el plan se lea de un vistazo.
 */
export type BloqueCronograma = Base & {
  tipo: "cronograma";
  /** Columnas de texto de cada fila: el proyecto y su atributo. */
  columnas: ColumnaTabla[];
  /** Años del horizonte, en orden. */
  anios: number[];
  filasIniciales?: number;
  filasMinimas?: number;
  sugerencias?: string[];
};

/**
 * Flujo de caja de un plan, mes a mes, con el saldo calculado.
 *
 * El Módulo 4 pide un presupuesto por actividad, pero nadie suma esos
 * presupuestos contra la plata que hay. Por eso los planes de microempresa
 * se mueren en el mes cuatro: no porque el proyecto fuera malo, sino porque
 * la caja no aguantó el mes en que coincidieron tres pagos. Este bloque hace
 * visible ese mes antes de que llegue.
 *
 * El saldo no es un campo: se calcula. Pedirlo como dato invitaría a
 * cuadrarlo a mano, que es justo lo que se quiere evitar.
 */
export type BloqueFlujoCaja = Base & {
  tipo: "flujo_caja";
  /** Cuántos meses se proyectan. */
  meses: number;
  /** Mes en que arranca el horizonte, 0 = enero. Solo rotula las columnas. */
  mesInicial?: number;
  /** Etiqueta del saldo con que se abre el horizonte. */
  etiquetaInicial?: string;
  /** Lo que entra: ventas esperadas, aportes, créditos. */
  entradas: { id: string; titulo: string }[];
  /** Lo que sale: los presupuestos del plan y la operación corriente. */
  salidas: { id: string; titulo: string }[];
};

// ---------------------------------------------------------------------
// Tabla calculada
// ---------------------------------------------------------------------

/** De dónde sale un operando de una fórmula. */
export type RefCalculo =
  /** Valor de esa columna en la fila que se está calculando. */
  | { de: "columna"; id: string }
  /** Uno de los parámetros globales del bloque. */
  | { de: "parametro"; id: string }
  /** Suma de esa columna en todas las filas. Solo para indicadores. */
  | { de: "total"; columna: string }
  /** Promedio de esa columna sobre las filas con dato. Solo para indicadores. */
  | { de: "promedio"; columna: string }
  /** Otro indicador, declarado antes que este. Solo para indicadores. */
  | { de: "indicador"; id: string }
  | { de: "constante"; valor: number };

/**
 * Las cinco operaciones que hacen falta.
 *
 * Es deliberadamente un lenguaje pobre y no una expresión que se evalúe: la
 * definición del taller viaja en JSONB y la escribe quien carga contenido,
 * no quien programa. Un `eval` ahí sería ejecutar texto de la base de datos
 * en el navegador de la empresa. Con estas cinco se arman el OEE, el takt
 * time, el porcentaje de valor agregado y el costo del desperdicio, que es
 * todo lo que los talleres piden.
 */
export type Operacion =
  | { op: "suma"; de: RefCalculo[] }
  | { op: "resta"; de: [RefCalculo, RefCalculo] }
  | { op: "producto"; de: RefCalculo[] }
  | { op: "division"; de: [RefCalculo, RefCalculo] }
  /** a ÷ b × 100. */
  | { op: "porcentaje"; de: [RefCalculo, RefCalculo] };

export type FormatoCifra = "numero" | "pesos" | "porcentaje";

/** Columna de una tabla calculada: se teclea, o se calcula. */
export type ColumnaCalculada = ColumnaTabla & {
  /** Sufijo bajo el título: «min», «m», «unidades/mes». */
  unidad?: string;
  /** Qué significa la columna. Va bajo el título, como en la priorización. */
  pista?: string;
  /** Si está, la columna no se teclea: la calcula el bloque. */
  calculada?: Operacion;
  formato?: FormatoCifra;
  decimales?: number;
  /** Suma la columna en el pie de la tabla. */
  total?: boolean;
};

/** Dato global del bloque: alimenta las fórmulas de todas las filas. */
export type ParametroCalculo = {
  id: string;
  titulo: string;
  unidad?: string;
  pista?: string;
  marcador?: string;
  /** Por defecto sí: son pocos y de ellos depende todo lo demás. */
  requerido?: boolean;
};

/**
 * Cifra que resume el bloque. El resultado del taller.
 *
 * Un indicador que solo usa parámetros y constantes es **de cabecera**: se
 * calcula antes de recorrer las filas y las fórmulas de las columnas pueden
 * apoyarse en él. Es lo que hace posible el takt time: tiempo disponible
 * entre demanda es una sola cifra para toda la planta, y cada estación se
 * compara contra ella. Como columna se teclearía repetida en cada fila, y
 * entonces cada estación tendría su propio takt.
 */
export type IndicadorCalculo = {
  id: string;
  titulo: string;
  pista?: string;
  calculada: Operacion;
  formato?: FormatoCifra;
  decimales?: number;
  unidad?: string;
  /** Lo destaca: es la cifra por la que existe el taller. */
  principal?: boolean;
  /**
   * Paso intermedio que no se muestra.
   *
   * Las operaciones no se anidan —a propósito: una fórmula anidada en JSONB
   * no se puede leer—, así que un cálculo de tres pasos se escribe como tres
   * indicadores. El OEE necesita «tiempo operando» y «producción ideal» para
   * llegar a sus tres factores, y ninguno de los dos se lleva a una reunión.
   */
  oculto?: boolean;
};

/**
 * Lo que el bloque concluye, en una frase.
 *
 * `umbral` compara un indicador contra tramos —un OEE de 48 % no dice nada
 * a quien lo ve por primera vez; «por debajo de lo que se considera
 * aceptable» sí—. `fila_maxima` nombra la fila que manda: el cuello de
 * botella no es un número, es una estación con nombre.
 *
 * En los textos, `{valor}` se reemplaza por la cifra y `{fila}` por el
 * nombre de la fila.
 */
export type VeredictoCalculado =
  | {
      tipo: "umbral";
      indicador: string;
      tramos: { hasta?: number; color: ColorEscala; texto: string }[];
    }
  | {
      tipo: "fila_maxima";
      /** Columna numérica que decide cuál fila manda. */
      columna: string;
      /** Columna de texto que da nombre a la fila. */
      nombre: string;
      texto: string;
    };

/**
 * Tabla con parámetros, columnas derivadas e indicadores de resumen.
 *
 * Es el bloque que sostiene siete talleres del programa Lean: el OEE, el
 * takt time, el porcentaje de valor agregado del flujo, el costo anual del
 * desperdicio, el tiempo convertible de un cambio de referencia, los
 * kilómetros caminados y la nivelación de la demanda. Los siete son la misma
 * cosa —datos que la empresa tiene sueltos y una aritmética que nadie hace—
 * y cada uno como tipo propio habrían sido siete implementaciones del mismo
 * bucle.
 *
 * La aritmética importa más que la interfaz. Una empresa que cree que su OEE
 * es del 85 % porque la máquina «casi no para» decide distinto cuando ve
 * 48 % en pantalla; y ese número no se puede pedir como dato, porque si se
 * pide, se estima. Por eso lo que se teclea son los insumos y lo que se
 * calcula nunca es un campo.
 */
export type BloqueTablaCalculada = Base & {
  tipo: "tabla_calculada";
  parametros?: ParametroCalculo[];
  /** Puede ir vacío: el OEE son solo parámetros e indicadores. */
  columnas: ColumnaCalculada[];
  filasIniciales?: number;
  filasMinimas?: number;
  sugerencias?: string[];
  textoAgregar?: string;
  indicadores?: IndicadorCalculo[];
  veredicto?: VeredictoCalculado;
};

/** Etiquetas que se agregan y se quitan. Los procesos del Taller 7. */
export type BloqueChipsAgregables = Base & {
  tipo: "chips_agregables";
  etiqueta?: string;
  descripcion?: string;
  /** Texto del botón. Sin esto decía «Agregar proceso» en todo el programa. */
  textoAgregar?: string;
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
  | BloqueMatrizPriorizacion
  | BloqueCronograma
  | BloqueFlujoCaja
  | BloqueTablaCalculada
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
