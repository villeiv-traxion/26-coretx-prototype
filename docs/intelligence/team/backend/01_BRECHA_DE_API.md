# La brecha de API

**Lo que el modelo ya sabe hacer y la API todavía no deja hacer**

---

## El resumen en un párrafo

El esquema ya tiene `Division`, `Compania`, `Operacion`, `Indicador`, `IndicadorAplicaA`
(la cobertura), `GrupoDeIndicadores` y `Asignacion.ambito`. **La API expone 32 endpoints y
ninguno los administra.** Las 1,774 líneas de `frontend/app/admin/page.tsx` corren hoy
contra `lib/catalogo.ts`, en memoria del navegador: el administrador crea una compañía y al
recargar la página desaparece.

Cerrar esta brecha es **H1**, y desbloquea a la célula de frontend.

> Cada endpoint marcado como faltante en este documento se verificó uno por uno contra
> `backend/app/api/`. Ninguno existe.

---

## 1 · Lo que ya existe — 32 endpoints

| router | endpoints |
|---|---|
| `sesion.py` | `POST /api/sesion/enlace` · `GET /api/sesion/entrar` · `POST /api/sesion/salir` · `GET /api/yo` |
| `catalogos.py` | `GET POST /api/usuarios` · `GET PATCH DELETE /api/usuarios/{id}` · `GET /api/companias` · `GET /api/operaciones` · `GET PATCH /api/operaciones/{id}` · `GET /api/indicadores` · `GET /api/indicadores/{id}` |
| `asignaciones.py` | `GET POST /api/asignaciones` · `POST /api/asignaciones/lote` · `DELETE /api/asignaciones/{id}` |
| `envios.py` | `POST /api/envios` · `POST /api/envios/validar` · `GET /api/envios` · `GET /api/envios/pendientes` · `GET /api/envios/export.csv` · `GET /api/envios/{id}` · `POST /api/envios/{id}/correccion` · `POST /api/envios/{id}/resolver` |
| `periodos.py` | `POST /api/periodos/abrir` · `GET /api/periodos/{periodo}/avance` · `GET /api/tablero/operacion/{id}` |
| `plantillas.py` | `POST /api/plantillas/previsualizar` · `POST /api/plantillas/confirmar` |

**Dos que parecen menores y no lo son:**

- **`POST /api/envios/validar`** comparte código con `POST /api/envios` y no escribe nada.
  Es lo que permite que el formulario marque el error mientras se escribe **con las mismas
  reglas del servidor**, sin una segunda copia en el navegador. Siempre responde 200: es una
  consulta, no un intento fallido de escritura. **Es el endpoint que mata a `lib/reglas/`.**
- **`POST /api/asignaciones/lote`** existe porque a una persona hay que asignarle 66
  operaciones. Uno por uno no es una interfaz, es un castigo.

---

## 2 · Lo que falta — 22 endpoints y 2 extensiones

Ordenados por lo que desbloquean.

### 2.1 · Divisiones — **nada existe**

```
GET    /api/divisiones                      → list[DivisionLeida]
POST   /api/divisiones                      { nombre }                 ADMIN
PATCH  /api/divisiones/{id}                 { nombre?, activa? }       ADMIN
DELETE /api/divisiones/{id}                 → activa = False           ADMIN
```

La semilla ya trae `division: "Logística"` en los 23 indicadores; el modelo la tiene como
tabla. Falta administrarla.

### 2.2 · Compañías — sólo existe `GET`

```
POST   /api/companias                       { nombre, division_id }    ADMIN
PATCH  /api/companias/{id}                  { nombre?, division_id?, activa? }
DELETE /api/companias/{id}                  → activa = False
```

⚠️ `DELETE` sobre una compañía con operaciones activas devuelve **409**, no cascada. Nada se
borra, y menos en cadena.

### 2.3 · Operaciones — faltan alta, baja y el cierre por lote

```
POST   /api/operaciones                     { id, nombre, compania_id, clase?, ... }
DELETE /api/operaciones/{id}                → activo = False, conserva sus envíos
PATCH  /api/operaciones/clase               { operaciones: [...], clase }   ← lote
```

El `PATCH` por lote es el que cierra el hueco de las **141 operaciones sin clasificar**.

> ⚠️ `Operacion.clase` **nace en nulo en las 141 y así se queda hasta que alguien la
> cierre**. 133 de los nombres no dan ninguna pista y adivinarlas sería inventar (§15.5). El
> `POST` acepta `clase = null` sin protestar.

`id` lo pone quien crea, no el servidor: **no se inventan identificadores** (§15.1). Si una
operación nueva no trae id, se guarda sin id y se marca.

### 2.4 · Indicadores — sólo existe lectura

```
POST   /api/indicadores      { id?, nombre, division_id, dominio, tipo, sentido,
                               frecuencia, corte, formato_periodo, campos: [...] }
PATCH  /api/indicadores/{id} { ... }
DELETE /api/indicadores/{id} → activo = False
```

`tipo` ∈ `PORCENTAJE · NPS · CONTEO · TASA` y `sentido` ∈ `MAS_ES_MEJOR · MENOS_ES_MEJOR ·
NEUTRO`. **Los dos son obligatorios.** Sin `tipo`, un NPS se pinta «45.58%»; sin `sentido`,
una subida de la rotación se colorea como buena noticia.

Los `campos` van anidados en el cuerpo, con su `papel` (`NUMERADOR · BASE · VALOR_UNICO`).
**El papel no es decorativo**: de él sale si el indicador se agrega ponderado o sumado.

⚠️ **Un indicador nuevo no trae fórmula ejecutable.** El campo `formula` es prosa; las
funciones de `app/dominio/formulas.py` están escritas a mano. Un `POST` que cree un
indicador sin fórmula registrada tiene que **guardarlo y marcarlo**, no fabricar una.

### 2.5 · Cobertura — **nada existe, y es la que genera los envíos esperados**

```
GET    /api/indicadores/{id}/cobertura      → list[CoberturaLeida]
POST   /api/indicadores/{id}/cobertura      { compania_id? , operacion_id? }
DELETE /api/cobertura/{id}                  → activa = False
```

Exactamente uno de `compania_id` / `operacion_id`: cubrir por compañía es cubrir todas sus
operaciones activas.

> **Es el endpoint más delicado de los 22.** De aquí salen los `ESPERADO` de cada periodo, y
> con ellos el denominador del porcentaje de entrega. Un `POST` duplicado que no verifique
> existencia **duplica la cobertura y el denominador**: es exactamente el defecto que ya
> ocurrió una vez en el seed y por el que existe `test_el_seed_es_idempotente`.

### 2.6 · Grupos de indicadores — **nada existe**

```
GET    /api/grupos?compania_id=             → list[GrupoLeido]
POST   /api/grupos                          { nombre, compania_id?, indicadores: [...] }
PATCH  /api/grupos/{id}                     { nombre?, indicadores? }
DELETE /api/grupos/{id}                     → activo = False
```

El grupo es la mitad del ámbito `GRUPO` de asignación, que es lo que bajó la malla de 2,453
renglones a 133. **La cobertura manda sobre el grupo**: un grupo puede nombrar un indicador
que a una operación no se le pide, y esa combinación no existe.

### 2.7 · Analítica y carga — **nada existe**

```
GET /api/analitica?indicador=&operaciones=&desde=&hasta=&comparar=
       → { serie: [{periodo, valor, operaciones}], comparacion: {ahora, antes, variacion} }

GET /api/carga-por-persona?periodo=
       → [{ usuario, ambitos, operaciones, envios_por_semana }]
```

`/api/analitica` sustituye a `frontend/lib/analitica.ts`. **Lee la §3 antes de escribirlo.**

`/api/carga-por-persona` alimenta la pantalla que hace visible la concentración. Es la que
convierte «hay que repartir el trabajo» en algo accionable.

### 2.8 · Dos extensiones sobre endpoints que ya existen

```
GET /api/envios/pendientes?agrupado=operacion   → un renglón por operación, no por envío
GET /api/operaciones?resumen=true               → + { cargados, esperados, corte }
```

Son **los dos cálculos que hoy recorren el histórico completo en el navegador**
(`operacionesPendientes` y `estadoPorOperacion`). Con los 7,074 envíos de la demostración
van sobrados; con 2,504 × 52 no. Están aislados en funciones puras justo para poder bajarlos
sin reescribir las pantallas.

---

## 3 · ⚠️ Un defecto que ya está en el servidor

`GET /api/tablero/operacion/{id}` compara una operación contra las demás de su compañía así:

```python
promedio = bd.scalar(
    select(func.avg(Envio.resultado))          # ← promedio simple de porcentajes
    .join(Operacion, Operacion.id == Envio.operacion_id)
    .where(Operacion.compania_id == operacion.compania_id, ...)
)
```

**`func.avg` sobre `Envio.resultado` es el error clásico de agregación.** Una operación que
reporta 99% sobre 100 unidades y otra 50% sobre 10,000 dan un promedio simple de **74.5%**
cuando el número verdadero es **50.5%**.

Es un defecto que no se nota, **porque el resultado siempre parece razonable**. El frontend
ya lo evita —`lib/analitica.ts` existe exactamente por esto— y el servidor todavía no.

### La forma correcta

**Se suman los campos capturados y se vuelve a aplicar la fórmula.** Se puede hacer porque
los valores están guardados y el resultado se calcula, nunca se captura (§15.3): siempre se
puede recalcular desde abajo.

```
Agregación PONDERADA  — el indicador tiene un campo con papel BASE
                        Σ campos → calcular(indicador, sumas)

Agregación SUMA       — el indicador no tiene BASE (valor único)
                        Σ resultados
```

`agregacionDe()` **se deriva de `Campo.papel`, no se guarda**. La lógica de referencia está
en `frontend/lib/analitica.ts`; hay que portarla al servidor en H3 y **borrar la copia del
navegador**, no dejar las dos.

Y dos cosas que la misma función tiene que respetar:

- **Sin ningún envío aceptado devuelve `null`, no cero.** «No se pudo comprobar» y «salió
  cero» son cosas distintas, y confundirlas es lo que hace que un tablero mienta.
- **La comparación es contra un rango de la misma longitud.** Ocho semanas contra las ocho
  anteriores; contra doce diría que todo bajó, y sólo por tener más datos.

---

## 4 · Convenciones que hay que respetar

### La forma de los errores

```json
{
  "error": {
    "codigo": "HTTP_422",
    "mensaje": "texto para la persona",
    "detalle": [
      {
        "regla": "R004",
        "clase": "RANGO",
        "campo": "C_L02_faltantes",
        "mensaje": "«Faltantes» no puede ser negativo.",
        "esperado": "un valor mayor o igual que cero"
      }
    ]
  }
}
```

`detalle` trae **una entrada por regla que no pasó**, con el mensaje **textual** de la
semilla. Los endpoints nuevos usan la misma forma.

### El resto

| convención | por qué |
|---|---|
| `DELETE` es siempre baja lógica | Nada se borra (§5.2.3) |
| Todo endpoint nuevo pasa por `requiere_rol(...)` **y** `aplicar_alcance(...)` | Una sola capa no basta; la prueba 13 comprueba las tres |
| El contrato vivo es `/docs` | FastAPI lo genera solo. No se mantiene a mano |
| Los esquemas Pydantic primero, el cuerpo después | Frontend genera sus tipos desde `/openapi.json` y no espera a la implementación |

---

## 5 · El orden recomendado

```
1  Divisiones + compañías          →  desbloquea la pestaña 1 de administración
2  Operaciones (alta, baja, lote)  →  desbloquea la pestaña 2 y cierra el hueco de la clase
3  Indicadores + cobertura         →  desbloquea la pestaña 3 y los ESPERADO
4  Grupos                          →  desbloquea la pestaña 4 y el ámbito GRUPO
5  Carga por persona               →  desbloquea la pestaña 5
6  Analítica (§3)                  →  H3, con la agregación ponderada bien hecha
7  Las dos extensiones (§2.8)      →  H3, bajan los recorridos del navegador
```

Los cinco primeros son H1 y siguen el orden en que se construye una división desde cero, que
es también el orden de las pestañas de administración. **Al terminar el paso 5, un
administrador puede crear una división completa contra el servidor sin salir de la
pantalla** — y ése es el criterio de salida de H1.
