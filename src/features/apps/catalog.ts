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
  icon: LucideIcon;
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
  { id: "logistics", category: "logistics", icon: Boxes, subApps: ["Traxnova"] },
  { id: "one", category: "logistics", icon: Globe2, subApps: [] },
  { id: "fleet", category: "cargo", icon: Truck, subApps: [] },
  { id: "mind", category: "people", icon: Users, subApps: [] },
  {
    id: "intelligence",
    category: "transversal",
    icon: BarChart3,
    subApps: [],
  },
  { id: "navigate", category: "transversal", icon: Compass, subApps: [] },
];

export function getAppsByCategory(category: CategoryId): CoretxApp[] {
  return APPS.filter((app) => app.category === category);
}
