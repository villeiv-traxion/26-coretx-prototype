"use client";

import Link from "next/link";
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@traxion-global/design-system/react";
import { useLanguage } from "@/features/i18n";
import type { CoretxApp } from "./catalog";

const styles = {
  // En móvil los botones se apilan a ancho completo; desde `sm` se colocan en
  // fila y cada uno mide lo que su texto.
  wrapper: "flex flex-col gap-2 sm:flex-row sm:flex-wrap",
  // `size="sm"` es el más pequeño que trae el DS. Sólo se le fuerza el ancho.
  linkButton: "w-full sm:w-auto",
  // Un botón deshabilitado no emite eventos de puntero, así que el tooltip
  // necesita colgar de un envoltorio y no del propio botón.
  disabledWrapper: "inline-block w-full sm:w-auto",
};

/** Los destinos fuera del prototipo se abren en una pestaña nueva. */
const isExternal = (href: string) => href.startsWith("http");

interface AppCardActionsProps {
  app: CoretxApp;
}

/**
 * Botones de entrada de una card. Las apps con varias entradas (`entries`)
 * muestran una por módulo; el resto, un único «Abrir <app>». Sin `href` el
 * botón sigue siendo un marcador: ese destino no existe todavía.
 */
export function AppCardActions({ app }: AppCardActionsProps) {
  const { t } = useLanguage();
  const { name } = t.apps[app.id];

  const actions = app.entries
    ? app.entries.map((entry) => ({
        key: entry.id,
        label: t.appEntries[entry.id],
        href: entry.href,
      }))
    : [
        {
          key: app.id,
          label: t.common.openApp.replace("{app}", name),
          href: app.href,
        },
      ];

  if (!app.hasAccess) {
    return (
      <div className={styles.wrapper}>
        {actions.map((action) => (
          <Tooltip key={action.key}>
            <TooltipTrigger asChild>
              <span className={styles.disabledWrapper} tabIndex={0}>
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className={styles.linkButton}
                >
                  {action.label}
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>{t.common.noAccess}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {actions.map((action) => (
        <Button
          key={action.key}
          asChild={Boolean(action.href)}
          variant="outline"
          size="sm"
          className={styles.linkButton}
        >
          {action.href ? (
            <Link
              href={action.href}
              {...(isExternal(action.href)
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {action.label}
            </Link>
          ) : (
            action.label
          )}
        </Button>
      ))}
    </div>
  );
}
