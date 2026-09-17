# ALQUIMIA — memoria del proyecto

## Fábrica de Aprendizaje

Modelo de EAFIT. El método son **los ocho momentos del Aprendizaje Experiencial** definidos
en la tesis de 2020: Conectar · Prestar atención · Imagen · Informar · Practicar · Extender ·
Refinar · Ejecutar. **No se inventa método nuevo**: se organiza el que existe.

Tiempos oficiales (guías LF001-CP y LF002-DT): 10·10·15·15·45·15·10·40 = **160 min**, contra
las 3 horas declaradas. Los 20 minutos sobrantes son los que ocupan la bienvenida (10) y el
cierre (10) que agregamos. Ningún momento pierde tiempo.

**La dinámica real del taller** —lo que no está escrito en ninguna guía y es el corazón—:
la instrucción se da **por encima a propósito**, se da tiempo para planear, el equipo se
desorganiza, falla, y **la información correctiva llega después de la primera corrida**.
En cada corrida el dato mejora. *Si el tallerista explica bien al principio, el taller no
funciona.*

### Documentos

| Archivo | Qué es |
|---|---|
| `docs/metodo/guia-metodologica-tallerista.md` / `.html` | Guía de 2 páginas para preparar un taller. Artifact: `906cc6ad-c5cd-4a4a-80d8-5e273290df0e` |
| `docs/metodo/ficha-diseno-taller.md` | Plantilla de contenido, una por taller |
| `docs/metodo/Guia-del-Tallerista.docx` | La guía en Word, carta, editable |
| `docs/metodo/gemelo-taller.html` | Gemelo digital · Capacidad de Producción. Artifact: `c9cbbb64-221d-4273-b8f5-772f85203e6a` |
| `docs/metodo/gemelo-oee.html` | **La Trampa del OEE** — gemelo de indicadores, 4 niveles. Artifact: `ed68e2c7-0dfe-4686-be84-aa8b489fa097` |
| `docs/metodo/jefe-de-planta.html` | **Jefe de Planta** — el mismo tema, jugable en celular, 5 niveles con puntaje. Artifact: `ce881141-c424-4b71-b3c7-65707c2e49f0` |
| `docs/metodo/sin-parar.html` | **SIN PARAR** — tercer gemelo, línea HEXA de 7 puestos. Artifact: <https://claude.ai/artifact/Pk9dYZtNESYkdsxW5StUyq> |
| `docs/metodo/ficha-sin-parar.md` | Ficha del taller de SIN PARAR, con el prompt que se le entrega a la IA |
| `docs/metodo/viaje-al-futuro.html` | **VIAJE AL FUTURO** — cuarto gemelo, en 3 pasos, con los datos que miden ellos. Artifact: <https://claude.ai/artifact/G4TPSJZnU77pPc79omKJtd> |
| `docs/metodo/ficha-viaje-al-futuro.md` | Ficha del taller + **hoja de toma de datos imprimible** |

### Preferencias de forma, aprendidas a los golpes

- **Corto.** La guía pasó de 4.200 palabras a 862 antes de servir. Si duda, corte.
- Sin ASCII art, sin rúbricas, sin «kit de frases», sin tablas de correspondencia.
- Nada de roles múltiples: **un** rol, el del tallerista.
- El checklist es **una sola lista**, no dividido por semana/día/hora.
- La sección 01 abre con **el rol del tallerista** —Mide · Devuelve · Corta—, no con
  «cómo funciona un taller». El taller se narra momento por momento en la sección 02;
  repetir el ciclo en la 01 era redundante.

---

## El gemelo digital — motor de simulación

`docs/metodo/gemelo-taller.html`. Vanilla JS, sin librerías, un solo archivo.
**Reutilizable para cualquier taller cambiando la configuración de estaciones.**

### Modelo

Línea de N estaciones en serie. Cada estación tiene un **contenido de trabajo** en segundos
y un número de operarios asignados; su tiempo de ciclo es `trabajo / operarios`. Entre
estaciones hay una cola con capacidad `CAP` (8). Tres estados por estación:

- **trabajando** — tiene unidad en proceso
- **espera** — sin material en su cola de entrada (*starving*)
- **bloqueado** — terminó una unidad y la cola de salida está llena (*blocking*)

El cuello de botella es `argmax(ciclo)`. La capacidad ociosa de cada estación es
`1 − ciclo_i / ciclo_cuello`.

### Configuración de la v01 (Capacidad de Producción)

```
E1 Preparar base           18 s
E2 Tornillería             42 s
E3 Montar cubierta         25 s
E4 Ajuste con herramienta  30 s
E5 Calidad y empaque       15 s
7 operarios · cola 8 · 25 min (1500 s) · meta 45 unidades
```

Resultados verificados contra cálculo analítico **y** contra el navegador:

| Asignación | Cuello | Unidades |
|---|---|---|
| `[2,1,1,2,1]` ingenua | Tornillería 42 s | **34** — falla la meta |
| `[1,3,1,1,1]` con datos | Ajuste 30 s | **47** — pasa |
| `[1,2,1,2,1]` óptima | Montar cubierta 25 s | **57** |

**La lección de fondo:** al reforzar el cuello obvio, **el cuello se muda a otra estación**.

### Decisiones de diseño que funcionaron

1. **Los tiempos de ciclo están ocultos en la corrida 1.** El visitante asigna a ciegas,
   igual que el equipo real. Se revelan en el momento 06. Sin esto no hay lección.
2. La corrida dura **14 segundos reales** = 1500 simulados (≈107×). El acelerador se
   expresa en **segundos**, no milisegundos — ese fue el bug de la primera versión.
3. La tarjeta de cierre se llena con **los números del visitante**, no con ejemplos.
4. Capacidad `sample` declarada: Claude revisa si el compromiso escrito tiene acción,
   métrica y fecha. Se oculta sola cuando `claude.use("sample")` devuelve `null`.

### Diseño visual

Papel cálido `#F7F6F3`, tinta `#191817`, un solo naranja de señal `#C9431C`.
La planta es un **panel oscuro** `#17161A` incrustado en el documento claro: la máquina es
la figura, el documento el fondo. Instrument Sans + Instrument Serif + JetBrains Mono para
telemetría. Tres estados de tema (claro / oscuro / sin estampar).

### Cómo verificarlo

`playwright` con el Chromium preinstalado en `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.
Se maneja la página de punta a punta y se contrastan las unidades producidas contra el
cálculo analítico. **Nunca publicar el gemelo sin correr esa prueba**: una simulación rota
se ve igual de bonita que una que funciona.

## Git

Rama de trabajo: `claude/fabrica-aprendizaje-metodologia-85cziy`.

---

## «La Trampa del OEE» — gemelo de indicadores Lean · `docs/metodo/gemelo-oee.html`

Artifact `ed68e2c7-0dfe-4686-be84-aa8b489fa097`. Segundo gemelo, mismo motor, otro tema.
**Un solo indicador en los cuatro niveles: OEE.** Lo que sube es la dificultad, no el
indicador. Elegido porque no se puede inflar: es un producto de tres factores.

`OEE = Disponibilidad × Rendimiento × Calidad = ciclo_ideal × buenas / tiempo_planeado`

Disponibilidad se mide **sobre la restricción**, que es la práctica estándar; medirla sobre
toda la línea daba Rendimiento por encima de 100%.

### Configuración calibrada — no tocar sin recalibrar

```
E1 Preparar base 20s · E2 Tornillería 40s · E3 Montar cubierta 22s
E4 Ajuste con herramienta 30s · E5 Calidad y empaque 18s      (total 130 s)
7 operarios · cola 8 · 1500 s · ciclo ideal 130/7 = 18,571 s/u · META 65%
MTBF/MTTR  [[2400,25],[230,55],[220,55],[210,58],[2400,25]]
defectos   [.004,.018,.004,.022,.004]
preventivo: cuesta 60 s, MTBF x5     ritmo forzado: ciclo x0.8, defectos x5, MTBF x0.4
nivel 4: MTBF x0.5
```

Los contenidos de trabajo son **20-40-22-30-18 a propósito**: con valores que empatan, el
cuello quedaba en una estación fiable y la disponibilidad salía 100%. Deben producir un
máximo único que además sea una máquina que se avería.

### La escalera verificada (navegador = cálculo analítico, al decimal)

| Nivel | Palanca nueva | Correcto | Errado |
|---|---|---|---|
| 1 | repartir operarios | `[1,2,1,2,1]` **79,2%** | `[2,1,1,2,1]` 43,3% |
| 2 | mantenimiento preventivo | con PM **73,0%** | sin PM 64,4% |
| 3 | ritmo normal / forzado | normal **69,3%** | forzado 61,9% |
| 4 | equipo viejo | PM + normal **66,9%** | forzado 55,7% |

El margen se estrecha nivel a nivel: +14,2 → +8,0 → +4,3 → +1,9. En el nivel 3 forzar
produce **70 unidades y solo 50 buenas**: ahí está el indicador vanidoso, en vivo.

### La trampa — el patrón, no el ejemplo

**La trampa es que la decisión que sube el número visible baja el número que importa.**
El jugador aprieta el acelerador, ve subir Rendimiento a 97,7% y produce 70 unidades: todo
en la pantalla dice que va ganando. Pero Calidad cae a 71,4% y el OEE se hunde a 61,9%.
Falla habiendo producido *más*.

Funciona por tres razones, y las tres son transferibles a cualquier gemelo futuro:

1. **El indicador es un producto, no una suma.** Un factor en el piso arrastra el total. Con
   un promedio la trampa no existe: se compensa.
2. **La palanca tramposa es la que la intuición pide primero.** «Vamos más rápido» es lo que
   dice cualquiera. El error tiene que ser el impulso natural, no una opción rara.
3. **La consecuencia llega separada de la acción.** Los defectos se acumulan durante la
   corrida y solo se leen al final. Si el castigo fuera inmediato, no habría trampa: habría
   un botón que nadie oprime.

**Receta para diseñar otra trampa:** buscar el indicador compuesto del tema, encontrar la
palanca que sube un factor y hunde otro, y esconder el daño hasta el veredicto.

### Reglas que aprendí construyéndolo

- **Calibrar en Python antes de escribir interfaz.** Un juego desbalanceado no enseña.
- **Paso de simulación fijo (0,25 s)** en JS igual que en el modelo. Con paso variable los
  números se corren y dejan de coincidir con la calibración.
- **Fallas deterministas y defectos con semilla fija**: la misma decisión debe dar siempre
  el mismo resultado, o la lección se enturbia.
- Para el OEE la forma correcta no es una gráfica: **un número héroe y tres medidores del
  mismo tono** —D, R y C son magnitudes de la misma clase, no categorías—, más una barra
  de parte-a-todo para producidas contra buenas.
- Verificar siempre con `drive3.mjs`: maneja los cuatro niveles y compara contra los
  valores esperados.


---

## «Jefe de Planta» — la versión jugable · `docs/metodo/jefe-de-planta.html`

Artifact `ce881141-c424-4b71-b3c7-65707c2e49f0`.

Clon de La Trampa del OEE, para que **los participantes lo jueguen en su celular antes de la
corrida física**. Mismo motor, misma calibración, mismo indicador. Lo que cambia es quién lo
usa y cómo se puntúa.

### Lo que decidió el negocio

- **Público:** estudiantes y empresarios del taller, en su propio celular o en grupo desde un
  computador de la Fábrica. **Móvil primero**, no adaptado después.
- **La secuencia es virtual → física.** Se juega, se falla barato, y después se monta en la
  línea real. Por eso la pantalla de cierre entrega **la asignación con la que cerró y el
  factor que más lo castigó**: es la hoja de ruta para la corrida física.
- **El puntaje premia entender, no correr.** Ver «reglas del puntaje» abajo.

### La apuesta — el mecanismo que hace que enseñe

Antes de cada corrida el jugador **se compromete con dos respuestas**:

1. ¿Con estas decisiones llega al 65%? — sí / no
2. ¿Cuál de los tres factores va a quedar más abajo? — Disponibilidad / Rendimiento / Calidad

Sin las dos respuestas el botón de arrancar no se habilita. Esto convierte el juego de
«probar hasta que pase» en **diagnosticar antes de actuar**, que es exactamente la pregunta
que el usuario quiere que el taller responda: *cómo sé si el indicador es vanidoso o me está
mostrando una falla real.*

**Empate técnico:** si el segundo factor más bajo está a menos de 3 puntos del primero, se
acepta cualquiera de los dos. Sin esa regla el nivel 2 sin preventivo era injusto — ahí
Rendimiento (78,8) y Disponibilidad (81,7) quedan a 2,8 puntos.

**Ojo con esto:** jugando bien, el factor más bajo es **siempre Rendimiento**. No es un
defecto del diseño, es la lección —cuando el mantenimiento y la calidad están resueltos, lo
único que queda por ganar es balanceo— pero el resumen tiene que decirlo explícitamente o el
jugador lo descubre como truco para farmear puntos. Por eso existe la tarjeta «Por qué le
salió Rendimiento casi siempre».

### Reglas del puntaje — 100 por nivel, 500 en total

| Concepto | Puntos |
|---|---|
| Pasar la meta | 50 |
| Acertar si pasaba o no | 15 |
| Acertar el factor más bajo | 15 |
| Pasar en la primera corrida | 20 (−20 por cada corrida extra) |

Rangos al cierre: 450 Ingeniero de mejora · 370 Jefe de planta · 280 Supervisor ·
170 Operario con criterio · 0 «Le creyó al indicador».

### El nivel 5 — producto nuevo

**Descartado primero:** bajar a 6 operarios. El máximo alcanzable es 45,8% contra una meta de
65%: nivel imposible. Se verificó antes de escribir interfaz.

**Lo que quedó:** una referencia nueva con el **mismo trabajo total, otro reparto**.

```
W nivel 5 = [30, 20, 40, 22, 18]   (contra [20,40,22,30,18] de los niveles 1-4)
correcto: [2,1,2,1,1] + preventivo + ritmo normal  ->  65,6%   (+0,6 sobre la meta)
copiar la asignación del nivel 4 [1,2,1,2,1]       ->  34,7%
```

El cuello se muda de Montar cubierta a **Ajuste con herramienta**. Se buscó por fuerza bruta
entre las permutaciones de los contenidos de trabajo, con tres condiciones: ganable pero
justo, cuello en una máquina que se avería, y que copiar la asignación anterior fallara feo.

**La escalera completa, margen sobre la meta:** +14,2 → +8,0 → +4,3 → +1,9 → **+0,6**.

### Diseño

- **El avatar es el operario que usted asigna**, no un adorno. Figuras SVG con casco que
  aparecen en la estación a la que las manda; se mecen cuando trabajan, se apagan al 32% de
  opacidad cuando esperan, y el casco se pone rojo en avería y ámbar en bloqueo. Así el
  desbalanceo **se ve**: dos operarios quietos en una estación rápida mientras uno solo suda
  en el cuello.
- Cada estación muestra su contenido de trabajo, su ciclo calculado en vivo y su holgura
  contra el cuello. Es el profesor de balanceo.
- Barra de progreso por estación, cola en cuadritos, y **dos bandejas —buenas y malas— que se
  llenan durante la corrida**. El daño se ve acumularse.
- Medidores: un solo tono; los dos factores sanos al 30% de intensidad y **el más bajo en
  acento pleno**. El color marca dónde mirar, no la categoría.
- Sin librerías, un archivo, 12 s reales por corrida, paso fijo de 0,25 s.

### Verificación — `drive5.mjs`

Maneja el juego en una pantalla de 390 px y contrasta los diez casos contra `cal5.py`.
Los cinco niveles de la jugada correcta y las cinco jugadas equivocadas coinciden **al
decimal**. Comprueba además que no haya desborde horizontal en celular. Los únicos errores de
consola son las fuentes de Google, que el contenedor no alcanza.

---

## «SIN PARAR» — tercer gemelo · línea HEXA · `docs/metodo/sin-parar.html`

Artifact <https://claude.ai/artifact/Pk9dYZtNESYkdsxW5StUyq>. Ficha del taller en
`docs/metodo/ficha-sin-parar.md`. Calibrador: `cal7.py`. Verificador: `drive7.mjs`.

Nace del documento «Estrategia de Optimización Industrial mediante Gemelos Digitales e IA»
y de las 7 fotos de la línea física. Tesis del documento, que es la del taller:

> «¿Usted cómo se le ocurre mejorarlo? Sin parar. La forma de mejorar sin parar es tener un
> gemelo digital.»

**Objetivo del taller:** que el participante aprenda a leer los indicadores de una línea para
decidir **qué mejorar primero**, y descubra que se mejora sin detener la planta.

### La pieza: HEXA, y por qué decide el diseño

Apilado hexagonal sobre 3 espárragos: base de acetal · placa transparente · amarilla · verde ·
azul · tuercas · tapa de tres brazos. **Cada placa viene partida en dos mitades que encajan en
zigzag.** La pieza ya está dividida en elementos separables con precedencia estricta, así que
el ensamble es una **cadena de 28 tareas** y un puesto es un **tramo de esa cadena**. Eso no
hubo que inventarlo: está en la pieza.

### El mecanismo nuevo: el jugador mueve los cortes

En los gemelos 01 y 02 las estaciones son fijas y se reparten operarios. Aquí **la única
palanca es dónde se corta la cadena**. Una persona por puesto; no puede haber más puestos que
participantes. Agregar un puesto **sí** baja el tiempo de ciclo; apurar a la gente **no**. Y
el resultado se traduce literalmente a la Fábrica: **dónde parte la fila**. El juego habla
siempre de **puestos**, nunca de «mesas»: decir «mover las mesas» hacía leer «mover mesas
*para* la planta» como si fuera un complemento y no el verbo *detener*.

### Configuración calibrada — no tocar sin correr `cal7.py`

```
28 tareas · trabajo total 182 s · jornada 8 h (28.800 s) · cola CAP=4
paso fijo 0,25 s · semilla 11 · ciclo ideal CI = 18,2 s (182/10, velocidad de diseño)
reconfigurar la línea real: 2.100 s (35 min) y la línea se vacía
máquinas (siguen a la tarea, no al puesto): t4 [2600,40] · t24 [2200,55] · t26 [1800,70]
micro-parada de cualquier puesto: [3200,50]
defectos: .0004 base · .0010 insertos · .0014 tuercas · .0016 torque
puesto sobrecargado (>1,15 × reparto parejo): defectos ×2,5
cortes de hoy [4,10,14,18,22,25,28] · óptimo 10 [4,6,10,13,16,19,22,24,26,28]
```

**`CI` es constante a propósito.** Con `CI = W/N` el OEE salía **no monótono** —con 9 puestos
daba peor que con 7— porque el ideal se movía junto con la gente. El ciclo ideal es la placa
de la línea, no función de cuánta gente le ponga hoy.

### El escalón — lo que destapó el modelo, no yo

| Puestos | 7 hoy | 7 recortados | 8 | 9 | **10** | 11 |
|---|---|---|---|---|---|---|
| Sale cada | 36,0 s | 28,0 s | 26,0 s | 25,0 s | **20,0 s** | 18,5 s |
| OEE | 47,4 % | 61,6 % | 65,4 % | 66,9 % | **86,2 %** | 92,5 % |

De 8 a 9 se gana **un** segundo; de 9 a 10 se ganan **cinco**, y diecinueve puntos de OEE.
Sale de cómo está partida la pieza. Es el nivel 2 entero y la pregunta que el participante se
hace solo: *«contraté a alguien y no pasó nada, ¿por qué?»*

### La trampa: «probemos en la línea» — verificada por simulación

| Jugada | Cambios físicos | OEE | Buenas |
|---|---|---|---|
| No tocar nada | 0 | 47,4 % | 750 |
| **Gemelo + 1 cambio** | 1 | **76,2 %** | **1.206** |
| Tanteo en la línea | 4 | 46,9 % | **742** |

**Tantear cuatro veces entrega menos piezas que no hacer nada**, con el OEE por debajo del
punto de partida. Cumple la receta: indicador compuesto, palanca que la intuición pide
primero, consecuencia diferida al cierre.

En la corrida, **la planta sigue produciendo mientras el jugador está en el gemelo** (el bucle
de animación no se detiene). Eso es lo que hace que la lección se sienta, no que se lea.

### El OEE aquí es diagnóstico, no meta

En «Jefe de Planta» el OEE **es** la meta. Repetirlo habría sido hacer el mismo taller dos
veces. Aquí las piezas dicen si ganó y **el OEE dice por qué**, porque cada factor lo rompe
una decisión distinta de este juego:

| Factor | Qué lo daña |
|---|---|
| Disponibilidad | parar la línea para reconfigurarla — la trampa |
| Rendimiento | el desbalanceo: bloqueo antes del cuello, espera después |
| Calidad | el puesto sobrecargado, que se equivoca más |

**Regla de lectura que entrega el cierre:** *Rendimiento mide su balanceo, Disponibilidad mide
sus paradas. Si Disponibilidad se le acerca a Rendimiento, está parando de más.*

### La escalera — correcto pasa, intuitivo falla

| Nivel | Gente | Meta | Correcto | Errado |
|---|---|---|---|---|
| 1 · La línea de hoy | 7 | takt ≤ 30,0 s | recortar a 7 parejos **28,0 s** | dejarlo como está 36,0 s |
| 2 · El escalón | 10 | takt ≤ 20,0 s | 10 puestos **20,0 s** | 9 puestos 25,0 s |
| 3 · La propuesta de la IA | 10 | OEE ≥ 72 % | 1 cambio temprano **76,2 %** | 2 cambios 63,7 % |
| 4 · Equipo viejo (×2 averías) | 10 | OEE ≥ 70 % | 1 cambio temprano **75,1 %** | 2 cambios 61,2 % |
| 5 · Referencia nueva | 10 | ≥ 1.000 buenas | recortar al reparto nuevo **1.182** | quedarse con lo de ayer 908 |

Nivel 5: la placa transparente lleva sellador y cada mitad pasa de 8 a 15 s. **Mismo trabajo
total**, otro reparto; con los cortes de ayer el takt salta a 30,0 s.

### La apuesta — dos preguntas, las mismas en los cinco niveles

1. ¿Cuántas **piezas buenas** va a entregar hoy? (`<800 · 800-1.000 · 1.000-1.200 · >1.200`)
2. ¿A qué **nota (OEE)** va a cerrar? (`<50 · 50-65 · 65-80 · >80`)

Se cayó «¿llega a los 20 s?»: era calculable sumando los cortes. **Se descartó «¿cuál factor
quedará más bajo?»** porque Rendimiento salía casi siempre — el defecto ya documentado en
«Jefe de Planta». Y **se cayó «¿cuántas veces va a parar la línea?»**: solo tenía sentido en
los niveles 3-5, en los niveles 1 y 2 la respuesta era forzosamente cero, y el usuario reportó
que la pregunta confundía más de lo que medía. Puntaje: 50 pasar · 25 la banda de piezas ·
25 la banda de nota = 100 por nivel, 500 en total.

**Los cortes de las bandas de piezas no son redondos por gusto:** separan la jugada correcta de
la errada en los cinco niveles (750/975 · 1.059/1.364 · 1.008/1.206 · 968/1.189 · 908/1.182).
Con las bandas anteriores —600/900/1.200— los niveles 4 y 5 caían los dos en la misma banda y
la pregunta no medía nada. Si se recalibran los tiempos, **hay que volver a mirar esto en
`niv.py` antes de mover las bandas.**

### La IA vive por fuera

Decisión del usuario. Los participantes le piden la configuración a ChatGPT o Claude en su
celular y la transcriben. **El gemelo es el validador**, que es el papel que le da el
documento. El prompt que se entrega está en la ficha.

### Reglas nuevas aprendidas aquí

- **El tiempo planeado del OEE en vivo es el transcurrido, no la jornada entera.** Con `T` fijo
  el indicador arrancaba en 13 % y subía solo porque el día avanzaba. Al cerrar da idéntico.
- **Verificar la mecánica, no solo los números.** `drive7.mjs` comprueba que la planta siga
  produciendo mientras el jugador está en el gemelo y que reconfigurar cobre 2.100 s exactos.
  Un motor correcto con la trampa rota no enseña nada.
- Las máquinas se atan a la **tarea**, no al puesto: si se atan al índice del puesto, mover un
  corte mueve la avería de sitio y el modelo deja de ser el mismo.
- Las máquinas se atan a la **tarea**, no al puesto (ver arriba).
- Los artifacts de este proyecto **no llevan** `<!DOCTYPE>`, `<html>`, `<head>` ni `<body>`:
  empiezan en `<title>` porque la plataforma pone el andamiaje al publicar.

### Lo que enseñó rehacer la interfaz para empresarios (v5)

El público son empresarios mirando un celular, no ingenieros. Tres reportes seguidos —«un poco
enredado», «el contador no me convence», «todavía no entiendo lo de parar la planta»— salieron
todos de lo mismo: **la pantalla pedía leer en vez de mirar.**

- **El estado de la línea es una gráfica, no una lista.** Una fila por puesto con su nombre, su
  estado en palabras y sus segundos son diez tarjetas y tres pantallas de deslizar. Una **barra
  por puesto, alta según lo que se demora**, cabe entera en media pantalla y el desbalanceo se
  ve sin leer nada. El acento marca el cuello; lo que se llena por dentro es el avance.
  Los segundos van **redondeados**: con diez puestos en 390 px el decimal no cabe, y el decimal
  exacto vive en el armado y en el cierre.
- **El mismo dibujo en las cuatro pantallas.** Las barras salen en el armado (fijas), en la
  ayuda (de ejemplo), en la corrida (vivas) y en la parada (apagadas). Reconocerlo cuesta una
  vez, no cuatro.
- **La cadena de 28 tareas es un acordeón.** Antes salían las 28 tareas y los 27 botones de
  corte de una vez: diez pantallas para decidir una cosa. Ahora se ven los **puestos completos**
  —que es lo que se compara para balancear— y se abre uno para mover sus cortes. **Arranca
  abierto el más lento**, que es donde hay que actuar.
- **Un costo se muestra, no se explica.** Reconfigurar cobra 2.100 s desde el principio, pero
  el jugador no lo sentía. Ahora, al confirmar, hay una pantalla con la línea apagada, un reloj
  que corre de 35:00 a 0:00 y el conteo de las piezas que no van a salir. `reconfig()` no
  cambió: la pantalla no toca el modelo, lo hace visible. Y el número de piezas está rotulado
  como lo que es —aritmética del ritmo, `2.100 ÷ takt`—, no como una lectura del modelo.
- **Explicar y mostrar, no una de las dos.** Además de la pantalla, la ayuda trae un paso
  «¿qué es detener la línea?» con las dos jugadas lado a lado: *probar en el computador —
  gratis* contra *detener la línea — 35 min*.
- **Cada pantalla arranca arriba.** Si el botón está al final de una pantalla larga, la
  siguiente entra por la mitad y parece rota. Al rearmar el acordeón sí se conserva el sitio.
- **Un botón deshabilitado sin explicación parece un juego trabado.** Cuando ya se usaron todas
  las personas, los «+ partir aquí» salen grises: hay que decir por qué y qué hacer.
- **Ojo con las clases genéricas.** El rótulo del eje se llamaba `.no` y `.paso .no` —el círculo
  naranja de los pasos de la ayuda— le ganaba por orden en la hoja: los números de puesto salían
  como bolas naranja. Se llama `.px`.
- **Al cambiar la interfaz hay que mover `drive7.mjs` con ella.** El acordeón escondió los
  `.cutrow` y el panel fijo se volvió `.takt`; el verificador dejó de encontrarlos. Los siete
  casos del motor contra `cal7.py` siguieron dando idéntico, que es la prueba de que se tocó
  la cara y no el modelo.

### Lo que queda por confirmar con la Fábrica

1. **Cuánta gente tiene un grupo** — fija el máximo de puestos. Con menos de 10 el nivel 2 no
   se puede recrear físicamente.
2. **Si se pueden montar más de 7 puestos.** Si no, el taller físico no reproduce el resultado.
3. **Los tiempos reales por tarea, con cronómetro.** Los actuales son estimados de las fotos y
   están marcados como tales en la ficha.

---

## «VIAJE AL FUTURO» — cuarto gemelo · 3 pasos · `docs/metodo/viaje-al-futuro.html`

Artifact <https://claude.ai/artifact/G4TPSJZnU77pPc79omKJtd>. Ficha en
`docs/metodo/ficha-viaje-al-futuro.md`. Calibrador `cal-viaje.py`, verificador
`drive-viaje.mjs`, contrato `esperado-viaje.json`.

Nace del informe «Sincronización entre Planta Real y Gemelo Digital» y del **instructivo
oficial del HEXA** (`Pasos_Ensamble_Rompecabezas.pdf`: 15 páginas, un paso por página, con
foto de antes y de después). Reemplaza a SIN PARAR en el taller y lo absorbe como Paso 3.

**La diferencia con los tres anteriores, y es la que importa:** en SIN PARAR la línea la
inventé yo. Aquí **la línea es la que el participante mide esa mañana con cronómetro**, y
el aplicativo tiene que demostrarle que el modelo es fiel antes de pedirle que le crea.
Eso es lo que el informe llama *el ancla de verdad*.

### Los tres pasos

| Paso | Qué hace | Por qué existe |
|---|---|---|
| **1 · La planta real** | formulario: puestos, pasos por puesto, segundos, lote, buenas/malas, paros **y su duración** · cierra con el OEE calculado a mano, con las tres divisiones escritas en pantalla | si el operario no *siente* la cuenta, no le cree a la proyección |
| **2 · La sombra digital** | el espejo (mismo OEE, por construcción) · **«los minutos que no aparecen»** · la proyección a 8 h, con apuesta antes de revelarla | una réplica **copia**, no mejora. Es lo que la hace creíble |
| **3 · El gemelo activo** | SIN PARAR con dos palancas —dónde se corta y cuánta gente— y veredicto en **piezas por persona y costo por pieza** | aquí empieza el juego |

**«Los minutos que no aparecen» es la mejor tarjeta del producto.** Los tiempos por puesto
suman menos de lo que duró el lote: `trabajo + (n−1)·ciclo + paros` contra el cronómetro.
Con los datos del informe faltan 1:09 sin explicar. Esa diferencia —arranque en frío, el
que se quedó buscando una pieza, el reproceso— es exactamente lo que un gemelo sirve para
encontrar, y sale de la aritmética, no de un discurso.

### Configuración — no tocar sin correr `cal-viaje.py`

```
15 pasos oficiales · trabajo de referencia 183 s · jornada 8 h · cola CAP=4
paso fijo 0,25 s · semilla 11 · reconfigurar la línea real: 2.100 s (35 min)
ciclo ideal CI = max(W) — el paso más largo. CONSTANTE, fijado en el Paso 1
defectos: .0008 base · .0015 capas (mitades chuecas) · .0010 columnas · .0018 tuercas
sobrecarga: 1 + 0,25 × (pasos del puesto − 3)
micro-parada: MTBF = (puestos × tiempo del lote) ÷ paros medidos · MTTR = duración medida
```

### Las cuatro decisiones de modelo, y las cuatro salieron de que el calibrador falló

1. **NO HAY MÁQUINAS. Las tuercas se aprietan a mano** — lo corrigió el usuario. Esta línea
   es ensamble 100 % manual, así que no hay averías de equipo y **no hay que inventar
   MTBF**: la única parada es la micro-parada de puesto y su frecuencia **se deriva de los
   paros que ellos midieron**. Es más fiel y quita una invención entera del modelo.
2. **`CI = max(W)`, no `W/N`.** Con el ciclo ideal atado al número de puestos, el OEE se iba
   **por encima de 100 %** al pasar de cierta dotación. El ideal de esta línea es su paso
   más largo: los pasos no se pueden partir, así que por más gente que contrate nunca sale
   una pieza más rápido que eso. Es la placa de la línea, y da una frase que el taller usa.
3. **La sobrecarga se mide en PASOS, no contra el promedio.** La regla de SIN PARAR
   —`ciclo > 1,15 × promedio`— aquí producía un artefacto grave: al agregar gente baja el
   promedio, y puestos que no habían cambiado de trabajo quedaban marcados como
   sobrecargados, así que **contratar empeoraba la calidad**. Falso. Lo verdadero y
   absoluto: *una persona con muchos pasos encima se olvida de uno.*
4. **La monotonía se verifica con tolerancia.** Las piezas buenas llevan azar: una caída del
   0,4 % entre dos dotaciones es ruido, no un error. Se compara la producción total en
   estricto y las buenas con 2 % de holgura.

### La trampa — y NO era la que yo había diseñado

Yo esperaba «más gente = más piezas pero menos piezas por persona», monótono. **El modelo
dijo otra cosa y es mejor:** las piezas por persona no bajan parejo, oscilan. La trampa real
es que **hay dotaciones que se pagan solas y otras que queman sueldos, y desde afuera no se
distinguen.**

```
6 puestos → 844 piezas      9 puestos  →   877     (tres personas por 33 piezas)
7 puestos → 844 piezas      10 puestos → 1.043     (una persona por 166)
8 puestos → 844 piezas
```

**Contratar al séptimo y al octavo no compra ni una pieza.** La gráfica del cierre lista
las quince dotaciones, no sólo las que cambian algo, y marca en gris las que sobran: la
lección se ve sin que nadie la explique. Es la pregunta literal del informe —*¿es rentable
duplicar la nómina para un incremento marginal?*— contestada con sus propios datos.

**El reto se plantea como negocio:** entregar la meta **con la menor cantidad de gente**.
Con «baje el ciclo» se gana poniendo gente hasta el tope, que es lo contrario de la lección.

**La meta sale de su dato, con dos topes:** 1,25 × lo que produce hoy, nunca por debajo de
lo que ya hace y nunca por encima de lo que se logra con el 80 % de los puestos posibles.
Se probó con 1,5× y quedaba pegada al tope.

### El barrido — la prueba que SIN PARAR nunca tuvo

Mañana miden con cronómetro y los tiempos van a ser otros. Si el juego sólo funciona con
mis estimados, no sirve. `cal-viaje.py` prueba **40 juegos de tiempos a ±40 %**:

```
DUROS  (modelo roto)              0 de 40
la dotación que quema sueldos    36 de 40
el escalón                       35 de 40
```

**Cuando una lección blanda no está en los datos de ese equipo, el aplicativo no la
muestra.** No se inventa una lección que no sea cierta para esa línea.

### Reglas nuevas aprendidas aquí

- **Calibrar no es ajustar números: es descubrir que el modelo miente.** Los cuatro errores
  de arriba los encontró el calibrador antes de que existiera una sola pantalla. Ninguno se
  habría visto en el navegador, porque **una simulación equivocada también se ve bonita**.
- **Separar invariantes duros de blandos.** Los duros dicen si el modelo está mal; los
  blandos enriquecen la lección y dependen de cómo caigan los tiempos. Mezclarlos lleva a
  aflojar un criterio que sí importaba para que «pase».
- **Cronometran por PUESTO, no por paso.** Nadie mide quince pasos sueltos en un taller. El
  tiempo del puesto se reparte entre sus pasos en proporción al estimado; la suma queda
  exacta, así que la sombra reproduce su dato al segundo. **Se rotula en pantalla.**
- **El bucle de corrida sólo puede ticar pasos completos.** `tick(R, Math.min(STEP,q))` tica
  pasos parciales y los números dejan de coincidir con la calibración. Se acumula y se ticа
  de a `STEP`, como en SIN PARAR.
- **Mirar las capturas, no sólo los asserts.** El verificador daba cero fallas mientras la
  pantalla decía *«le faltó reparto, no gente»* a alguien que con esa gente no llegaba ni
  con el mejor reparto: un consejo equivocado para un empresario, invisible para un test.
- `:nth-of-type(2)` cuenta hermanos del mismo **tag**, no de la misma clase. Si una casilla
  hay que verificarla, se le pone un `id`.

### La segunda vuelta: lo que pidió el usuario mirando la pantalla

Cuatro correcciones que no salieron de ningún test, sino de que él abrió el aplicativo.

1. **«Que ellos puedan escribir qué actividades hicieron y en qué orden.»** Tenía razón de
   fondo y el informe lo respalda: *los operarios deciden solos el balanceo*, así que lo
   que hicieron puede no ser lo que dice el instructivo. `ACT` pasó a ser **mutable**:
   renombrar, agregar, quitar y mover de orden. Efecto de lado que vale plata: **el
   aplicativo dejó de ser sólo del HEXA** — con otra lista modela cualquier línea manual.
2. **«También debe medir cuántas sacaron en X tiempo.»** Esto tapó un hueco real del
   modelo. El tiempo del lote **incluye el arranque en frío**, así que no dice a qué
   velocidad iba la línea ya estable. Contar piezas en una ventana sí lo dice, y se compara
   contra el tiempo de ciclo: con los datos de referencia el modelo permite una cada 32 s y
   ellos sacaban una cada 75 s. Esa diferencia, por pieza, **es mejora que no cuesta
   contratar a nadie**. Es el mejor diagnóstico del Paso 2 y no se me había ocurrido.
3. **«Que se vea movimiento como en SIN PARAR.»** El Paso 2 dejó de contar y pasó a
   **mostrar**: el computador arma delante de ellos las mismas piezas que acaban de armar a
   mano, con las barras llenándose, y después viaja las 8 horas. Ver salir su propio lote
   convence más que cualquier número.
4. **«Explique en cada parte cómo llenarlo, lenguaje simple.»** Ocho cajas `.como` con
   ejemplo concreto, y un mapa de las cinco secciones al principio para que la longitud no
   asuste. El formulario son 6,5 pantallas de celular: largo, pero se llena una sola vez de
   arriba abajo y cada sección dice exactamente qué anotar.

**El tiempo dejó de vivir en el puesto y pasó a vivir en la actividad.** Antes se
cronometraba por puesto y se repartía entre sus pasos en proporción al estimado; con la
lista editable esa cuenta sobra y **desapareció una fuente entera de error**. Escribir el
total de un puesto sigue funcionando: reescala sus actividades.

**Lección de método, y es la que más duele:** seis de mis reemplazos de texto fallaron en
silencio porque la cadena ya había cambiado, y el aplicativo quedó con una sola de las seis
cajas de ayuda. No lo vi hasta que el verificador contó `.como`. **Todo reemplazo de texto
va con `assert`**, y **toda sección nueva va con un test que la cuente**.

### La tercera vuelta: seis cosas que sólo se ven abriéndolo (v3)

- **No había ni una regla para pantallas grandes.** El único `@media` del archivo era el del
  tema oscuro, así que en un computador se veía una columna de celular de 693 px con dos
  márgenes enormes. Un solo bloque `@media (min-width:820px)` —columna a 44rem, letra a
  19 px, `.met`/`.opts` con `auto-fit`— y queda diseñado en los dos lados. **Es `min-width` a
  propósito: el celular no se toca.** Y ahora el verificador mide el desborde en 390 **y** en
  1280 px.
- **Un número sin con qué compararse no comunica nada.** «Veces lo de la prueba: 1,9» era
  cierto y nadie lo entendía: se quitó y su contenido pasó a una frase. «Piezas por persona:
  106» se quedó, pero ahora sale como **«121 de 141 posibles»** y con una línea que dice para
  qué sirve. La regla: *si un número obliga a preguntar «¿qué es esto?», o se explica al lado
  o se va.*
- **Trabajo total y tiempo de ciclo son dos números distintos y hay que decirlo.** Armar una
  pieza son 183 s de trabajo, pero sale una cada 32 s porque los puestos trabajan al tiempo.
  Estaba escondido en una nota de pie; ahora es una caja propia, y es justo lo que el taller
  enseña.
- **Los puestos deben sumar a la vista.** Se mostraban redondeados con decimales por dentro,
  así que lo que el participante suma no daba el total que ve. `escalarPuesto()` redondea a un
  decimal y le carga el sobrante a la actividad más larga: el total del puesto queda exacto.
- **«Juntar todo en un puesto» / «Repartir parejo».** Lo pidió él para ver la lista completa y
  el total sumado. Con los tiempos viviendo en las actividades, juntar y volver a partir **no
  cambia un solo segundo** — el verificador lo comprueba: 183,0 antes y después.
- **Una franja negra vacía que ningún test veía.** El panel del lote del Paso 2 sólo se
  repintaba en `S.f2===2`, así que al pasar al viaje quedaba un rectángulo negro en blanco.
  Se vio en una captura. Test nuevo: **ningún `.plant` puede quedar sin `.bars`**.

**Y la lección de método se repitió, con costo:** un lote de reemplazos abortó a la mitad por
un `assert`, y como el script escribe al final, **cuatro cambios que creí aplicados nunca se
escribieron**. Uno sobrevivió hasta la captura («2 pasos» donde debía decir «2 actividades»).
Cuando un lote falle, hay que **volver a verificar los que creía hechos**, no sólo los que
faltaban.

### Tres grupos al tiempo (v4)

El aplicativo **no tiene servidor, ni red, ni estado compartido**: todo vive en `D` y `ACT`
dentro de la página. Tres grupos abriendo el mismo enlace tienen tres copias independientes
y no se estorban. Eso ya funcionaba; lo que faltaba era otra cosa.

- **No guardaba nada.** Llenar el Paso 1 son diez minutos; si a alguien se le bloqueaba el
  celular o le daba «atrás», perdía todo. Ahora se guarda en `localStorage` del navegador de
  cada quien, en cada acción del usuario.
- **No se restaura solo, y eso es lo importante.** En un computador compartido de la Fábrica
  el grupo 2 abriría los datos del grupo 1 sin enterarse. Al abrir, si hay algo guardado sale
  un aviso con dos botones: **«seguir con esos»** o **«empezar de cero»**. La decisión es de
  ellos, no del aplicativo.
- **Hay que guardar en la acción, no en la pintada.** `verPaso1()` corre al abrir con los
  valores por defecto: si el guardado estuviera ahí, borraría de una lo que hubiera. Va en
  `re()`, que sólo se llama cuando el usuario toca algo.
- **Y «empezar de cero» no puede pasar por `re()`**, porque `re()` guarda: borraba y volvía a
  guardar en el mismo clic, y el aviso reaparecía en la siguiente recarga. Lo encontró el
  test, no yo.
- **Nombre del equipo**, porque son tres comparando en el tablero: sale en la barra de arriba
  y en la tarjeta «lo que se lleva a la línea real».
- Todo el `localStorage` va en `try/catch`: en ventana privada o con el almacenamiento
  bloqueado falla, y el aplicativo tiene que seguir funcionando igual.

**Publicar no es compartir.** Los artifacts nacen privados; el enlace se abre desde el menú
de compartir de la página. Antes de un taller hay que **probar el enlace desde un celular en
ventana de incógnito**, que es lo más parecido a lo que va a hacer un participante.

### Lo que sigue sin confirmar con la Fábrica

Sigue pendiente **cuántos puestos físicos se pueden montar**. El aplicativo deja el tope
configurable y marca los escenarios que hoy no se pueden montar, pero el número real hay
que ponerlo. Con 15 pasos el máximo teórico son **15 puestos, no 16** — aunque cada capa
son dos mitades, así que los pasos de capa se podrían partir si algún día hace falta.
