import {
  ADKAR, CASOS, DESPERDICIOS, GRUPOS_CAMBIO, PILARES, SEIS_M,
} from "../fuente/lean-crudo";
import type { TallerSemilla } from "@/lib/talleres/tipos";

/**
 * Fábrica Lean · Módulo 5. Profundización, a la carta.
 *
 * Once talleres que **no cuentan para terminar el programa**, y eso es una
 * decisión de diseño, no una rebaja.
 *
 * El núcleo del programa son doce talleres en cuatro módulos. Meter aquí
 * otros once habría dado veintitrés obligatorios, y el dato que tenemos de la
 * plataforma dice qué pasa entonces: en el programa de la Cámara, con cuatro
 * módulos publicados, una de las dos empresas va en 81 %, 0 % y 0 %. El
 * riesgo real de un taller no es que falte contenido, es que no se complete,
 * y un taller sin terminar no produce ninguna respuesta.
 *
 * Vive como módulo aparte y no como talleres opcionales dentro de los otros
 * cuatro por una razón aritmética: el avance se calcula por módulo, así que
 * once talleres opcionales repartidos habrían diluido el porcentaje de los
 * cuatro módulos del núcleo. Aquí nadie pierde porcentaje y quien quiera
 * profundizar tiene dónde.
 *
 * El precio de esa decisión hay que decirlo: **las respuestas viven por
 * módulo**, cada uno con su bitácora. Un taller de aquí no puede leer el
 * costo del desperdicio del Módulo 1 ni el cuello de botella del Módulo 2.
 * Donde hace falta ese insumo, se pide traerlo a mano y el aviso del taller
 * lo explica, en vez de dejar a la empresa buscando un botón que no existe.
 */

const t1: TallerSemilla = {
  numero: 1,
  slug: "tres-pilares",
  corto: "Industria 5.0",
  titulo: "¿Cuál de los tres pilares es tu eslabón débil?",
  lead:
    "Personas, resiliencia y sostenibilidad. La Industria 5.0 no reemplaza a la 4.0: le "
    + "añade las dos dimensiones que la tecnología sola no resuelve.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "calificar",
        bloques: [
          {
            tipo: "fichas_escala",
            id: "pilares",
            escala: "solidez",
            ayuda:
              "Solo uno puede ser el eslabón débil. Si marcas los tres como débiles no "
              + "has priorizado nada, y el valor de esta lámina es elegir.",
            items: PILARES.map((p) => ({
              id: p.id,
              titulo: p.titulo,
              descripcion: p.descripcion,
            })),
            campoNota: { etiqueta: "Un hecho concreto que lo demuestre" },
          },
          {
            tipo: "texto",
            id: "prueba-resiliencia",
            etiqueta: "La última disrupción que te golpeó, ¿cuánto tardaste en recuperarte?",
            marcador: "Un paro de proveedor, una subida de materia prima, una renuncia clave",
          },
        ],
      },
    ],
  },
};

const t2: TallerSemilla = {
  numero: 2,
  slug: "lean-verde",
  corto: "Lean verde",
  titulo: "La huella de tus desperdicios",
  lead:
    "Cada desperdicio Lean tiene una huella ambiental pegada: el reproceso se paga dos "
    + "veces en energía, el inventario en espacio climatizado, el transporte en "
    + "combustible. La buena noticia es que atacarlos sirve para las dos cosas.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "huella",
        bloques: [
          {
            tipo: "nota",
            id: "aviso",
            cuerpo:
              "**No se trata de hacer un inventario de carbono.** Se trata de ver qué "
              + "desperdicio te está costando además en energía, agua o residuo, porque "
              + "eso suele cambiar la prioridad: un desperdicio mediano en plata puede ser "
              + "el primero en huella, y hoy hay clientes que lo preguntan antes de "
              + "comprar.",
          },
          {
            tipo: "tabla",
            id: "ambiental",
            columnas: [
              {
                id: "desperdicio",
                titulo: "Desperdicio",
                marcador: "De los ocho",
              },
              {
                id: "huella",
                titulo: "Qué consume de más",
                marcador: "Energía · agua · material · espacio",
              },
              {
                id: "medida",
                titulo: "Cómo se podría medir",
                multilinea: true,
                marcador: "Con qué dato que ya tengas: factura, contador, báscula",
              },
            ],
            filasIniciales: 3,
            filasMinimas: 3,
            sugerencias: DESPERDICIOS.map((d) => d.titulo.replace(/^\d+ · /, "")),
          },
          {
            tipo: "texto",
            id: "pausa",
            etiqueta:
              "¿Mides el impacto ambiental de tu operación con la misma disciplina con que mides el costo?",
            marcador: "La respuesta honesta de casi todas es no. Lo que importa es qué harías al respecto",
          },
        ],
      },
    ],
  },
};

const t3: TallerSemilla = {
  numero: 3,
  slug: "gemba",
  corto: "Gemba",
  titulo: "Ir a ver",
  lead:
    "«El lugar real». Una hora de pie mirando el proceso, sin interrumpir y sin opinar, "
    + "produce más hallazgos que una semana de reuniones sobre el mismo proceso.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "preparar",
        bloques: [
          {
            tipo: "nota",
            id: "reglas",
            cuerpo:
              "**Cuatro reglas del Gemba walk.** Ir al sitio, no pedir el informe. Mirar el "
              + "proceso, no evaluar a la persona —si quien trabaja siente que lo están "
              + "calificando, cambia lo que hace y ya no estás viendo el proceso—. Preguntar "
              + "sin corregir: «¿qué te estorba para hacer esto?» en vez de «deberías "
              + "hacerlo así». Y anotar en el momento: lo que no se anota de pie, a las dos "
              + "horas se volvió una impresión general.",
          },
          {
            tipo: "tabla",
            id: "plan",
            columnas: [
              { id: "donde", titulo: "Dónde", marcador: "Estación o área concreta" },
              { id: "cuando", titulo: "Cuándo", marcador: "Día y hora. El turno importa" },
              { id: "cuanto", titulo: "Cuánto tiempo", marcador: "Mínimo 30 minutos" },
              {
                id: "pregunta",
                titulo: "Qué quieres entender",
                multilinea: true,
                marcador: "Una pregunta, no cinco",
              },
            ],
            filasIniciales: 1,
            filasMinimas: 1,
          },
        ],
      },
      {
        id: "hallazgos",
        titulo: "Lo que viste",
        lead: "Se llena después de ir. Antes de ir, esta sección no se puede llenar.",
        bloques: [
          {
            tipo: "lista_numerada",
            id: "observado",
            etiqueta: "Hechos observados",
            lineas: 5,
            marcador: "Lo que viste, no lo que concluyes",
            ayuda:
              "Un hecho es «el operario caminó seis veces al estante en veinte minutos». "
              + "Una conclusión es «el puesto está mal diseñado». Aquí van hechos: las "
              + "conclusiones se discuten mejor cuando los hechos están escritos aparte.",
          },
          {
            tipo: "texto",
            id: "dijo",
            etiqueta: "Lo que te dijo quien hace el trabajo",
            marcador: "Textual si puedes. Suele ser el hallazgo más valioso del día",
          },
          {
            tipo: "texto",
            id: "sorpresa",
            etiqueta: "¿Qué te sorprendió? ¿Qué creías que pasaba y no pasa así?",
            marcador: "Si nada te sorprendió, probablemente mirabas para confirmar",
          },
        ],
      },
    ],
  },
};

const t4: TallerSemilla = {
  numero: 4,
  slug: "ishikawa",
  corto: "Ishikawa 6M",
  titulo: "Las seis causas posibles",
  lead:
    "Los cinco porqués siguen una sola rama. El Ishikawa abre seis y evita el sesgo de "
    + "siempre: en casi toda planta, el primer culpable que se nombra es la mano de obra, "
    + "y en casi toda planta el método y la medición pesan más.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "espina",
        bloques: [
          {
            tipo: "texto",
            id: "problema",
            etiqueta: "El problema, con cifra",
            marcador: "Ej.: 18 % de rechazo en el corte de la referencia A",
            multilinea: false,
          },
          {
            tipo: "cuadrantes",
            id: "seis-m",
            ayuda:
              "Dos o tres causas posibles por cada M. No hace falta llenarlas todas: una M "
              + "vacía también dice algo. Lo que no vale es llenar solo «mano de obra».",
            cuadrantes: SEIS_M.map((m, i) => ({
              id: m.id,
              titulo: m.titulo,
              subtitulo: m.subtitulo,
              color: (["acento", "med", "fav", "des", "na", "acento"] as const)[i]!,
              lineas: 3,
            })),
          },
        ],
      },
      {
        id: "elegir",
        titulo: "La causa que vas a comprobar",
        lead:
          "El Ishikawa produce hipótesis, no respuestas. El paso que casi nadie da es el "
          + "que sigue: ir a comprobar una.",
        bloques: [
          {
            tipo: "tabla",
            id: "comprobar",
            columnas: [
              {
                id: "causa",
                titulo: "Causa a comprobar",
                multilinea: true,
                marcador: "La que explicaría más del problema",
              },
              {
                id: "como",
                titulo: "Cómo la compruebas",
                multilinea: true,
                marcador: "Qué medirías o qué separarías para saber si es esa",
              },
              { id: "cuando", titulo: "Para cuándo", marcador: "Fecha" },
            ],
            filasIniciales: 2,
            filasMinimas: 2,
          },
        ],
      },
    ],
  },
};

const t5: TallerSemilla = {
  numero: 5,
  slug: "trabajo-estandarizado",
  corto: "Trabajo estándar",
  titulo: "La hoja de trabajo estándar",
  lead:
    "Es lo que sostiene cualquier mejora: sin estándar escrito, el proceso vuelve a como "
    + "lo hacía cada quien en tres semanas. Y no es burocracia —una hoja por proceso "
    + "crítico, de una página—.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "secuencia",
        bloques: [
          {
            tipo: "nota",
            id: "aviso",
            cuerpo:
              "**El estándar lo escribe quien hace el trabajo**, no el ingeniero solo. Un "
              + "estándar redactado en la oficina describe cómo debería hacerse; el que "
              + "escribe el operario describe cómo se hace cuando sale bien, que es lo que "
              + "queremos repetir.\n\n"
              + "**El punto clave es la columna que importa**: qué hay que vigilar en ese "
              + "paso para que el resultado salga bien. Es el conocimiento que hoy vive en "
              + "la cabeza de una persona y se va con ella.",
          },
          {
            tipo: "texto",
            id: "proceso",
            etiqueta: "¿Qué proceso vas a estandarizar?",
            marcador: "El más crítico o el que más depende de una sola persona",
            multilinea: false,
          },
          {
            tipo: "tabla",
            id: "pasos",
            columnas: [
              { id: "paso", titulo: "Paso", multilinea: true, marcador: "Qué se hace" },
              {
                id: "tiempo",
                titulo: "Tiempo",
                marcador: "min",
                numerica: true,
                requerida: false,
              },
              {
                id: "clave",
                titulo: "Punto clave",
                multilinea: true,
                marcador: "Qué vigilar para que salga bien",
              },
              {
                id: "riesgo",
                titulo: "Si se omite",
                marcador: "Qué pasa. Esto es lo que convence de no omitirlo",
                requerida: false,
              },
            ],
            filasIniciales: 5,
            filasMinimas: 4,
          },
          {
            tipo: "texto",
            id: "donde-vive",
            etiqueta: "¿Dónde va a estar esta hoja para que se use?",
            marcador: "En el puesto, a la vista. En una carpeta no sirve",
          },
        ],
      },
    ],
  },
};

const t6: TallerSemilla = {
  numero: 6,
  slug: "recorrido",
  corto: "Recorrido",
  titulo: "¿Cuántos kilómetros camina tu equipo al año?",
  lead:
    "El quinto desperdicio es el que menos se ve, porque caminar parece trabajo. Puesto en "
    + "kilómetros al año deja de parecerlo, y es el argumento más simple para mover una "
    + "mesa o rediseñar un puesto.",
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
              "**Una fila por trayecto que se repite**: del puesto al estante, del estante "
              + "a la bodega, del puesto a la impresora. Mide los metros una vez, a pasos "
              + "—un paso es unos 75 cm— y cuenta las veces en un turno observado, no "
              + "estimadas de memoria.\n\n"
              + "El cálculo asume **250 turnos al año**, que es un año laboral de un turno "
              + "diario. Si trabajas dos turnos, el resultado se duplica.",
          },
          {
            tipo: "tabla_calculada",
            id: "trayectos",
            columnas: [
              {
                id: "trayecto",
                titulo: "Trayecto",
                marcador: "Ej.: del puesto al estante de herramienta",
              },
              {
                id: "metros",
                titulo: "Metros ida y vuelta",
                numerica: true,
                marcador: "0",
                origen: true,
              },
              {
                id: "veces",
                titulo: "Veces por turno",
                numerica: true,
                marcador: "0",
                origen: true,
              },
              {
                id: "turno",
                titulo: "Metros por turno",
                unidad: "m",
                calculada: {
                  op: "producto",
                  de: [{ de: "columna", id: "metros" }, { de: "columna", id: "veces" }],
                },
              },
              {
                id: "anual",
                titulo: "Metros al año",
                unidad: "m",
                calculada: {
                  op: "producto",
                  de: [{ de: "columna", id: "turno" }, { de: "constante", valor: 250 }],
                },
                total: true,
              },
            ],
            filasIniciales: 4,
            filasMinimas: 3,
            textoAgregar: "+ Trayecto",
            indicadores: [
              {
                id: "km",
                titulo: "Kilómetros al año",
                calculada: {
                  op: "division",
                  de: [{ de: "total", columna: "anual" }, { de: "constante", valor: 1000 }],
                },
                decimales: 1,
                unidad: "km",
                principal: true,
                pista: "Caminados sin agregar valor",
              },
              {
                id: "metros-turno",
                titulo: "Metros por turno",
                calculada: { op: "suma", de: [{ de: "total", columna: "turno" }] },
                unidad: "m",
              },
            ],
            veredicto: {
              tipo: "fila_maxima",
              columna: "anual",
              nombre: "trayecto",
              texto:
                "**El trayecto que más pesa es «{fila}»: {valor} al año.** Mover el "
                + "destino de ese recorrido más cerca del puesto, o traer lo que se busca "
                + "al puesto, suele costar una tarde.",
            },
          },
        ],
      },
      {
        id: "actuar",
        bloques: [
          {
            tipo: "texto",
            id: "cambio",
            etiqueta: "¿Qué moverías y qué cuesta moverlo?",
            marcador: "Una mesa, un estante, un carro de herramienta",
          },
        ],
      },
    ],
  },
};

const t7: TallerSemilla = {
  numero: 7,
  slug: "smed",
  corto: "SMED",
  titulo: "El cambio de referencia, minuto a minuto",
  lead:
    "SMED es una sola idea: la mayoría de lo que se hace con la máquina parada se puede "
    + "hacer con la máquina andando. Separar esas dos cosas suele recortar el cambio a la "
    + "mitad sin comprar nada.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "desglosar",
        bloques: [
          {
            tipo: "nota",
            id: "como",
            cuerpo:
              "**Graba un cambio completo con el celular** y desglósalo viendo el video. De "
              + "memoria no funciona: siempre se olvidan los minutos de buscar la "
              + "herramienta y de ir por el material, que son justo los convertibles.\n\n"
              + "**Interno** es lo que exige la máquina parada: desmontar, montar, "
              + "calibrar.\n\n"
              + "**Externo** es lo que se podría hacer antes o después, con la máquina "
              + "produciendo: buscar la herramienta, traer el material, precalentar, "
              + "preparar el molde siguiente, llenar el formato.\n\n"
              + "Cada minuto que pase de interno a externo es capacidad que aparece sin "
              + "invertir un peso.",
          },
          {
            tipo: "tabla_calculada",
            id: "cambio",
            ayuda:
              "Escribe cada actividad en **una sola** de las dos columnas de minutos, "
              + "según dónde está hoy. Si dudas de si una podría ser externa, ponla en "
              + "externa: la duda es justo la oportunidad.",
            columnas: [
              {
                id: "actividad",
                titulo: "Actividad del cambio",
                multilinea: true,
                marcador: "Ej.: buscar las llaves",
              },
              {
                id: "interno",
                titulo: "Con máquina parada",
                unidad: "min",
                numerica: true,
                marcador: "0",
                total: true,
              },
              {
                id: "externo",
                titulo: "Se puede hacer andando",
                unidad: "min",
                numerica: true,
                marcador: "0",
                total: true,
              },
            ],
            filasIniciales: 6,
            filasMinimas: 5,
            textoAgregar: "+ Actividad",
            sugerencias: [
              "Buscar herramienta",
              "Traer el material de la referencia nueva",
              "Desmontar el montaje anterior",
              "Montar el nuevo",
              "Calibrar y ajustar",
              "Primera pieza de prueba",
              "Diligenciar el formato",
              "Limpiar",
            ],
            indicadores: [
              {
                id: "total",
                titulo: "Cambio completo",
                calculada: {
                  op: "suma",
                  de: [
                    { de: "total", columna: "interno" },
                    { de: "total", columna: "externo" },
                  ],
                },
                unidad: "min",
              },
              {
                id: "parada",
                titulo: "Máquina parada hoy",
                calculada: { op: "suma", de: [{ de: "total", columna: "interno" }] },
                unidad: "min",
              },
              {
                id: "convertible",
                titulo: "Convertible a externo",
                calculada: {
                  op: "porcentaje",
                  de: [{ de: "total", columna: "externo" }, { de: "indicador", id: "total" }],
                },
                formato: "porcentaje",
                principal: true,
                pista: "Del cambio completo, lo que no exige parar",
              },
            ],
            veredicto: {
              tipo: "umbral",
              indicador: "convertible",
              tramos: [
                {
                  hasta: 10,
                  color: "des",
                  texto:
                    "**Solo {valor} del cambio es convertible.** Casi siempre significa "
                    + "que el desglose está incompleto: faltan los minutos de buscar, "
                    + "traer y diligenciar, que son los que se olvidan y los que sí se "
                    + "pueden sacar. Vuelve al video.",
                },
                {
                  hasta: 40,
                  color: "med",
                  texto:
                    "**{valor} del cambio se puede hacer con la máquina andando.** Eso es "
                    + "capacidad que aparece sin invertir: alista todo eso antes de parar "
                    + "y el cambio se acorta desde el próximo turno.",
                },
                {
                  color: "fav",
                  texto:
                    "**{valor} del cambio es externo.** Es un margen grande. El siguiente "
                    + "paso es un carro de alistamiento con todo listo junto a la máquina "
                    + "antes de parar, y una lista de verificación para que no se dependa "
                    + "de quién haga el cambio.",
                },
              ],
            },
          },
        ],
      },
      {
        id: "actuar",
        bloques: [
          {
            tipo: "texto",
            id: "siguiente-cambio",
            etiqueta: "En el próximo cambio, ¿qué vas a alistar antes de parar la máquina?",
            marcador: "Lo de la columna de la derecha. Nómbralo y mide el resultado",
          },
        ],
      },
    ],
  },
};

const t8: TallerSemilla = {
  numero: 8,
  slug: "kanban",
  corto: "Kanban",
  titulo: "El sistema de señales",
  lead:
    "Kanban no es un tablero de tareas: es una señal que autoriza producir. Mientras cada "
    + "estación produzca lo que puede en vez de lo que la siguiente necesita, el "
    + "inventario en proceso crece y el lead time con él.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "disenar",
        bloques: [
          {
            tipo: "nota",
            id: "como",
            cuerpo:
              "**La señal puede ser de papel.** Una tarjeta, un espacio marcado en el piso, "
              + "un recipiente vacío que vuelve. Lo digital viene después y solo si el de "
              + "papel ya funciona.\n\n"
              + "**El punto de reorden** es cuánto queda cuando se dispara la señal: "
              + "suficiente para aguantar lo que tarde en llegar la reposición. **El WIP "
              + "máximo** es cuánto se permite acumular entre dos estaciones; cuando se "
              + "llena, la estación anterior **para**. Eso incomoda y es justo el punto: "
              + "una estación parada es visible, un inventario creciendo no.",
          },
          {
            tipo: "tabla",
            id: "senales",
            columnas: [
              { id: "paso", titulo: "Entre qué y qué", marcador: "Ej.: corte → doblado" },
              {
                id: "senal",
                titulo: "Cuál es la señal",
                marcador: "Tarjeta, espacio marcado, recipiente vacío",
              },
              {
                id: "reorden",
                titulo: "Punto de reorden",
                marcador: "Cuánto queda cuando se dispara",
                requerida: false,
              },
              {
                id: "wip",
                titulo: "WIP máximo",
                marcador: "Cuánto se permite acumular",
                numerica: true,
              },
            ],
            filasIniciales: 3,
            filasMinimas: 3,
          },
          {
            tipo: "texto",
            id: "para",
            etiqueta: "¿Qué hace la estación anterior cuando se llena el WIP máximo?",
            marcador:
              "Si la respuesta es «sigue produciendo», no hay Kanban: hay un tablero decorativo",
          },
        ],
      },
    ],
  },
};

const t9: TallerSemilla = {
  numero: 9,
  slug: "poka-yoke",
  corto: "Poka-Yoke",
  titulo: "Hacer el error imposible",
  lead:
    "Un Poka-Yoke no avisa del error: lo impide. La pieza no entra si está al revés, la "
    + "máquina no arranca si falta el seguro. Capacitar de nuevo a la gente es la "
    + "respuesta que siempre falla, porque el error humano no se elimina con atención.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "puntos",
        bloques: [
          {
            tipo: "nota",
            id: "aviso",
            cuerpo:
              "**Primero la causa raíz, después el mecanismo.** La conferencia marca este "
              + "como el error común de esta herramienta: instalar un dispositivo sin "
              + "entender por qué ocurre el defecto trata el síntoma y deja el problema. "
              + "Si no tienes la causa, haz primero el Ishikawa.\n\n"
              + "**Jidoka** es el pariente automático: la máquina se detiene sola ante la "
              + "anomalía, en vez de seguir produciendo defectos hasta que alguien se da "
              + "cuenta al final de la línea.",
          },
          {
            tipo: "tabla",
            id: "mecanismos",
            columnas: [
              { id: "paso", titulo: "Dónde ocurre", marcador: "Paso o estación" },
              {
                id: "error",
                titulo: "Error posible",
                multilinea: true,
                marcador: "Qué se puede hacer mal, aunque sea sin querer",
              },
              {
                id: "efecto",
                titulo: "Qué pasa cuando ocurre",
                marcador: "Retrabajo, rechazo del cliente, accidente",
              },
              {
                id: "mecanismo",
                titulo: "Mecanismo que lo impide",
                multilinea: true,
                marcador: "Una guía, un tope, un sensor, un conector que solo entra de un lado",
              },
            ],
            filasIniciales: 3,
            filasMinimas: 3,
          },
          {
            tipo: "texto",
            id: "primero",
            etiqueta: "¿Cuál vas a instalar primero y qué cuesta?",
            marcador: "Los buenos Poka-Yoke suelen costar poco: un tope, una plantilla",
          },
        ],
      },
    ],
  },
};

const t10: TallerSemilla = {
  numero: 10,
  slug: "heijunka",
  corto: "Heijunka",
  titulo: "Nivelar la demanda",
  lead:
    "La capacidad es fija y la demanda no. Producir siguiendo los picos obliga a "
    + "sobretiempo en unas semanas y deja la planta quieta en otras; nivelar es decidir "
    + "con qué ritmo se produce, no con cuál se recibe.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "ver-el-pico",
        bloques: [
          {
            tipo: "nota",
            id: "como",
            cuerpo:
              "**Usa datos reales de los últimos ocho a doce periodos** —semanas o meses, "
              + "como lo manejes—, no el presupuesto. El presupuesto está nivelado por "
              + "construcción y esconde justo lo que queremos ver.\n\n"
              + "**La capacidad** es cuánto puedes producir en un periodo sin sobretiempo "
              + "ni subcontratar. En la columna de desviación, lo positivo es lo que te "
              + "sobró de capacidad y lo negativo es lo que tuviste que resolver a la "
              + "fuerza.",
          },
          {
            tipo: "tabla_calculada",
            id: "nivelacion",
            parametros: [
              {
                id: "capacidad",
                titulo: "Capacidad por periodo",
                unidad: "unidades",
                pista: "Sin sobretiempo ni subcontratación",
                marcador: "0",
              },
            ],
            columnas: [
              { id: "periodo", titulo: "Periodo", marcador: "Semana 1, enero…" },
              {
                id: "demanda",
                titulo: "Demanda real",
                unidad: "unidades",
                numerica: true,
                marcador: "0",
              },
              {
                id: "desviacion",
                titulo: "Capacidad − demanda",
                unidad: "unidades",
                calculada: {
                  op: "resta",
                  de: [
                    { de: "parametro", id: "capacidad" },
                    { de: "columna", id: "demanda" },
                  ],
                },
              },
            ],
            filasIniciales: 8,
            filasMinimas: 6,
            textoAgregar: "+ Periodo",
            indicadores: [
              {
                id: "promedio",
                titulo: "Demanda promedio",
                calculada: { op: "suma", de: [{ de: "promedio", columna: "demanda" }] },
                unidad: "unidades",
                principal: true,
                pista: "El ritmo al que convendría producir",
              },
              {
                id: "capacidad-vista",
                titulo: "Capacidad declarada",
                calculada: { op: "suma", de: [{ de: "parametro", id: "capacidad" }] },
                unidad: "unidades",
              },
            ],
            veredicto: {
              tipo: "fila_maxima",
              columna: "demanda",
              nombre: "periodo",
              texto:
                "**Tu pico está en {fila}, con {valor}.** Compáralo con la demanda "
                + "promedio: la diferencia es lo que estás resolviendo con sobretiempo, "
                + "subcontratación o incumplimiento. Nivelar es producir cerca del "
                + "promedio y usar inventario terminado para absorber el pico, en vez de "
                + "perseguirlo con la planta.",
            },
          },
        ],
      },
      {
        id: "decidir",
        bloques: [
          {
            tipo: "texto",
            id: "como-absorbe",
            etiqueta: "Hoy, ¿cómo absorbes el pico?",
            marcador: "Sobretiempo, subcontratación, incumplir, inventario",
          },
          {
            tipo: "texto",
            id: "costo-pico",
            etiqueta: "¿Cuánto te cuesta esa forma de absorberlo?",
            marcador: "Pon una cifra aunque sea aproximada: es lo que paga la nivelación",
          },
        ],
      },
    ],
  },
};

const t11: TallerSemilla = {
  numero: 11,
  slug: "gestion-del-cambio",
  corto: "Gestión del cambio",
  titulo: "ADKAR y la coalición que lo sostiene",
  lead:
    "La tecnología se compra; la cultura se construye. ADKAR mira el cambio persona por "
    + "persona y sirve para un diagnóstico incómodo: casi siempre el cuello no está en el "
    + "conocimiento, está en el deseo.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "adkar",
        bloques: [
          {
            tipo: "nota",
            id: "como",
            cuerpo:
              "**ADKAR se diagnostica por grupo y en orden.** Las cinco etapas son "
              + "secuenciales: no sirve capacitar (conocimiento) a quien todavía no quiere "
              + "(deseo), y es el error más caro de cualquier implantación Lean —formación "
              + "para gente que no ha entendido por qué—.\n\n"
              + "**Busca la primera etapa en rojo de cada grupo.** Ahí es donde hay que "
              + "trabajar, y solo ahí: avanzar en las siguientes antes de resolver esa es "
              + "esfuerzo perdido.",
          },
          {
            tipo: "matriz_escala",
            id: "etapas",
            escala: "grado",
            ayuda:
              "Responde por el grupo en conjunto, con lo que ves hoy. Si en un grupo hay "
              + "división real, marca «en parte» y explícalo en la coalición de abajo.",
            grupos: GRUPOS_CAMBIO.map((g) => ({
              id: g.id,
              titulo: g.titulo,
              filas: ADKAR.map((a) => ({ id: a.id, texto: a.texto })),
            })),
          },
        ],
      },
      {
        id: "coalicion",
        titulo: "La coalición líder",
        lead:
          "El segundo paso de Kotter, y el que decide. Un cambio con un solo patrocinador "
          + "se cae el día que esa persona está ocupada.",
        bloques: [
          {
            tipo: "tabla",
            id: "personas",
            columnas: [
              { id: "persona", titulo: "Persona", marcador: "Nombre" },
              { id: "papel", titulo: "Qué papel juega", marcador: "Patrocina, ejecuta, valida" },
              {
                id: "postura",
                titulo: "Postura hoy",
                marcador: "Apoya · duda · se opone",
              },
              {
                id: "necesita",
                titulo: "Qué necesita para moverse",
                multilinea: true,
                marcador: "Un dato, un reconocimiento, tiempo, quitarle otra carga",
              },
            ],
            filasIniciales: 4,
            filasMinimas: 3,
          },
          {
            tipo: "texto",
            id: "victoria-temprana",
            etiqueta: "¿Cuál sería la primera victoria visible, en menos de 60 días?",
            marcador:
              "El sexto paso de Kotter. Algo pequeño que todos vean: sin eso, el cambio no se cree",
          },
          {
            tipo: "texto",
            id: "referencia",
            etiqueta: "¿A qué empresa te quieres parecer y en qué exactamente?",
            marcador:
              `De los casos de la conferencia: ${CASOS.slice(4).map((c) => c.split(" · ")[0]).join(", ")}`,
          },
        ],
      },
    ],
  },
};

export const LEAN_MODULO_5 = {
  numero: 5,
  slug: "lean-profundizacion",
  pregunta: "Profundización",
  titulo: "Las once herramientas restantes",
  lead:
    "A la carta y sin contar para terminar el programa: SMED, Kanban, Poka-Yoke, Heijunka, "
    + "Ishikawa, trabajo estándar, recorrido, Gemba, Lean verde, Industria 5.0 y gestión "
    + "del cambio.",
  talleres: [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11] as TallerSemilla[],
};
