# Frontend — empieza aquí

**Next.js 15 App Router · React 19 · Tailwind 3.4 · `@traxion-global/design-system`**

---

## 1 · Corriendo en diez minutos

```bash
export NODE_AUTH_TOKEN=ghp_...    # ← sin esto no arranca. Ver §2
cd frontend
npm install
npm run dev                       # http://localhost:3000
```

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Requiere Node ≥ 18.18.

> **Node 18 está en fin de vida.** Funciona con Next 15, pero conviene subir a Node 22 antes
> de que el equipo crezca. Es una tarea de H0.

---

## 2 · ⚠️ El token privado — el primer bloqueo del proyecto

`@traxion-global/design-system` es un paquete **privado de GitHub Packages**. Sin un token
con `read:packages`:

- `npm install` falla,
- el CI no construye,
- y nadie del equipo puede empezar.

El `.npmrc` del proyecto ya apunta el scope:

```
@traxion-global:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

**Se pide a `c.rengifo@traxion.global` el primer día**, para las personas y para el CI. Ver
[`../devops/01_ENTORNOS_Y_SECRETOS.md`](../devops/01_ENTORNOS_Y_SECRETOS.md).

---

## 3 · Dos trampas que cuestan una tarde cada una

### 3.1 · `npm run build` con el servidor de desarrollo vivo

**Comparten `.next`.** El build lo reescribe bajo los pies del servidor, y lo que sale son
errores 500 con `MODULE_NOT_FOUND` que **parecen defectos de la aplicación**. Pasó tres
veces durante la construcción.

```bash
# se para el servidor, y entonces
rm -rf .next && npm run dev
```

### 3.2 · `install_design_system` deja el proyecto roto

La herramienta MCP del design system —que es **como se instala**, así lo exige su propia
documentación— tiene dos defectos conocidos:

1. Deja `tailwind.config.js` mezclando `import` con `module.exports` y **sin la clave
   `presets`**. Sin el preset, `bg-primary` y compañía no existen y **toda la interfaz sale
   en blanco y negro**.
2. **Sobrescribe `globals.css` entero.**

Ya está corregido en este repositorio. **Si alguien reinstala el design system, hay que
volver a corregirlo.**

---

## 4 · El mapa

```
frontend/
  app/                     # las siete rutas
    page.tsx                 la raíz: es el trabajo, no un letrero
    capturar/[operacion]/    la matriz
    seguimiento/  semanas/  analiticos/  admin/
  componentes/             # los primitivos y las superficies compartidas
  lib/
    periodos.ts              ✅ se queda: el cliente necesita el reloj
    operaciones.ts           ⚠️ dos funciones bajan al servidor en H3
    indicadores.ts           ✅ tipo y sentido
    analitica.ts             ⚠️ se borra en H3
    demo.tsx                 ⚠️ se borra en H1–H2
    catalogo.ts              ⚠️ se borra en H1
    mock/                    ⚠️ se borra en H1 (2.4 MB)
    reglas/                  ⚠️ se borra en H2 — el más peligroso
```

### La regla de organización

**Los derivados no viven dentro de las pantallas.** `almacenesPendientes`,
`estadoPorOperacion`, `bloquesDeCaptura` y `responsableDe` están en `lib/operaciones.ts`
como funciones puras — precisamente para poder bajarlas al servidor sin reescribir ninguna
pantalla.

---

## 5 · Lo que el design system no trae, y de dónde sale

| hueco | solución en este repo |
|---|---|
| Layout de aplicación | `componentes/AppShell.tsx`, siguiendo la escala z de la guía |
| Tabs | `componentes/Tabs.tsx` sobre `@radix-ui/react-tabs` |
| Formularios con validación | `componentes/Campo.tsx` — el `Input` del DS no tiene props de error |
| Estados vacíos con acción | `componentes/Pagina.tsx` → `Vacio`. El `NoDataMessage` del DS no acepta acción |
| Gráficas | `recharts`, alimentado con los tokens (`hsl(var(--primary-dark))`) |
| Paginación que no rompe en 375 px | `Paginacion` envuelve la del DS y fuerza el apilado |

**No se usa `react-hook-form` ni `zod`**, aunque el plan inicial los contemplaba: la
autoridad sobre la validación son **las 239 reglas de la semilla**, y meter esquemas de
`zod` habría creado una segunda fuente de verdad — exactamente lo que la especificación
advierte que no se haga.

Nota: el peer del design system pide `lucide-react@^0.469`, no la 1.x. Está fijado.

---

## 6 · Las convenciones que el design system marca como obligatorias

| | |
|---|---|
| **Sólo clases semánticas** | `bg-primary`, `text-muted-foreground`, `border-destructive`. **Nunca `text-red-500`**, nunca hex |
| **Iconos sólo de `lucide-react`** | Sin emoji, sin unicode, sin SVG en línea |
| **Ancho de página con `container`** | No `max-w-*` |
| **Escala z fija** | `z-30` header · `z-40` sidebar · `z-50` modales · `z-[100]` toasts |
| **Errores de campo** | `aria-invalid` + `aria-describedby`, y **nunca sólo color** |

---

## 7 · Qué hacer ahora

| documento | qué trae |
|---|---|
| [`01_CONEXION.md`](01_CONEXION.md) | **Empieza por aquí.** El orden de conexión ruta por ruta, y qué archivo se borra en cada paso |
| [`02_PANTALLAS.md`](02_PANTALLAS.md) | Las siete rutas y las decisiones de producto que ya se tomaron |
| [`03_SISTEMA_DE_DISENO.md`](03_SISTEMA_DE_DISENO.md) | Las reglas de `DESIGN.md` que un equipo nuevo rompe primero |

Y antes de tocar nada, [`../03_ESTADO_DEL_PROTOTIPO.md`](../03_ESTADO_DEL_PROTOTIPO.md) §6:
los siete defectos que ni `tsc`, ni ESLint, ni el build detectaron.

> **Una interfaz que se ve bien no es una interfaz que funciona.** Hay que tocarla.
