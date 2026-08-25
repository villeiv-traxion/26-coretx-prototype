# Datos y operación

---

## 1 · La base

**PostgreSQL 16.** En desarrollo, `docker compose up -d db` en el puerto **5433**. En
`stage` y `prod`, gestionada.

### 1.1 · ⚠️ La zona horaria no es un detalle de configuración

```yaml
TZ: America/Mexico_City
```

El sistema **guarda en UTC y calcula en `America/Mexico_City`** con `zoneinfo`. La ventana de
captura es **corte − 72 h**, y el corte semanal es **viernes 14:00 hora de México**.

> Una base o un contenedor en UTC sin declarar la zona **mueve la hora del corte**, y lo que
> se rompe no es una pantalla: es la diferencia entre un envío marcado **a tiempo** y uno
> marcado **tarde**. Silenciosamente, y sobre un registro que se supone auditable.

La zona va declarada en el contenedor de la base, en el de la aplicación, y en
`CORETX_ZONA_HORARIA`. **Los tres.**

### 1.2 · Cuánto crece

| | |
|---|---|
| Catálogos | 141 operaciones · 23 indicadores · 50 campos · 239 reglas · 2,577 renglones de cobertura |
| Envíos por año | **~76,624**, más los «al ocurrir» |
| Valores por envío | 1 a 3 — 50 campos entre 23 indicadores |
| Bitácora | **al menos una entrada por envío**, más las de rechazo y escalación |

Del orden de **cientos de miles de renglones al año**. Es una base pequeña; lo que importa no
es el tamaño sino los índices sobre `(periodo, indicador_id, operacion_id, estado)`, que es
por donde entran todas las consultas de seguimiento.

### 1.3 · Nada se borra

`Asignacion.hasta` · `Envio.corrige_a_id` · `activo = False`. Todo `DELETE` de la API es baja
lógica.

**Consecuencia para operación:** no hay purga. Una operación dada de baja conserva sus
envíos, y **tiene que conservarlos**: son el registro de con qué número se venía operando.

---

## 2 · Respaldos

| | |
|---|---|
| Frecuencia | Diaria, más recuperación a un punto en el tiempo |
| Retención | Al menos **un año** — el ciclo semestral necesita comparar contra el semestre anterior |
| Cifrado | En reposo y en tránsito |

> **Un respaldo que nunca se restauró no es un respaldo.**

La restauración se prueba **una vez en H3, de verdad, sobre un entorno nuevo**, y se anota
cuánto tardó. Ese número es el objetivo de recuperación; el que se escribe sin medirlo no
lo es.

### Qué se pierde si se pierde la base

No es un tablero: es **la bitácora**. Nombre, hora, valores, reglas aplicadas y versión de
las reglas, de cada número de la división. Es el registro que va a existir de con qué
calidad se sostuvo la captura manual, y **no se puede reconstruir desde los sistemas de
origen** — precisamente porque estos indicadores todavía no están en ellos.

---

## 3 · La carga: el pico de los viernes

Es lo que hay que entender para dimensionar y para poner alertas.

| corte | cuándo | envíos que se concentran | ventana abierta |
|---|---|---:|---|
| **Semanal** | **viernes 14:00** | **1,280** | desde el martes 14:00 |
| Mensual | día 3 del mes siguiente | 816 | ~día 30 |
| Semestral | día 5 del mes siguiente al cierre | 136 | |
| Al ocurrir | dentro de 24 h del suceso | — | con el suceso |

```
lun    mar         mié    jue    vie
       ├── ventana semanal abierta (72 h) ──┤
                                      14:00 ▲ corte
                                   ▲▲▲▲ el pico real
```

**El resto de la semana el sistema está prácticamente inactivo.** Tres consecuencias:

1. **Dimensionar por el promedio es dimensionar mal.** Si hay autoescalado, la señal es la
   hora del calendario, no la CPU: para cuando la CPU sube, la persona ya está esperando.
2. **Una ventana de mantenimiento un jueves es una ventana en el peor momento posible.**
3. **La guardia se pone el viernes por la mañana**, no repartida por igual.

Y hay **dos días peores que los demás cada mes**: del 1 al 3, cuando el corte mensual se
solapa con el semanal.

---

## 4 · Qué vigilar

### 4.1 · Lo técnico, mínimo

| | umbral |
|---|---|
| Disponibilidad de `/api/yo` | cualquier fallo en ventana abierta |
| Latencia de `POST /api/envios/validar` | **es el más sensible**: corre en cada `onBlur` |
| Latencia de `GET /api/envios` con filtros | la consulta de seguimiento |
| Errores 5xx | cualquiera |
| Conexiones a la base | por el pico del viernes |
| **Entrega de correo** | un enlace que no llega parece una plataforma rota |

### 4.2 · Lo del dominio — **más útil que lo técnico**

Estas cuatro dicen si la plataforma está sirviendo, y **salen de la propia base**:

| medida | alerta |
|---|---|
| **% de entrega del periodo en curso** | Si a 4 h del corte va por debajo de lo normal, alguien tiene que llamar |
| **Envíos escalados sin resolver** | Un escalado retiene el envío: si nadie resuelve, sigue contando como pendiente para siempre |
| **Envíos huérfanos** | Cobertura sin asignación vigente. Hoy son **73 por periodo** |
| **Periodos sin abrir** | Si `abrir_periodo()` no corrió, no hay `ESPERADO`, y **el porcentaje de entrega da 100% sobre nada** |

> **La última es la alerta más importante de la lista y la más fácil de olvidar.** Sin los
> `ESPERADO`, todos los tableros dicen que todo va bien. Es la invariante número 1 del
> proyecto convertida en alerta.

### 4.3 · Los registros no son la bitácora

`Bitacora` es una tabla del dominio: qué se envió, quién, cuándo, qué reglas se aplicaron y
con qué versión. **Es un dato del producto, no telemetría**, y se consulta desde la
aplicación.

Los registros de la infraestructura son otra cosa y **no deben contener valores de envíos ni
correos de personas**.

---

## 5 · El programador de tareas

En **E1 hay una sola tarea periódica**: `POST /api/periodos/abrir` — crear los `ESPERADO` de
cada periodo. Hoy es un endpoint que alguien llama.

**Tiene que quedar automatizada**, porque si no corre, el porcentaje de entrega miente en la
dirección más peligrosa.

| frecuencia | cuándo abrir |
|---|---|
| Semanal | martes 14:00 (72 h antes del corte) |
| Mensual | ~día 30 |
| Semestral | según el cierre |
| Al ocurrir | **nunca** — abre con el suceso y no genera esperados |

Un `cron` con reintento y una alerta si no dejó rastro es suficiente. **No hace falta una
cola**: es una tarea, tres veces al mes.

En **E2** esto crece a un reloj de seis momentos por ventana y recepción de correo entrante.
**No antes de que E1 esté en uso.**

---

## 6 · Recuperación: los tres escenarios

| escenario | qué se hace |
|---|---|
| **La aplicación se cae en ventana abierta** | Volver a la etiqueta anterior. Nada capturado se pierde: la escritura es transaccional |
| **Una migración sale mal** | `downgrade` si está escrito y probado; si no, restaurar el respaldo. **Por eso cada migración lleva su `downgrade`** |
| **Se pierde la base** | Restaurar. El objetivo de recuperación es el que se midió en la prueba de H3, no el que se escribió sin medirlo |

Y uno que no es técnico y hay que tener previsto: **si la plataforma no está disponible en
la ventana del viernes, la operación vuelve al Excel esa semana.** No es una catástrofe —así
se trabaja hoy— pero el envío entra después, a mano, y hay que poder cargarlo marcado como
tarde sin romper el registro. **La plataforma ya lo soporta**: lo que llega después del corte
se marca **tarde**, no se rechaza.
