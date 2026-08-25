"use client";

import type { WeekProgress } from "./lib/compliance";
import type { Period } from "./lib/periods";

/**
 * The 52 weeks of one operation in a single strip.
 *
 * It is a grid of cells and not a 52-column table: the whole year fits at a
 * glance, which is the only thing that tells **someone who failed once from
 * someone who always fails** — the conversation a single-period table cannot
 * have.
 *
 * The cell says the fraction, not a yes or a no: "9 of 11" and "0 of 11" are
 * different situations, and collapsing them into a cross loses exactly what is
 * needed to act. A week that has not arrived is left blank: painting it as a
 * breach would invent a failure that never happened.
 */

const styles = {
  strip: "flex gap-[2px]",
  cell: "h-4 w-[9px] shrink-0 rounded-[2px]",
  current: "ring-2 ring-secondary ring-offset-1",
};

function fillClass(progress: WeekProgress): string {
  if (progress.status === "FUTURE") return "bg-muted";
  if (progress.status === "MISSED") return "bg-destructive/60";

  const fraction = progress.delivered / progress.total;
  if (fraction >= 1) return "bg-primary";
  if (fraction >= 0.75) return "bg-primary/70";
  if (fraction >= 0.4) return "bg-primary/45";
  return "bg-primary/25";
}

function caption(period: Period, progress: WeekProgress): string {
  if (progress.status === "FUTURE") return `Semana ${period.week} · sin abrir`;
  return `Semana ${period.week} · ${progress.delivered} de ${progress.total}`;
}

interface WeekStripProps {
  weeks: { period: Period; progress: WeekProgress }[];
  currentWeek: number;
}

export function WeekStrip({ weeks, currentWeek }: WeekStripProps) {
  return (
    <div className={styles.strip}>
      {weeks.map(({ period, progress }) => (
        <span
          key={period.week}
          title={caption(period, progress)}
          className={`${styles.cell} ${fillClass(progress)} ${
            period.week === currentWeek ? styles.current : ""
          }`}
        />
      ))}
    </div>
  );
}
