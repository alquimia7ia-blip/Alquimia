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
| `docs/metodo/jefe-de-planta.html` | **Jefe de Planta** — el mismo tema, jugable en celular, 5 niveles con puntaje. Artifact: `PENDIENTE` |

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
