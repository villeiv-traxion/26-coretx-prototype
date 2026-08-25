"use client";

import { Badge } from "@traxion-global/design-system/react";

/**
 * How much of the week is in, said in a word.
 *
 * Three states on one axis — how many of the eleven have landed — and nothing
 * about the deadline. Whether the week is still editable is a different
 * question, and it is answered where it matters: by the countdown at the top
 * and by the lock on a closed form. Folding both into one badge made "borrador"
 * and "incompleto" mean the same thing in two different words.
 */

const styles = {
  badge: "shrink-0",
};

interface CompletenessBadgeProps {
  delivered: number;
  total: number;
}

export function CompletenessBadge({
  delivered,
  total,
}: CompletenessBadgeProps) {
  if (delivered === 0) {
    return (
      <Badge variant="gray" className={styles.badge}>
        Pendiente
      </Badge>
    );
  }

  if (delivered < total) {
    return (
      <Badge variant="yellow" className={styles.badge}>
        Incompleto
      </Badge>
    );
  }

  return (
    <Badge variant="green" className={styles.badge}>
      Completo
    </Badge>
  );
}
