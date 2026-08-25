# Entornos y secretos

---

## 1 · Los tres entornos

| | `dev` | `stage` | `prod` |
|---|---|---|---|
| Base de datos | Docker local, puerto 5433 | Gestionada, pequeña | Gestionada, con réplica de lectura si hace falta |
| Datos | Semilla + `generar_mock.py` | **Semilla real, sin envíos** | Semilla real |
| Correo | `CorreoDeConsola` — imprime en la terminal | Buzón de captura, **nunca a personas reales** | SMTP corporativo |
| `CORETX_COOKIE_SEGURA` | `False` | `True` | `True` |
| CORS | `http://localhost:3000` | dominio de *stage* | dominio real |
| Quién entra | el equipo | el equipo + dominio | la operación |

### ⚠️ `stage` no lleva envíos reales

La bitácora es un registro con nombre y hora de personas reales. Un *stage* con copia de
producción convierte cada entorno de prueba en una copia de datos de personal.

**`stage` arranca con la semilla —que son catálogos, no personas capturando— y se llena
con lo que el equipo teclee.** Si alguna vez hace falta reproducir un defecto con datos
reales, se hace en producción con acceso de lectura, no copiando la base.

---

## 2 · ⚠️ El token privado — el primer trámite del proyecto

`@traxion-global/design-system` vive en **GitHub Packages, privado**. El `.npmrc` del
proyecto ya apunta el scope:

```
@traxion-global:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

**Sin `NODE_AUTH_TOKEN` con `read:packages`:**

- `npm install` falla en la máquina de cada persona,
- **el CI no construye el frontend**,
- y la imagen de despliegue no se puede generar.

Hay que provisionarlo en **tres sitios**:

| dónde | cómo |
|---|---|
| Máquina de cada persona | Variable de entorno en el perfil |
| CI | Secreto del repositorio |
| Construcción de la imagen | **Secreto de build**, no `ARG` — ver [`02_CI_CD.md`](02_CI_CD.md) §2 |

> Un token en un `ARG` de Docker **queda en la imagen**. Se usa `--mount=type=secret`.

Se pide a `c.rengifo@traxion.global`. **Antes que cualquier código.**

---

## 3 · Los secretos

| secreto | dónde se usa | notas |
|---|---|---|
| `CORETX_URL_DE_BASE_DE_DATOS` | backend | Usuario con permisos sobre un solo esquema; **no superusuario** |
| `NODE_AUTH_TOKEN` | build del frontend | §2 |
| Credenciales SMTP / SES | backend | §5 |
| Clave de firma de los enlaces | backend | ⚠️ **Ver §4** |

Ninguno va en el repositorio. Ninguno va en un `ARG` de Docker. Los valores de `config.py`
son valores por omisión de desarrollo y **no sirven en producción** — empezando por
`coretx:coretx`.

---

## 4 · La identidad: enlace de un solo uso

Decisión de §0 de la especificación: **enlace de un solo uso por correo `@traxion.global`,
sin contraseñas.** Se aísla en un módulo; el SSO corporativo entra después sin tocar lo
demás.

```
POST /api/sesion/enlace   { correo }   → 204 SIEMPRE, exista o no el usuario
GET  /api/sesion/entrar?t=…            → 302 + cookie
POST /api/sesion/salir                 → 204
```

> **El 204 constante es deliberado:** un 404 cuando el correo no existe convierte el
> endpoint en un enumerador de personas de la empresa. No se cambie «para dar mejor
> retroalimentación».

| parámetro | omisión | revisar con seguridad |
|---|---:|---|
| Vida del enlace | 30 min | ¿suficiente si el correo corporativo tarda? |
| Vida de la sesión | 12 h | Cubre una jornada. ¿Renovación deslizante? |
| Cookie | `httpOnly`, `sameSite=lax` | |
| `CORETX_COOKIE_SEGURA` | **`False`** | **`True` en stage y prod** |

### Lo que hay que revisar y hoy no está

- **Límite de petición de enlaces por correo y por IP.** Hoy no hay ninguno: cualquiera
  puede pedir mil enlaces. Es la tarea de seguridad más urgente de H2.
- **Invalidar el enlace al usarlo**, no sólo al expirar — verificar que se cumple.
- **Cerrar sesión en todos los dispositivos** al dar de baja a un usuario.

---

## 5 · El correo

Hoy `CorreoDeConsola` **imprime el enlace en la terminal**. Es una implementación de la
interfaz abstracta `Correo`, en `app/seguridad/sesiones.py`.

> **Sustituir la implementación, nada más.** No hay que tocar nada del resto.

### En E1 el correo hace una sola cosa

Manda enlaces de acceso. **Volumen bajo**: una persona entra una o dos veces por semana, y
son nueve personas.

### En E2 el volumen cambia de orden

El agente manda recordatorios en cuatro momentos de cada ventana, a cada responsable de cada
operación. **Con 141 operaciones y cortes semanales, son miles de mensajes por periodo.**
Eso ya no es un `sendmail`: necesita un proveedor con reputación, reintentos y registro de
entrega.

**Dimensionar para E2 desde el principio evita migrar el proveedor a mitad del despliegue**,
aunque E1 no lo use.

### Reglas que no cambian

- **Sólo se admiten correos `@traxion.global`** (`CORETX_DOMINIO_DE_CORREO`). En `dev` y
  `stage`, además, a un buzón de captura: **nunca a personas reales**.
- SPF, DKIM y DMARC del dominio, o los enlaces caen en no deseado y la plataforma parece
  rota cuando el problema es de entrega.

---

## 6 · CORS y el mismo origen

Hoy está fijo en `app/main.py`:

```python
allow_origins=["http://localhost:3000"]
allow_credentials=True
```

**Tiene que salir a configuración** en H1. Y con `allow_credentials=True`, `allow_origins`
**nunca** puede ser `*`.

**Lo más simple es no necesitarlo**: servir frontend y backend bajo el mismo origen, con el
backend en `/api`. Elimina CORS entero y hace que `sameSite=lax` funcione sin excepciones.
Es la opción recomendada.

---

## 7 · Lista de comprobación antes de producción

```
[ ] cookie_segura = True y HTTPS forzado
[ ] CORS al dominio real, nunca *
[ ] Usuario de base de datos sin permisos de superusuario
[ ] Ningún secreto en el repositorio ni en una capa de imagen
[ ] Límite de petición de enlaces por correo y por IP
[ ] SPF, DKIM y DMARC verificados
[ ] Respaldo automático, y una restauración probada de verdad
[ ] Zona horaria del contenedor y de la base en America/Mexico_City
[ ] /docs cerrado o detrás de autenticación
[ ] Ventana de mantenimiento acordada: NUNCA jueves ni viernes
```

El último punto no es cosmético: la ventana de captura semanal abre el **martes a las 14:00**
—72 h antes del corte del viernes— y el pico es el viernes por la mañana.
