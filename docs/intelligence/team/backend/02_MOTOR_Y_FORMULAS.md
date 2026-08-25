# El motor de reglas y las 23 fórmulas

**Lo que decide si un número entra, y lo que decide cuánto vale**

Son dos cosas distintas y se confunden con facilidad:

| | qué hace | de dónde sale | ¿firmado? |
|---|---|---|---|
| **Las 239 reglas** | Deciden si el envío **entra** | `semilla/reglas.json`, verificadas | ✅ vienen del contrato |
| **Las 23 fórmulas** | Deciden **cuánto vale** el indicador | Escritas a mano desde prosa | ⚠️ **no** |

La primera columna es sólida. **La segunda es el mayor riesgo silencioso del proyecto.**

---

## 1 · Las 239 reglas

### 1.1 · Las ocho clases

| clase | cuántas | ámbito | efecto |
|---|---:|---|---|
| `tipo` | 50 | campo | RECHAZA |
| `rango` | 50 | campo | RECHAZA |
| `coherencia` | 27 | campo | RECHAZA |
| `base distinta de cero` | 20 | campo | RECHAZA |
| `ventana` | 23 | envío | ESCALA |
| `duplicado` | 23 | envío | ESCALA |
| `variación` | 23 | envío | ESCALA |
| `remitente` | 23 | envío | ESCALA |

147 de campo, 92 de envío. Cada una trae expresión y **mensaje textual**.

### 1.2 · El orden de §7.3, inalterable

```
estructura → campo → envío → cálculo → bitácora
```

- **Campo: RECHAZA y termina**, devolviendo **todos** los mensajes juntos. No uno a uno:
  quien captura corrige una vez, no cuatro veces.
- **Envío: ESCALA y retiene.** El envío sigue contando como pendiente.

### 1.3 · Cómo está implementado

`app/dominio/reglas.py` — **despacho por clase con expresiones regulares. Sin `eval`, sin
parser genérico.** La gramática de la semilla tiene diez formas conocidas y hay una prueba
que **falla si aparece una forma nueva**, en vez de ignorarla en silencio.

Es la decisión de diseño más importante del módulo: un evaluador genérico habría aceptado
cualquier expresión futura sin avisar de que nadie la había revisado.

### 1.4 · Los tres casos que se hacen mal solos

**Duplicado sobre un envío ya aceptado.** No se escribe envío nuevo: los valores propuestos
van a `Bitacora.detalle`. **Sobreescribir el aceptado destruiría un dato bueno.**

**`variación` sin periodo anterior aceptado.** No aplica. Se anota en
`Veredicto.no_evaluadas` y llega a la bitácora. **No se inventa una base.** «Pasó» y «no se
pudo comprobar» son cosas distintas y el primer periodo de un indicador nuevo siempre es el
segundo caso.

**Convertir una escalación en rechazo «para simplificar».** Rechazar culpa a quien captura y
no escribe nada; escalar pide una decisión humana y retiene. Son dos conversaciones con dos
personas distintas.

### 1.5 · Añadir una regla

Se añade **a `semilla/reglas.json`**, no al código. Si su forma no está en la gramática, la
prueba de gramática falla — y eso es lo correcto: una forma nueva necesita que alguien
escriba su evaluador y lo revise.

**Nunca se reescribe el mensaje.** Se devuelve tal cual (§15.2).

---

## 2 · Las 23 fórmulas — ⚠️ la compuerta

### 2.1 · Por qué esto es un riesgo y no una tarea

El campo `formula` de la semilla es **prosa escrita por una persona**, no una expresión
ejecutable. L02, literal:

```
1- (ABS(Unidades Sobrantes - Unidades Faltantes) / Cantidad de Unidades contadas)
* ABS: Absoluto faltante / Absoluto Sobrante (No negativos)
```

No hay forma honesta de derivar código de eso automáticamente. Las 23 funciones de
`app/dominio/formulas.py` se escribieron **una por una**, con la prosa original en el
docstring para poder compararlas renglón por renglón.

La prueba que existe verifica que las funciones usan los **50 campos reales**: comprueba las
*referencias*, no la *aritmética*.

> **Es lo único que puede hacer que un número salga mal sin que ninguna prueba lo note.**

Un indicador con la fórmula equivocada produce un número plausible, se pinta bonito, se
compara contra periodos anteriores calculados con la misma fórmula equivocada —así que la
tendencia también se ve coherente— y nadie lo descubre hasta que alguien lo cruza contra el
sistema de origen. Que es, exactamente, en la semana del apagado.

### 2.2 · Las cuatro que hay que revisar primero

| | por qué no es `numerador / base` |
|---|---|
| **L02** | `1 − \|sobrantes − faltantes\| / contadas`. El valor absoluto de una **diferencia**, no una suma |
| **L30** | El denominador —«horas laboradas»— **se deriva**: extras + normales. No es un campo capturado |
| **L59** | El cociente se multiplica por **10,000**. Es una tasa, no un porcentaje |
| **L12** | ⚠️ **La urgente.** Ver abajo |

### 2.3 · ⚠️ L12 — Rotación de Personal Operativo

La fórmula divide entre **el promedio del headcount de este periodo y el del anterior**, y
**el headcount del periodo anterior no es un campo capturado**.

Lo implementado hoy:

1. Se lee del envío aceptado previo.
2. **Cuando no lo hay, se cae al headcount de este periodo y se anota.**

`INDICADORES_QUE_MIRAN_ATRAS = frozenset({"L12"})` — es el único de los 23 que necesita un
dato del periodo anterior distinto del resultado.

**Tres preguntas para la sesión de firma:**

1. ¿El promedio es realmente `(headcount_actual + headcount_anterior) / 2`?
2. Cuando no hay periodo anterior —el primer mes de una operación—, ¿es correcto caer al
   headcount de este periodo, o el indicador **no debe calcularse**?
3. ¿El «headcount operativo» de L12 es el mismo dato que el «headcount total» de L28? Si lo
   fuera, se está capturando dos veces.

La tercera es la que más probablemente esté mal, y es invisible desde el código.

### 2.4 · Cómo se firma

**No hace falta que nadie lea Python.** Cada función lleva la prosa original en su docstring.
La sesión se prepara así:

| paso | qué |
|---|---|
| 1 | Una tabla de 23 renglones: `id · nombre · prosa de la semilla · fórmula implementada en notación matemática · un ejemplo numérico` |
| 2 | El ejemplo numérico sale de un envío real de la operación, no inventado |
| 3 | Quien firma marca cada renglón: **correcta · incorrecta · no aplica** |
| 4 | Las incorrectas se corrigen y se vuelve a firmar sólo ésas |

Firman: **Dirección de Logística y Tecnología** — es quien figura como
`responsable_de_dominio` en la propia semilla.

**Agendar en H0.** No en H4.

---

## 3 · La taxonomía de indicadores — ⚠️ también sin firmar

`Indicador.tipo` y `Indicador.sentido` **no vienen de la semilla**: se derivaron de los
datos durante la construcción y viven en `app/seed.py`.

| `tipo` | qué es | cuántos |
|---|---|---:|
| `PORCENTAJE` | 0–1, se pinta ×100 con `%` | 16 |
| `NPS` | −1 a 1, se pinta en escala −100…+100 **sin `%`** | 3 |
| `CONTEO` | entero absoluto | 3 |
| `TASA` | por cada 10,000 | 1 |

| `sentido` | cuántos |
|---|---:|
| `MAS_ES_MEJOR` | 15 |
| `MENOS_ES_MEJOR` | 7 |
| `NEUTRO` | 1 — el headcount es un número de control, ni bueno ni malo |

### Por qué existen

Antes había una **lista negra de cuatro identificadores** (`esPorcentaje()` excluía L28,
L35, L49 y L59 a mano). Con eso:

- Un **NPS se pintaba «45.58%»**, que no es lo que significa un NPS.
- Una **subida de la rotación se coloreaba como buena noticia**, igual que una subida del
  nivel de servicio.

Son 24 asignaciones y se revisan en veinte minutos. Van en la misma sesión que las fórmulas.

---

## 4 · La agregación se deriva, no se guarda

```
tiene algún campo con papel BASE  →  PONDERADA
no tiene                          →  SUMA
```

**Ponderada** significa: se suman los campos capturados de todas las operaciones y se vuelve
a aplicar la fórmula. **Nunca promediar los resultados.**

99% sobre 100 unidades y 50% sobre 10,000 no dan 74.5%; dan 50.5%. Es un error que no se
nota porque el número siempre parece razonable, y **el servidor ya lo tiene** en
`GET /api/tablero/operacion/{id}` — ver
[`01_BRECHA_DE_API.md`](01_BRECHA_DE_API.md) §3.

**Suma** es para los tres de valor único: el headcount total de cinco operaciones es la suma
de los cinco.

---

## 5 · La lista de firmas pendientes

| qué | quién | cuándo |
|---|---|---|
| **Las 23 fórmulas** — L12 primero | Dirección de Logística y Tecnología | **H0 agendar · H2 firmada** |
| **`tipo` y `sentido`** de los 23 | Dirección de Logística | misma sesión |
| La regla de corrección — «hasta el corte del periodo siguiente» | Dirección de Logística | antes de H4 |
| El plazo del escalado — se propone 24 h tras el corte | Dirección de Logística | antes de H4 |
| La hora de los cortes por día | Tecnología | antes de H4 |

Las dos primeras son las que pueden hacer que un número salga mal. Las tres últimas cambian
comportamiento, pero el comportamiento actual está implementado y marcado como propuesta.
