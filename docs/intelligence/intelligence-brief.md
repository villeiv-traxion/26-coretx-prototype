# CoreTX Captura — brief del prototipo

**Dónde vive:** app dentro de **CoreTX Intelligence**.
**Qué es:** prototipo conceptual. Sin backend ni base de datos — el estado vive en `localStorage`, el catálogo en un archivo de datos versionado.

## Alcance

Cubre el **bloque 3** del proyecto: la captura manual de indicadores y su seguimiento.

Queda fuera el **bloque 1** (maestro de datos): alta de divisiones, empresas y operaciones; clientes; contratos; analíticos. La estructura llega precargada.

---

## Los musts

### Perfiles

1. Dos perfiles: **Coordinación** y **Captura**. Se alterna entre ellos sin autenticación.

### Coordinación

2. Asigna responsables a operaciones **ya existentes**. Hasta 3 por operación. Con buscador — el directorio es largo.
3. Una operación **sin responsable sigue contando como pendiente**. La obligación no nace de la asignación.
4. Ve el cumplimiento de las **52 semanas** por operación.

### Captura

5. Ve **sólo** las operaciones donde es responsable.
6. Por operación, ve **cuánto plazo le queda** y **cuánto lleva capturado** — la fracción, no un sí/no.
7. Captura en un **formulario**, no en Excel.
8. Al guardar recibe una confirmación que dice **hasta cuándo puede modificar**.

### El dato

9. Tres estados: **Pendiente → Borrador (editable) → Cerrado (oficial, inmodificable)**. Corte viernes 14:00, semana ISO. Es el cambio de fondo que el prototipo tiene que demostrar.
10. **El resultado se calcula, nunca se captura.** No existe el campo donde escribir un porcentaje.
11. **11 indicadores, 24 campos** (abajo).
12. Las validaciones y sus mensajes salen del catálogo **tal cual están redactados**. No se reescriben.

### Técnicos

13. **Nada quemado.** El formulario se genera desde el catálogo (`etiqueta`, `tipo`, `unidad`, `mínimo`, `decimales`, `ayuda`). Añadir un indicador = una entrada de datos, cero JSX.
14. Toda la UI con `@traxion-global/design-system`, vía el MCP.
15. Un solo formulario. El constructor de formularios es una fase posterior.
16. Control para mover la fecha simulada — sin él no se puede enseñar la transición a *Cerrado*.
17. **Código en inglés, interfaz en español**, que es la convención del repo. Los ids de campo del catálogo (`C_L02_unidades_contadas`) se conservan literales: son claves del sistema real, no identificadores nuestros.

---

## Los 11 indicadores (24 campos)

Extraídos del catálogo embebido en `docs/intelligence/team/mvp.html`. Son los semanales que aplican a almacén; los 3 de transporte quedan fuera.

| | Indicador | Campos |
|---|---|---|
| L02 | Exactitud de Registro de Inventario (IRA) | Unidades contadas · Faltantes · Sobrantes |
| L11 | Cobertura de Plantilla Operativa | Vacantes de personal · Requerimiento aprobado |
| L15 | Aprovechamiento de activos · %Vacancy | m² disponibles · m² totales |
| L30 | % Tiempo Extra | Horas extra dobles · triples · Horas laboradas normales |
| L37 | Exactitud de Existencias (ILA) | Ubicaciones auditadas · Ubicaciones con error |
| L38 | Cumplimiento al plan de descarga | Descargas en tiempo · Descargas totales |
| L39 | Cumplimiento al plan de carga | Cargas en tiempo · Cargas totales |
| L42 | % Incidencias y reclamaciones | Incidencias y reclamaciones · Notas embarcadas |
| L58 | Dock to Delivery / Dock to Stock | ID's on time · ID's de recibo |
| L64 | Precisión de Escaneos (SSP) | Escaneo interno · Escaneo Amazon |
| L67 | Tasa de Servicios Perfectos (POF) | Pedidos perfectos · Pedidos totales |

---

## Lo que NO está decidido — es la propuesta

Ninguna de estas preguntas es un must. Son el trabajo:

- Cómo se ve el cumplimiento de 52 semanas sin volverse ilegible.
- Qué ve alguien de Captura al entrar.
- Cómo se presenta un formulario de 24 campos sin que agote.
- Cómo se comunica un plazo que corre, y el cierre cuando llega.
- Cómo se asigna un responsable a una operación.
- Qué pasa visualmente con lo ya entregado.

`mvp.html` contesta cada una de un modo. **Es referencia, no contrato** — se presentó en la reunión del 18/08/2026 como propuesta abierta.

---

## Decisiones operativas

1. **Datos ficticios.** El catálogo de indicadores y la estructura son reales; nombres de responsables, correos y cifras capturadas, inventados. El Excel de origen trae salarios, costos e ingresos por operación y correos personales reales, y esto se despliega en una URL pública.
2. **Dos compañías, no nueve.** Muestra pequeña: se avanza rápido y equivocarse sale barato.
3. **Sólo frecuencia semanal.** Mensual, semestral y «al ocurrir» quedan fuera; se nombran para que no parezca olvido.
