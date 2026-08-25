# Las pruebas

**67 en verde, ~10 s. Qué cubren, qué no, y qué falta escribir**

```bash
cd backend
uv run pytest -q
uv run pytest tests/test_aceptacion.py::test_05_abrir_un_periodo_semanal_completo -v
```

Cada base de prueba se crea, se carga con la semilla **real** y se destruye; cada prueba
corre en una transacción que se deshace. Por eso tardan diez segundos y no ensucian nada.

---

## 1 · Qué hay hoy

| archivo | pruebas | qué cubre |
|---|---:|---|
| `test_aceptacion.py` | **32** | Las 16 de §12 de la especificación, más las invariantes del motor |
| `test_periodos.py` | **23** | Semana ISO, los cuatro cortes, ventanas, periodos vecinos |
| `test_api.py` | **7** | Alcance por rol (prueba 13), exportación (16), forma del error |
| `test_plantilla.py` | **5** | Prueba 15: 66 renglones, 198 valores faltantes |

### 1.1 · Las 16 de aceptación, y las cifras que fijan

Salen de §12 y **cada una es verificable contra la semilla**:

| # | prueba | cifra que fija |
|---|---|---|
| 1 | Cargar la semilla | 141 operaciones · 23 indicadores · 50 campos · 239 reglas |
| 2 | Reglas por clase | tipo 50 · rango 50 · coherencia 27 · ventana 23 · duplicado 23 · variación 23 · remitente 23 · base≠0 20 |
| 3 | Toda regla de campo apunta a un campo real | **147 de 147** |
| 4 | Cobertura de los 23 indicadores | **2,577** · **2,504** sobre operación activa |
| 5 | Abrir un periodo semanal completo | **1,280** envíos `ESPERADO` |
| 6 | L02 con `faltantes` negativo | rechaza, **con el mensaje textual** de `R004` |
| 7 | L02 con `unidades_contadas = 0` | rechaza por base distinta de cero |
| 8 | Dos veces el mismo indicador/operación/periodo | el segundo **escala**, no se escribe |
| 9 | Envío sin asignación a esa operación | escala por remitente |
| 10 | Valor 45% mayor que el periodo anterior | escala por variación |
| 11 | **Primer** periodo de un indicador | acepta; la bitácora anota que variación no se pudo evaluar |
| 12 | 30 minutos después del corte | acepta, marcado **tarde** |
| 13 | `CAPTURA` consulta una operación ajena | 403, **y no aparece en ninguna lista** |
| 14 | Corregir un envío aceptado | nace uno nuevo con `corrige_a_id`; el anterior sigue existiendo |
| 15 | Plantilla de 66 renglones | 66 envíos leídos; vacía, **198 valores faltantes** |
| 16 | Exportar lo filtrado | el CSV trae exactamente los renglones de la pantalla |

### 1.2 · Las invariantes, que valen tanto como las anteriores

Cubren lo que se rompe en silencio al añadir código:

| prueba | qué protege |
|---|---|
| `test_toda_expresion_de_la_semilla_es_conocida_por_el_motor` | **Falla si aparece una forma de expresión nueva**, en vez de ignorarla |
| `test_las_23_formulas_estan_registradas` | Que ningún indicador se quede sin fórmula |
| `test_los_23_indicadores_tienen_tipo_y_sentido` | Que un indicador nuevo no entre sin taxonomía |
| `test_una_operacion_sin_responsable_sigue_generando_esperados` | **La distinción cobertura ≠ asignación.** Si se fundieran, un hueco sería invisible |
| `test_un_grupo_no_alcanza_indicadores_que_no_cubren_la_operacion` | Que la cobertura mande sobre el grupo |
| `test_el_seed_es_idempotente` | Que una segunda corrida no duplique la cobertura — **ya pasó una vez** |
| `test_05b_al_ocurrir_no_genera_esperados` | Que L35 y L49 no inventen pendientes |
| `test_06b_se_devuelven_todos_los_mensajes_de_una_pasada` | Que quien captura corrija una vez, no cuatro |
| `test_el_mapeo_de_columnas_sale_del_catalogo_no_de_codigo` | Que las columnas de la plantilla no se escriban a mano |
| `test_los_encabezados_se_comparan_sin_acentos_ni_mayusculas` | Que «ALMACEN» coincida con «Almacén» — el encabezado real de los Excel de la gente |

---

## 2 · ⚠️ Dos advertencias sobre lo que las pruebas *no* prueban

### 2.1 · La malla es una reconstrucción

Las pruebas 4 y 5 dependen de **qué operaciones cubre cada indicador**, y la semilla trae
conteos, no listas — a propósito, porque eso es lo que la plataforma administra.

```python
INACTIVOS_QUE_CUBRE = {141: 5, 113: 2, 3: 0}
```

Se eligió porque reproduce **las seis cifras publicadas sin excepción**:

```
universo 2,577 · sobre activo 2,504
Semanal 1,308/1,280 · Mensual 846/816 · Semestral 141/136 · Al ocurrir 282/272
```

y porque explica los 73 envíos huérfanos como `11 × 5 + 9 × 2`.

**Sigue siendo una reconstrucción.** En cuanto llegue la malla real de la división, se borra
y las pruebas corren contra ella. Vive en `app/seed.py`.

### 2.2 · Las fórmulas se prueban por referencia, no por aritmética

`test_las_23_formulas_estan_registradas` y su compañera verifican que las funciones usan los
**50 campos reales**. Comprueban las *referencias*, no el *resultado*.

> **Una fórmula equivocada pasa las 67 pruebas.** Por eso la firma de dominio es una
> compuerta y no una tarea. Ver [`02_MOTOR_Y_FORMULAS.md`](02_MOTOR_Y_FORMULAS.md) §2.

### 2.3 · `plantillas/h_beltran.xlsx` no está en el repositorio

La prueba 15 lo pide y viene del paquete de análisis. Mientras no llegue se construye un
equivalente sintético con la misma forma —66 renglones, hoja de L02, tres columnas fijas y
una por campo— y las cifras comprobadas son las mismas.

**Traerlo es una tarea de H0**, no de ingeniería.

---

## 3 · Las pruebas que hay que escribir

En el orden de los hitos. Todas fallan hoy porque el código no existe.

### H1 — con el CRUD de catálogos

| prueba | por qué es la que puede fallar en silencio |
|---|---|
| Un `POST /api/cobertura` **duplicado no duplica** el denominador | Es el defecto que ya ocurrió en el seed. El % de entrega sale a la mitad y parece plausible |
| `DELETE` de operación pone `activo = False` y **no borra sus envíos** | Nada se borra (§5.2.3) |
| `DELETE` de compañía con operaciones activas devuelve **409** | Una cascada silenciosa se lleva por delante el histórico |
| Crear un indicador **sin fórmula registrada lo marca**, no fabrica una | §15.1 aplicada a las fórmulas |
| Un indicador nuevo **sin `tipo` o `sentido` no se acepta** | Sin ellos el número se pinta mal y nadie lo nota |
| Crear una operación **sin `clase` funciona** | Las 141 nacen en nulo a propósito |

### H2 — con la captura conectada

| prueba | |
|---|---|
| El alcance de tres capas sobre **todos** los endpoints nuevos | Una capa sola no basta; la 13 lo comprueba para los viejos |
| La ventana de corrección: dentro se puede, pasada **desaparece la acción** | Hoy es la propuesta por omisión, marcada para firmar |
| El correo real manda al dominio `@traxion.global` **y a ningún otro** | §0, decisión de identidad |

### H3 — con la analítica en el servidor — **las dos que más importan**

| prueba | |
|---|---|
| **La agregación ponderada da distinto que el promedio simple sobre datos desiguales** | Si se implementa mal, el número sigue pareciendo razonable. La prueba **tiene** que usar datos desiguales: con datos parecidos, promedio y ponderado coinciden y la prueba pasa sin probar nada |
| Sin ningún envío aceptado, la agregación devuelve **`null`, no cero** | «No se pudo comprobar» y «salió cero» son cosas distintas |
| La comparación usa **rangos de la misma longitud** | Ocho contra doce diría que todo bajó, y sólo por tener más datos |
| Un `NPS` se formatea `+36`, no `36%` | |
| El tercer responsable de un ámbito **avisa y se guarda**; no se bloquea | Decisión tomada: avisar sin bloquear |

### H4 — con el piloto

| prueba | |
|---|---|
| Un indicador «al ocurrir» se captura **con fecha del hecho** y no genera esperados | L35 y L49 hoy no se pueden capturar |
| `GET /api/tablero/operacion/{id}` **no promedia porcentajes** | Ver [`01_BRECHA_DE_API.md`](01_BRECHA_DE_API.md) §3 |

---

## 4 · La regla que resume todo esto

> **Un refactor que compila no es un refactor verificado.**

Siete defectos del prototipo aparecieron mirando o tocando la pantalla y **ninguno** lo
detectó `pytest`, `tsc`, ESLint ni el build. Uno de ellos fue una prueba que un `sed` dejó
sin sentido —comprobaba que «ALMACEN» coincide con «Almacén» y el renombre le cambió el
literal a «OPERACION»— y **la prueba siguió pasando sin comprobar nada**.

Cuando una prueba se toca en un refactor masivo, hay que leerla, no sólo verla en verde.

La lista completa está en [`../03_ESTADO_DEL_PROTOTIPO.md`](../03_ESTADO_DEL_PROTOTIPO.md) §6.
