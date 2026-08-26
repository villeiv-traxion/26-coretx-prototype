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
  // The cells share the row instead of taking a fixed 9px each: on a wide table
  // that left the year squeezed into the first third of the width with dead
  // space after it. A floor keeps them tappable, and once it bites the table
  // scrolls sideways rather than shaving them thinner.
  strip: "flex flex-1 gap-[2px]",
  cell: "h-4 min-w-[6px] flex-1 rounded-[2px]",
  current: "ring-2 ring-secondary ring-offset-1",
};

/**
 * The same three colours the badges use, so «Completo» and a green square are
 * one fact told twice rather than two schemes to learn. `yellow-500` and
 * `green-500` are the palette the design system itself reaches for in its Badge
 * variants; the gap keeps the warm destructive, which the app uses everywhere
 * for something missing rather than something wrong.
 *
 * No shading inside «parcial»: the tooltip already says «9 de 11», and four
 * tints of the same hue asked the eye to measure what a number states.
 */
function fillClass(progress: WeekProgress): string {
  switch (progress.status) {
    case "FUTURE":
      return "bg-muted";
    case "MISSED":
      return "bg-destructive-warm";
    case "OFFICIAL":
    case "DRAFT":
      return progress.delivered === progress.total
        ? "bg-green-500"
        : "bg-yellow-500";
    default:
      return "bg-muted";
  }
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
