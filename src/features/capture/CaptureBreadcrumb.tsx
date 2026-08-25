"use client";

import { usePathname } from "next/navigation";
import { House } from "lucide-react";
import { Breadcrumb, type BreadcrumbItem } from "@/ui/Breadcrumb";
import { getOperation } from "./lib/organization";

/**
 * Dónde está el usuario dentro de la app, y cómo sale de aquí.
 *
 * El rastro se deriva de la ruta en un solo sitio y no en cada pantalla: la
 * tabla de cumplimiento se monta en dos rutas distintas (la raíz del perfil de
 * coordinación y `/compliance`), así que si cada pantalla trajera el suyo esa
 * tabla tendría que adivinar bajo cuál de las dos está.
 */

const ROOT = "/intelligence/capture";

/** Las hojas fijas: ruta exacta → cómo se llama esa pantalla. */
const LEAVES: Record<string, string> = {
  [`${ROOT}/compliance`]: "Cumplimiento",
  [`${ROOT}/responsibles`]: "Responsables",
};

function trailFor(pathname: string): BreadcrumbItem[] {
  const home: BreadcrumbItem = { label: "Inicio", href: "/", icon: House };

  if (pathname === ROOT) return [home, { label: "Captura" }];

  const app: BreadcrumbItem = { label: "Captura", href: ROOT };

  const leaf = LEAVES[pathname];
  if (leaf) return [home, app, { label: leaf }];

  const operationId = pathname.startsWith(`${ROOT}/operation/`)
    ? pathname.slice(`${ROOT}/operation/`.length)
    : undefined;
  const operation = operationId ? getOperation(operationId) : undefined;
  if (operation) return [home, app, { label: operation.name }];

  return [home, app];
}

export function CaptureBreadcrumb({ className }: { className?: string }) {
  const pathname = usePathname();
  return <Breadcrumb items={trailFor(pathname)} className={className} />;
}
