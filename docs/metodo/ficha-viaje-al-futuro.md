# FICHA DE DISEÑO DE TALLER · «VIAJE AL FUTURO»

Fábrica de Aprendizaje · de la planta real al gemelo digital, en tres pasos

Llena la plantilla [ficha-diseno-taller.md](ficha-diseno-taller.md). La
[guía metodológica](guia-metodologica-tallerista.md) no cambia.
El aplicativo es [`viaje-al-futuro.html`](viaje-al-futuro.html).

```
TEMA: Gemelo digital e indicadores   CÓDIGO: VF-01   VERSIÓN: 1   FECHA: ______
DURACIÓN: 180 min                    PARTICIPANTES: mín 7 / máx 15
ASIGNATURA O EMPRESA: _____________________________________________________

RESULTADO OBSERVABLE
Al terminar, el participante será capaz de medir su propia línea, cargar esos datos
en un modelo, comprobar que el modelo reproduce lo que midió, y decidir cuánta gente
necesita —y cuánta le sobra— sin detener la planta para averiguarlo.
```

**En qué se diferencia de «SIN PARAR»:** allá la línea venía inventada y el
participante jugaba. Aquí **la línea es la que ellos midieron esta mañana**, y el
aplicativo tiene que demostrarles que es fiel antes de pedirles que le crean. El juego
empieza en el Paso 3, no antes.

---

## MOMENTO 0 · BIENVENIDA · 10 min

**Por qué importa, en una frase:** toda empresa decide sobre su planta encendida; el que
sabe simular decide sin apagarla.

## MOMENTO 1 · CONECTAR · 10 min

**Detonante:** el HEXA armado, en la mano. Se pasa por la mesa sin explicar nada.

**Pregunta única:** *¿cuántas personas hacen falta para armar esto?*
Se anota en el tablero lo que digan. Nadie tiene el dato; ese es el punto.

## MOMENTO 2 · PRESTAR ATENCIÓN · 10 min

1. ¿Cuál de los puestos creen que va a ser el más lento?
2. Si contrataran a una persona más, ¿dónde la pondrían?
3. ¿Cuántas piezas creen que salen en un turno de 8 horas?
4. Para mejorar la línea, ¿hay que pararla?

**No se corrige ninguna respuesta.** Se anotan y se vuelven a sacar en el momento 6.

## MOMENTO 3 · IMAGEN · 15 min

**Consigna del dibujo:** dibuje la línea que van a montar y marque con una X dónde cree
que se van a amontonar las piezas.

## MOMENTO 4 · INFORMAR · 15 min · máximo 3 conceptos

| Concepto | Qué es | Dónde se va a ver |
|---|---|---|
| **Tiempo de ciclo** | lo que se demora el puesto más lento | en la barra naranja del Paso 2 |
| **OEE** | Disponibilidad × Rendimiento × Calidad | en la cuenta a mano del Paso 1 |
| **Réplica y gemelo** | la réplica copia; el gemelo acepta cambios | Paso 2 contra Paso 3 |

**La dinámica, dicha por encima:** «armen la pieza, tomen los tiempos, y después
metemos esos números al computador».

**Lo que NO se les explica:** que los tiempos por puesto no van a sumar lo que duró el
lote; que contratar de a uno casi no sirve; dónde está el cuello.

## MOMENTO 5 · PRACTICAR · 45 min

**Objeto de práctica:** la línea física primero, el aplicativo después.

1. **Arman 10 piezas de verdad** (20 min), con la hoja de toma de datos de abajo:
   un cronómetro por puesto, un anotador para los paros y uno para las piezas malas.
2. **Cargan sus datos en el Paso 1** (10 min) y calculan el OEE a mano con la pantalla.
3. **Pasan al Paso 2** (15 min): la sombra tiene que dar el mismo número.

**Métrica:** el OEE de cada equipo, escrito en el tablero.

**Lo crítico y fácil de olvidar:** que alguien cronometre **cuánto dura cada parada**,
no sólo cuántas hubo. Sin eso no hay Disponibilidad y el taller se queda sin OEE.

## MOMENTO 6 · EXTENDER · 15 min

**La conclusión que tiene que salir:** *los tiempos por puesto no explican todo lo que
duró el lote. La diferencia es lo que nadie está midiendo, y ahí está la mejora.*

**La información que entrego para corregir:** la tarjeta «los minutos que no aparecen»
del Paso 2, con los números de cada equipo.

**Pregunta del momento:** *¿en qué se le fueron esos minutos y por qué nadie los anotó?*

## MOMENTO 7 · REFINAR · 10 min

**Consigna:** pídale a ChatGPT o a Claude un reparto para su línea con el prompt de
abajo. Tradúzcalo a cortes y pruébelo en el Paso 3 **antes** de decir nada.

### El prompt que se les entrega

```
Actúa como ingeniero de balanceo de líneas.

Tengo una línea de ensamble manual con 15 pasos en cadena y precedencia estricta:
ninguno puede hacerse antes que el anterior. Estos son los tiempos en segundos,
en orden (reemplace por los suyos):

14, 18, 16, 16, 16, 16, 16, 10, 10, 7, 7, 7, 9, 12, 9

Un puesto es un tramo de pasos consecutivos y lo atiende una sola persona. El
tiempo de ciclo de la línea es el del tramo más cargado.

Dime con cuántas personas conviene montarla y dónde van los cortes, sabiendo que
quiero entregar al menos ____ piezas buenas en 8 horas al menor costo posible.
Responde sólo con los números de paso después de los cuales va cada corte.
```

**Lo que suele pasar y hay que dejar que pase:** la IA propone algo razonable pero
nunca considera paradas ni defectos, y casi siempre pone gente de más. Por eso se
valida en el gemelo. *La IA propone, el gemelo valida.*

## MOMENTO 8 · EJECUTAR · 40 min

**Escenario complejo:** el Paso 3 completo. Meta del día, y gana **quien llegue con la
menor cantidad de gente**. El que detiene la línea para probar pierde 35 minutos de
jornada y lo ve en la pantalla.

Después, **montarlo físicamente**: se corren los puestos al reparto que sacó el equipo
ganador —la tarjeta «lo que se lleva a la línea real» lo entrega paso por paso— y se
arma el HEXA de verdad, cronómetro en mano.

**Debe responder:** ¿el tiempo real coincide con el del gemelo? ¿En qué puesto se
separa y por qué?

## CIERRE · 10 min

**Pregunta de transferencia:** en su empresa, ¿qué decisión están tomando sobre la
planta encendida que podrían estar probando en un gemelo? ¿Y cuánta gente tiene puesta
donde no compra producción?

---

## HOJA DE TOMA DE DATOS · una por equipo

> Imprima esta página. Se llena a mano durante la corrida y después se transcribe al
> Paso 1. Que lleguen con todo anotado: escribir en el celular es lento.

```
EQUIPO: ______________________   FECHA: ____________

A · LA LÍNEA QUE MONTAMOS
   Puestos: ____      Personas: ____

   Puesto   Pasos que hace (del 1 al 15)   Segundos por pieza
   ------   ----------------------------   ------------------
     1      del ____ al ____                     ______
     2      del ____ al ____                     ______
     3      del ____ al ____                     ______
     4      del ____ al ____                     ______
     5      del ____ al ____                     ______
     6      del ____ al ____                     ______
     7      del ____ al ____                     ______
     8      del ____ al ____                     ______
     9      del ____ al ____                     ______
    10      del ____ al ____                     ______

B · LA CORRIDA DE PRUEBA
   Piezas que armamos en total .................. ______
   Cuánto nos demoramos (min:seg) ............... ____ : ____
   Cuántas salieron buenas ...................... ______
   Cuántas veces se detuvo la línea ............. ______
   Cuánto duró cada parada, en promedio (seg) ... ______

   Qué pasó en cada parada (una línea por parada):
   1) _______________________________________________________
   2) _______________________________________________________
   3) _______________________________________________________

C · LO QUE NOS DIO EL PASO 1
   Disponibilidad ____ %   Rendimiento ____ %   Calidad ____ %
   OEE ____ %

D · LO QUE NOS DIJO EL PASO 2
   El lote debería haber durado ____ : ____
   Se demoró ____ : ____      Sin explicar: ____ : ____
   Proyección a 8 horas: ______ piezas buenas
```

**Los 15 pasos del ensamble** (instructivo oficial del HEXA):

| # | Paso | # | Paso |
|---|---|---|---|
| 1 | Base y los 3 espárragos | 9 | Columnas: círculo pequeño y pentágono |
| 2 | Capa transparente · 2 mitades | 10 | Tuerca 1 · a mano |
| 3 | Transición transparente + amarilla | 11 | Tuerca 2 · a mano |
| 4 | Capa amarilla · 2 mitades | 12 | Tuerca 3 · a mano |
| 5 | Capa verde · 2 mitades | 13 | Colocar la hélice |
| 6 | Transición verde + azul | 14 | 2 tuercas de la hélice |
| 7 | Capa azul · 2 mitades | 15 | Última tuerca y almacenar |
| 8 | Columnas: círculo grande y triángulo | | |

---

## KIT DE MATERIALES

- 1 HEXA por equipo: base hexagonal + 3 espárragos + las capas partidas en dos mitades
  en zigzag (transparente, amarilla, verde, azul) · las columnas (círculo grande,
  círculo pequeño, triángulo, pentágono) · 6 tuercas · hélice de tres brazos.
  **Las tuercas se aprietan a mano: no hace falta llave.**
- Mesas suficientes para llegar a **10 puestos**, no 7
- **Un cronómetro por puesto** · un cronómetro más para los paros · tablero
- Esta hoja impresa, una por equipo
- El aplicativo abierto: [`viaje-al-futuro.html`](viaje-al-futuro.html)

## CRITERIO DE ÉXITO

```
[ ] Cada equipo con su hoja de datos llena, incluida la duración de los paros
[ ] Cada equipo vio su propio OEE aparecer igual en el Paso 1 y en el Paso 2
[ ] Al menos un equipo nombró en voz alta en qué se le fueron los minutos que faltaban
[ ] Al menos un equipo descubrió solo que hay dotaciones que no compran producción
[ ] La línea física quedó montada con el reparto que salió del Paso 3
[ ] Se comparó el dato físico contra el del gemelo y se anotó dónde se separan
[ ] Encuesta ≥ 4 de 5 en «el ejercicio explicó el concepto»
```

---

## NOTA TÉCNICA

Los tiempos que trae precargados el aplicativo son **estimados de las fotos del
instructivo** y están marcados como tales: sirven para que el taller no se trabe si
falla el cronómetro. El dato bueno es el que ellos midan.

El calibrador (`verificacion/cal-viaje.py`) probó el juego con **40 juegos de tiempos
distintos, a ±40 % del estimado**: el modelo aguanta los cuarenta. La lección de «hay
dotaciones que queman sueldos» aparece en 36 de 40 y el escalón en 35 de 40 — cuando no
están en los datos de un equipo, el aplicativo **no las muestra**, porque no se inventa
una lección que no sea cierta para esa línea.
