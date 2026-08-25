# Los servicios del maestro

**Los contratos de API, para que el equipo los tome de aquí — no se implementan en este
paquete.** Mismo estilo que `team/backend/01_BRECHA_DE_API.md`: cada endpoint con su forma,
sus reglas y sus trampas.

Convenciones heredadas del backend de Captura, sin excepción:

- **`DELETE` es siempre baja lógica** — `activo = false` o `hasta = fecha`.
- **El alcance se aplica en el servidor**, en las tres capas (rol → filtro de consulta →
  403 en el recurso concreto). Nunca escondiendo botones.
- **Errores con la forma de §9**: `{ error: { codigo, mensaje, detalle[] } }`.
- **Los esquemas se publican primero** (`/openapi.json`) para que el frontend genere tipos.
- Prefijo **`/api/mdm`** — convive con la API de Captura sin pisarla.

---

## Bloque A · Estructura corporativa

### CRUD plano

```
GET/POST         /api/mdm/divisiones      · /companias · /negocios · /territorios
GET/PATCH/DELETE /api/mdm/…/{id}
GET/POST         /api/mdm/operaciones          ?compania=&negocio=&territorio=&cliente=&activo=&hueco=
GET/PATCH/DELETE /api/mdm/operaciones/{id}
PATCH            /api/mdm/operaciones/clase    { operaciones: [...], clase }        ← lote
GET/POST         /api/mdm/clientes             ?estado=&q=
GET/PATCH/DELETE /api/mdm/clientes/{id}
POST             /api/mdm/clientes/{id}/confirmar
POST             /api/mdm/clientes/fusionar    { conservar, absorber: [...] }
GET/POST         /api/mdm/contratos            ?cliente=&compania=&origen=
GET/PATCH/DELETE /api/mdm/contratos/{id}
POST/DELETE      /api/mdm/contratos/{id}/operaciones      { operacionId }
```

Reglas que no son obvias:

- **`POST /clientes/fusionar`** existe porque el derivado produce duplicados legítimos
  («Samsung», «Samsung PIQ», «SDS Samsung»). Fusionar re-apunta los contratos del absorbido
  al conservado y deja al absorbido `INACTIVO` con una referencia — **no lo borra**: los
  renglones históricos del lake apuntan a él.
- **`DELETE /companias/{id}` con operaciones activas → 409**, nunca cascada.
- El filtro **`?hueco=`** de operaciones acepta `sin_clase · sin_sistema · sin_cliente ·
  sin_captura · sin_escalacion` — es la consulta que alimenta la pantalla de calidad, y
  tenerla en el servidor evita que cada pantalla cuente huecos a su manera.
- Los `POST` aceptan `origen` sólo entre `MANUAL` y `EJEMPLO`; `SEMILLA` y `DERIVADO` los
  escribe únicamente el cargador.

### El árbol

```
GET /api/mdm/arbol?desde=division&hueco=true
```

La jerarquía completa resuelta —división → compañía → negocio → operaciones— con conteos
por nodo y, con `hueco=true`, los huecos contados en cada nivel. Es `v_arbol_corporativo`
servida; el frontend no arma árboles.

---

## Bloque B · Indicadores, alcance y origen

```
GET              /api/mdm/indicadores               ?frecuencia=&dominio=&canal=
GET/PATCH        /api/mdm/indicadores/{id}          (identidad y taxonomía; campos y reglas viven en Captura)
GET/POST/DELETE  /api/mdm/indicadores/{id}/alcance  { nivel, nivelId }
GET              /api/mdm/indicadores/{id}/alcance/resuelto     → operaciones concretas
GET/POST/PATCH   /api/mdm/origenes                  ?canal=&estado=
GET              /api/mdm/transicion                → el calendario de apagado como recurso
```

- **`POST /alcance` es el endpoint más delicado del maestro**: de su resolución salen los
  envíos esperados. Un alta duplicada que no verifique la vigente **duplica el denominador
  del porcentaje de entrega** — el defecto ya ocurrió una vez en el seed de Captura y tiene
  prueba de regresión allá; aquí necesita la suya.
- **`DELETE /alcance` pone `hasta`**, y el efecto es prospectivo: los esperados ya escritos
  no se tocan. «Ya no se le pide» y «nunca se le pidió» son historias distintas.
- **`PATCH /origenes`** es cómo se conecta un sistema: `MANUAL→AUTOMATIZADO` cierra la fila
  vigente y abre la nueva. El servicio **avisa a Captura** (o Captura consulta al abrir
  periodo) para dejar de generar esperados manuales — el contrato exacto de ese aviso se
  decide en F1.
- **`GET /transicion`** devuelve, por semana, qué indicadores y cuántos envíos/periodo se
  apagan — la tabla S14/S20/S40/S42 como recurso, con el año en `null` mientras Tecnología
  no lo cierre. Que el hueco viaje en la respuesta, no en una nota.

---

## Bloque C · Personas y responsabilidad

```
GET/POST         /api/mdm/usuarios
GET/PATCH/DELETE /api/mdm/usuarios/{id}
GET/POST/DELETE  /api/mdm/responsabilidades        ?usuario=&verbo=&nivel=&vigentes=
GET              /api/mdm/carga-por-persona        ?frecuencia=SEMANAL
```

- **`POST /responsabilidades` avisa desde el tercer responsable** del mismo ámbito y verbo
  — y guarda. Se permite, no se bloquea: es la decisión ya tomada en el producto.
- **`GET /carga-por-persona`** resuelve verbo `CAPTURA` × alcances vigentes × frecuencia y
  devuelve envíos/semana por persona, ordenado descendente. Es `v_carga_por_persona`
  cruzada con el alcance: la pantalla que evita que los 726 vuelvan.
- La autorización usa la propia tabla: quien pega a la API del maestro necesita
  `ADMINISTRA` vigente sobre el ámbito que toca. **El maestro se gobierna con su propio
  modelo** — si el modelo no alcanza para gobernarse, está mal diseñado.

---

## Bloque D · Calidad

```
GET /api/mdm/calidad
```

`v_calidad_del_maestro` servida: cada hueco con su conteo, su lista paginable y **quién lo
cierra**. Es la primera pantalla del administrador y el contrato de datos del lake: plata
no promociona un maestro cuya calidad no conoce.

```json
{
  "operaciones_sin_clase":        { "cuantos": 141, "cierra": "Administrador del maestro" },
  "operaciones_sin_sistema":      { "cuantos": 46,  "nota": "44 más dicen «Sistema independinete»; el análisis publica 90" },
  "clientes_por_confirmar":       { "cuantos": 87,  "cierra": "Comercial" },
  "contratos_de_ejemplo":         { "cuantos": 87,  "cierra": "Comercial" },
  "conexiones_pendientes":        { "cuantos": 23,  "cierra": "Tecnología" },
  "operaciones_sin_captura":      { "cuantos": 5,   "cierra": "Dirección de Logística" },
  "escalaciones_en_nulo":         { "cuantos": 141, "cierra": "Dirección de Logística" }
}
```

---

## El orden de construcción

```
1  Bloque A plano + el árbol      → la consola tiene dónde pararse
2  Bloque D (calidad)             → barata (una vista) y gobierna todo lo demás
3  Bloque B (alcance + origen)    → los esperados; requiere la prueba del duplicado
4  Bloque C (responsabilidad)     → y con ella, la autorización del propio maestro
5  Fusionar clientes + lote de clase → las herramientas de limpieza del administrador
```

El paso 5 al final a propósito: fusionar exige que existan contratos re-apuntables (1) y
que la calidad muestre el efecto (2).
