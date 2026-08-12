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
  // `justify-start` para que el label quede pegado al icono y no repartido por
  // el `justify-between` del DS. `rotate-0` anula el volteo del chevron.
  trigger:
    "flex w-full items-center justify-start gap-3 rounded-md px-2 py-2.5 text-left text-sm hover:bg-muted hover:no-underline [&[data-state=open]>svg]:rotate-0",
  illustration: "h-8 w-8 shrink-0 object-contain",
  name: "flex-1 text-left font-medium",
  subList: "flex flex-col gap-1 pb-1 pl-11",
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

  const illustration = (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={app.illustration} alt="" className={styles.illustration} />
  );

  if (app.subApps.length === 0) {
    return (
      <button type="button" className={styles.row}>
        {illustration}
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
        {illustration}
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
