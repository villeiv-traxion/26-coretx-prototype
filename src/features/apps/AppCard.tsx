"use client";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@traxion-global/design-system/react";
import { useLanguage } from "@/features/i18n";
import type { CoretxApp } from "./catalog";

const styles = {
  // En móvil ocupan todo el ancho disponible; desde `sm` el ancho es fijo y es
  // lo que define el ancho del wrapper gris de cada categoría.
  card: "w-full sm:w-[380px] grid grid-cols-[auto_1fr] p-2 sm:p-4 gap-x-4 shadow-none",
  header: "self-center p-0 pb-1 sm:row-span-2",
  svg: "w-16 h-16 sm:w-20 sm:h-20",
  content: "overflow-hidden p-0 col-start-2",
  title: "text-lg sm:text-xl mb-1 leading-tight group-[.bg-dark]:text-white",
  description:
    "text-xs text-muted-foreground leading-tight mb-2 sm:mb-3 group-[.bg-dark]:text-white/70",
  linksSection: "p-0 col-span-2 sm:col-span-1 sm:col-start-2",
  // Dos columnas: cada botón ocupa el 50%, así entran dos por fila.
  linksContainer: "grid w-full grid-cols-2 gap-2",
  // `size="lg"` (h-9 px-8) es la base para móvil; desde `sm` se restauran las
  // medidas del size `default` del DS (h-8 px-4 py-2), porque la prop `size` no
  // admite breakpoints.
  linkButton: "w-full sm:h-8 sm:px-4 sm:py-2",
};

interface AppCardProps {
  app: CoretxApp;
}

export function AppCard({ app }: AppCardProps) {
  const { t } = useLanguage();
  const { name, description } = t.apps[app.id];

  return (
    <Card className={styles.card}>
      <CardHeader className={styles.header}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={app.illustration} alt={name} className={styles.svg} />
      </CardHeader>

      <CardContent className={styles.content}>
        <CardTitle className={styles.title}>{name}</CardTitle>
        <p className={styles.description}>{description}</p>
      </CardContent>

      <CardContent className={styles.linksSection}>
        {/* Prototipo: ningún botón navega todavía. Cuando la app tiene apps
            adicionales, éstas sustituyen al botón genérico "Abrir". */}
        <div className={styles.linksContainer}>
          {app.subApps.length > 0 ? (
            app.subApps.map((subApp) => (
              <Button
                key={subApp}
                variant="outline"
                size="lg"
                className={styles.linkButton}
              >
                {subApp}
              </Button>
            ))
          ) : (
            <Button variant="outline" size="lg" className={styles.linkButton}>
              {t.common.open}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
