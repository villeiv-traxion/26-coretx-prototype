"use client";

import { useLanguage } from "@/features/i18n";
import { AppCategorySection } from "./AppCategorySection";
import { CATEGORY_ORDER } from "./catalog";

const styles = {
  wrapper: "container flex flex-col items-center gap-10 py-8 sm:py-12",
  intro: "flex flex-col items-center gap-5",
  // El logo es 719x159 (4.5:1) y la caja 216x56 (3.9:1): `object-contain` lo
  // encaja sin deformarlo.
  logo: "h-[56px] w-[216px] object-contain",
  // `w-full` + `max-w` en vez de ancho fijo: mide 680px cuando hay espacio y no
  // desborda en pantallas más estrechas.
  subtitle:
    "w-full max-w-[680px] text-center text-base text-muted-foreground md:text-lg",
  // Flex, no grid: cada grupo ocupa lo que ocupan sus cards y los que caben
  // comparten fila.
  groups: "flex flex-wrap justify-center gap-6",
};

export function AppGrid() {
  const { t } = useLanguage();

  return (
    <div className={styles.wrapper}>
      <div className={styles.intro}>
        <h1>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo_cortx.png" alt="CoreTX" className={styles.logo} />
        </h1>
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
