/**
 * The derived reads: what was delivered, what is missing, and in what state.
 *
 * Pure functions that take the already-read state. They live outside the
 * screens on purpose — in the real product they move down to the server without
 * a single component being rewritten.
 */

import { INDICATORS } from "./catalog";
import type { State } from "./store";
import type { Values } from "./formulas";
import { OPERATIONS, type Operation } from "./organization";
import { isClosed, isFuture, periodKey, type Period } from "./periods";
import { isComplete } from "./rules";
import { seededSubmission } from "./seed";

/**
 * - `FUTURE` — the week has not started. Nothing is owed yet.
 * - `PENDING` — open, with nothing captured.
 * - `DRAFT` — captured and **still editable**. Counts as delivered.
 * - `OFFICIAL` — past the cutoff with data. No longer touched.
 * - `MISSED` — past the cutoff with no data. That is a failure, not a blank.
 */
export type SubmissionStatus =
  | "FUTURE"
  | "PENDING"
  | "DRAFT"
  | "OFFICIAL"
  | "MISSED";

export interface WeekProgress {
  delivered: number;
  total: number;
  status: SubmissionStatus;
  closed: boolean;
}

export const PER_WEEK_TOTAL = INDICATORS.length;

/**
 * At or above this share of the week, the shortfall stops counting as one.
 *
 * «Ten of eleven» is not a bad week, and a screen that says so in one column
 * while painting it as fine in the next teaches nobody anything. The reference
 * prototype draws the same line — its bad-week count takes «parcial» and
 * «nada» and leaves out «casi».
 *
 * `0.8` is a design decision, not a figure from the data. The source says so in
 * as many words: «UMBRAL_DE_CASI = 0.8 y MOVIMIENTO_MINIMO = 0.005 son
 * decisiones de diseño, no datos».
 */
export const NEARLY_COMPLETE = 0.8;

/**
 * A week that closed meaningfully short. The open week is never one: nothing is
 * late before the cutoff.
 */
export function isShortfall({ delivered, total, closed }: WeekProgress): boolean {
  if (!closed || total === 0) return false;
  return delivered / total < NEARLY_COMPLETE;
}

/** How much of a week is in, on one axis. Drives both the badge and the filter. */
export type Completeness = "PENDING" | "PARTIAL" | "COMPLETE";

/** Takes only the two counts, so a live form total works as well as a stored one. */
export function completenessOf({
  delivered,
  total,
}: Pick<WeekProgress, "delivered" | "total">): Completeness {
  if (delivered === 0) return "PENDING";
  if (delivered < total) return "PARTIAL";
  return "COMPLETE";
}

/**
 * What was captured for an operation in a week: whatever the person typed if
 * they typed anything, and otherwise the derived history.
 */
export function valuesFor(
  state: State,
  operationId: string,
  period: Period,
  now: Date,
): Values {
  const own = state.submissions[`${operationId}|${periodKey(period)}`];
  if (own) return own.values;
  if (isFuture(period, now)) return {};
  return seededSubmission(operationId, period, !isClosed(period, now)) ?? {};
}

export function savedAt(
  state: State,
  operationId: string,
  period: Period,
): string | null {
  return (
    state.submissions[`${operationId}|${periodKey(period)}`]?.savedAt ?? null
  );
}

export function progressOf(
  state: State,
  operationId: string,
  period: Period,
  now: Date,
): WeekProgress {
  const closed = isClosed(period, now);

  if (isFuture(period, now)) {
    return { delivered: 0, total: PER_WEEK_TOTAL, status: "FUTURE", closed };
  }

  const values = valuesFor(state, operationId, period, now);
  const delivered = INDICATORS.filter((i) => isComplete(i, values)).length;

  let status: SubmissionStatus;
  if (delivered === 0) status = closed ? "MISSED" : "PENDING";
  else status = closed ? "OFFICIAL" : "DRAFT";

  return { delivered, total: PER_WEEK_TOTAL, status, closed };
}

/** The operations someone is responsible for. */
export function operationsOf(state: State, userId: string): Operation[] {
  return OPERATIONS.filter((o) =>
    (state.assignments[o.id] ?? []).includes(userId),
  );
}

export function responsiblesOf(state: State, operationId: string): string[] {
  return state.assignments[operationId] ?? [];
}

/** How many operations each person carries. Without this, concentration returns. */
export function workloadByPerson(state: State): Map<string, number> {
  const workload = new Map<string, number>();
  for (const operation of OPERATIONS) {
    for (const userId of state.assignments[operation.id] ?? []) {
      workload.set(userId, (workload.get(userId) ?? 0) + 1);
    }
  }
  return workload;
}

export interface WeekSummary {
  delivered: number;
  expected: number;
  pendingOperations: number;
  unassignedOperations: number;
}

/**
 * The state of a whole week.
 *
 * The expected count comes from the operations, not from the assignments: an
 * operation with nobody assigned **still owes** its eleven indicators. If the
 * denominator came from who delivers them, the gap would go invisible exactly
 * where it needs to be seen.
 */
export function weekSummary(
  state: State,
  period: Period,
  now: Date,
): WeekSummary {
  let delivered = 0;
  let pendingOperations = 0;
  let unassignedOperations = 0;

  for (const operation of OPERATIONS) {
    const progress = progressOf(state, operation.id, period, now);
    delivered += progress.delivered;
    if (progress.delivered < PER_WEEK_TOTAL) pendingOperations++;
    if ((state.assignments[operation.id] ?? []).length === 0) {
      unassignedOperations++;
    }
  }

  return {
    delivered,
    expected: OPERATIONS.length * PER_WEEK_TOTAL,
    pendingOperations,
    unassignedOperations,
  };
}

/**
 * How many complete weeks an operation has out of the ones it was asked for.
 * A number without a denominator cannot be compared: "2 of 8" and "2 of 40" are
 * different situations, and ordering by the 2 points at whichever has the least
 * history.
 */
export function historyOf(
  state: State,
  operationId: string,
  weeks: Period[],
  now: Date,
): { complete: number; required: number } {
  let complete = 0;
  let required = 0;

  for (const period of weeks) {
    if (isFuture(period, now)) continue;
    required++;
    const { delivered } = progressOf(state, operationId, period, now);
    if (delivered === PER_WEEK_TOTAL) complete++;
  }

  return { complete, required };
}
