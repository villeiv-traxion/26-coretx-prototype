"use client";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@traxion-global/design-system/react";
import { useLanguage } from "@/features/i18n";
import type { CoretxApp } from "@/features/apps";

const styles = {
  row: "flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left text-sm transition-colors hover:bg-muted",
  trigger:
    "flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left text-sm hover:no-underline hover:bg-muted",
  icon: "h-5 w-5 shrink-0 text-primary",
  name: "font-medium",
  subList: "flex flex-col gap-1 pb-1 pl-10",
  subItem:
    "rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
};

interface AppsPanelItemProps {
  app: CoretxApp;
  /** Abre el submenú al pasar el puntero (sólo en dispositivos con hover). */
  onHoverOpen: (appId: string) => void;
  onHoverClose: (appId: string) => void;
}

export function AppsPanelItem({
  app,
  onHoverOpen,
  onHoverClose,
}: AppsPanelItemProps) {
  const { t } = useLanguage();
  const { name } = t.apps[app.id];
  const Icon = app.icon;

  if (app.subApps.length === 0) {
    return (
      <button type="button" className={styles.row}>
        <Icon className={styles.icon} aria-hidden="true" />
        <span className={styles.name}>{name}</span>
      </button>
    );
  }

  return (
    <AccordionItem
      value={app.id}
      className="border-none"
      onMouseEnter={() => onHoverOpen(app.id)}
      onMouseLeave={() => onHoverClose(app.id)}
    >
      <AccordionTrigger className={styles.trigger}>
        <Icon className={styles.icon} aria-hidden="true" />
        <span className={styles.name}>{name}</span>
      </AccordionTrigger>
      <AccordionContent>
        <div className={styles.subList}>
          {app.subApps.map((subApp) => (
            <button type="button" key={subApp} className={styles.subItem}>
              {subApp}
            </button>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
