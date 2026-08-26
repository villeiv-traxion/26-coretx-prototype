"use client";

import { usePathname } from "next/navigation";
import { House } from "lucide-react";
import { Breadcrumb, type BreadcrumbItem } from "@/ui/Breadcrumb";
import { getOperation } from "./lib/organization";

/**
 * Dónde está el usuario dentro de la plataforma, y cómo sale de aquí.
 *
 * El rastro se deriva de la ruta en un solo sitio y no en cada pantalla: la
 * tabla de cumplimiento se monta en dos rutas distintas (la raíz del perfil de
 * coordinación y `/compliance`), así que si cada pantalla trajera el suyo esa
 * tabla tendría que adivinar bajo cuál de las dos está.
 */

const ROOT = "/intelligence/capture";
const OPERATION_PREFIX = `${ROOT}/operation/`;

function trailFor(pathname: string): BreadcrumbItem[] {
  const home: BreadcrumbItem = { label: "Inicio", href: "/", icon: House };
  // El eje no tiene pantalla propia todavía: se nombra, no se enlaza.
  const axis: BreadcrumbItem = { label: "CoreTX Intelligence" };

  if (pathname === ROOT) return [home, axis, { label: "CoreTX Captura" }];

  const app: BreadcrumbItem = { label: "CoreTX Captura", href: ROOT };

  const operationId = pathname.startsWith(OPERATION_PREFIX)
    ? pathname.slice(OPERATION_PREFIX.length)
    : undefined;
  const operation = operationId ? getOperation(operationId) : undefined;
  if (operation) return [home, axis, app, { label: operation.name }];

  return [home, axis, app];
}

export function CaptureBreadcrumb({ className }: { className?: string }) {
  const pathname = usePathname();
  return <Breadcrumb items={trailFor(pathname)} className={className} />;
}
