"use client";

import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/features/i18n";
import type { CoretxApp } from "@/features/apps";

const styles = {
  row: "flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent",
  illustration: "h-8 w-8 shrink-0 object-contain",
  name: "flex-1 text-left font-medium",
  chevron: "h-4 w-4 shrink-0 text-muted-foreground",
};

interface AppsPanelItemProps {
  app: CoretxApp;
}

export function AppsPanelItem({ app }: AppsPanelItemProps) {
  const { t } = useLanguage();
  const { name } = t.apps[app.id];

  return (
    <button type="button" className={styles.row} disabled={!app.hasAccess}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={app.illustration} alt="" className={styles.illustration} />
      <span className={styles.name}>{name}</span>
      <ChevronRight className={styles.chevron} aria-hidden="true" />
    </button>
  );
}
