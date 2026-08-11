# CoreTX — Prototipo

Prototipo conceptual de **CoreTX** (antes *Network OS*), la plataforma principal de Traxion donde viven las aplicaciones especializadas de cada división —carga, movilidad de personas y logística— junto con los ejes transversales **CoreTX Intelligence** y **CoreTX Navigate**.

El objetivo del prototipo es mostrar de manera conceptual cómo se despliegan las aplicaciones de Traxion y los ejes transversales de la plataforma.

## Aplicaciones y ejes

| Categoría | App | Descripción |
| --- | --- | --- |
| Logística y tecnología | **CoreTX Logistics** | Gestión integral de operaciones logísticas (incluye *Traxnova*) |
| Logística y tecnología | **CoreTX One** | Brokerage Cross-Border, Intra-MX e Intra-USA |
| Carga | **CoreTX Fleet** | Gestión integral de la División Carga |
| Personas | **CoreTX MIND** | Gestión integral de la División Personas |
| Transversal | **CoreTX Intelligence** | Sistemas de gestión, datos y decisión |
| Transversal | **CoreTX Navigate** | Ejecución comercial corporativa |

## Funcionalidades

- **Home**: pantalla de inicio con cards que funcionan como acceso directo a las aplicaciones y ejes transversales, agrupadas por categoría (Logística y tecnología, Carga, Personas, Transversales).
- **Menú de hamburguesa**: abre un panel lateral izquierdo con todos los servicios y apps disponibles. Las apps CoreTX son las principales y despliegan submenús al hover o tap con sus apps adicionales.

## Diseño

- Toda la UI se construye con **`@traxion-global/design-system`**, consultado a través del MCP `new-traxion-design-system` (componentes, stories, tokens y guidelines) **antes** de escribir markup. No se reinventan componentes ni estilos que el DS ya provee.
- La interfaz es **responsive** y se adapta a distintos tamaños de pantalla.

## Stack

| Pieza | Versión | Nota |
| --- | --- | --- |
| [Next.js](https://nextjs.org) | 16.3.0 | App Router, TypeScript, Turbopack, `src/` |
| React | 19.2.8 | |
| [Tailwind CSS](https://tailwindcss.com) | **3.4.x** | Fijado a v3 a propósito — es la versión que soporta el DS |
| PostCSS + Autoprefixer | 8.x / 10.x | Pipeline clásico de Tailwind v3 |
| ESLint | 9.x | `eslint-config-next` |
| [Vercel](https://vercel.com) | — | Despliegue |

> **Tailwind 3.4, no v4.** `create-next-app` scaffoldea Tailwind v4 por defecto; aquí se generó el proyecto **sin** Tailwind y se añadió v3.4 a mano. Por eso hay [`tailwind.config.ts`](tailwind.config.ts) y [`postcss.config.mjs`](postcss.config.mjs) con `tailwindcss` + `autoprefixer`, y `globals.css` usa las directivas `@tailwind base/components/utilities` en vez del `@import "tailwindcss"` de v4. **No actualices a Tailwind 4** mientras el DS no lo soporte.

## Design system

Instalado vía la herramienta `install_design_system` del MCP:

| Paquete | Versión |
| --- | --- |
| `@traxion-global/design-system` | 0.19.0 |
| `lucide-react` (peer) | 0.469.0 — **fijado**, el DS no soporta la 1.x |

Cableado en el proyecto:

- [`tailwind.config.ts`](tailwind.config.ts) aplica `presets: [traxionPreset]` y escanea el dist del DS.
- [`src/app/globals.css`](src/app/globals.css) importa `@traxion-global/design-system/theme.css` **antes** de las directivas `@tailwind`.
- [`types/design-system.d.ts`](types/design-system.d.ts) declara el módulo `tailwind-preset`, que se distribuye como CJS sin tipos.

```tsx
import { Button } from "@traxion-global/design-system/react";

<Button variant="default">Hola</Button>;
```

> Variantes reales de `Button`: `default`, `destructive`, `destructiveWarm`, `outline`, `secondary`, `ghost`, `link`. **No existe `primary`** (el ejemplo que devuelve el instalador del MCP es incorrecto).
>
> El instalador del MCP asume rutas `./app` y `styles/globals.css`; en este proyecto (`src/`, App Router) hay que revisar a mano lo que escribe en `tailwind.config.ts` tras cada ejecución.

## Estructura

```
src/app/            # App Router (layout, page, globals.css)
public/             # Assets estáticos
types/              # Declaraciones de módulos sin tipos (tailwind-preset del DS)
tailwind.config.ts  # Preset + content del DS
postcss.config.mjs
.mcp.json           # Servidor MCP del design system
.npmrc              # Registry de GitHub Packages para @traxion-global
docs/prototype.md   # Especificación del prototipo
```

## MCP del design system

El servidor MCP está declarado en [`.mcp.json`](.mcp.json) y apunta al **repo local** del design system:

```
C:/Apps y websites/8-traxion-global-design-system/packages/mcp/src/index.ts
```

Requisitos:

1. Tener clonado el repo `8-traxion-global-design-system` en esa ruta (si está en otra, ajusta `.mcp.json`).
2. Reiniciar Claude Code y aprobar el servidor MCP del proyecto la primera vez.
3. `NODE_AUTH_TOKEN` en el entorno con un token de GitHub Packages con permiso `read:packages` — el paquete `@traxion-global/design-system` es privado y se resuelve vía [`.npmrc`](.npmrc).

Herramientas expuestas por el MCP (ya permitidas en `.claude/settings.local.json`): `version`, `install_design_system`, `get_guideline`, `list_components`, `get_component`, `get_component_stories`.

## Puesta en marcha

```bash
npm install          # requiere NODE_AUTH_TOKEN para el paquete privado del DS
npm run dev          # http://localhost:3000
npm run build        # build de producción
npm run lint         # eslint
```

## Repositorios y despliegue

El proyecto vive en el repo de Traxion y cuenta con un repo espejo en `villeiv`. El repo espejo es el que se importa a Vercel para el despliegue.

| Rol | Repositorio |
| --- | --- |
| Principal | https://github.com/villeiv-traxion/26-coretx-prototype |
| Espejo (Vercel) | https://github.com/villeiv/26-coretx-prototype-mirror |

`origin` está configurado con dos push-URLs, de modo que un solo `git push` actualiza ambos remotos:

```bash
git remote add origin https://github.com/villeiv-traxion/26-coretx-prototype.git
git remote set-url --add --push origin https://github.com/villeiv-traxion/26-coretx-prototype.git
git remote set-url --add --push origin https://github.com/villeiv/26-coretx-prototype-mirror.git
```

## Documentación

- [`docs/prototype.md`](docs/prototype.md) — especificación del prototipo.
