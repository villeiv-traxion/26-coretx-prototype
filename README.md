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

- [Next.js](https://nextjs.org) para la aplicación web.
- Design system de Traxion vía MCP.
- Despliegue en [Vercel](https://vercel.com).

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
npm run dev
```

La app queda disponible en `http://localhost:3000`.

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
