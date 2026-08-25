# Backend — empieza aquí

**FastAPI · SQLAlchemy 2.0 · PostgreSQL 16 · Python 3.12 · `uv`**

---

## 1 · Corriendo en diez minutos

```bash
cd backend
docker compose up -d db                    # PostgreSQL 16 en el puerto 5433
uv sync
uv run alembic upgrade head
uv run python -m app.seed                  # carga semilla/*.json
uv run pytest -q                           # 67 pruebas, ~10 s
uv run uvicorn app.main:app --reload       # el contrato vivo en http://localhost:8000/docs
```

> ⚠️ **Si ya tenías una base de desarrollo de antes de agosto de 2026, bórrala.** La
> migración inicial se reescribió con el renombre `Almacen` → `Operacion` y una base
> anterior no migra: `DROP DATABASE coretx_captura;` antes de `alembic upgrade head`.

El seed imprime las cifras de la prueba 1 y **tienen que dar exactamente**:

```
companias                9
operaciones            141
operaciones_activas    136
indicadores             23
campos                  50
reglas                 239
cobertura            2,577      (2,504 sobre operación activa)
```

**Si alguna no cuadra, no sigas.** La semilla o el cargador están mal, y todo lo que viene
después hereda el error.

Las pruebas crean y destruyen `coretx_captura_test`; no ensucian la base de desarrollo.

```bash
uv run pytest tests/test_aceptacion.py::test_05_abrir_un_periodo_semanal_completo -v
uv run alembic revision --autogenerate -m "..."
```

---

## 2 · El mapa

```
backend/app/
  main.py            # la aplicación, los manejadores de error y el registro de routers
  config.py          # todo lo configurable, con prefijo CORETX_ en el entorno
  db.py              # motor y sesión por petición
  modelos/           # SQLAlchemy 2.0 — el esquema
  esquemas/          # Pydantic v2 — lo que entra y sale por la API
  seguridad/         # enlace de un solo uso, sesión, rol y alcance
  api/               # un router por recurso
  dominio/           # ← aquí vive la inteligencia
    periodos.py        semana ISO, cortes, ventanas, zona horaria
    reglas.py          el motor de las 239 reglas
    formulas.py        las 23 fórmulas        ⚠️ sin firmar
    envios.py          apertura de periodos y registro de envíos
    alcance.py         el resolvedor de ámbitos de asignación
    plantilla.py       lectura del .xlsx
  seed.py            # semilla → base de datos
```

### La regla de organización, y por qué importa

> **`dominio/` no sabe que existe HTTP y no consulta la base por su cuenta.** Recibe un
> `Contexto` ya armado. `api/` arma ese contexto y llama al dominio.

Por eso el motor de las 239 reglas se puede probar sin levantar nada. Si te encuentras
importando `Session` dentro de `dominio/`, algo se torció.

---

## 3 · Las tres invariantes que no se negocian

### 3.1 · El envío esperado se escribe antes que el dato

`abrir_periodo()` crea los `ESPERADO` a partir de la **cobertura**. Son el denominador del
porcentaje de entrega. **Sin ellos siempre da 100% y no mide nada.**

Y salen de la cobertura, no de la asignación: si salieran de la asignación, una operación
sin responsable no aparecería como pendiente y su hueco sería invisible.

### 3.2 · El resultado se calcula, nunca se captura

`EnvioNuevo` **no tiene campo `resultado`**. No hay forma de mandarlo desde fuera, y eso es
deliberado: es la invariante convertida en tipo.

### 3.3 · Nada se borra

`Asignacion.hasta`, `Envio.corrige_a_id`, `activo = False`. Todo `DELETE` de la API es baja
lógica. Corregir crea un envío nuevo que apunta al anterior; el anterior sigue existiendo.

---

## 4 · El motor de reglas

`app/dominio/reglas.py` — despacho por clase con expresiones regulares, **sin `eval` ni
parser genérico**. La gramática de la semilla tiene diez formas y hay una prueba que falla
si aparece una nueva.

### El orden de §7.3, inalterable

```
estructura → campo (RECHAZA y termina, con TODOS los mensajes juntos)
           → envío (ESCALA y retiene)
           → cálculo
           → bitácora
```

### `RECHAZA` y `ESCALA` no son intercambiables

| | qué hace | escribe |
|---|---|---|
| **RECHAZA** | Culpa a quien captura. Reversible | **Nada** |
| **ESCALA** | Pide una decisión humana y **retiene** el envío, que sigue contando como pendiente | Retención + bitácora |

**Nunca convertir una escalación en rechazo «para simplificar».** Son dos conversaciones
distintas con dos personas distintas.

### Dos casos que se hacen mal solos

- **Escalación por duplicado sobre un envío ya aceptado:** no se escribe envío nuevo. Los
  valores propuestos van a `Bitacora.detalle`. **Sobreescribir el aceptado destruiría un
  dato bueno.**
- **`variación` sin periodo anterior aceptado no aplica.** Se anota en
  `Veredicto.no_evaluadas` y llega a la bitácora. **No se inventa una base**: «pasó» y «no
  se pudo comprobar» son cosas distintas.

### Y la segunda regla del proyecto

**Los mensajes de las reglas se devuelven tal cual vienen de `reglas.json`.** Están
redactados para quien captura:

> «Faltantes» no puede ser mayor que «Unidades contadas»: la parte no supera al total.

No se reescriben, no se traducen, no se «mejoran».

---

## 5 · El alcance por rol: tres capas, todas en el servidor

Un `CAPTURA` sólo ve y escribe sobre las combinaciones operación × indicador con asignación
vigente (`hasta IS NULL`):

1. `requiere_rol(...)` — autoriza la operación.
2. `aplicar_alcance(consulta, usuario, Envio)` — `JOIN` contra las vigentes, de forma que lo
   ajeno **no aparece en ninguna lista**.
3. `_exigir_alcance(...)` — 403 sobre el recurso concreto.

**Las tres hacen falta, y nunca escondiendo botones en el frontend.** En la carga por
plantilla el alcance se aplica **renglón por renglón**: un `CAPTURA` no mete datos de una
operación ajena ni dentro de un archivo de 66 renglones.

El resolvedor de ámbitos vive en **un solo sitio**: `app/dominio/alcance.py`. La cobertura
manda sobre el grupo — un grupo puede nombrar un indicador que a una operación no se le pide.

---

## 6 · El calendario

`America/Mexico_City` con `zoneinfo`; **se guarda en UTC**. La ventana es corte − 72 h. Lo
que llega después se marca **tarde**, no se rechaza.

Dos trampas:

- **«Al ocurrir» (L35, L49) abre con el suceso y no genera esperados.** No cabe en una
  matriz de periodo.
- **Semanal y semestral comparten el formato `AAAA-MM`**, así que `periodo_anterior` y
  `periodo_siguiente` **necesitan la frecuencia** como argumento.

---

## 7 · La semilla usa otro vocabulario que el esquema

Los JSON son `snake_case` español anidado; el esquema es plano con enumerados. **La
traducción vive sólo en `app/seed.py`** (y en `herramientas/generar_mock.py`). Los casos que
no son mecánicos:

| en el JSON | en el esquema |
|---|---|
| `compania: "Medistik"` (cadena) | `compania_id` — crear o resolver las 9 primero |
| `sistema_declarado: "Sin información"` | `NULL` — 90 de 141 |
| `contacto_captura: null` | columnas planas nulas — 5 casos |
| `destino.{sistema, semana_en_que_deja_de_pedirse}` | `sistema_destino`, `semana_en_que_termina` |
| `clase: "base distinta de cero"` | `BASE_NO_CERO` |
| `almacenes_que_lo_capturan: 113` | **es un conteo, no una lista** |

Las columnas de plantilla mapean 1:1 a los campos: las tres primeras son fijas (`Almacén`,
rótulo de periodo, `Fecha`) y de la cuarta en adelante `columnas[i+3] → campos[i]`. El seed
lo verifica y **falla ruidosamente** si deja de cumplirse.

> ⚠️ **Dos sitios conservan la palabra «almacén» y tienen que conservarla:**
> `semilla/almacenes.json` con su llave raíz, y el encabezado de la plantilla de Excel
> (`COLUMNA_OPERACION = "almacen"`), que es el rótulo de los archivos que la gente ya tiene.

---

## 8 · Qué hacer ahora

| documento | qué trae |
|---|---|
| [`01_BRECHA_DE_API.md`](01_BRECHA_DE_API.md) | **Empieza por aquí.** Los ~22 endpoints que faltan, con contrato y orden |
| [`02_MOTOR_Y_FORMULAS.md`](02_MOTOR_Y_FORMULAS.md) | Las 239 reglas, las 23 fórmulas y la firma que falta |
| [`03_PRUEBAS.md`](03_PRUEBAS.md) | Las 67 que hay y las que faltan escribir |

Y antes de tocar nada, [`../03_ESTADO_DEL_PROTOTIPO.md`](../03_ESTADO_DEL_PROTOTIPO.md) §6:
los siete defectos que ninguna verificación automática detectó.
