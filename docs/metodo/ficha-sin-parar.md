# FICHA DE DISEÑO DE TALLER · «SIN PARAR»

Fábrica de Aprendizaje · línea de ensamble **HEXA**

Llena la plantilla [ficha-diseno-taller.md](ficha-diseno-taller.md). La
[guía metodológica](guia-metodologica-tallerista.md) no cambia.
El gemelo digital es [`sin-parar.html`](sin-parar.html).

```
TEMA: Gemelo digital e indicadores   CÓDIGO: SP-01   VERSIÓN: 1   FECHA: ______
DURACIÓN: 180 min                    PARTICIPANTES: mín 7 / máx 12
ASIGNATURA O EMPRESA: _____________________________________________________

RESULTADO OBSERVABLE
Al terminar, el participante será capaz de leer el OEE de una línea, decir cuál
de los tres factores la está frenando, y decidir si un cambio vale la parada que
cuesta.
```

---

## MOMENTO 0 · BIENVENIDA · 10 min

**Por qué importa, en una frase:** toda planta que mejora tiene que decidir si para
para mejorar; el que sabe simular no tiene que escoger.

## MOMENTO 1 · CONECTAR · 10 min

**Detonante:** el HEXA armado, en la mano. Se pasa por la mesa sin explicar nada.

**Pregunta única:** *¿cuántas personas hacen falta para armar esto?*
Se anota en el tablero lo que digan. Nadie tiene el dato todavía; ese es el punto.

**Si falla** —si nadie habla— se desarma el HEXA delante de ellos y se vuelve a
preguntar.

## MOMENTO 2 · PRESTAR ATENCIÓN · 10 min

1. ¿Cuál de los siete puestos creen que es el más lento? ¿Por qué ese?
2. Si contrataran a una persona más, ¿dónde la pondrían?
3. ¿Cuánto creen que se demora la línea en sacar una pieza?
4. Para mejorar la línea, ¿hay que pararla?

**No se corrige ninguna respuesta.** Se anotan.

## MOMENTO 3 · IMAGEN · 15 min

**Consigna del dibujo:** dibuje la línea de siete puestos y marque con una X dónde
cree que se amontonan las piezas.

Se guardan los dibujos. Se vuelven a sacar en el momento 6.

## MOMENTO 4 · INFORMAR · 15 min · máximo 3 conceptos

| Concepto | Qué es | Dónde se va a ver |
|---|---|---|
| **Tiempo de ciclo** | lo que se demora el puesto más lento | en el número grande del juego |
| **OEE** | Disponibilidad × Rendimiento × Calidad | en los tres medidores |
| **Gemelo digital** | la línea simulada, donde equivocarse no cuesta | en el botón «ensayar» |

**La dinámica, dicha por encima:** «van a dirigir la línea. Tienen que bajar el
tiempo de ciclo. Ahí está el juego, en el celular.»

**Lo que NO se les explica:** que agregar puestos de a uno casi no sirve; que parar
la línea para reconfigurarla se come la ganancia; dónde está el cuello.

## MOMENTO 5 · PRACTICAR · 45 min

**Objeto de práctica:** el gemelo [`sin-parar.html`](sin-parar.html), niveles 1 a 3,
en el celular de cada uno o en grupos de tres en un computador de la Fábrica.

**Meta:** pasar el nivel 2 — una pieza cada 20,0 s.
**Métrica:** puntos del juego y OEE de cierre, escritos en el tablero por equipo.

**Minutos de planeación:** ninguno. Se entra al juego de una.

**Si cumplen rápido, la variación es:** nivel 4, equipo viejo.

## MOMENTO 6 · EXTENDER · 15 min

**La conclusión que tiene que salir:** *agregar gente no baja el tiempo de ciclo;
repartir el trabajo sí. Y de 9 a 10 puestos se gana cinco veces más que de 8 a 9.*

**La información que entrego para corregir:** la tabla del escalón.

| Puestos | 7 hoy | 7 recortados | 8 | 9 | **10** | 11 |
|---|---|---|---|---|---|---|
| Sale cada | 36,0 s | 28,0 s | 26,0 s | 25,0 s | **20,0 s** | 18,5 s |
| OEE | 47,4 % | 61,6 % | 65,4 % | 66,9 % | **86,2 %** | 92,5 % |

**Segunda corrida:** sí — con los dibujos del momento 3 al lado, para que vean
dónde creían que estaba el cuello.

**Cálculos que debe hacer:** sumar los tiempos de su tramo más cargado y
compararlo con 182 ÷ número de puestos.

## MOMENTO 7 · REFINAR · 10 min

**Consigna:** pídale a ChatGPT o a Claude una configuración para esta línea, con el
prompt de abajo. Tradúzcala a cortes, pruébela en el gemelo **antes** de decir nada.

### El prompt que se les entrega

```
Actúa como ingeniero de balanceo de líneas.

Tengo una línea de ensamble manual con 28 tareas en cadena y precedencia
estricta: ninguna tarea puede hacerse antes que la anterior. Estos son los
tiempos, en segundos, en orden:

4, 5, 5, 5, 8, 8, 5, 5, 5, 5, 6.5, 6.5, 6, 6, 6.5, 6.5, 6, 6, 6.5, 6.5,
6, 6, 8, 8, 9, 9, 10, 8

Tengo 10 personas. Cada persona atiende un puesto, y un puesto es un tramo
de tareas consecutivas. El tiempo de ciclo de la línea es el del tramo más
cargado.

Repárteme las tareas en 10 puestos de forma que el tramo más cargado sea lo
más pequeño posible. Respóndeme solo con los números de tarea después de los
cuales va cada corte, separados por guiones. Nada más.
```

**Lo que suele pasar y hay que dejar que pase:** la IA propone algo razonable pero
no siempre óptimo, y **nunca** considera averías ni defectos. Por eso se valida en
el gemelo. Esa es la frase del momento: *la IA propone, el gemelo valida.*

## MOMENTO 8 · EJECUTAR · 40 min

**Escenario complejo:** nivel 5 del juego — entra otra referencia y la asignación de
ayer ya no sirve. Y después, **montarlo físicamente**: se corren las mesas de la
Fábrica a los cortes que el equipo ganador sacó en «lo que se lleva a la mesa», y se
arma el HEXA de verdad, cronómetro en mano.

**Debe responder:** ¿el tiempo real coincide con el del gemelo? ¿En qué puesto se
separa y por qué?

*Los tiempos por tarea de esta ficha son estimados. La primera corrida física es la
que los vuelve reales: se anotan y se recalibra el gemelo.*

## CIERRE · 10 min

**Pregunta de transferencia:** en su empresa, ¿qué decisión están tomando sobre la
planta encendida que podrían estar probando en un gemelo?

---

## KIT DE MATERIALES

- 1 HEXA por equipo: placa base de acetal + 3 espárragos + 5 placas hexagonales
  (transparente, amarilla, verde, azul y tapa de tres brazos), cada una partida en
  dos mitades en zigzag · 4 insertos por placa (triángulo, pentágono, 2 cilindros)
  · tuercas · tornillo central · llave allen
- Mesas suficientes para llegar a **10 puestos** (no 7)
- Cronómetro por equipo · tablero · los celulares de los participantes
- El gemelo abierto: [`sin-parar.html`](sin-parar.html)

## CRITERIO DE ÉXITO

```
[ ] Tiempos de las dos corridas escritos en el tablero
[ ] Cada equipo con su OEE de cierre y su factor más bajo anotados
[ ] Al menos un equipo descubrió solo el escalón de 9 a 10 puestos
[ ] La línea física quedó montada con los cortes que salieron del gemelo
[ ] Cada participante con su tarjeta «Lo que me llevo» llena
[ ] Encuesta ≥ 4 de 5 en «el ejercicio explicó el concepto»
```
