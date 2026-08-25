# `MDM/` — el maestro de datos

**CoreTX · división Logística de TRAXION · agosto de 2026**

Este directorio define **la estructura de la que todo lo demás cuelga**: la jerarquía
corporativa con sus clientes y contratos, el alcance de cada indicador sobre cada nivel, el
origen de cada dato —manual o automatizado— y la responsabilidad de las personas. Es la base
del sistema de gestión configurable, y el cimiento de la capa agéntica.

**La relación con lo que ya existe:** CoreTX Captura (el producto en `backend/` y
`frontend/`) es **la vista del canal manual** — la pantalla de quien está asignado a cargar
indicadores a mano. El MDM es el maestro encima: Captura se vuelve su consumidor, igual que
los conectores automatizados que van llegando.

## Qué hay aquí

| pieza | qué es |
|---|---|
| [`00_ESTRATEGIA.md`](00_ESTRATEGIA.md) | La visión: los tres bloques, los principios, las fases y la capa agéntica |
| [`01_MODELO_DE_DATOS.md`](01_MODELO_DE_DATOS.md) | Entidades, relaciones, diagrama y el mapa de correspondencia con Captura |
| [`02_esquema.sql`](02_esquema.sql) | El DDL ejecutable (PostgreSQL 16), con vistas y aserciones de humo |
| [`03_SERVICIOS.md`](03_SERVICIOS.md) | Los contratos de API del maestro, para que el equipo los tome de ahí |
| [`04_DATA_LAKE_FABRIC.md`](04_DATA_LAKE_FABRIC.md) | La arquitectura de datos sobre Microsoft Fabric: bronce → plata → oro → agentes |
| [`mvp.html`](mvp.html) | **La consola del administrador maestro**, navegable, en un archivo sin dependencias |
| [`datos/maestro.json`](datos/maestro.json) | El maestro derivado de la semilla — generado, inspeccionable |
| `herramientas/` | `derivar_maestro.py` (semilla → maestro) y `generar_mvp_mdm.mjs` (maestro → consola) |

```bash
python3 MDM/herramientas/derivar_maestro.py     # regenera datos/maestro.json
node    MDM/herramientas/generar_mvp_mdm.mjs    # regenera mvp.html
```

## Lo primero que hay que saber del dato

Este maestro **deriva** lo que puede y **publica** lo que no, con el origen marcado en cada
renglón:

- **87 clientes** salieron de los nombres de operación («Colgate Querétaro, CEN» → Colgate;
  en Solistica CL el nombre *es* el cliente; en Pharma Gobierno es la institución). Todos
  nacen **`POR_CONFIRMAR`** — son una propuesta derivada, no un catálogo firmado.
- **5 territorios** (CEN · MET · OCC · NTE · K & M) salieron de los sufijos de SID. En el
  resto de compañías no existe señal territorial y la columna queda en nulo.
- **87 contratos** son **`EJEMPLO`**: no existe ni un dato de contrato en ninguna fuente.
  Enseñan la relación cliente ↔ contrato ↔ operaciones; jamás llevan dinero, y la insignia
  los persigue por cada pantalla.
- **34 operaciones no tienen cliente derivable** (los CEDIS multicliente de Medistik, las
  líneas de transporte) — hueco honesto, contado en la pantalla de calidad.
- Y un hallazgo de calidad: el análisis publica **90 operaciones sin sistema**, pero en el
  dato son **46** «Sin información» + **44** «Sistema independinete». Decidir si lo segundo
  es un sistema o un hueco es una decisión de catálogo pendiente — el maestro enseña las
  dos cifras en vez de elegir en silencio.

## Las reglas que este paquete hereda del producto

1. **El esperado se escribe antes que el dato** — ahora desde `indicador_alcance`.
2. **El resultado se calcula, nunca se captura.**
3. **Nada se borra** — vigencias y banderas, nunca `DELETE` físico.
4. **Publicar el hueco en vez de rellenarlo** — la pantalla de inicio del administrador es
   precisamente el tablero de huecos.
5. **No inventar identificadores** — los sembrados conservan los suyos; lo nuevo usa
   `CL-…`, `CT-…`, `NG-…`, `TER-…`.
