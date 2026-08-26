/**
 * The capture calendar.
 *
 * An ISO week opens on Monday and **closes on Friday at 14:00**. Until the
 * cutoff whatever was captured is a draft and can be corrected; past the cutoff
 * it becomes official and is no longer touched. That rule is the reason this
 * prototype exists.
 *
 * The real product anchors the cutoff to `America/Mexico_City` and stores UTC.
 * Here we use the browser local time, which for a demo is the same thing and
 * saves dragging in a timezone library.
 */

export const CUTOFF_DAY = 5; // Friday, ISO numbering (Monday = 1)
export const CUTOFF_HOUR = 14;

export interface Period {
  year: number;
  week: number;
}

/** `2026-W34`. Sorts alphabetically the same way it sorts chronologically. */
export function periodKey({ year, week }: Period): string {
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export function periodFromKey(key: string): Period {
  const [year, week] = key.split("-W");
  return { year: Number(year), week: Number(week) };
}

/** The ISO week a date belongs to. */
export function periodOf(date: Date): Period {
  const t = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const isoDay = t.getUTCDay() || 7;
  // An ISO week is the week of its Thursday: move there and ask for its year.
  t.setUTCDate(t.getUTCDate() + 4 - isoDay);
  const year = t.getUTCFullYear();
  const jan1 = Date.UTC(year, 0, 1);
  const week = Math.ceil(((t.getTime() - jan1) / 86400000 + 1) / 7);
  return { year, week };
}

/** Monday 00:00, when the week opens. */
export function startOf({ year, week }: Period): Date {
  // January 4th always falls in week 1, whichever weekday it lands on.
  const jan4 = new Date(year, 0, 4);
  const isoDay = jan4.getDay() || 7;
  const mondayOfWeek1 = new Date(year, 0, 4 - (isoDay - 1));
  const monday = new Date(mondayOfWeek1);
  monday.setDate(monday.getDate() + (week - 1) * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/** Friday at 14:00, when the week stops being editable. */
export function cutoffOf(period: Period): Date {
  const cutoff = startOf(period);
  cutoff.setDate(cutoff.getDate() + (CUTOFF_DAY - 1));
  cutoff.setHours(CUTOFF_HOUR, 0, 0, 0);
  return cutoff;
}

/** 52 almost always; 53 in long ISO years. */
export function weeksIn(year: number): number {
  return periodOf(new Date(year, 11, 28)).week;
}

export function isClosed(period: Period, now: Date): boolean {
  return now.getTime() >= cutoffOf(period).getTime();
}

export function isFuture(period: Period, now: Date): boolean {
  return now.getTime() < startOf(period).getTime();
}

/** Every week of the year, elapsed or not. */
export function allWeeks(year: number): Period[] {
  return Array.from({ length: weeksIn(year) }, (_, i) => ({
    year,
    week: i + 1,
  }));
}

/**
 * Week 1 up to and including the one `now` falls in.
 *
 * The axis of the compliance table. Weeks that have not started owe nothing, so
 * a column for them is a column of dots — width spent saying that the future
 * has not happened.
 */
export function elapsedWeeks(now: Date): Period[] {
  const { year, week } = periodOf(now);
  return Array.from({ length: week }, (_, i) => ({ year, week: i + 1 }));
}

export function previousPeriod({ year, week }: Period): Period {
  if (week > 1) return { year, week: week - 1 };
  return { year: year - 1, week: weeksIn(year - 1) };
}

/**
 * How much time is left, already worded. Returns `null` once the cutoff has
 * passed: there is no time left to count then, there is a fact.
 */
export function timeLeft(period: Period, now: Date): string | null {
  const remaining = cutoffOf(period).getTime() - now.getTime();
  if (remaining <= 0) return null;

  const hours = Math.floor(remaining / 3600000);
  if (hours < 1) return `${Math.max(1, Math.round(remaining / 60000))} min`;
  if (hours < 24) return `${hours} h`;

  const days = Math.floor(hours / 24);
  const spare = hours % 24;
  return spare === 0 ? `${days} d` : `${days} d ${spare} h`;
}

const CUTOFF_FORMAT = new Intl.DateTimeFormat("es-MX", {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

/** «viernes, 28 de agosto, 14:00» — for the confirmation message. */
export function cutoffInWords(period: Period): string {
  return CUTOFF_FORMAT.format(cutoffOf(period));
}

const RANGE_FORMAT = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
});

/** «24 – 30 ago» — the span of days the week covers. */
export function rangeInWords(period: Period): string {
  const monday = startOf(period);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  return `${RANGE_FORMAT.format(monday)} – ${RANGE_FORMAT.format(sunday)}`;
}
