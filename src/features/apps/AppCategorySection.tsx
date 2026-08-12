"use client";

import { useLanguage } from "@/features/i18n";
import { AppCard } from "./AppCard";
import { getAppsByCategory, type CategoryId } from "./catalog";

const styles = {
  section: "flex w-full flex-col gap-4",
  heading: "text-sm font-semibold uppercase tracking-wide text-muted-foreground",
  grid: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
};

interface AppCategorySectionProps {
  category: CategoryId;
}

export function AppCategorySection({ category }: AppCategorySectionProps) {
  const { t } = useLanguage();
  const apps = getAppsByCategory(category);

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>{t.categories[category]}</h2>
      <div className={styles.grid}>
        {apps.map((app) => (
          <AppCard key={app.id} app={app} />
        ))}
      </div>
    </section>
  );
}
