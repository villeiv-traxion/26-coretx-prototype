"use client";

import { useLanguage } from "@/features/i18n";
import { AppCategorySection } from "./AppCategorySection";
import { CATEGORY_ORDER } from "./catalog";

const styles = {
  wrapper: "container flex flex-col items-center gap-10 py-8 sm:py-12",
  intro: "flex flex-col items-center gap-2",
  title: "text-center text-2xl font-medium md:text-3xl",
  subtitle:
    "w-full text-center text-base text-muted-foreground md:w-2/3 md:text-lg lg:w-1/2",
  // Flex, no grid: cada grupo ocupa lo que ocupan sus cards y los que caben
  // comparten fila.
  groups: "flex flex-wrap justify-center gap-6",
};

export function AppGrid() {
  const { t } = useLanguage();

  return (
    <div className={styles.wrapper}>
      <div className={styles.intro}>
        <h1 className={styles.title}>{t.home.title}</h1>
        <p className={styles.subtitle}>{t.home.subtitle}</p>
      </div>

      <div className={styles.groups}>
        {CATEGORY_ORDER.map((category) => (
          <AppCategorySection key={category} category={category} />
        ))}
      </div>
    </div>
  );
}
