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
| `docs/metodo/gemelo-taller.html` | Gemelo digital. Artifact: `c9cbbb64-221d-4273-b8f5-772f85203e6a` |

### Preferencias de forma, aprendidas a los golpes

- **Corto.** La guía pasó de 4.200 palabras a 862 antes de servir. Si duda, corte.
- Sin ASCII art, sin rúbricas, sin «kit de frases», sin tablas de correspondencia.
- Nada de roles múltiples: **un** rol, el del tallerista.
- El checklist es **una sola lista**, no dividido por semana/día/hora.

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

## Gemelo de indicadores Lean — `docs/metodo/gemelo-oee.html`

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
