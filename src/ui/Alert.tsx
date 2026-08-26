"use client";

import type { LucideIcon } from "lucide-react";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import { cn } from "@traxion-global/design-system";

/**
 * An inline notice: something the screen has to say about what is on it.
 *
 * The design system has no `Alert`. Its only panel of this shape is
 * `AiInsight`, which fits structurally — title, description, variant — but is
 * named for where such panels usually come from, and most of what this app
 * needs to announce comes from a calendar, not from an agent.
 *
 * Built on the same tokens the design system uses, so it inherits the theme
 * even though it is not part of it. Icon and wording carry the meaning as well
 * as the colour does: an alert that only differs by hue says nothing to anyone
 * who cannot see the difference.
 */

export type AlertVariant = "info" | "warning" | "critical" | "success";

const VARIANTS: Record<
  AlertVariant,
  { icon: LucideIcon; panel: string; mark: string }
> = {
  info: {
    icon: Info,
    panel: "border-border bg-muted/60",
    mark: "text-muted-foreground",
  },
  warning: {
    icon: TriangleAlert,
    panel: "border-destructive-warm/40 bg-destructive-warm/5",
    mark: "text-destructive-warm",
  },
  critical: {
    icon: CircleAlert,
    panel: "border-destructive/40 bg-destructive/5",
    mark: "text-destructive",
  },
  success: {
    icon: CircleCheck,
    panel: "border-primary-dark/40 bg-primary/10",
    mark: "text-primary-dark",
  },
};

const styles = {
  panel: "flex items-start gap-3 rounded-lg border px-4 py-3",
  icon: "mt-0.5 h-4 w-4 shrink-0",
  body: "flex min-w-0 flex-col gap-0.5",
  title: "text-sm font-medium leading-snug",
  description: "text-sm leading-snug text-muted-foreground",
};

interface AlertProps {
  title: string;
  description?: string;
  variant?: AlertVariant;
  className?: string;
}

export function Alert({
  title,
  description,
  variant = "info",
  className,
}: AlertProps) {
  const { icon: Icon, panel, mark } = VARIANTS[variant];

  return (
    <div role="status" className={cn(styles.panel, panel, className)}>
      <Icon className={cn(styles.icon, mark)} aria-hidden="true" />
      <div className={styles.body}>
        <p className={styles.title}>{title}</p>
        {description ? (
          <p className={styles.description}>{description}</p>
        ) : null}
      </div>
    </div>
  );
}
