import { AREAS, ERIC } from "../fuente/modulo-5-crudo";
import type { TallerSemilla } from "@/lib/talleres/tipos";

/**
 * Módulo 5 · Profundización.
 *
 * Los módulos 1 a 4 son el programa de la Cámara. Este no: son cinco
 * actividades de ALQUIMIA que atacan huecos concretos del programa, y vive
 * aparte a propósito, por tres razones.
 *
 * La primera es de terminación. El Módulo 1 tiene once talleres y 195
 * campos; meter tres talleres más adentro habría diluido el avance de las
 * empresas que están a mitad de camino, y un taller sin terminar no produce
 * ninguna respuesta. Aquí nadie pierde porcentaje.
 *
 * La segunda es de propiedad: este contenido es reutilizable con cualquier
 * cámara sin discutir de quién es la metodología.
 *
 * La tercera es el precio de las dos anteriores, y hay que decirlo: **las
 * respuestas viven por módulo**, cada uno con su bitácora. Un taller de aquí
 * no puede leer el DOFA del Módulo 1 ni los atributos del Módulo 2. Donde
 * hacía falta ese insumo se pide traerlo a mano, y el aviso del taller lo
 * explica en vez de dejar a la empresa buscando un botón que no existe.
 */

const t1: TallerSemilla = {
  numero: 1,
  slug: "madurez-por-area",
  corto: "Madurez por área",
  titulo: "¿Qué parte de tu empresa está más atrasada?",
  lead:
    "Siete áreas, tres preguntas cada una. No mide si eres bueno: mide si el área tiene "
    + "método o se improvisa. Lo que salga aquí debería decidir en qué gastas el próximo año.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "diagnostico",
        bloques: [
          {
            tipo: "nota",
            id: "aviso-honestidad",
            cuerpo:
              "Responde con lo que **hay hoy**, no con lo que debería haber. Un diagnóstico "
              + "amable no sirve para nada: el valor de este taller es encontrar el área "
              + "floja, y si todas salen en verde no encontraste nada. «Se hace, sin método» "
              + "es la respuesta honesta de la mayoría de las microempresas en la mayoría de "
              + "las áreas, y no es un fracaso: es el punto de partida.",
          },
          {
            tipo: "matriz_escala",
            id: "madurez",
            escala: "madurez",
            ayuda:
              "**No existe**: nadie lo hace. **Se hace, sin método**: ocurre, depende de "
              + "quién esté. **Definido y escrito**: hay una forma acordada y está por "
              + "escrito. **Definido y medido**: además se mide y se revisa con cifras.",
            grupos: AREAS.map((a) => ({
              id: a.id,
              titulo: a.titulo,
              filas: a.afirmaciones.map((f) => ({ id: f.id, texto: f.texto })),
            })),
          },
        ],
      },
      {
        id: "conclusion",
        titulo: "Lo que el diagnóstico te dice",
        lead:
          "Las dos o tres áreas más flojas son las candidatas naturales a proyecto en el "
          + "Módulo 4. Anota la cifra de hoy: sin línea base, en un año no sabrás si mejoró.",
        bloques: [
          {
            tipo: "tabla",
            id: "brechas",
            columnas: [
              { id: "area", titulo: "Área más floja", marcador: "De las siete de arriba" },
              {
                id: "falta",
                titulo: "Qué falta exactamente",
                multilinea: true,
                marcador: "Lo que habría que tener y no se tiene",
              },
              {
                id: "cifra",
                titulo: "Cifra de hoy",
                marcador: "El número que debería mejorar",
                origen: true,
              },
              {
                id: "primero",
                titulo: "Qué se haría primero",
                multilinea: true,
                marcador: "La acción más pequeña que movería la aguja",
              },
            ],
            filasIniciales: 3,
            filasMinimas: 3,
            sugerencias: AREAS.map((a) => a.titulo),
          },
        ],
      },
    ],
  },
};

const t2: TallerSemilla = {
  numero: 2,
  slug: "cruce-dofa",
  corto: "Cruce DOFA",
  titulo: "¿Qué estrategias salen de tu DOFA?",
  lead:
    "El DOFA del Módulo 1 llena cuatro listas y ahí se detiene. Cruzarlas es el paso que "
    + "produce estrategias: una fortaleza frente a una oportunidad es algo que hay que "
    + "atacar ya; una debilidad frente a una amenaza es algo de lo que hay que defenderse.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "traer",
        titulo: "Primero, tu DOFA aquí",
        lead:
          "Abre el Módulo 1 · DOFA en otra pestaña y trae lo más importante de cada lista. "
          + "No se copia solo: cada módulo guarda sus respuestas por separado, y de paso "
          + "volver a escribirlas obliga a escoger las que de verdad pesan.",
        bloques: [
          {
            tipo: "cuadrantes",
            id: "dofa",
            ayuda:
              "Tres o cuatro por cuadrante, no diez. Si traes todo, el cruce de abajo se "
              + "vuelve inmanejable y acabas sin hacerlo.",
            cuadrantes: [
              { id: "f", titulo: "Fortalezas", subtitulo: "Dentro · a favor", color: "fav", lineas: 4 },
              { id: "d", titulo: "Debilidades", subtitulo: "Dentro · en contra", color: "des", lineas: 4 },
              { id: "o", titulo: "Oportunidades", subtitulo: "Fuera · a favor", color: "fav", lineas: 4 },
              { id: "a", titulo: "Amenazas", subtitulo: "Fuera · en contra", color: "des", lineas: 4 },
            ],
            // Las fortalezas y debilidades sí se sugieren solas: salen del
            // diagnóstico de madurez, que vive en este mismo módulo. Las
            // oportunidades y amenazas son del entorno y están en el Módulo 1.
            alimentadoPor: { fortaleza: "f", debilidad: "d" },
          },
        ],
      },
      {
        id: "cruzar",
        titulo: "Ahora el cruce",
        lead:
          "Cada casilla responde una pregunta distinta. Escribe acciones, no adjetivos: "
          + "«abrir una línea de mantenimiento» sirve; «aprovechar nuestra experiencia», no.",
        bloques: [
          {
            tipo: "cuadrantes",
            id: "cruce",
            cuadrantes: [
              {
                id: "fo",
                titulo: "FO · atacar",
                subtitulo: "¿Qué fortaleza aprovecha cuál oportunidad?",
                color: "fav",
                lineas: 3,
              },
              {
                id: "fa",
                titulo: "FA · defender",
                subtitulo: "¿Qué fortaleza nos protege de cuál amenaza?",
                color: "acento",
                lineas: 3,
              },
              {
                id: "do",
                titulo: "DO · corregir",
                subtitulo: "¿Qué debilidad nos impide tomar cuál oportunidad?",
                color: "med",
                lineas: 3,
              },
              {
                id: "da",
                titulo: "DA · sobrevivir",
                subtitulo: "¿Qué debilidad nos deja expuestos a cuál amenaza?",
                color: "des",
                lineas: 3,
              },
            ],
          },
          {
            tipo: "texto",
            id: "la-urgente",
            etiqueta: "De las doce casillas, ¿cuál no puede esperar?",
            marcador: "Una sola, y por qué esa",
          },
        ],
      },
    ],
  },
};

const t3: TallerSemilla = {
  numero: 3,
  slug: "eric-oceano-azul",
  corto: "ERIC",
  titulo: "¿En qué vas a dejar de competir?",
  lead:
    "Competir en lo mismo que todos, solo un poco mejor, es la forma más cara de ganarse la "
    + "vida. Este taller fuerza la decisión contraria: qué atributo se elimina, cuál se "
    + "reduce, cuál se incrementa y cuál se crea.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "eric",
        bloques: [
          {
            tipo: "nota",
            id: "aviso-atributos",
            cuerpo:
              "Ten a mano el **Módulo 2 · Atributos de valor**, donde calificaste cada "
              + "atributo de 1 a 5 contra tu competidor y contra el mercado. Esas tres "
              + "columnas son el insumo: donde el cliente valora mucho y tú estás por "
              + "debajo, hay que **incrementar**; donde el sector se esfuerza y al cliente "
              + "le da igual, se puede **eliminar**. Lo difícil no es la columna de crear: "
              + "es atreverse a llenar la de eliminar.",
          },
          {
            tipo: "cuadrantes",
            id: "matriz",
            cuadrantes: ERIC.map((q, i) => ({
              id: q.id,
              titulo: q.titulo,
              subtitulo: q.subtitulo,
              color: (["des", "med", "acento", "fav"] as const)[i]!,
              lineas: 3,
            })),
          },
        ],
      },
      {
        id: "curva",
        titulo: "La apuesta, en una frase",
        bloques: [
          {
            tipo: "texto",
            id: "nueva-curva",
            etiqueta: "¿En qué serás claramente distinto dentro de un año?",
            marcador:
              "Seremos la única empresa del sector que ___, y a cambio dejaremos de ___",
          },
          {
            tipo: "texto",
            id: "costo-de-dejar",
            etiqueta: "¿Qué pierdes al eliminar o reducir, y por qué vale la pena?",
            marcador: "Qué clientes o ingresos se van, y qué se gana con eso",
            requerido: false,
          },
        ],
      },
    ],
  },
};

const t4: TallerSemilla = {
  numero: 4,
  slug: "meta-mega",
  corto: "La MEGA",
  titulo: "¿Cuál es tu meta grande y audaz?",
  lead:
    "El programa se llama «Empresas con Propósito MEGA» y hasta ahora ningún taller te pedía "
    + "escribir la MEGA. Es una meta a diez años, con una cifra, lo bastante grande para que "
    + "dé algo de miedo decirla en voz alta.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "mega",
        bloques: [
          {
            tipo: "nota",
            id: "aviso-mega",
            cuerpo:
              "Una MEGA no es una proyección: es una **apuesta**. Se reconoce porque cumple "
              + "tres cosas. Tiene **una sola cifra** que no deja discutir si se cumplió. "
              + "Tiene **fecha**, a diez años. Y **no se alcanza haciendo más de lo mismo**: "
              + "si se logra con el negocio actual creciendo al ritmo actual, no es una MEGA, "
              + "es un presupuesto.",
          },
          {
            tipo: "texto",
            id: "declaracion",
            etiqueta: "La MEGA de tu empresa",
            marcador: "Para 2036 seremos ___ / habremos logrado ___",
            multilinea: false,
          },
          {
            tipo: "tabla",
            id: "cifra",
            ayuda:
              "Una cifra, dos, máximo tres. **Hoy** es el valor real de este momento, "
              + "aunque sea incómodo, y de ahí el selector de origen: si el valor de hoy es "
              + "una opinión, la meta también lo es.",
            columnas: [
              {
                id: "indicador",
                titulo: "La cifra que lo mide",
                marcador: "Ventas, clientes, empleados, municipios…",
              },
              { id: "hoy", titulo: "Hoy", marcador: "Valor actual", origen: true },
              { id: "meta", titulo: "En 2036", marcador: "Valor de la MEGA" },
            ],
            filasIniciales: 2,
            filasMinimas: 2,
          },
        ],
      },
      {
        id: "camino",
        titulo: "El camino",
        lead:
          "Diez años no se gestionan. Pon tres puntos intermedios: si en el primero ya vas "
          + "corto, la MEGA no era una apuesta sino un deseo.",
        bloques: [
          {
            tipo: "tabla",
            id: "hitos",
            columnas: [
              { id: "anio", titulo: "Año", marcador: "2029", numerica: true },
              {
                id: "donde",
                titulo: "Dónde debemos estar",
                multilinea: true,
                marcador: "Qué tiene que ser cierto ya para ese año",
              },
            ],
            filasIniciales: 3,
            filasMinimas: 3,
          },
          {
            tipo: "texto",
            id: "supuesto-del-mundo",
            etiqueta: "¿Qué tendría que ser cierto del mundo para que esto sea posible?",
            marcador:
              "Qué del entorno —mercado, regulación, tecnología— tiene que acompañar",
            requerido: false,
          },
        ],
      },
    ],
  },
};

const t5: TallerSemilla = {
  numero: 5,
  slug: "flujo-y-supuestos",
  corto: "¿Se puede pagar?",
  titulo: "¿Tu plan sobrevive a tu caja?",
  lead:
    "El Módulo 4 pide un presupuesto por actividad, pero nadie suma esos presupuestos contra "
    + "la plata que hay. Por eso los planes se mueren en el mes cuatro: no porque el proyecto "
    + "fuera malo, sino porque coincidieron tres pagos en el mismo mes.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "caja",
        bloques: [
          {
            tipo: "nota",
            id: "aviso-caja",
            cuerpo:
              "Escribe en pesos, mes a mes, lo que esperas que **entre** y lo que sabes que "
              + "va a **salir** — incluyendo los presupuestos del plan de acción del Módulo 4. "
              + "No busques precisión: busca el mes del valle. Equivocarse en un 20 % no "
              + "cambia la conclusión; no hacerlo, sí.",
          },
          {
            tipo: "flujo_caja",
            id: "flujo",
            meses: 12,
            mesInicial: 0,
            etiquetaInicial: "Caja con la que arrancas",
            ayuda:
              "El saldo del mes y el acumulado se calculan solos: no los escribas. El "
              + "acumulado es el que importa — es la plata que hay en el banco al cerrar "
              + "cada mes, y el que se pone en rojo primero marca la fecha límite.",
            entradas: [
              { id: "ventas", titulo: "Ventas cobradas" },
              { id: "otros", titulo: "Otros ingresos (aportes, crédito)" },
            ],
            salidas: [
              { id: "operacion", titulo: "Costos y gastos de operación" },
              { id: "plan", titulo: "Presupuesto del plan de acción" },
            ],
          },
        ],
      },
      {
        id: "supuestos",
        titulo: "El supuesto que lo mataría",
        lead:
          "Por cada proyecto grande: ¿qué estás dando por cierto que, si fuera falso, "
          + "tumbaría el proyecto? Y ¿cuál es la prueba más barata que lo verifica antes de "
          + "gastar el presupuesto completo?",
        bloques: [
          {
            tipo: "tabla",
            id: "criticos",
            ayuda:
              "Un supuesto útil es verificable y concreto: «los clientes pagarán 15 % más "
              + "por entrega en 24 horas» se puede probar la semana entrante con diez "
              + "llamadas. «El mercado va a crecer» no se puede probar ni refutar.",
            columnas: [
              { id: "proyecto", titulo: "Proyecto", marcador: "Del Módulo 4" },
              {
                id: "supuesto",
                titulo: "Lo que damos por cierto",
                multilinea: true,
                marcador: "Si esto fuera falso, el proyecto no tiene sentido",
              },
              {
                id: "cifra",
                titulo: "Cifra que lo sustenta",
                marcador: "El número en que te basas",
                origen: true,
              },
              {
                id: "prueba",
                titulo: "La prueba más barata",
                multilinea: true,
                marcador: "Qué harías esta semana para saberlo",
              },
              { id: "costo", titulo: "Cuesta ($)", numerica: true, marcador: "0" },
              { id: "cuando", titulo: "Para cuándo", marcador: "Fecha" },
            ],
            filasIniciales: 3,
            filasMinimas: 3,
          },
          {
            tipo: "texto",
            id: "decision",
            etiqueta: "Después de ver la caja, ¿qué cambia en tu plan?",
            marcador:
              "Qué proyecto se mueve de fecha, qué se recorta, qué plata hay que conseguir",
          },
        ],
      },
    ],
  },
};

export const MODULO_5 = {
  numero: 5,
  slug: "profundizacion",
  pregunta: "¿Qué tan firme es lo que decidimos?",
  titulo: "Profundización",
  lead: "Cinco actividades para poner a prueba el plan antes de ejecutarlo.",
  talleres: [t1, t2, t3, t4, t5] as TallerSemilla[],
};
