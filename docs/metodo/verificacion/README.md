# Verificación de «SIN PARAR»

Un gemelo roto se ve igual de bien que uno que funciona. Nada se publica sin correr esto.

| Archivo | Qué hace |
|---|---|
| `cal7.py` | El modelo de referencia. Calibra la escalera y busca los cortes óptimos. |
| `niv.py` | Imprime los cinco niveles: la jugada correcta pasa, la intuitiva falla. |
| `esperado.json` | Los siete casos de control que exporta `cal7.py`. |
| `drive7.mjs` | Maneja el juego en un navegador de 390 px y lo contrasta contra `esperado.json`. |

```bash
python3 cal7.py          # el modelo y la escalera
python3 niv.py           # los cinco niveles, correcto contra errado
npm i playwright && node drive7.mjs
```

`drive7.mjs` comprueba tres cosas, y las tres importan:

1. Que el motor del navegador y el de Python **coincidan al decimal** en los siete casos.
2. Que jugando bien el nivel 1 por la interfaz salgan **exactamente 975 piezas buenas**.
3. Que la mecánica de la trampa funcione: **la planta sigue produciendo** mientras el jugador
   está en el gemelo, y **reconfigurar cuesta 2.100 s exactos**.

Lo tercero es lo que se olvida: un motor correcto con la trampa rota no enseña nada.

Los únicos recursos que fallan al cargar son las fuentes de Google, que el contenedor de
desarrollo no alcanza. En un navegador con red cargan bien.
