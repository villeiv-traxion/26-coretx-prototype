"use client";

import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@traxion-global/design-system/react";
import { useLanguage } from "@/features/i18n";
import { APPS } from "@/features/apps";
import { AppsPanelItem } from "./AppsPanelItem";

const styles = {
  trigger:
    "flex items-center justify-center rounded-md p-1 text-white transition-colors hover:bg-white/10",
  triggerIcon: "h-6 w-6",
  // Pantalla completa en móvil; desde `sm` vuelve a ser un panel lateral.
  content: "w-full overflow-y-auto sm:w-[288px]",
  // Lista plana: sin títulos de categoría, todas las apps con el mismo
  // espaciado entre sí.
  body: "mt-6 flex flex-col gap-1",
};

export function AppsPanel() {
  const { t } = useLanguage();

  return (
    <Sheet>
      <SheetTrigger className={styles.trigger} aria-label={t.header.openMenu}>
        <Menu className={styles.triggerIcon} />
      </SheetTrigger>
      <SheetContent side="left" className={styles.content}>
        <SheetHeader>
          <SheetTitle>{t.header.panelTitle}</SheetTitle>
          <SheetDescription>{t.header.panelDescription}</SheetDescription>
        </SheetHeader>

        <div className={styles.body}>
          {APPS.map((app) => (
            <AppsPanelItem key={app.id} app={app} />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
