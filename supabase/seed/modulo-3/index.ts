import { COMPETENCIAS_BLANDAS, COMPETENCIAS_DURAS } from "../fuente/modulo-3-crudo";
import type { TallerSemilla } from "@/lib/talleres/tipos";

/**
 * Módulo 3 · Transformación organizacional.
 *
 * La presentación trae cuatro talleres diligenciables; los talleres 3 a 6
 * de la numeración original viven en un archivo de Excel aparte que todavía
 * no llega, así que aquí no están. Cuando llegue, entran como bloques más
 * sin tocar nada de esto.
 *
 * El taller de reflexión sobre el líder es el único del programa que la
 * presentación marca como no socializable. Esta plataforma todavía no tiene
 * campos privados por persona —la bitácora es de la empresa y la ve todo el
 * equipo—, así que se incluye con el aviso por delante en vez de dejarlo
 * fuera sin decir nada.
 */

const t1: TallerSemilla = {
  numero: 1,
  slug: "perfil-del-lider",
  corto: "Perfil del líder",
  titulo: "¿Quién está liderando esta transformación?",
  lead:
    "Reflexión sobre el perfil de quien lidera la empresa. Puede ser usted mismo o un " +
    "colaborador. No hay respuesta correcta: hay respuesta honesta.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "lider",
        bloques: [
          {
            tipo: "nota",
            id: "aviso-privacidad",
            cuerpo:
              "En la presentación este taller **no se socializa**. Ten en cuenta que la " +
              "bitácora es de la empresa: **lo que escribas aquí lo puede ver el resto de " +
              "tu equipo**. Si prefieres que quede solo para ti, trabájalo aparte hasta " +
              "que exista el campo personal.",
          },
          {
            tipo: "texto",
            id: "quien",
            etiqueta: "¿Sobre quién es esta reflexión?",
            marcador: "Tú mismo, o el nombre y cargo de la persona",
            multilinea: false,
          },
          {
            tipo: "lista_numerada",
            id: "positivos",
            etiqueta: "Aspectos positivos",
            lineas: 4,
            marcador: "Lo que esta persona ya aporta al liderazgo de la empresa",
          },
          {
            tipo: "lista_numerada",
            id: "mejorar",
            etiqueta: "Aspectos a mejorar",
            lineas: 4,
            marcador: "Lo que hoy le falta para liderar la transformación",
          },
        ],
      },
    ],
  },
};

const t2: TallerSemilla = {
  numero: 2,
  slug: "valores-empresariales",
  corto: "Valores",
  titulo: "¿Qué conductas esperas de cada persona del equipo?",
  lead:
    "Los valores describen las conductas esperadas de cada coequipero en el desarrollo de " +
    "las actividades, dentro y fuera de la empresa.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "valores",
        bloques: [
          {
            tipo: "nota",
            id: "aviso-valores",
            cuerpo:
              "Retoma los valores que identificaste en el **Módulo 1** y confróntalos con " +
              "las declaraciones del **Módulo 2**: propósito, atributos y propuesta de " +
              "valor. Ajústalos según consideres — un valor que no sostiene la propuesta " +
              "de valor sobra.",
          },
          {
            tipo: "tabla",
            id: "valores",
            columnas: [
              { id: "valor", titulo: "Valor", marcador: "Nombre" },
              {
                id: "descripcion",
                titulo: "Qué significa en esta empresa",
                multilinea: true,
                marcador: "La conducta concreta que se espera, no la definición del diccionario",
              },
            ],
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
  slug: "competencias",
  corto: "Competencias",
  titulo: "¿Qué tiene que saber hacer la gente para cumplir la promesa?",
  lead:
    "Define las características y conductas que requiere la empresa para cumplir el " +
    "propósito, los atributos y la propuesta de valor que declaraste en el Módulo 2.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "blandas",
        titulo: "Competencias blandas",
        bloques: [
          {
            tipo: "nota",
            id: "aviso-competencias",
            cuerpo:
              "Las **blandas** tienen que ver con la persona; las **duras**, con " +
              "conocimientos o habilidades. Toca un ejemplo para insertarlo y edítalo " +
              "después. Quédate con las que de verdad materializan tu propuesta de valor.",
          },
          {
            tipo: "chips_agregables",
            id: "blandas",
            etiqueta: "Competencias blandas que necesita la empresa",
            descripcion: "Relacionadas con la persona.",
            textoAgregar: "+ Agregar competencia",
            sugerencias: COMPETENCIAS_BLANDAS,
            esperadas: 5,
          },
        ],
      },
      {
        id: "duras",
        titulo: "Competencias duras",
        bloques: [
          {
            tipo: "chips_agregables",
            id: "duras",
            etiqueta: "Competencias duras que necesita la empresa",
            descripcion: "Relacionadas con conocimientos o habilidades.",
            textoAgregar: "+ Agregar competencia",
            sugerencias: COMPETENCIAS_DURAS,
            esperadas: 5,
          },
        ],
      },
    ],
  },
};

const t4: TallerSemilla = {
  numero: 4,
  slug: "estructura-organizacional",
  corto: "Estructura",
  titulo: "¿Con qué cargos vas a cumplirla, y cuáles faltan?",
  lead:
    "La estructura actual más los cargos que hay que crear en los próximos años para " +
    "sostener la propuesta de valor.",
  definicion: {
    version: 1,
    secciones: [
      {
        id: "estructura",
        bloques: [
          {
            tipo: "nota",
            id: "aviso-estructura",
            cuerpo:
              "La presentación pide **graficar** el organigrama. Aquí se registra como " +
              "tabla: la columna **Depende de** es la que dibuja la jerarquía, y marcar un " +
              "cargo como **nuevo** es lo que convierte este taller en plan de acción.",
          },
          {
            tipo: "tabla",
            id: "cargos",
            columnas: [
              { id: "cargo", titulo: "Cargo", marcador: "Nombre del cargo" },
              { id: "depende", titulo: "Depende de", marcador: "Cargo al que reporta" },
              {
                id: "responsabilidad",
                titulo: "Responsabilidad principal",
                multilinea: true,
                marcador: "Qué responde este cargo ante la propuesta de valor",
              },
              { id: "estado", titulo: "Actual o nuevo", marcador: "Actual / Nuevo" },
              {
                id: "cuando",
                titulo: "Cuándo se crea",
                marcador: "Año",
                requerida: false,
              },
            ],
            filasIniciales: 5,
            filasMinimas: 5,
          },
        ],
      },
    ],
  },
};

export const MODULO_3 = {
  numero: 3,
  slug: "transformacion-organizacional",
  pregunta: "¿Con quién lo haremos?",
  titulo: "Transformación organizacional",
  lead: "Las personas, las competencias y la estructura que sostienen la promesa.",
  talleres: [t1, t2, t3, t4] as TallerSemilla[],
};
