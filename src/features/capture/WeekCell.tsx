"use client";

import type { WeekProgress } from "./lib/compliance";
import type { Period } from "./lib/periods";

/**
 * One operation in one week, as a cell.
 *
 * Always the fraction, never a tick: «11 de 11» and «9 de 11» belong to the same
 * column and should be read the same way, and a symbol among numbers makes the
 * eye stop to translate it.
 *
 * A week nobody was asked for is a dot, not a zero. Painting it as a breach
 * would invent a failure that never happened.
 *
 * The tones are the ones the reference prototype uses: primary for a week that
 * closed, warm for one that fell short, destructive for one that never
 * reported. An open week that is merely unfinished stays grey — nothing is late
 * until the cutoff, and colouring it would accuse whoever still has until
 * Friday.
 */

const styles = {
  chip: "inline-flex h-6 w-10 items-center justify-center rounded text-[0.6875rem] tabular-nums",
  complete: "bg-primary/25 text-primary-foreground",
  open: "text-muted-foreground",
  short: "bg-destructive-warm/15 text-destructive-warm",
  none: "bg-destructive/15 text-destructive",
  future: "text-muted-foreground",
};

interface WeekCellProps {
  period: Period;
  progress: WeekProgress;
}

function toneOf(progress: WeekProgress): string {
  if (progress.delivered === progress.total) return styles.complete;
  if (!progress.closed) return styles.open;
  return progress.delivered === 0 ? styles.none : styles.short;
}

export function WeekCell({ period, progress }: WeekCellProps) {
  if (progress.status === "FUTURE") {
    return (
      <span
        className={styles.future}
        title={`Semana ${period.week} · sin abrir`}
        aria-label={`Semana ${period.week}: sin abrir`}
      >
        ·
      </span>
    );
  }

  return (
    <span
      className={`${styles.chip} ${toneOf(progress)}`}
      title={`Semana ${period.week} · ${progress.delivered} de ${progress.total}`}
    >
      {progress.delivered}/{progress.total}
    </span>
  );
}
