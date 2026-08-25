# Las pantallas

**Las siete rutas, y las decisiones de producto que ya se tomaron**

Este documento existe para que nadie rediseñe por accidente algo que se decidió con un
motivo. Cada decisión trae su porqué; si el porqué deja de ser cierto, se cambia.

---

## 1 · Las siete rutas

| ruta | quién la ve | qué es |
|---|---|---|
| `/` | `CAPTURA` | **Lo que hay que cargar.** Con una operación, la matriz directa; con varias, la cola |
| `/` | `COORDINACION` `ADMIN` `LECTURA` | El seguimiento — su trabajo al abrir |
| `/capturar` | `CAPTURA` | Buscador de operaciones con su situación |
| `/capturar/[operacion]` | `CAPTURA` | **La matriz**: todos los indicadores del periodo, y la carga por plantilla |
| `/seguimiento` | coordinación | Una tabla: cargado, responsable, fecha límite, editar o completar |
| `/semanas` | coordinación | La misma información en el tiempo, con rango elegible |
| `/analiticos` | **permiso**, no rol | El número, no la entrega |
| `/admin` | `ADMIN` `COORDINACION` | Divisiones, compañías, operaciones, indicadores, cobertura, grupos, usuarios, asignación y carga por persona |

**Analíticos no es un rol: es un permiso** (`Usuario.puedeAnalizar`) que se enciende sobre
`CAPTURA` o `COORDINACION`. Un jefe de almacén que además captura puede tenerlo.

**La navegación de un `CAPTURA` es una entrada.** Dos si tiene el permiso de analíticos.

---

## 2 · Las cinco decisiones que gobiernan todo

### 2.1 · El eje es la operación, no el indicador

Las pantallas empezaban preguntando **qué indicador** y sólo después **qué almacén**. Se
giraron enteras.

> Quien captura no piensa en indicadores. Tiene **66 operaciones con ~20 indicadores cada
> una**, no 66 renglones de L02.

### 2.2 · La raíz es el trabajo, no un letrero

**No hay pantalla de inicio.** Quien captura entra y ve lo que tiene que cargar; quien
coordina entra y ve el seguimiento.

> Una pantalla cuyo contenido íntegro es un enlace a otra pantalla nunca gana sus píxeles.

⚠️ **Esto se aparta de §10.1 de la especificación**, que pide una lista de *envíos*
pendientes, un renglón por envío. Con la malla real eso son **726 renglones para una sola
persona**, que repiten el nombre del indicador y susurran la operación: gritan la constante
y susurran la variable.

Se conserva **todo lo que §10.1 exige de fondo** —orden por corte más próximo, el reloj
visible, una cifra de cuántos faltan, y «nadie que capture debería tener que buscar dónde
capturar»— cambiando la **unidad** del renglón.

**Es la única desviación deliberada de la fuente de verdad, y le falta firma.** Si la
especificación se revisa, éste es el punto a discutir primero.

### 2.3 · Sin modales, sin uno por uno

La matriz sustituyó a **once modales**. Se captura una operación entera de una vez.

### 2.4 · La pantalla abre en el trabajo; la referencia está a un clic

Se midió antes de tocar nada: de **once** renglones en la matriz semanal, la mediana de los
que pedían un número era **cuatro**. El 64% de lo que la persona leía era trabajo ya
entregado, con el mismo peso tipográfico que lo pendiente.

Después: **la captura pasó de 18 renglones, 3 botones de registrar y 6 datos de ficha a 4
renglones, 1 botón y una línea.**

### 2.5 · La pantalla dice su respuesta arriba, en una frase

Las tres pantallas de coordinación abrían con sus filtros: lo primero que veía alguien un
viernes a las 12 eran cuatro desplegables, y para saber si la semana iba a cerrar tenía que
leer 136 renglones y sumar de cabeza.

El primitivo es `Respuesta` y **no es una banda de cifras**: una frase, con sujeto y verbo.

> Semana 33 va al 63%. Faltan 478 envíos en 126 operaciones.

---

## 3 · La matriz de captura — el corazón

`componentes/MatrizDeCaptura.tsx`, 623 líneas. Es la pantalla que más se usa y la que más
decisiones acumula.

### 3.1 · No mezcla frecuencias

**Un bloque por frecuencia, cada uno con su periodo.** Una columna que dice «Semana 33»
arriba y «agosto» abajo no es una tabla.

### 3.2 · El bloque abierto se fija al entrar

Se elige el corte más próximo **que todavía deba algo**, y **no se recalcula**.

> Si se recalculara, terminar el bloque semanal reemplazaría la tabla por la mensual **en el
> mismo instante de pulsar «Registrar»**. La página cambiaría bajo el cursor.

Es un defecto que ya ocurrió. Se arregló fijando el bloque con `useState(() => …)` y
forzando el remontaje con `key={abierto.frecuencia}` — sin la `key`, el selector de periodo
quedaba en blanco porque el estado del bloque anterior sobrevivía al cambio de props.

### 3.3 · Lo entregado se pliega, contado

«Ver los 7 ya entregados». **El número va en la etiqueta del pliegue**, no escondido: así
nadie puede leer el pliegue como «se perdió lo que mandé».

### 3.4 · Ajustable hasta el corte

Lo ya entregado se puede corregir **mientras la ventana siga abierta**; pasado el corte, la
acción desaparece (`cerrado = entregado && !enVentana`). Las correcciones llevan
`corrigeAId`: nace un envío nuevo, el anterior sigue existiendo.

### 3.5 · La jerarquía sigue al trabajo

Mientras quede algo que registrar, **«Registrar» es el botón destacado** y «Seguir con la
siguiente operación» el apagado. Sólo cuando no queda nada se invierten.

Al revés, lo resaltado invitaría a saltarse aquello a lo que la persona vino.

### 3.6 · Los dos que no caben

**L35 Fatalidades y L49 Incidencias del Camino no aparecen en ninguna matriz.** Abren con el
suceso, no con el calendario, y no generan esperados.

**Se nombran al pie para que no parezca un olvido.** Necesitan su propio formulario con
fecha del hecho — es la deuda A2, y se cierra en H4.

### 3.7 · Una trampa de implementación

La matriz renderiza **tabla y tarjetas a la vez** —una escondida por CSS, pero las dos en el
documento—, y eso pintaba cada campo dos veces **con el mismo `id`**, lo que rompe la
asociación `label`/`input`.

Se arregló con la prop `prefijo` de `Campo` (`"tabla"` / `"tarjeta"`). **Se encontró
intentando llenar un campo desde el navegador, no leyendo el código.**

---

## 4 · Seguimiento y semanas

### 4.1 · «No más que una tabla»

Es la instrucción literal de coordinación. `/seguimiento` es una tabla y nada más. El
detalle de envío de §10.4 **se retiró a petición**; reponerlo es reponer `DetalleDelEnvio`.

### 4.2 · `/semanas` responde una pregunta distinta

Una fila por operación, una columna por semana, una marca por celda. Es donde se distingue
**quién falló una vez de quién falla siempre**, que es una conversación completamente
distinta y que una tabla de un solo periodo no puede tener.

**La marca dice la fracción, no un sí o un no.** «9 de 11» y «0 de 11» son situaciones
distintas y colapsarlas en un aspa perdería justo lo que hace falta para actuar.

**Una celda vacía se deja en blanco**: a esa operación no se le pedía nada esa semana, y
pintarla como incumplimiento sería inventar una falta que no ocurrió.

### 4.3 · Un número sin denominador no se puede comparar

«2 semanas malas» de una operación con dos semanas de historia y de una con ocho son el 100%
y el 25%. Presentadas iguales, **el orden de la tabla apunta a las que menos datos tienen**.

Por eso la columna dice «2 de 8» y el orden es por proporción, con historia suficiente
primero.

### 4.4 · ⚠️ «Completar» promete lo que coordinación no hace

El botón lleva a capturar por otra persona. **La acción correcta es recordar, y recordar es
E2.** Está registrado como deuda A7.

---

## 5 · Analíticos — ya no es seguimiento de entrega

Dejó de mirar si el número llegó y mira **el número**.

> Un director de almacén no abre esto para saber si cumplió el calendario —para eso está el
> seguimiento—: lo abre para saber si su nivel de servicio está bajando, y si baja en todas
> sus operaciones o en una.

Tres cosas que lo hacen honesto y que son fáciles de hacer mal:

1. **La agregación es ponderada.** Se suman los campos y se recalcula la fórmula. Promediar
   porcentajes entre operaciones da números creíbles y falsos: 99% sobre 100 unidades y 50%
   sobre 10,000 **no dan 74.5%**, dan 50.5%.
2. **La comparación es contra un rango de la misma longitud.** Ocho semanas contra las ocho
   anteriores; contra doce diría que todo bajó, y sólo por tener más datos. Hay un ajuste
   explícito con una nota en pantalla cuando los rangos no coinciden.
3. **El color sale del `sentido` del indicador.** Que la rotación suba no es lo mismo que
   que suba el nivel de servicio, y pintarlos igual convierte el tablero en decoración.

Y una cuarta: **por debajo de ±0.5% se escribe «sin cambio», sin flecha y sin color.**
Pintar `-0.0%` en rojo le decía a un director que su indicador empeoró sobre un número
idéntico. Pasaba en tres de once.

---

## 6 · Administración — la más grande

`app/admin/page.tsx`, 1,774 líneas, cinco pestañas **en el orden en que se construye una
división**:

| # | pestaña | qué |
|---|---|---|
| 1 | División y compañías | CRUD. Una compañía cuelga de una división |
| 2 | Operaciones | CRUD con su **clase**. Arriba, el hueco: *«141 operaciones sin clasificar»*, cerrable en lote |
| 3 | Indicadores | CRUD con `tipo`, `sentido`, frecuencia, corte, campos y reglas. Y su **cobertura** |
| 4 | Grupos de indicadores | CRUD. Un nombre y una selección; opcionalmente por compañía |
| 5 | Asignación y carga | Asignar ámbitos, y **la tabla de carga por persona** |

### 6.1 · Cobertura y asignación son cosas distintas

Es la distinción que sostiene todo lo demás:

- **Cobertura** — *a qué operaciones se les pide* un indicador. **De aquí salen los envíos
  esperados.** Si salieran de la asignación, una operación sin responsable no aparecería
  como pendiente y su hueco sería invisible.
- **Asignación** — *quién lo entrega*. No genera nada; pone nombre.

Estaban fundidas, y por eso una persona acumulaba 1,320 renglones de malla y 726 envíos por
semana. **Separarlas bajó la malla de 2,453 renglones a 133.**

### 6.2 · La tabla de carga por persona

| Persona | Ámbitos | Operaciones | Envíos por semana | |
|---|---:|---:|---:|---|
| Héctor Beltrán | 66 | 66 | **726** ⚠ | Repartir |
| Christian Ivan Reyes | 41 | 41 | **307** ⚠ | Repartir |

**Sin esa tabla nada impide que la concentración vuelva.** Es la pantalla que convierte
«reparte el trabajo» en algo que alguien puede hacer un martes.

### 6.3 · Más de dos responsables avisa, no bloquea

Decisión tomada: se permite, y **desde el tercero se avisa** — en la pantalla y en el lote.

### 6.4 · Los huecos se muestran abiertos

141 correos de escalación en nulo · 5 operaciones sin quien capture · 48 sin contacto de TI ·
90 sin sistema declarado · **141 sin clase**.

Van en `destructive-warm`, **nunca en gris**. Un hueco que no se ve no se cierra.

⚠️ **La clase de las 141 nace en nulo y así se queda.** 133 de los nombres no dan ninguna
pista y adivinarlas sería inventar. La cierra el administrador por lote.

---

## 7 · «Territorio» no existe

La semilla trae tres ejes verificados: **corporativo (7), compañía (9) y unidad de negocio
(4)**. Administración usa unidad de negocio. **No se inventó un eje** que no está en los
datos.
