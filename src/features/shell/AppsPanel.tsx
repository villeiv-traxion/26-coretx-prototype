"use client";

import { useCallback, useState } from "react";
import { Menu } from "lucide-react";
import {
  Accordion,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@traxion-global/design-system/react";
import { useLanguage } from "@/features/i18n";
import { CATEGORY_ORDER, getAppsByCategory } from "@/features/apps";
import { AppsPanelItem } from "./AppsPanelItem";
import { useHasHover } from "./useHasHover";

const styles = {
  trigger:
    "flex items-center justify-center rounded-md p-1 text-white transition-colors hover:bg-white/10",
  triggerIcon: "h-6 w-6",
  content: "w-[300px] overflow-y-auto sm:w-[360px]",
  body: "mt-6 flex flex-col gap-6",
  category: "flex flex-col gap-1",
  categoryLabel:
    "px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
};

export function AppsPanel() {
  const { t } = useLanguage();
  const hasHover = useHasHover();
  const [openItems, setOpenItems] = useState<string[]>([]);

  const handleHoverOpen = useCallback(
    (appId: string) => {
      if (!hasHover) return;
      setOpenItems((prev) => (prev.includes(appId) ? prev : [...prev, appId]));
    },
    [hasHover],
  );

  const handleHoverClose = useCallback(
    (appId: string) => {
      if (!hasHover) return;
      setOpenItems((prev) => prev.filter((id) => id !== appId));
    },
    [hasHover],
  );

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
          {CATEGORY_ORDER.map((category) => (
            <div key={category} className={styles.category}>
              <span className={styles.categoryLabel}>
                {t.categories[category]}
              </span>
              <Accordion
                type="multiple"
                value={openItems}
                onValueChange={setOpenItems}
              >
                {getAppsByCategory(category).map((app) => (
                  <AppsPanelItem
                    key={app.id}
                    app={app}
                    onHoverOpen={handleHoverOpen}
                    onHoverClose={handleHoverClose}
                  />
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
