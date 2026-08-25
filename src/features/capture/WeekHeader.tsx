"use client";

import {
  CalendarDays,
  CalendarRange,
  Clock,
  Lock,
  UserRound,
} from "lucide-react";
import { Card, Progress } from "@traxion-global/design-system/react";
import {
  cutoffInWords,
  cutoffOf,
  isClosed,
  periodOf,
  rangeInWords,
  timeLeft,
  type Period,
} from "./lib/periods";

/**
 * The head of the capture screen: the answer, how far along the week is, and
 * how long is left.
 *
 * It still opens with a sentence rather than a band of figures — whoever lands
 * here at noon on a Friday wants to know whether the week is going to close,
 * not four tiles to work it out from. What the sentence cannot do is show
 * distance, so it is followed by the one bar that can, and by the countdown,
 * which is the only thing on this screen that changes on its own.
 *
 * The countdown turns warm inside the last day. That is not decoration: it is
 * the point at which "I will do it tomorrow" stops being true.
 */

/** Inside this many hours, the deadline stops being background information. */
const URGENT_HOURS = 24;

const styles = {
  // Keeps the shadow the design system puts on Card, rather than flattening it
  // the way the workspace surface below does.
  card: "flex flex-col gap-4 p-4 sm:p-5",
  sentence: "text-xl font-semibold leading-snug sm:text-2xl",
  // The deadline sits beside the progress rather than above it: given its own
  // row it pushed the bar — the thing this screen is actually about — down the
  // card for no reason.
  body: "flex flex-wrap items-center justify-between gap-x-6 gap-y-4",
  measures: "flex min-w-0 flex-1 flex-col gap-3",
  deadline:
    "flex items-center gap-2.5 rounded-lg border bg-muted/40 px-3 py-2",
  deadlineUrgent:
    "flex items-center gap-2.5 rounded-lg border border-destructive-warm bg-destructive-warm/5 px-3 py-2",
  deadlineIcon: "h-5 w-5 shrink-0 text-muted-foreground",
  deadlineIconUrgent: "h-5 w-5 shrink-0 text-destructive-warm",
  deadlineValue: "text-base font-semibold leading-tight tabular-nums",
  deadlineValueUrgent:
    "text-base font-semibold leading-tight tabular-nums text-destructive-warm",
  deadlineNote: "text-xs leading-tight text-muted-foreground",
  gauge: "flex items-center gap-3",
  bar: "h-2 max-w-sm flex-1",
  gaugeLabel: "shrink-0 text-sm tabular-nums text-muted-foreground",
  chips: "flex flex-wrap items-center gap-x-4 gap-y-1.5",
  chip: "flex items-center gap-1.5 text-xs text-muted-foreground",
  chipIcon: "h-3.5 w-3.5 shrink-0",
};

interface WeekHeaderProps {
  now: Date;
  /** Operations with all eleven indicators in. */
  complete: number;
  total: number;
  userName: string;
}

function hoursLeft(period: Period, now: Date): number {
  return (cutoffOf(period).getTime() - now.getTime()) / 3600000;
}

export function WeekHeader({ now, complete, total, userName }: WeekHeaderProps) {
  const period = periodOf(now);
  const closed = isClosed(period, now);
  const remaining = timeLeft(period, now);
  const urgent = !closed && hoursLeft(period, now) <= URGENT_HOURS;
  const missing = total - complete;

  const sentence = closed
    ? `La semana ${period.week} ya cerró.`
    : missing === 0
      ? `No te falta nada en la semana ${period.week}.`
      : `Te faltan ${missing} de ${total} operaciones.`;

  return (
    <Card className={styles.card}>
      <h1 className={styles.sentence}>{sentence}</h1>

      <div className={styles.body}>
        <div className={styles.measures}>
          <div className={styles.gauge}>
            <Progress
              className={styles.bar}
              value={total === 0 ? 0 : (complete / total) * 100}
            />
            <span className={styles.gaugeLabel}>
              {complete} de {total} completas
            </span>
          </div>

          <div className={styles.chips}>
            <span className={styles.chip}>
              <CalendarDays className={styles.chipIcon} aria-hidden="true" />
              Semana {period.week}
            </span>
            <span className={styles.chip}>
              <CalendarRange className={styles.chipIcon} aria-hidden="true" />
              {rangeInWords(period)}
            </span>
            <span className={styles.chip}>
              <UserRound className={styles.chipIcon} aria-hidden="true" />
              {userName}
            </span>
          </div>
        </div>

        <div className={urgent ? styles.deadlineUrgent : styles.deadline}>
          {closed ? (
            <Lock className={styles.deadlineIcon} />
          ) : (
            <Clock
              className={urgent ? styles.deadlineIconUrgent : styles.deadlineIcon}
            />
          )}
          <div>
            <p
              className={
                urgent ? styles.deadlineValueUrgent : styles.deadlineValue
              }
            >
              {closed ? "Cerrada" : `Cierra en ${remaining}`}
            </p>
            <p className={styles.deadlineNote}>{cutoffInWords(period)}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
