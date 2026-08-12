"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@traxion-global/design-system/react";
import { useLanguage } from "@/features/i18n";
import type { CoretxApp } from "@/features/apps";
import { useHasHover } from "./useHasHover";

/** Margen para cruzar el hueco entre el ítem y el submenú sin que se cierre. */
const CLOSE_DELAY_MS = 120;

const styles = {
  row: "flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left text-sm transition-colors hover:bg-muted",
  illustration: "h-8 w-8 shrink-0 object-contain",
  name: "flex-1 text-left font-medium",
  chevron: "h-4 w-4 shrink-0 text-muted-foreground",
  subPanel: "w-48",
};

interface AppsPanelItemProps {
  app: CoretxApp;
}

export function AppsPanelItem({ app }: AppsPanelItemProps) {
  const { t } = useLanguage();
  const hasHover = useHasHover();
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  function openOnHover() {
    if (!hasHover) return;
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function closeOnLeave() {
    if (!hasHover) return;
    closeTimer.current = window.setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  }

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
    // `modal={false}` es imprescindible con apertura por hover: en modo modal
    // Radix bloquea los eventos de puntero fuera del contenido, el trigger deja
    // de recibirlos y se dispara un ciclo abrir/cerrar que hace parpadear el menú.
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger
        className={styles.row}
        onMouseEnter={openOnHover}
        onMouseLeave={closeOnLeave}
      >
        {illustration}
        <span className={styles.name}>{name}</span>
        <ChevronRight className={styles.chevron} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="right"
        align="start"
        sideOffset={4}
        className={styles.subPanel}
        onMouseEnter={openOnHover}
        onMouseLeave={closeOnLeave}
      >
        {app.subApps.map((subApp) => (
          <DropdownMenuItem key={subApp}>{subApp}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
