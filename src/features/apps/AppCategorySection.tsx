"use client";

import { useLanguage } from "@/features/i18n";
import { AppCard } from "./AppCard";
import { getAppsByCategory, type CategoryId } from "./catalog";

const styles = {
  section: "flex flex-col gap-2 rounded-xl bg-[#E9E9E9] p-4",
  heading: "text-sm font-bold uppercase text-muted-foreground",
  cards: "flex flex-wrap gap-4",
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
      <div className={styles.cards}>
        {apps.map((app) => (
          <AppCard key={app.id} app={app} />
        ))}
      </div>
    </section>
  );
}
