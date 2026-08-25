# DevOps — empieza aquí

**La célula que arranca de cero, y la que bloquea a las otras dos si llega tarde**

---

## 1 · Qué existe hoy

**Casi nada.** Y decirlo claro evita una estimación optimista:

| | estado |
|---|---|
| `Dockerfile` de backend | ❌ no existe |
| `Dockerfile` de frontend | ❌ no existe |
| Integración continua | ❌ no existe |
| Despliegue | ❌ no existe |
| Correo saliente real | ❌ `CorreoDeConsola` **imprime el enlace en la terminal** |
| Respaldos | ❌ |
| Observabilidad | ❌ |
| HTTPS y cookie segura | ❌ `cookie_segura = False` |
| Secretos | ❌ están en valores por omisión del código |

Lo único que hay es un `docker-compose.yml` con **PostgreSQL 16 en el puerto 5433**, para
desarrollo local:

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: coretx
      POSTGRES_PASSWORD: coretx
      POSTGRES_DB: coretx_captura
      TZ: America/Mexico_City
    ports: ["5433:5432"]
```

---

## 2 · El bloqueo del día uno

> ⚠️ **`@traxion-global/design-system` es un paquete privado de GitHub Packages. Sin un
> token con `read:packages` provisionado, el frontend no construye — ni en local ni en CI.**

Es el primer trámite del proyecto, antes que cualquier código. Se pide a
`c.rengifo@traxion.global`, para las personas **y para el CI**.

Detalle en [`01_ENTORNOS_Y_SECRETOS.md`](01_ENTORNOS_Y_SECRETOS.md) §2.

---

## 3 · La forma del sistema

```
                   ┌──────────────────┐
   navegador ──────│  frontend        │  Next.js 15 · Node 22
                   │  (SSR + cliente) │
                   └────────┬─────────┘
                            │  HTTP + cookie de sesión (httpOnly, sameSite=lax)
                   ┌────────▼─────────┐
                   │  backend         │  FastAPI · uvicorn
                   │  /api  ·  /docs  │
                   └────────┬─────────┘
                            │
                   ┌────────▼─────────┐        ┌──────────────┐
                   │  PostgreSQL 16   │        │  SMTP / SES  │
                   │  TZ: MX City     │        │  enlaces     │
                   └──────────────────┘        └──────────────┘
```

Dos contenedores y una base. **No hay cola, no hay caché, no hay almacenamiento de
archivos**: la plantilla `.xlsx` se lee en memoria y no se guarda.

E2 añadirá un programador de tareas —el reloj de seis momentos— y recepción de correo
entrante. **No antes de que E1 esté en uso.**

---

## 4 · Todo lo configurable

Prefijo `CORETX_` en el entorno. Los valores del código son **valores por omisión de
desarrollo** y **ninguno sirve en producción**:

| variable | omisión | en producción |
|---|---|---|
| `CORETX_URL_DE_BASE_DE_DATOS` | `postgresql+psycopg://coretx:coretx@localhost:5433/coretx_captura` | **secreto** |
| `CORETX_ZONA_HORARIA` | `America/Mexico_City` | igual — **no tocar** |
| `CORETX_DOMINIO_DE_CORREO` | `@traxion.global` | igual |
| `CORETX_MINUTOS_DE_VIDA_DEL_ENLACE` | 30 | revisar con seguridad |
| `CORETX_HORAS_DE_VIDA_DE_LA_SESION` | 12 | revisar con seguridad |
| `CORETX_NOMBRE_DE_LA_COOKIE` | `coretx_sesion` | igual |
| `CORETX_COOKIE_SEGURA` | **`False`** | **`True`** ← detrás de HTTPS |
| `CORETX_HORAS_DE_VENTANA` | 72 | igual (§6 de la especificación) |
| `CORETX_CORRECCION_HASTA_EL_CORTE_SIGUIENTE` | `True` | ⚠️ propuesta sin firmar |

Y uno que no está en `config.py` y hay que sacar del código: **el origen de CORS**, hoy
fijo en `http://localhost:3000` dentro de `app/main.py`.

---

## 5 · La carga no es uniforme

Es lo más importante que hay que saber para dimensionar y para poner guardias.

| corte | cuándo | indicadores | envíos que se concentran |
|---|---|---:|---:|
| **Semanal** | **viernes 14:00** | 14 | **1,280** |
| Mensual | día 3 del mes siguiente | 6 | 816 |
| Semestral | día 5 del mes siguiente al cierre | 1 | 136 |
| Al ocurrir | dentro de 24 h del suceso | 2 | — |

La ventana de captura **abre 72 h antes del corte**. Así que:

> **El pico del sistema es el viernes por la mañana**, con 1,280 envíos concentrados en las
> horas previas a las 14:00, y nueve personas capturando a la vez.

El resto de la semana el sistema está prácticamente inactivo. **Dimensionar por el promedio
es dimensionar mal**, y una ventana de mantenimiento un jueves por la tarde es una ventana
de mantenimiento en el peor momento posible.

---

## 6 · El orden en que se construye

| | qué | hito |
|---|---|---|
| 1 | Token privado provisionado, para personas y CI | **H0** |
| 2 | CI mínima: `pytest` + `tsc` + `lint` + `build`, en verde | **H0** |
| 3 | `Dockerfile` de backend y de frontend | H1 |
| 4 | Entorno de *stage* con base gestionada y migraciones en el despliegue | H1 |
| 5 | HTTPS, `cookie_segura=True`, CORS al dominio real | H2 |
| 6 | Correo saliente real | H2 |
| 7 | Respaldos y **restauración probada de verdad** | H3 |
| 8 | Observabilidad, con alertas centradas en la ventana | H3 |
| 9 | Producción y guardia de los viernes | H4 |

---

## 7 · Los tres documentos

| | qué trae |
|---|---|
| [`01_ENTORNOS_Y_SECRETOS.md`](01_ENTORNOS_Y_SECRETOS.md) | Los tres entornos, el token privado, la sesión, el correo |
| [`02_CI_CD.md`](02_CI_CD.md) | El pipeline, las imágenes, las migraciones en el despliegue |
| [`03_DATOS_Y_OPERACION.md`](03_DATOS_Y_OPERACION.md) | PostgreSQL, respaldos, zona horaria, la ventana de los viernes, qué vigilar |
