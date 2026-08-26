"use client";

import Link from "next/link";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@traxion-global/design-system/react";
import { useLanguage } from "@/features/i18n";
import type { CoretxApp } from "./catalog";

const styles = {
  // En móvil ocupan todo el ancho disponible; desde `sm` el ancho es fijo y es
  // lo que define el ancho del wrapper gris de cada categoría.
  //
  // El ancho llega en `--card-width` desde el grupo (AppCategorySection), que
  // es quien decide cuánto miden sus cards; el 250px del fallback es sólo para
  // una card fuera de un grupo. La ilustración se deriva de la misma variable,
  // así que el SVG sigue al ancho sin tocarlo aparte.
  card: "w-full sm:w-[var(--card-width,250px)] grid grid-cols-[auto_1fr] p-2 sm:p-4 gap-x-4 shadow-none",
  header: "self-center p-0 pb-1 sm:row-span-2",
  // 20% del ancho de la card. En móvil no se puede derivar —la card es fluida y
  // un 20% de pantalla completa la desbordaría—, así que ahí queda el tamaño fijo.
  svg: "w-[3.2rem] h-[3.2rem] sm:w-[calc(var(--card-width,250px)*0.2)] sm:h-[calc(var(--card-width,250px)*0.2)]",
  content: "overflow-hidden p-0 col-start-2",
  title: "text-sm sm:text-base mb-1 leading-tight group-[.bg-dark]:text-white",
  description:
    "text-xs text-muted-foreground leading-tight mb-2 sm:mb-3 group-[.bg-dark]:text-white/70",
  linksSection: "p-0 col-span-2 sm:col-span-1 sm:col-start-2",
  // `size="sm"` es el más pequeño que trae el DS. Sólo se le fuerza el ancho:
  // en móvil ocupa la card entera, y desde `sm` se ajusta a su texto.
  linkButton: "w-full sm:w-auto",
  // Un botón deshabilitado no emite eventos de puntero, así que el tooltip
  // necesita colgar de un envoltorio y no del propio botón.
  disabledWrapper: "inline-block w-full",
};

interface AppCardProps {
  app: CoretxApp;
}

export function AppCard({ app }: AppCardProps) {
  const { t } = useLanguage();
  const { name, description } = t.apps[app.id];
  const openLabel = t.common.openApp.replace("{app}", name);

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
        {app.hasAccess ? (
          // Sin `href` la card sigue siendo un marcador: la app no existe todavía.
          <Button
            asChild={Boolean(app.href)}
            variant="outline"
            size="sm"
            className={styles.linkButton}
          >
            {app.href ? <Link href={app.href}>{openLabel}</Link> : openLabel}
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={styles.disabledWrapper} tabIndex={0}>
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className={styles.linkButton}
                >
                  {openLabel}
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>{t.common.noAccess}</TooltipContent>
          </Tooltip>
        )}
      </CardContent>
    </Card>
  );
}
