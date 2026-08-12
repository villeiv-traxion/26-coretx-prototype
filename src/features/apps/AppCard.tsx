"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@traxion-global/design-system/react";
import { useLanguage } from "@/features/i18n";
import type { CoretxApp } from "./catalog";

const styles = {
  card: "group h-full grid grid-cols-[auto_1fr] content-start gap-x-4 p-4 shadow transition-shadow hover:shadow-md",
  header: "self-start p-0 row-span-2",
  iconWrapper:
    "flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10",
  icon: "h-7 w-7 text-primary",
  content: "col-start-2 overflow-hidden p-0",
  title: "mb-1 text-lg leading-tight sm:text-xl",
  description: "mb-2 text-xs leading-tight text-muted-foreground",
  subApps: "mb-3 flex flex-wrap gap-1.5",
  footer: "col-span-2 p-0 pt-1 sm:col-span-1 sm:col-start-2",
  button: "w-full sm:w-auto",
};

interface AppCardProps {
  app: CoretxApp;
}

export function AppCard({ app }: AppCardProps) {
  const { t } = useLanguage();
  const { name, description } = t.apps[app.id];
  const Icon = app.icon;

  return (
    <Card className={styles.card}>
      <CardHeader className={styles.header}>
        <div className={styles.iconWrapper}>
          <Icon className={styles.icon} aria-hidden="true" />
        </div>
      </CardHeader>

      <CardContent className={styles.content}>
        <CardTitle className={styles.title}>{name}</CardTitle>
        <p className={styles.description}>{description}</p>
        {app.subApps.length > 0 && (
          <div className={styles.subApps}>
            {app.subApps.map((subApp) => (
              <Badge key={subApp} variant="secondary">
                {subApp}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardContent className={styles.footer}>
        {/* Prototipo: las apps aún no tienen destino, el botón no navega. */}
        <Button variant="outline" size="sm" className={styles.button}>
          {t.common.open}
        </Button>
      </CardContent>
    </Card>
  );
}
