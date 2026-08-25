# Integración y despliegue

**Hoy no existe ninguno de los dos. Esto es lo que hay que construir, y en qué orden.**

---

## 1 · La integración continua

Es lo primero, y es de H0: sin CI en verde, las otras dos células no tienen red debajo.

### 1.1 · Lo que tiene que correr en cada cambio

```bash
# backend
uv sync
uv run alembic upgrade head
uv run python -m app.seed
uv run pytest -q                      # 67 pruebas, ~10 s

# frontend
npm ci                                # necesita NODE_AUTH_TOKEN
npx tsc --noEmit
npm run lint
npm run build
```

El backend necesita **un PostgreSQL 16 de servicio** en el pipeline. Las pruebas crean y
destruyen `coretx_captura_test` por su cuenta; sólo hace falta que la base exista y que el
usuario pueda crear bases.

### 1.2 · Dos cosas que la CI tiene que comprobar y no son pruebas

**Que el seed dé las cifras exactas.** El propio seed las imprime:

```
companias 9 · operaciones 141 · activas 136 · indicadores 23 · campos 50 · reglas 239
cobertura 2,577  (2,504 sobre operación activa)
```

Si alguna no cuadra, **el pipeline falla ahí**. La semilla o el cargador están mal y todo lo
que viene después hereda el error.

**El presupuesto de `frontend/lib/mock/envios.json`: 2.5 MB.** Acaba en el paquete que
descarga el navegador. Mientras exista, la CI lo mide y falla si crece:

```bash
[ "$(stat -c%s frontend/lib/mock/envios.json)" -lt 2621440 ]
```

Desaparece en H1, y con él esta comprobación.

### 1.3 · ⚠️ Una trampa del pipeline

**`npm run build` y `next dev` comparten `.next`.** En CI no coexisten, pero **en cualquier
script que haga las dos cosas, sí**: el build reescribe lo que el servidor está usando y
salen 500 con `MODULE_NOT_FOUND` que parecen defectos de la aplicación.

Pasó tres veces durante la construcción. Si un paso del pipeline levanta el servidor para
una prueba de humo, **que sea después del build y sobre `npm start`, nunca sobre `next dev`
en paralelo**.

---

## 2 · Las imágenes

No existen. Dos, ambas multietapa.

### 2.1 · Backend

```dockerfile
FROM python:3.12-slim AS deps
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

FROM python:3.12-slim
ENV TZ=America/Mexico_City
WORKDIR /app
COPY --from=deps /app/.venv /app/.venv
COPY app/ app/
COPY alembic/ alembic/
COPY alembic.ini .
# ⚠️ la semilla vive FUERA de backend/ y el seed la lee de la raíz del repositorio
COPY ../semilla/ /semilla/
ENV CORETX_DIRECTORIO_DE_SEMILLA=/semilla
CMD ["/app/.venv/bin/uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

> ⚠️ **La ruta de la semilla es la trampa de esta imagen.** `config.py` la resuelve como
> `RAIZ_DEL_REPO / "semilla"`, dos niveles por encima de `app/`. En un contenedor donde el
> contexto de build es `backend/`, esa ruta no existe. **El contexto de build tiene que ser
> la raíz del repositorio**, y `CORETX_DIRECTORIO_DE_SEMILLA` apuntar a donde se copió.

### 2.2 · Frontend — y el token

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN --mount=type=secret,id=npm_token \
    NODE_AUTH_TOKEN="$(cat /run/secrets/npm_token)" npm ci
```

> ⚠️ **El token va como `--mount=type=secret`, nunca como `ARG`.** Un `ARG` **queda escrito
> en la capa de la imagen** y cualquiera que la descargue lo lee. Es la clase de defecto que
> nadie nota hasta que se audita.

El resto es el multietapa estándar de Next 15 con `output: "standalone"`.

---

## 3 · El despliegue

### 3.1 · Las migraciones

```
construir → publicar → migrar → arrancar
```

**`alembic upgrade head` corre como un paso del despliegue, antes de arrancar la aplicación
nueva.** No en el arranque del contenedor: con dos réplicas, dos contenedores intentarían
migrar a la vez.

Automatizarlo en H1. Si no, cada entrega posterior arrastra un paso manual, y el paso manual
se olvida justo el viernes.

### 3.2 · ⚠️ La primera migración de este proyecto

La migración inicial **se reescribió** con el renombre `Almacen` → `Operacion`. Una base
anterior a agosto de 2026 **no migra**:

```sql
DROP DATABASE coretx_captura;
```

Vale para las bases de desarrollo del equipo. En `stage` y `prod` no aplica porque nacen
después.

### 3.3 · Cargar la semilla

`uv run python -m app.seed` es **idempotente** —hay una prueba que lo fija— así que puede
correr en cada despliegue sin duplicar nada.

> Que sea idempotente **no era gratis**: la primera versión duplicaba los 2,577 renglones de
> cobertura en la segunda corrida, y con ellos el denominador del porcentaje de entrega. El
> número resultante parecía razonable.

### 3.4 · Vuelta atrás

- **La aplicación** vuelve atrás cambiando la etiqueta de la imagen.
- **La base no.** Cada migración con `downgrade` escrito y probado en `stage`, o la vuelta
  atrás es restaurar un respaldo.
- **Nunca se despliega un viernes.** Ver §5.

---

## 4 · Ramas y entregas

| rama | despliega a | quién |
|---|---|---|
| cualquiera con propuesta de cambio | nada — sólo CI | |
| `main` | `stage`, automático | |
| etiqueta `vX.Y.Z` | `prod`, manual | con aprobación |

Producción **siempre a mano**, aunque sea un botón. Es una plataforma con ventanas de corte:
el momento del despliegue importa más que la velocidad.

---

## 5 · El calendario de despliegue

| corte | cuándo | ventana abierta desde |
|---|---|---|
| **Semanal** | **viernes 14:00** | martes 14:00 |
| Mensual | día 3 del mes siguiente | día 30 aprox. |
| Semestral | día 5 del mes siguiente al cierre | |

> **Las ventanas de captura ocupan de martes a viernes, todas las semanas.**

- **Nunca desplegar jueves ni viernes.**
- **Nunca mantenimiento con una ventana abierta.**
- La franja segura es **viernes por la tarde después del corte, sábado y lunes**.
- El día 1 al 3 de cada mes se solapan el corte mensual y el semanal: es la peor franja del
  año, y hay dos días así cada mes.

---

## 6 · Lista de comprobación de la primera entrega a producción

```
[ ] CI en verde: 67 pruebas + tsc + lint + build
[ ] Migraciones aplicadas y `downgrade` probado en stage
[ ] Seed corrido, y las cifras cuadran exactamente
[ ] cookie_segura = True, HTTPS forzado
[ ] CORS al dominio real
[ ] Correo saliente probado contra un buzón @traxion.global
[ ] Respaldo automático activo y UNA restauración probada de verdad
[ ] Alertas de la ventana configuradas (ver 03_DATOS_Y_OPERACION.md)
[ ] /docs cerrado o autenticado
[ ] No es jueves ni viernes
```
