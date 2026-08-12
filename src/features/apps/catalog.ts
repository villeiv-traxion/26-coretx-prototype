import {
  BarChart3,
  Boxes,
  Compass,
  Globe2,
  Truck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
  /** Icono compacto para el panel lateral. */
  icon: LucideIcon;
  /** Ilustración de la card en el Home (`public/apps/<id>.svg`). */
  illustration: string;
  /**
   * Apps adicionales que cuelgan de la app principal. Son nombres propios de
   * producto, así que no se traducen.
   */
  subApps: string[];
};

export const CATEGORY_ORDER: CategoryId[] = [
  "logistics",
  "cargo",
  "people",
  "transversal",
];

export const APPS: CoretxApp[] = [
  {
    id: "logistics",
    category: "logistics",
    icon: Boxes,
    illustration: "/apps/logistics.svg",
    subApps: ["Traxnova", "Bodegas"],
  },
  {
    id: "one",
    category: "logistics",
    icon: Globe2,
    illustration: "/apps/one.svg",
    subApps: ["Crossdock", "Aduanas"],
  },
  {
    id: "fleet",
    category: "cargo",
    icon: Truck,
    illustration: "/apps/fleet.svg",
    subApps: ["Rutas", "Taller"],
  },
  {
    id: "mind",
    category: "people",
    icon: Users,
    illustration: "/apps/mind.svg",
    subApps: ["Turnos", "Rondines"],
  },
  {
    id: "intelligence",
    category: "transversal",
    icon: BarChart3,
    illustration: "/apps/intelligence.svg",
    subApps: ["Tableros", "Pronósticos"],
  },
  {
    id: "navigate",
    category: "transversal",
    icon: Compass,
    illustration: "/apps/navigate.svg",
    subApps: ["Cotizador", "Pipeline"],
  },
];

export function getAppsByCategory(category: CategoryId): CoretxApp[] {
  return APPS.filter((app) => app.category === category);
}
