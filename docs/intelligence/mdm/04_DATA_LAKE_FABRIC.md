# La arquitectura de datos sobre Microsoft Fabric

**Del maestro operacional a la capa agéntica: bronce → plata → oro → agentes**

---

## 0 · La forma completa, en un dibujo

```
  OPERACIONAL                          MICROSOFT FABRIC (OneLake)
┌──────────────────┐        ┌─────────────────────────────────────────────────┐
│ PostgreSQL       │        │  BRONCE            PLATA             ORO       │
│  ├ MDM (maestro) │─espejo─▶  mdm_*  ─────────▶ dim_* (SCD2) ───▶ modelo    │
│  └ Captura       │Mirroring│  captura_envios ─▶ hechos conformes  dimensional│
│    (canal MANUAL)│        │                                        │        │
└──────────────────┘        │  aterrizajes de conectores ────────────┤        │
                            │   wms_* talentrax_* sfdc_* ssma_*      ▼        │
  SISTEMAS DE ORIGEN        │   (Dataflows Gen2 / Pipelines)   Direct Lake    │
  WMS · Talentrax ·         │                                   ├ Power BI   │
  Salesforce · SSMA ────────▶                                   └ Agentes    │
                            └─────────────────────────────────────────────────┘
```

Tres decisiones definen el diseño, y las tres abaratan algo:

1. **El maestro vive en PostgreSQL y se espeja, no se muda.** Fabric tiene *Mirroring* de
   PostgreSQL: replica a OneLake en Delta, casi en tiempo real, **sin ETL propio**. El MDM
   sigue siendo transaccional (altas, fusiones, vigencias) y el lake lo lee sin que nadie
   escriba un pipeline de extracción.
2. **Un Lakehouse por capa, un dominio por división.** `lh_bronce`, `lh_plata`, `lh_oro`
   dentro del dominio *Logística*. Cuando otra división entre, es otro dominio — no otra
   arquitectura.
3. **Oro se expone por Direct Lake.** Power BI lee las tablas Delta sin importarlas ni
   duplicarlas; el modelo semántico es una capa de nombres, no otra copia de los datos.

---

## 1 · Bronce — todo aterriza crudo, con linaje

| tabla | de dónde | cómo |
|---|---|---|
| `mdm_*` (las 12 del maestro) | PostgreSQL | **Mirroring** — automático |
| `captura_envios`, `captura_valores`, `captura_bitacora` | PostgreSQL (Captura) | Mirroring — el canal manual ya queda espejado con eso |
| `wms_*` | WMS | Pipeline / Dataflow Gen2, cuando el conector exista (F3) |
| `talentrax_*`, `sfdc_*`, `ssma_*` | ídem | ídem |

Reglas de bronce: **nunca se transforma, nunca se borra**; cada carga lleva
`_cargado_en` y `_fuente`. Un archivo Excel que llegó por correo en la era pre-plataforma
también puede aterrizar aquí (carpeta *Files* del Lakehouse) — el histórico previo no se
tira.

## 2 · Plata — el maestro manda

Plata es donde el dato se **conforma contra el MDM**. Dos trabajos:

1. **Dimensiones con historia (SCD tipo 2)** sobre los maestros espejados: `dim_cliente`,
   `dim_contrato`, `dim_operacion`, `dim_negocio`, `dim_territorio`, `dim_indicador`,
   `dim_persona`. Cada cambio de un maestro (una fusión de clientes, un cambio de
   responsable, una conexión de origen) abre versión nueva con `vigente_desde/hasta`.
   Es lo que hace respondible «¿quién era el responsable cuando entró este número?» y
   «¿este envío era de Samsung o de SDS Samsung *según el catálogo de entonces*?».
2. **Hechos conformes**: `envio` validado contra las dimensiones — todo envío cuyo
   `operacion_id` no exista en el maestro **no pasa a plata**: cae a una tabla de
   cuarentena con motivo. La calidad del maestro (§03 bloque D) es el contrato de admisión.

Los renglones con `origen = EJEMPLO` (los 87 contratos) **cruzan a plata marcados** y las
transformaciones de oro los excluyen de cualquier métrica: existen para la estructura,
jamás para un número.

## 3 · Oro — el modelo dimensional

Esquema estrella clásico, en Delta, listo para Direct Lake:

```
hechos                              dimensiones
─────────────────────────────       ────────────────────────────────
fact_envio                          dim_tiempo (día, semana ISO, mes)
  (grano: envío)                    dim_indicador
fact_valor_de_indicador             dim_operacion    ── dim_negocio
  (grano: indicador × operación     dim_cliente      ── dim_territorio
   × periodo, sólo aceptados,       dim_contrato     ── dim_compania
   con campos base para reagregar)  dim_persona
```

Dos reglas que vienen del producto y no se negocian en oro:

- **`fact_valor_de_indicador` guarda los campos capturados, no sólo el resultado.** La
  agregación entre operaciones es **ponderada**: se suman los campos y se vuelve a aplicar
  la fórmula. Un `AVG(resultado)` sobre porcentajes da números creíbles y falsos (99% sobre
  100 unidades y 50% sobre 10,000 no dan 74.5%) — el modelo semántico define las medidas
  como `SUM(numerador) / SUM(base)`, nunca como promedio del cociente.
- **El denominador viaja.** El % de entrega se calcula contra los esperados
  (`fact_envio.estado`), que existen porque el alcance los escribió antes que el dato.
  Sin ellos, todos los tableros dan 100% sobre nada.

## 4 · Lo que ya se puede responder (F2, sin conectores)

Con el espejo del maestro + Captura, oro contesta desde el primer día:

- **Cumplimiento**: % de entrega en ventana por operación / compañía / territorio / cliente
  derivado, por semana.
- **Concentración**: envíos por persona (los 726), y su tendencia al repartirse.
- **Transición**: envíos manuales restantes contra el calendario S14/S20/S40/S42.
- **Calidad de captura**: rechazos y escalaciones por regla, por operación.
- **Calidad del maestro**: los huecos, como serie de tiempo — un maestro que mejora se ve.

## 5 · La rentabilidad — el hueco, especificado

> «¿Qué negocio, cliente u operación es rentable?» **no se puede contestar con ningún dato
> que exista hoy.** No hay ingresos, ni costos, ni tarifas en ninguna fuente de este
> proyecto. Decir otra cosa sería inventar.

Lo que este diseño deja listo son **las dimensiones** (cliente, contrato, negocio,
operación, territorio, tiempo). Lo que falta son **dos tablas de hechos**, y su dueño es
Finanzas:

| tabla | grano | columnas mínimas | fuente probable |
|---|---|---|---|
| `fact_ingreso` | contrato × periodo | importe, moneda, concepto | facturación / ERP |
| `fact_costo` | operación × periodo | importe, moneda, categoría (nómina, renta, flete…) | ERP / nómina |

Con ellas, la pregunta se vuelve un `JOIN` contra dimensiones que ya existen — margen por
contrato, costo por envío, rentabilidad por cliente con su nivel de servicio al lado. Sin
ellas, el tablero de rentabilidad **no se construye**: un agente que opine de margen sin
`fact_ingreso` está alucinando con formato corporativo.

## 6 · La capa agéntica

Los agentes (Copilot de Fabric, o agentes propios vía API) operan con tres restricciones de
diseño, no de cortesía:

1. **Leen oro y el catálogo del maestro; jamás bronce.** Bronce es crudo y sin conformar —
   un agente que lee bronce responde con datos que el maestro todavía no valida.
2. **Las medidas vienen del modelo semántico**, donde la agregación ponderada ya está
   definida. Un agente que escriba su propio `AVG` reintroduce el error clásico.
3. **«No hay dato» es una respuesta.** El catálogo expone qué preguntas tienen hechos
   detrás y cuáles no (§5). El agente que recibe «¿qué cliente es rentable?» antes de F4
   responde *con qué falta y quién lo cierra* — el equivalente agéntico de publicar el
   hueco.

Preguntas que un agente contesta bien desde F2: «¿qué operaciones de Kellogg's fallaron la
entrega dos semanas seguidas?» · «¿quién queda sobrecargado si García sale de vacaciones?» ·
«¿vamos a llegar a la semana 14 con el WMS conectado?»

## 7 · Gobernanza

| qué | cómo |
|---|---|
| Dueño de cada maestro | La tabla de huecos de §03 bloque D: cada hueco tiene quién lo cierra; cada maestro, quién lo administra (`ADMINISTRA` vigente) |
| Linaje | Purview sobre Fabric — de la celda del tablero al renglón de bronce |
| Contratos de datos | Por conector: esquema esperado, frecuencia, umbral de rechazo a cuarentena |
| Acceso | Los verbos del maestro se proyectan: `CONSULTA × COMPANIA` = seguridad a nivel de fila en el modelo semántico, derivada de `responsabilidad`, no mantenida a mano |
| `EJEMPLO` | Excluido de toda medida por transformación, no por disciplina |

## 8 · Fases, con su criterio de salida

| fase | entra | sale cuando |
|---|---|---|
| **F0** | El maestro operacional poblado; la consola | El administrador confirma clientes y cierra clases **en el maestro**, no en un Excel |
| **F1** | Captura lee catálogos y alcance del maestro | Alta de operación en un solo sitio |
| **F2** | Mirroring + plata + oro de operación | El tablero de cumplimiento de Power BI da lo mismo que la pantalla de seguimiento |
| **F3** | Conectores (WMS primero — S14 es el más urgente) | Un indicador `CONECTADO` deja de esperarse por captura y el tablero no se entera |
| **F4** | `fact_ingreso` + `fact_costo` + agentes | La pregunta de rentabilidad tiene respuesta con linaje |
