"use client";

import { Badge } from "@traxion-global/design-system/react";
import type { Completeness } from "./lib/compliance";

/**
 * How much of the week is in, said in a word.
 *
 * Three states on one axis — how many of the eleven have landed — and nothing
 * about the deadline. Whether the week is still editable is a different
 * question, and it is answered where it matters: by the countdown in the header
 * and by the lock on a closed form.
 */

export const COMPLETENESS_LABELS: Record<
  Completeness,
  { text: string; variant: "gray" | "yellow" | "green" }
> = {
  PENDING: { text: "Pendiente", variant: "gray" },
  PARTIAL: { text: "Incompleto", variant: "yellow" },
  COMPLETE: { text: "Completo", variant: "green" },
};

const styles = {
  badge: "shrink-0",
};

export function CompletenessBadge({ state }: { state: Completeness }) {
  const label = COMPLETENESS_LABELS[state];
  return (
    <Badge variant={label.variant} className={styles.badge}>
      {label.text}
    </Badge>
  );
}
