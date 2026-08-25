# La conexión

**Cómo el frontend deja de ser una demostración, paso a paso, sin dejar de funcionar**

---

## El principio

El frontend **no llama al backend**. Es una decisión, no un olvido: permitió validar
navegación y sensación de uso con la operación antes de comprometer integración. Todo el
estado vive en memoria del navegador y al recargar vuelve al estado generado.

Conectarlo tiene una regla:

> **De abajo hacia arriba, y cada paso deja la demostración funcionando.**

Primero leer, después validar, al final escribir. Nunca al revés: si se empieza por la
escritura, hay un periodo en que la aplicación no sirve ni para demostrar ni para usar.

---

## 1 · Los siete borrados

Cada archivo de esta tabla **existe sólo mientras no haya servidor detrás**. Borrarlos no es
limpieza: es el criterio de terminado de cada hito.

| # | se borra | líneas | lo sustituye | hito |
|---|---|---:|---|---|
| 1 | `lib/mock/` | *2.4 MB* | `GET /api/operaciones` · `/indicadores` · `/companias` · `/envios` | H1 |
| 2 | `lib/catalogo.ts` | 262 | El CRUD de catálogos ([`../backend/01_BRECHA_DE_API.md`](../backend/01_BRECHA_DE_API.md)) | H1 |
| 3 | `lib/demo.tsx` | 286 | `GET /api/yo` + los endpoints de escritura | H1–H2 |
| 4 | **`lib/reglas/`** | **436** | `POST /api/envios/validar` en el `onBlur` | **H2** |
| 5 | Lectura de CSV en `CargaPorPlantilla` | — | `POST /api/plantillas/previsualizar` con el `.xlsx` real | H2 |
| 6 | `lib/analitica.ts` | 175 | `GET /api/analitica` | H3 |
| 7 | Selector de rol del encabezado | — | Menú de usuario real + `POST /api/sesion/salir` | H4 |

### ⚠️ El número 4 es el peligroso

`lib/reglas/` es una **copia en TypeScript del motor de Python**. Existe sólo para que la
demostración pueda dar retroalimentación real al escribir.

> **Si sobrevive a la integración se convierte en una fuente de divergencia. Dos motores de
> reglas que se separan poco a poco es la peor forma de este problema.**

Y no hace falta conservarlo para tener validación en vivo: **`POST /api/envios/validar`
comparte código con `POST /api/envios` y no escribe nada.** Siempre responde 200. Es una
consulta, no un intento fallido de escritura. Existe exactamente para esto.

**Borrarlo es criterio de salida de H2, no una tarea suelta.**

---

## 2 · La tabla ruta por ruta

| hoy | lo sustituye |
|---|---|
| `lib/mock/*` | `GET /api/operaciones`, `/api/indicadores`, `/api/companias` |
| `lib/reglas/*` | `POST /api/envios/validar` en el `onBlur` de cada campo |
| `lib/demo.tsx` → `usuario` | `GET /api/yo` |
| `lib/demo.tsx` → `envios` | `GET /api/envios` con los mismos filtros |
| `lib/demo.tsx` → `todosLosEnvios` | `GET /api/envios` sin `mios=true`, paginado |
| `lib/demo.tsx` → `registrar()` | `POST /api/envios` y `POST /api/envios/{id}/correccion` |
| `lib/demo.tsx` → `asignacionesVisibles` | `GET /api/yo` → `asignaciones[]`, y `GET /api/asignaciones?vigentes=true` para coordinación |
| `lib/demo.tsx` → `asignar()` | `POST /api/asignaciones/lote` |
| `lib/demo.tsx` → `retirar()` | `DELETE /api/asignaciones/{id}` — pone `hasta`, no borra |
| `lib/catalogo.ts` → todo | El CRUD de divisiones, compañías, operaciones, indicadores, cobertura y grupos |
| `lib/operaciones.ts` → `operacionesPendientes` | `GET /api/envios/pendientes?agrupado=operacion` |
| `lib/operaciones.ts` → `estadoPorOperacion` | `GET /api/operaciones?resumen=true` |
| `lib/operaciones.ts` → `responsableDe` | Viene resuelto en `GET /api/periodos/{periodo}/avance` |
| `lib/analitica.ts` → `serieAgregada`, `comparar` | `GET /api/analitica` |
| `lib/analitica.ts` → `formatearAgregado`, `seMovio` | **Se quedan.** Son formato, no agregación |
| `lib/periodos.ts` | **Se queda.** El cliente necesita el reloj y los periodos elegibles |

### ⚠️ Los dos que **tienen** que bajar al servidor

`operacionesPendientes` y `estadoPorOperacion` **recorren el histórico completo en el
navegador**. Con los 7,074 envíos de la demostración van sobrados; con **2,504 envíos por
periodo × 52 semanas** del universo real, no.

Están aislados en funciones puras en `lib/operaciones.ts`, fuera de las pantallas, **justo
para poder bajarlos sin reescribir nada de la interfaz**. Es deuda con fecha: H3.

---

## 3 · Los tipos se generan, no se escriben

`lib/mock/tipos.ts` es hoy la única fuente de los tipos del dominio. **Al conectar se generan
desde `/openapi.json`** y el archivo desaparece.

```bash
# el backend publica el contrato solo; FastAPI lo genera
curl http://localhost:8000/openapi.json > openapi.json
npx openapi-typescript openapi.json -o lib/api/tipos.ts
```

Esto es lo que permite que **frontend no espere a que backend termine H1**: espera a los
esquemas Pydantic, que se publican primero.

---

## 4 · El orden, hito por hito

### H1 · Leer

1. `GET /api/yo` → sustituye `usuario` y `asignacionesVisibles`.
2. Los catálogos → **se borra `lib/mock/`**.
3. `GET /api/envios` con filtros → sustituye `envios`.
4. El CRUD de administración → **se borra `lib/catalogo.ts`**.

**Criterio de salida:** un administrador crea una división completa contra el servidor sin
salir de la pantalla.

### H2 · Validar y escribir

5. `POST /api/envios/validar` en el `onBlur` de cada campo → **se borra `lib/reglas/`**.
6. `POST /api/envios` y las correcciones.
7. El `.xlsx` se manda a `POST /api/plantillas/previsualizar` → **desaparece el apaño del
   CSV** (leer Excel en el navegador exigiría otra librería; el backend ya lo hace bien con
   `openpyxl`).

**Criterio de salida:** una persona captura una operación completa, ve un mensaje de regla
textual al equivocarse, y el envío queda en la bitácora con su nombre y su hora.

### H3 · Agregar

8. `GET /api/analitica` → **se borra la agregación de `lib/analitica.ts`**.
9. Los dos recorridos del navegador bajan al servidor.

⚠️ **Al portar la agregación, no se dejan las dos.** Es el mismo error que `lib/reglas/`, con
otro nombre.

### H4 · Sesión

10. Enlace de un solo uso real, menú de usuario, `POST /api/sesion/salir` → **fuera el
    selector de rol**.

---

## 5 · Lo que hay que respetar al conectar

### 5.1 · El mensaje de la regla se muestra tal cual

El error del servidor trae una entrada por regla que no pasó, con el mensaje textual:

```json
{ "regla": "R004", "clase": "RANGO", "campo": "C_L02_faltantes",
  "mensaje": "«Faltantes» no puede ser negativo.",
  "esperado": "un valor mayor o igual que cero" }
```

**No se reescribe, no se resume, no se traduce** (§15.2). Están redactados para quien
captura.

### 5.2 · Rechazar y escalar se ven distinto

| | color | qué significa |
|---|---|---|
| **RECHAZA** | `destructive` | Culpa a quien captura. Corregible ahí mismo |
| **ESCALA** | `destructive-warm` | Pide una decisión de otra persona. **El envío sigue pendiente** |

Que se vean distinto **es la regla de negocio hecha color**. Colapsarlos en «error» pierde
la información que dice qué hacer.

### 5.3 · Registrar no es todo o nada

La matriz aplica el mismo criterio que la carga por plantilla: **entra lo que pasa, se
devuelve lo que no**, con su mensaje. El resumen usa el vocabulario del dominio:

> 9 aceptados · 2 rechazados · 1 escalado

### 5.4 · El alcance no se implementa en el frontend

Un `CAPTURA` no ve lo ajeno **porque el servidor no se lo manda**, no porque un botón esté
escondido. Si al conectar aparece lo que no debería, el defecto está en el servidor y ahí se
arregla.

### 5.5 · Las cinco vidas de cada pantalla siguen siendo obligatorias

Cargando · vacío · error · éxito · parcial. Al conectar, **«cargando» deja de ser teórico**:
hoy los datos están en memoria y aparecen al instante. Con servidor detrás, una tabla que
enseña «ninguna operación coincide» mientras carga **afirma algo falso**. Por eso existe
`EsqueletoDeTabla` y por eso va **antes** que el estado vacío en cada pantalla.

---

## 6 · Lo que no cambia al conectar

- **`lib/periodos.ts`** — el cliente necesita el reloj, la ventana y los periodos elegibles.
- **`MatrizDeCaptura`, `Campo`, `ListaDeTarjetas`, `Pagina`, `Severidad`** — los primitivos.
- **Las decisiones de `DESIGN.md`** — densidad, color por severidad, la respuesta arriba.
- **El eje de la operación** — se entra por la operación, no por el indicador.

La conexión cambia de dónde vienen los datos. **No es una oportunidad para rediseñar.**
