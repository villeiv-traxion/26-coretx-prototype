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

- El prototipo usa el **MCP del design system de Traxion**.
- La interfaz es **responsive** y se adapta a distintos tamaños de pantalla.

## Stack

- [Next.js](https://nextjs.org) para la aplicación web.
- Design system de Traxion vía MCP.
- Despliegue en [Vercel](https://vercel.com).

## Puesta en marcha

```bash
npm install
npm run dev
```

La app queda disponible en `http://localhost:3000`.

## Repositorios y despliegue

El proyecto vive en el repo de Traxion y cuenta con un repo espejo en `villeiv`, con push configurado a ambos remotos. El repo de `villeiv` es el que se importa a Vercel para el despliegue.

```bash
git remote add origin <repo-traxion>
git remote set-url --add --push origin <repo-traxion>
git remote set-url --add --push origin <repo-villeiv>
```

## Documentación

- [`docs/prototype.md`](docs/prototype.md) — especificación del prototipo.
