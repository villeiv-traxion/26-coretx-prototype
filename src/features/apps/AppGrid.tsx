"use client";

import { useLanguage } from "@/features/i18n";
import { AppCategorySection } from "./AppCategorySection";
import { CATEGORY_ROWS } from "./catalog";

const styles = {
  // Sin espacio inferior: el footer aporta el suyo, y sumar los dos abría un
  // hueco que no era de nadie.
  //
  // El espacio de arriba se mide contra el alto de la ventana, no contra el
  // ancho: un valor fijo empujaba las cards fuera de la pantalla en portátiles
  // bajos y se quedaba corto en monitores altos. El `clamp` acota las dos
  // puntas para que ni se pegue al header ni se despeñe.
  // El hueco entre la descripción y los grupos se mide igual que el de arriba:
  // son los dos respiros que la pantalla corta necesita ceder primero.
  wrapper:
    "container flex flex-col items-center gap-[clamp(1.25rem,4.5vh,4rem)] pt-[clamp(1.5rem,7vh,7rem)]",
  intro: "flex flex-col items-center gap-5",
  // El logo es 719x159 (4.5:1) y la caja 180x46 (3.9:1): `object-contain` lo
  // encaja sin deformarlo. En móvil, un 30% menos (126x34).
  logo: "h-[31px] w-[113px] object-contain sm:h-[41px] sm:w-[162px]",
  subtitle:
    "w-full max-w-[680px] text-center text-sm text-muted-foreground md:text-base",
  groups: "flex w-full flex-col items-center gap-4",
  // Cada fila se apila hasta `lg`: dos grupos lado a lado necesitan ~1000px.
  row: "flex w-full flex-col items-center gap-4 lg:flex-row lg:flex-wrap lg:items-start lg:justify-center",
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
