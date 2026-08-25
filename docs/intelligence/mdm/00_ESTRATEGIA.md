# La estrategia del maestro de datos

**Por qué un MDM, qué gobierna, y cómo llega hasta la capa agéntica**

---

## 1 · El problema que un maestro resuelve

Hoy la división tiene un sistema que captura bien —CoreTX Captura, con sus 239 reglas y su
bitácora— pero la **estructura sobre la que captura está repartida en tres sitios**: parte
en la semilla (compañías, operaciones, indicadores), parte en la cabeza de la gente
(clientes, contratos, territorios) y parte en ningún lado (qué dato llega por qué canal, y
quién es responsable de qué nivel).

Las consecuencias se miden:

- **El cliente no existe como dato.** Está escondido en los nombres de operación. Nadie
  puede preguntar «¿cómo va Kellogg's?» porque Kellogg's son cuatro renglones con nombres
  distintos.
- **El contrato no existe en ninguna fuente.** Sin contrato no hay pregunta de rentabilidad
  que se pueda contestar, por buena que sea la captura.
- **El origen del dato es una nota, no un dato.** El calendario de apagado (S14/S20/S40/
  S42) vive en un campo de texto de la semilla; nadie lo administra, y el año ni siquiera
  está escrito.
- **La responsabilidad sólo existe para capturar.** Quién *administra* un catálogo y quién
  puede *consultar* qué nivel no está modelado en ningún sitio.

Un maestro de datos es la respuesta aburrida y correcta: **una sola estructura, con dueño,
de la que capturas, conectores, tableros y agentes leen.**

---

## 2 · Los tres bloques

```
        BLOQUE A · Estructura            BLOQUE B · Indicadores        BLOQUE C · Personas
  ┌────────────────────────────┐   ┌──────────────────────────┐   ┌──────────────────────┐
  │ División                   │   │ Indicador (tipo,sentido) │   │ Usuario              │
  │  └ Compañía                │   │   ├ Alcance por NIVEL ───┼──▶│   Responsabilidad    │
  │     ├ Negocio              │◀──┼───┘  (compañía·negocio·  │   │   verbo × ámbito     │
  │     │   └ Operación        │   │       operación·cliente· │   │   ADMINISTRA         │
  │     │       └ Territorio*  │   │       contrato)          │   │   CAPTURA            │
  │     └ Contrato* ── Cliente*│   │   └ Origen del dato      │   │   CONSULTA           │
  │          └ ContratoOperación│  │      MANUAL│AUTOMATIZADO │   │                      │
  └────────────────────────────┘   └──────────────────────────┘   └──────────────────────┘
                                * derivado o ejemplo, marcado
```

### Bloque A — la estructura corporativa

La jerarquía que ya existe (división → compañía → operación) más lo que falta: el
**negocio** (el tipo de operación-negocio, formalizado desde la unidad de negocio), el
**territorio** (derivado de donde hay señal, nulo donde no), y el par
**cliente · contrato** con su mapa hacia las operaciones que lo sirven.

La decisión de modelado que importa: **el cliente se relaciona con la operación a través
del contrato**, no directo. Una operación dedicada («Colgate Querétaro») tiene un contrato
con una operación; un sitio multicliente («Multicuentas Tultitlán», los CEDIS de Medistik)
aparece en varios contratos. Modelar cliente-operación directo habría hecho imposible el
caso multicliente, que es exactamente el caso de los sitios más grandes.

### Bloque B — indicadores, alcance y origen

El indicador ya tiene identidad y taxonomía (`tipo`, `sentido`). Lo que el maestro añade
son las dos preguntas que Captura no puede contestar sola:

1. **¿Sobre qué se mide?** — `indicador_alcance`, con nivel: compañía, negocio, operación,
   cliente o contrato. Generaliza la cobertura actual (que sólo conoce operaciones) y
   conserva la invariante: **de aquí salen los envíos esperados.**
2. **¿Por dónde llega el dato?** — `origen_de_dato`: canal `MANUAL` o `AUTOMATIZADO`,
   sistema origen, semana de transición, estado de la conexión. **CoreTX Captura es el
   conector del canal manual.** Cuando el WMS tome L02 (estado `CONECTADO`), el mismo
   renglón que hoy manda esperados a Captura los mandará al conector — la estructura no
   cambia, cambia un enum.

### Bloque C — personas y responsabilidad

Una sola tabla generaliza lo que hoy son tres cosas distintas: `responsabilidad` =
usuario × **verbo** (`ADMINISTRA` · `CAPTURA` · `CONSULTA`) × **ámbito** (nivel + id) ×
vigencia.

- La asignación actual de Captura es el caso `CAPTURA × OPERACION`.
- Un director de compañía es `CONSULTA × COMPANIA`.
- El dueño del maestro es `ADMINISTRA × DIVISION`.

Con vigencia y sin borrado, para que «¿quién era responsable cuando entró este número?»
tenga respuesta siempre.

---

## 3 · Los principios (los mismos cinco del producto)

| # | principio | en el maestro significa |
|---|---|---|
| 1 | El esperado antes que el dato | Los esperados salen de `indicador_alcance`, nunca de la responsabilidad — una operación sin responsable **sigue debiendo** sus indicadores |
| 2 | El resultado se calcula | El maestro guarda definiciones y estructura; los valores viven en la captura y en el lake |
| 3 | Nada se borra | Vigencias (`desde`/`hasta`) y banderas en todas las tablas |
| 4 | Publicar el hueco | `origen_del_registro` en cada maestro: `SEMILLA` · `DERIVADO` · `MANUAL` · `EJEMPLO`. La pantalla de inicio del administrador es el tablero de huecos |
| 5 | No inventar identificadores | Lo sembrado conserva su id; lo nuevo usa series propias |

---

## 4 · El camino, en cinco fases

| fase | qué entra | qué desbloquea |
|---|---|---|
| **F0 · El maestro operacional** | El esquema de `02_esquema.sql` poblado desde la semilla + el derivado confirmándose a mano | Una sola fuente de estructura; la consola del administrador |
| **F1 · Captura como consumidor** | Captura lee catálogos y alcances del maestro (hoy los tiene propios) | Un solo sitio donde dar de alta una operación o mover una responsabilidad |
| **F2 · El espejo en Fabric** | Mirroring de PostgreSQL a OneLake + oro de operación | Tableros de cumplimiento y concentración en Power BI sin ETL propio |
| **F3 · Conectores automatizados** | WMS, Talentrax, Salesforce, SSMA escriben por el canal `AUTOMATIZADO`, gobernados por `origen_de_dato` | El apagado de la captura manual, medido en vez de sufrido |
| **F4 · Hechos financieros y agentes** | `fact_ingreso` y `fact_costo` (Finanzas) + la capa agéntica sobre oro | La pregunta de rentabilidad por cliente/negocio/operación |

La regla de tránsito entre fases es la misma que la del producto: **no empezar la siguiente
antes de que la anterior esté en uso.**

---

## 5 · La capa agéntica — qué puede contestar y cuándo

Un agente es tan bueno como el maestro que consulta. Con este MDM:

**Respondible desde F2** (sólo con lo que ya se captura):

- ¿Qué operación / compañía / territorio entrega a tiempo y cuál falla siempre?
- ¿Dónde está concentrado el riesgo de captura? (los 726 de una persona)
- ¿Cómo va la transición a los sistemas de origen contra su calendario?
- ¿Qué indicador se mueve más de lo normal en qué cliente? (una vez confirmados)

**Respondible sólo desde F4** — y hay que decirlo así de claro:

> «¿Qué negocio, cliente u operación es rentable?» necesita **ingresos y costos**, y hoy no
> existe ni un dato de ninguno de los dos. El maestro deja las dimensiones listas
> (cliente, contrato, negocio, operación, territorio); las dos tablas de hechos que faltan
> están especificadas en [`04_DATA_LAKE_FABRIC.md`](04_DATA_LAKE_FABRIC.md) §5, y las
> cierra Finanzas. Un agente que opine de rentabilidad sin ellas estaría inventando — y un
> dato inventado es peor que el vacío.

---

## 6 · Qué se decide aquí y qué queda abierto

**Decidido en este paquete:** el modelo de tres bloques; cliente vía contrato; el alcance
por nivel como fuente de esperados; el origen del dato como tabla administrable; la
responsabilidad con verbo; Fabric como plataforma del lake.

**Abierto, con dueño:**

| hueco | quién lo cierra |
|---|---|
| Confirmar (o fusionar) los 87 clientes derivados | Comercial / Dirección de Logística |
| Los contratos reales — vigencias, monedas, tarifas | Comercial |
| La clase de los 4 negocios y de las 141 operaciones | El administrador del maestro |
| «Sistema independinete»: ¿sistema o hueco? (44 operaciones) | Tecnología |
| El año de las semanas de transición | Tecnología |
| Ingresos y costos para la rentabilidad | Finanzas |
