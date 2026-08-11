# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es esto

Prototipo conceptual de **CoreTX**, la plataforma de Traxion que agrupa las apps de cada división (carga, personas, logística) y los ejes transversales. La especificación funcional vive en `docs/prototype.md`.

**`docs/prototype.md` es propiedad exclusiva del usuario: léelo, nunca lo edites** — ni siquiera para marcar tareas del checklist. El avance del proyecto se refleja en `README.md`.

## Comandos

```bash
npm install          # requiere NODE_AUTH_TOKEN (ver abajo)
npm run dev          # http://localhost:3000
npm run build        # incluye type-check; es la verificación real de un cambio
npm run lint         # eslint
```

No hay framework de tests configurado. `npm run build` es la única verificación automatizada: compila y corre TypeScript.

## Stack y restricciones no obvias

Next.js 16 (App Router, Turbopack, `src/`, alias `@/*`), React 19, TypeScript.

**Tailwind está fijado en 3.4 y no debe subirse a v4** mientras el design system no lo soporte. `create-next-app` scaffoldea v4 por defecto; este proyecto se generó con `--no-tailwind` y se añadió v3.4 a mano. Consecuencias que hay que respetar:

- `tailwind.config.ts` + `postcss.config.mjs` con `tailwindcss` + `autoprefixer` (pipeline clásico v3), no `@tailwindcss/postcss`.
- `src/app/globals.css` usa `@tailwind base/components/utilities`, no el `@import "tailwindcss"` de v4.

`lucide-react` está **fijado en 0.469.0** porque es el peer que declara el DS. `npm install lucide-react` sin versión instala la 1.x y rompe la compatibilidad.

No existe `public/`: el boilerplate de Next se eliminó a propósito. Créalo solo si hacen falta assets estáticos.

## Construcción de UI

- **Siempre vía el MCP del Design System**: toda UI que se construya debe apoyarse en el `@traxion-global/design-system`. Consúltalo a través del MCP `new-traxion-design-system` para componentes, stories, tokens y guidelines **antes** de escribir markup. No reinventes componentes ni estilos que el DS ya provee.
- **Componentes pequeños y enfocados**: más fáciles de entender, probar y mantener.
- **Responsabilidad única**: cada componente debe tener una sola razón para cambiar. Señales de que hace demasiado:
  - Mezcla preocupaciones no relacionadas (p. ej. data fetching + validación de formulario + layout).
  - Demasiadas props (>5-7 suele ser bandera roja).
  - Lógica de renderizado condicional compleja.
  - Más de ~300 líneas.
- **Descomponer lo complejo**: cuando un componente hace demasiado, extrae piezas lógicas en componentes separados.
- **Extraer clases Tailwind a constantes de estilo**: en componentes de composición de app, saca los strings de clases Tailwind a una constante fuera del componente. Mejora legibilidad (el JSX se centra en estructura), mantenibilidad (cambios de estilo centralizados) y consistencia.

## Design system — protocolo y cableado

Protocolo de sesión del MCP:

1. Llama `version` **primero**, antes de `list_components` o cualquier otro tool.
2. Compara con lo instalado (`npm list @traxion-global/design-system --depth=0`). Si difieren, **pregunta al usuario** qué versión usar — el paquete está en `0.x` y los minor traen breaking changes.
3. Luego ya puedes usar `list_components`, `get_component`, `get_component_stories`, `get_guideline`.

Cableado actual (no lo rompas):

- `tailwind.config.ts` → `presets: [traxionPreset]` y `content` incluye el dist del DS (el DS emite clases sin prefijo desde su bundle; si no se escanea, esas utilidades no se generan).
- `src/app/globals.css` → `@import "@traxion-global/design-system/theme.css"` **antes** de las directivas `@tailwind`.
- `src/app/layout.tsx` → carga **Roboto** vía `next/font/google` mapeada a `--font-sans`, que es el token tipográfico que espera `theme.css`.
- `types/design-system.d.ts` → declara `@traxion-global/design-system/tailwind-preset`, que se distribuye como CJS sin tipos y sin esto falla el type-check.

### El instalador del MCP deja destrozos — revísalos

`install_design_system` asume un proyecto con `./app` y `styles/globals.css`. En este repo (`src/`, App Router) tras ejecutarlo hay que verificar a mano:

- `tailwind.config.ts` — ha llegado a introducir comas dobles (error de sintaxis), importar `traxionPreset` sin añadirlo a `presets`, y agregar rutas de `content` inexistentes (`./app`, `./pages`, `./components`, `./features`).
- El CSS del DS **no** se enlaza solo (avisa que no encuentra `styles/globals.css`).
- Instala `lucide-react` en la versión equivocada.
- El snippet de ejemplo que devuelve usa `variant="primary"`, que **no existe**. Las variantes reales de `Button` son `default`, `destructive`, `destructiveWarm`, `outline`, `secondary`, `ghost`, `link`.

## Entorno

`@traxion-global/design-system` es privado en GitHub Packages. Requiere `NODE_AUTH_TOKEN` en el entorno (scope `read:packages`; PAT clásico con SSO autorizado si la org usa SAML). `.npmrc` solo referencia la variable — nunca metas el token ahí.

El MCP apunta al **repo local** del DS en `C:/Apps y websites/8-traxion-global-design-system`; si no está clonado ahí, `.mcp.json` necesita ajuste.

## Git

`origin` tiene dos push-URLs configuradas: un solo `git push` actualiza el repo principal (`villeiv-traxion/26-coretx-prototype`) y el espejo (`villeiv/26-coretx-prototype-mirror`), que es el que consume Vercel. No conviertas eso en dos remotos separados sin avisar.
