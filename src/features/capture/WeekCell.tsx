"use client";

import { NEARLY_COMPLETE, type WeekProgress } from "./lib/compliance";
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
 * The week in progress is grey whatever it holds. Nothing is late before the
 * cutoff, and grading it would accuse whoever still has until Friday — which is
 * the one place this parts company with the reference prototype, whose grid
 * grades every week the same way.
 */

const styles = {
  chip: "inline-flex h-7 w-12 items-center justify-center rounded text-xs tabular-nums",
  complete: "bg-primary/35 text-primary-foreground",
  nearly: "bg-primary/10 text-primary-foreground",
  // One red for everything under the threshold. Whether it was seven of eleven
  // or none of them is what the figure inside the cell is for; a second hue
  // only asked the eye to carry what the number already says.
  short: "bg-destructive/15 text-destructive",
  open: "bg-muted text-muted-foreground",
  future: "text-muted-foreground",
};

interface WeekCellProps {
  period: Period;
  progress: WeekProgress;
}

function toneOf(progress: WeekProgress): string {
  const { delivered, total } = progress;
  if (!progress.closed) return styles.open;
  if (total === 0 || delivered >= total) return styles.complete;
  // The same threshold the bad-week count uses, so a cell painted as fine is
  // never one of the weeks counted against the operation beside it.
  return delivered / total >= NEARLY_COMPLETE ? styles.nearly : styles.short;
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
