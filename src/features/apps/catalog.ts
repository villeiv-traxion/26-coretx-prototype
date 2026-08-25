/** Ejes/categorías bajo los que se agrupan las apps en el Home y en el panel. */
export type CategoryId = "logistics" | "cargo" | "people" | "transversal";

/** Apps principales CoreTX. Los ids son la clave de `t.apps`. */
export type AppId =
  | "logistics"
  | "one"
  | "fleet"
  | "mind"
  | "intelligence"
  | "navigate";

export type CoretxApp = {
  id: AppId;
  category: CategoryId;
  /** Ilustración de la card en el Home (`public/apps/<id>.svg`). */
  illustration: string;
  /**
   * En el producto real vendrá de los permisos del usuario. En el prototipo es
   * fijo, para poder mostrar el estado sin acceso.
   */
  hasAccess: boolean;
  /**
   * Destino del botón «Abrir». Sólo lo tienen las apps que ya existen dentro
   * del prototipo; el resto siguen siendo cards sin navegación.
   */
  href?: string;
};

/**
 * Filas del Home en desktop. Cada array es una fila; en móvil y tablet se
 * apilan todas las categorías en una columna.
 */
export const CATEGORY_ROWS: CategoryId[][] = [
  ["logistics", "cargo"],
  ["people", "transversal"],
];

export const APPS: CoretxApp[] = [
  {
    id: "logistics",
    category: "logistics",
    illustration: "/apps/logistics.svg",
    hasAccess: true,
  },
  {
    id: "one",
    category: "logistics",
    illustration: "/apps/one.svg",
    hasAccess: true,
  },
  {
    id: "fleet",
    category: "cargo",
    illustration: "/apps/fleet.svg",
    hasAccess: true,
  },
  {
    id: "mind",
    category: "people",
    illustration: "/apps/mind.svg",
    // Ejemplo de app sin acceso: su botón sale deshabilitado con tooltip.
    hasAccess: false,
  },
  {
    id: "intelligence",
    category: "transversal",
    illustration: "/apps/intelligence.svg",
    hasAccess: true,
    href: "/intelligence/capture",
  },
  {
    id: "navigate",
    category: "transversal",
    illustration: "/apps/navigate.svg",
    hasAccess: true,
  },
];

export function getAppsByCategory(category: CategoryId): CoretxApp[] {
  return APPS.filter((app) => app.category === category);
}
