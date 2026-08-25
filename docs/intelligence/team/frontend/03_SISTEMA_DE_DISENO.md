# El sistema de diseño

**Las reglas de `DESIGN.md` que un equipo nuevo rompe primero**

`DESIGN.md` en la raíz es el documento completo. Esto es el extracto de lo que se rompe sin
querer, con el defecto real que lo motivó.

---

## 1 · Color: los cuatro tokens y por qué no son intercambiables

| intención | token |
|---|---|
| Acción primaria, éxito, cruzar umbral | `primary` / `primary-dark` |
| **Error de validación, rechazo** | `destructive` |
| **Requiere una decisión, tarde, hueco abierto** | `destructive-warm` |
| Secundario, estructura | `secondary` / `muted-foreground` |

**Sólo clases semánticas. Nunca `text-red-500`, nunca hex.**

> **El naranja y el rojo no son intercambiables, y eso viene del dominio.** Un rechazo culpa
> a quien captura (`destructive`); una escalación pide una decisión (`destructive-warm`).
> **Que se vean distinto es la regla de negocio hecha color.**

Y los huecos del directorio —141 correos en nulo, 90 sistemas sin declarar— van en
`destructive-warm`, **nunca en gris**. Un hueco que no se ve no se cierra.

---

## 2 · El color señala **severidad**, no estado

Es la regla que más fácil se pierde, porque romperla se siente como consistencia.

En `/semanas` hay **1,088 celdas** y `10/11` se pintaba **idéntico** a `6/11`: la rejilla
entera era un lavado rosa y encontrar el problema costaba lo mismo que sin color. En
`/seguimiento`, `0 de 2` y `4 de 11` llevaban la misma insignia amarilla.

> **Cuando todo está marcado, nada lo está.**

Cuatro tramos, en `componentes/Severidad.tsx`, y **el del medio no lleva color**:

| tramo | cuándo | color |
|---|---|---|
| Completa | todo entregado | verde |
| **Casi** | ≥ 80% de lo pedido | **ninguno** — está a un envío de estar bien |
| Parcial | < 80% | naranja |
| Nada | cero, o vencido | rojo |

Quitarle el color a lo que está casi bien era **el 70% de las celdas y todo el ruido**. Lo
que queda coloreado es lo que hay que mirar.

**El criterio vive en un solo sitio** porque son dos pantallas que tienen que decir lo mismo,
y duplicar el umbral sería garantizar que se separan.

⚠️ `UMBRAL_DE_CASI = 0.8` y `MOVIMIENTO_MINIMO = 0.005` son **decisiones de diseño, no datos
del negocio**. Están cada una en un solo sitio y comentadas, para poder discutirlas con un
número delante. **Se calibran en el piloto.**

---

## 3 · Las cinco vidas de cada pantalla

Toda vista de datos define las cinco. **No es opcional.**

| estado | cómo se ve |
|---|---|
| **Cargando** | `EsqueletoDeTabla`, `Cifras cargando`, o `DataTable isLoading`. **Nunca un spinner de página completa sobre contenido que ya existe** |
| **Vacío** | `Vacio` — borde punteado, icono, título, una frase que explica cuándo se llena, y **acción primaria**. Nunca «No hay datos» a secas |
| **Error** | `app/error.tsx` — dice que **nada capturado se perdió**, ofrece reintentar y volver, y da la referencia para soporte |
| **Éxito** | El dato, con su resultado calculado y su estado de entrega |
| **Parcial** | La previsualización de plantilla: renglón por renglón, listo / escalado / con error, con el mensaje textual |

### ⚠️ «Cargando» va **antes** que «vacío»

Hoy los datos están en memoria y aparecen al instante, así que el orden no se nota. **Con
servidor detrás sí**: una tabla que enseña «ninguna operación coincide» mientras carga
**afirma algo falso**.

Es uno de los cinco defectos del mismo tipo que encontró la revisión de diseño.

**Los estados vacíos son una funcionalidad.** El `NoDataMessage` del design system no acepta
acción; por eso existe `Vacio`.

---

## 4 · Densidad: cuatro reglas

> **La pantalla abre en el trabajo. La referencia está a un clic.**

1. **Lo hecho no compite con lo pendiente.** Se cuenta —«Ver los 7 ya entregados»— y se
   pliega. **El número va en la etiqueta del pliegue**, no escondido: así nadie lee el
   pliegue como «se perdió lo que mandé».
2. **Lo que no vence hoy no compite con lo que vence hoy.** La captura abre un solo bloque
   de frecuencia. Los demás son una línea con su reloj.
3. **Una columna que dice lo mismo en todos los renglones no informa.** Se funde o se cae.
   Aplicado a: `Estado` en la matriz (decía «Pendiente» en todos), `Frecuencia`+`Corte` en
   las tablas de indicadores, `Campos`+`Reglas` en administración.
4. **Los filtros se montan cuando hay algo que filtrar.** Umbral: **25 renglones**
   (`UMBRAL_DE_FILTROS`, en `componentes/Pagina.tsx`). Cinco desplegables sobre doce
   renglones ocupan más alto que la tabla y no ahorran ni una búsqueda.

**Corolario que cuesta recordar:** una decisión que se recalcula sola **cambia la pantalla
bajo el cursor**. Terminar algo tiene que sentirse como terminar.

---

## 5 · Responsivo: tres decisiones, no «apilado en móvil»

- **Bajo `md`, las tablas de más de cuatro columnas pasan a lista de tarjetas**
  (`componentes/ListaDeTarjetas.tsx`), que **admite como mucho cuatro pares
  etiqueta/valor** — lo que obliga a decidir qué importa en un teléfono en vez de arrastrar
  ocho columnas.
- **Excepción deliberada:** las comparaciones numéricas entre compañías e indicadores se
  quedan con desplazamiento horizontal. Convertirlas en tarjetas destruye la comparación que
  las hace útiles.
- **A 1280 px la tabla no desborda.** Se comprueba midiendo, no mirando: una tabla de 1,031
  px en un contenedor de 992 recortaba el botón «Completar» y nadie lo veía en una captura.

---

## 6 · Accesibilidad y objetivos táctiles

- **Errores de campo con `aria-invalid` + `aria-describedby`, y nunca sólo color.**
- **Iconos sólo de `lucide-react`.** Sin emoji, sin unicode, sin SVG en línea.
- **Ancho de página con `container`**, no `max-w-*`.
- **Escala z fija:** `z-30` header · `z-40` sidebar · `z-50` modales · `z-[100]` toasts.

⚠️ **Los objetivos táctiles del design system se quedan cortos** (`h-8` = 32 px,
`size="icon"` = 28 px, contra los 44 px recomendados). El reporte está escrito y listo para
enviar en [`Docs/objetivos-tactiles-design-system.md`](../../Docs/objetivos-tactiles-design-system.md).

La propuesta recomendada es una consulta `@media (pointer: coarse)` **dentro del propio
design system**: no necesita API nueva y arregla todas las aplicaciones de Traxion de golpe.

**Depende de un equipo que este proyecto no controla.** Mientras tanto, en móvil no se
renderiza la paginación del `DataTable`: se usa una propia con botones de 40 px, y lleva
escrito en el código bajo qué condición se retira.

---

## 7 · El patrón de defecto que hay que vigilar

De los ocho hallazgos de la revisión de diseño, **cinco eran el mismo defecto**:

> **La pantalla afirmaba algo que no era cierto.**

| | qué decía | qué pasaba |
|---|---|---|
| 1 | `-0.0%` con flecha roja | El número era idéntico |
| 2 | «ninguna operación coincide» | Los datos estaban cargando |
| 3 | «2 semanas malas» | Sin denominador: podía ser el 100% o el 25% |
| 4 | `10/11` pintado como `6/11` | El color había dejado de discriminar |
| 5 | Barra de avance llena | El avance era 0% |

**Los cinco pasan `tsc`, ESLint y `npm run build`.** Ninguno es detectable leyendo el código.

> **Una interfaz que se ve bien no es una interfaz que funciona. Hay que tocarla.**

---

## 8 · Y si hace falta algo que no está

`DESIGN.md` §12 dice qué **no** decide ese documento. Si una pantalla necesita una decisión
nueva, se toma **y se anota ahí**. Ése es el punto del documento: dentro de tres meses lo
que hace falta no es saber qué se hizo, sino por qué.
