"use client";

import { CalendarDays, Clock, Lock } from "lucide-react";
import { Separator } from "@traxion-global/design-system/react";
import {
  cutoffOf,
  isClosed,
  periodOf,
  rangeInWords,
  timeLeft,
  type Period,
} from "./lib/periods";

/**
 * The week, in one line, sized to sit beside the filters.
 *
 * Three facts and no more: which week, how much is in, how long is left. It
 * replaced a full header block that carried the same figures inside a sentence,
 * a progress bar and a row of chips — the room that took was worth more to the
 * work below it than the phrasing was.
 *
 * The countdown still turns warm inside the last day. That is the one thing the
 * short version cannot afford to lose.
 */

/** Inside this many hours, the deadline stops being background information. */
const URGENT_HOURS = 24;

const styles = {
  root: "flex h-8 shrink-0 items-center gap-2.5 rounded-md border bg-background px-3 text-xs",
  rootUrgent:
    "flex h-8 shrink-0 items-center gap-2.5 rounded-md border border-destructive-warm bg-destructive-warm/5 px-3 text-xs",
  cell: "flex items-center gap-1.5 whitespace-nowrap text-muted-foreground",
  icon: "h-3.5 w-3.5 shrink-0",
  iconUrgent: "h-3.5 w-3.5 shrink-0 text-destructive-warm",
  figure: "font-medium tabular-nums text-foreground",
  figureUrgent: "font-medium tabular-nums text-destructive-warm",
  divider: "h-4",
};

interface WeekSummaryInlineProps {
  now: Date;
  /** Operations with all eleven indicators in. */
  complete: number;
  total: number;
}

function hoursLeft(period: Period, now: Date): number {
  return (cutoffOf(period).getTime() - now.getTime()) / 3600000;
}

export function WeekSummaryInline({
  now,
  complete,
  total,
}: WeekSummaryInlineProps) {
  const period = periodOf(now);
  const closed = isClosed(period, now);
  const remaining = timeLeft(period, now);
  const urgent = !closed && hoursLeft(period, now) <= URGENT_HOURS;

  return (
    <div className={urgent ? styles.rootUrgent : styles.root}>
      <span className={styles.cell}>
        <CalendarDays className={styles.icon} aria-hidden="true" />
        Semana <span className={styles.figure}>{period.week}</span>
        <span>· {rangeInWords(period)}</span>
      </span>

      <Separator orientation="vertical" className={styles.divider} />

      <span className={styles.cell}>
        <span className={styles.figure}>
          {complete} de {total}
        </span>
        operaciones reportadas
      </span>

      <Separator orientation="vertical" className={styles.divider} />

      <span className={styles.cell}>
        {closed ? (
          <Lock className={styles.icon} aria-hidden="true" />
        ) : (
          <Clock
            className={urgent ? styles.iconUrgent : styles.icon}
            aria-hidden="true"
          />
        )}
        {closed ? (
          <span className={styles.figure}>Cerrada</span>
        ) : (
          <>
            Cierra en{" "}
            <span className={urgent ? styles.figureUrgent : styles.figure}>
              {remaining}
            </span>
          </>
        )}
      </span>
    </div>
  );
}
