/**
 * Contenido del Módulo 1 · "Entorno Empresarial", transcrito del PowerPoint
 * del programa Empresas con Propósito MEGA (Cámara de Comercio del Aburrá
 * Sur, docentes Hernando Granados Cortés y Luis Enrique Ortiz).
 *
 * Extraído literalmente de docs/taller-mega-modulo-1.html, líneas 421-518,
 * sin reescribir una palabra: lo que cambia es el envase, no el taller.
 * Este archivo es la fuente; supabase/seed/modulo-1/ lo convierte en
 * definiciones de bloques.
 */

export const TENDENCIAS: [string, string, string][] = [
  ["esp","Espiritualidad","Vivir en armonía propia y con los demás."],
  ["sin","Singularidad","Recibir trato personalizado y único."],
  ["pso","Prácticas sociales","Cambios en las formas de trabajar, la concepción del bienestar y en las relaciones interpersonales."],
  ["gob","Gobernanza y gobernabilidad","Cambios políticos en la forma de gobernar la voluntad ciudadana y de las organizaciones de la sociedad civil."],
  ["sos","Sostenibilidad","Conciencia sobre la necesidad de garantizar los recursos sociales, económicos y naturales."],
  ["cli","Variabilidad y adaptación climática","Conciencia sobre los factores de riesgo asociados a fenómenos climáticos: deforestación, contaminación del aire y del agua, sobreexplotación de recursos, especies invasoras."],
  ["dig","Digitalización e Inteligencia Artificial","Apropiación y aplicación de tecnologías a los procesos empresariales."],
  ["hip","Hiperconectividad","Interacción de y entre las personas, las organizaciones y las tecnologías."],
  ["red","Redes de colaboración","Sentido de colaboración entre personas y organizaciones."],
  ["dem","Cambios demográficos y estilos de vida","Nuevas formas y configuraciones de las personas y grupos poblacionales."],
  ["ssa","Sostenibilidad social, ambiental y económica","Conciencia de la necesidad de hacer perdurable los distintos ecosistemas."],
  ["urb","Urbanización, migración e inmigración","Procesos de concentración y desplazamiento interno y externo a los territorios."],
  ["aut","Autocuidado","Concientización de las personas de hacerse responsables de sí mismas de manera integral."],
  ["pro","Vivir con propósito","Concientización de las personas sobre su función o proyecto de vida."],
  ["inm","Inmediatez","Urgencia de las personas por obtener aspiraciones, productos o servicios con prontitud."]
];

export const PESTEL: [string, string, string, string[]][] = [
  ["dg","Demográfico","#", [
    "Cambios socioeconómicos",
    "Matrimonios y uniones más tardías, familias pequeñas",
    "Cambios en hábitos de consumo",
    "Aumento en la expectativa de vida",
    "Ciudades más urbanas que rurales",
    "Nueva concepción de las personas sobre el trabajo",
    "Hogares multigeneracionales",
    "Inmigración por búsqueda de oportunidades",
    "Población más educada, informada y exigente",
    "Conciencia e inclusión ambiental, social y económica"
  ]],
  ["sc","Sociocultural","#", [
    "Pensamiento comunitario",
    "Flexibilidad en horarios y tiempos de trabajo",
    "Las personas eligen la empresa para la que trabajan",
    "Trabajar desde cualquier lugar",
    "Nuevos estilos de vida y valores diferentes",
    "Las redes sociales como canal de información",
    "Sensibilidad social, inclusión e igualdad"
  ]],
  ["ec","Económico","#", [
    "Multiplicidad de monedas",
    "Mejores salarios, ingresos y poder adquisitivo",
    "Tasas de desempleo y cambio en expectativas laborales",
    "Cambios en el consumo y desigualdad en ingresos"
  ]],
  ["pl","Político · gobernabilidad · legal","#", [
    "Inseguridad jurídica: fiscal y laboral",
    "Mayores exigencias en seguridad y salud en el trabajo",
    "Certificaciones obligatorias exigentes",
    "Patentes y mayor importancia de las alianzas",
    "Dominio de normas internacionales",
    "Clima político no favorable para los negocios",
    "Protección de la identidad personal y empresarial",
    "Marco jurídico del país: laboral, pensional y salud"
  ]],
  ["tc","Tecnológico","#", [
    "Convergencia entre tecnología y medio ambiente",
    "Big data y digitalización",
    "Robotización, realidad virtual e IA frente a productividad",
    "Energías alternativas",
    "Mundo digital y reingeniería digital",
    "Plataformas de e-learning y aprendizaje en casa"
  ]],
  ["gl","Global","#", [
    "Guerra comercial",
    "Ética en los negocios globales",
    "Conocimiento en crecimiento y continua evolución",
    "Ciberseguridad",
    "Trazabilidad y transparencia en las transacciones",
    "Moneda global única",
    "Corrupción"
  ]]
];

export const FUERZAS: [string, string, string, string][] = [
  ["riv","Rivalidad entre competidores existentes",
   "Examine la intensidad de la competencia actual en el mercado: número de competidores, sus capacidades, activos estratégicos, formas de competir y decisiones para lograr mayor participación.",
   "Grado de concentración; interés estratégico de la empresa; crecimiento del sector; falta de diferenciación en la solución total; costos de cambio; economías de escala y capacidad ociosa; relevancia de la marca y reputación; similitud o diferenciación de propuestas; rol corporativo de la empresa; barreras de salida."],
  ["pro","Poder negociador de los proveedores",
   "Concluya qué tanto poder tiene la empresa para negociar con sus proveedores los precios y calidades de las materias primas e insumos de su cadena productiva. El grado de dependencia y la imposibilidad de sustituir es determinante.",
   "Posibilidad de integración hacia adelante; grado de importancia del insumo o materia prima; porcentaje y grado de concentración sobre las compras."],
  ["com","Poder negociador de los compradores",
   "Concluya qué tanto poder tiene la empresa para imponer precios en el mercado, el grado de diferenciación de su propuesta y la sensibilidad de los clientes a los cambios de precio.",
   "Grado de concentración; posibilidad de integrarse hacia atrás; costo de cambio; peso de la compra en los costos del comprador; conflicto de intereses en el proceso; importancia de la reputación del proveedor; sensibilidad al precio; impacto en cumplimiento, calidad y desempeño."],
  ["nue","Amenaza de nuevos competidores",
   "Evalúe qué tan fácil es para nuevos competidores entrar al mercado en el que participa la empresa y cómo puede afectar su participación y su margen de rentabilidad.",
   "Requerimientos de capital; costos de cambio; economías de escala; curva de aprendizaje; diferenciación de soluciones; represalias esperadas y competencia por precio; acceso a clientes; barreras de entrada; desventajas de costos; políticas y facilidades gubernamentales."],
  ["sus","Amenaza de productos o servicios sustitutos",
   "Concluya cuántos productos hay en el mercado que puedan reemplazar fácilmente el producto o servicio que vende la empresa.",
   "Costos de cambio reducidos o altos; desempeño superior; exigencias y regulaciones ambientales; energías renovables; impacto en la propuesta de valor."]
];

export const IND_SUGERIDOS = ["Nivel de ventas","Margen de utilidad total","Margen por línea de producto",
  "Número de clientes","Gastos totales","Gastos por línea de producto","Costos de impuestos","Inversiones"];
export const VALORES_SUGERIDOS = ["Honestidad","Respeto","Lealtad","Transparencia","Compromiso","Servicio","Innovación","Responsabilidad","Puntualidad","Trabajo en equipo"];
export const PROC_PROD = ["Gestión de clientes","Gestión de la producción"];
export const PROC_SOP  = ["Talento humano","Financiera y contable"];
