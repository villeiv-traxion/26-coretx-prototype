"use client";

import { useLanguage } from "@/features/i18n";
import { AppCategorySection } from "./AppCategorySection";
import { CATEGORY_ROWS } from "./catalog";

const styles = {
  // Sólo sube el espacio superior (entre el header y el logo); el inferior se
  // mantiene, de ahí el `pt`/`pb` separados.
  wrapper:
    "container flex flex-col items-center gap-10 pb-8 pt-10 sm:pb-12 sm:pt-16",
  intro: "flex flex-col items-center gap-5",
  // El logo es 719x159 (4.5:1) y la caja 156x40 (3.9:1): `object-contain` lo
  // encaja sin deformarlo. En móvil, un 30% menos (109x29).
  logo: "h-[29px] w-[109px] object-contain sm:h-[40px] sm:w-[156px]",
  subtitle:
    "w-full max-w-[680px] text-center text-base text-muted-foreground md:text-lg",
  groups: "flex w-full flex-col items-center gap-6",
  // Cada fila se apila hasta `lg`: dos grupos lado a lado necesitan ~1000px.
  row: "flex w-full flex-col items-center gap-6 lg:flex-row lg:flex-wrap lg:items-start lg:justify-center",
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
        {CATEGORY_ROWS.map((row) => (
          <div key={row.join("-")} className={styles.row}>
            {row.map((category) => (
              <AppCategorySection key={category} category={category} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
