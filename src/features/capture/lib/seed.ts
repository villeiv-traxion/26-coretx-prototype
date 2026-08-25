/**
 * The history of past captures.
 *
 * It is not stored: it is **derived** deterministically from the operation and
 * the week. Two consequences worth having: `localStorage` only holds what a
 * person actually typed, and resetting the demo is clearing one key instead of
 * regenerating 800 records.
 *
 * The figures are invented, but they respect the catalog rules — the part never
 * exceeds the total, the base is never zero — so the form opens clean when
 * someone goes back to a week already delivered.
 */

import { INDICATORS } from "./catalog";
import type { Values } from "./formulas";
import { periodKey, type Period } from "./periods";

/**
 * How reliable an operation is. Handed out by the hash of its id.
 *
 * `completes` is per indicator, so a complete week is that number to the 11th
 * power — small changes here swing the yearly figure hard. These four were
 * picked so the 24 operations land between 6% and 100% of complete weeks: with
 * a harsher spread half of them sit at zero, the ordering stops saying anything
 * and the screen reads as "everything is broken".
 */
const BEHAVIOURS = [
  { delivers: 1, completes: 0.998 }, // never misses
  { delivers: 0.97, completes: 0.98 }, // the odd one slips
  { delivers: 0.92, completes: 0.95 }, // patchy
  { delivers: 0.8, completes: 0.9 }, // badly behind
];

/**
 * Plausible ranges per indicator: the base, and what fraction of it the
 * numerator represents. This is demo data; the real catalog says nothing here.
 */
const RANGES: Record<string, { base: [number, number]; part: [number, number] }> =
  {
    L02: { base: [20000, 400000], part: [0, 0.004] },
    L11: { base: [30, 140], part: [0, 0.15] },
    L15: { base: [6000, 42000], part: [0.02, 0.25] },
    L30: { base: [2500, 12000], part: [0.004, 0.05] },
    L37: { base: [500, 9000], part: [0, 0.03] },
    L38: { base: [80, 600], part: [0.75, 1] },
    L39: { base: [80, 600], part: [0.75, 1] },
    L42: { base: [500, 6000], part: [0, 0.03] },
    L58: { base: [100, 900], part: [0.8, 1] },
    L64: { base: [1000, 20000], part: [0.9, 1] },
    L67: { base: [500, 8000], part: [0.9, 1] },
  };

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32: small, deterministic and plenty for demo data. */
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function between(rand: () => number, [min, max]: [number, number]): number {
  return min + rand() * (max - min);
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function behaviourOf(operationId: string) {
  return BEHAVIOURS[hash(operationId) % BEHAVIOURS.length];
}

function valuesFor(indicatorId: string, rand: () => number): Values {
  const indicator = INDICATORS.find((i) => i.id === indicatorId);
  const range = RANGES[indicatorId];
  if (!indicator || !range) return {};

  const base = Math.max(1, between(rand, range.base));
  const fraction = between(rand, range.part);
  const values: Values = {};

  // The first NUMERATOR takes the whole fraction; a second one (L02 surplus,
  // L30 triple hours) takes a smaller slice.
  let numeratorsSeen = 0;
  for (const field of indicator.fields) {
    if (field.role === "BASE") {
      values[field.id] = round(base, field.decimals);
    } else {
      const weight = numeratorsSeen === 0 ? 1 : 0.45 * rand();
      values[field.id] = round(base * fraction * weight, field.decimals);
      numeratorsSeen++;
    }
  }
  return values;
}

/**
 * What this operation delivered that week. `null` if it delivered nothing.
 * An indicator missing from the object is an indicator left undelivered.
 */
/**
 * Two operations that always arrive finished in the week in progress.
 *
 * Left to the odds, the open week is all partials and the landing screen never
 * shows what a finished one looks like. Both belong to the people the demo
 * opens as, so the delivered state is on screen from the first paint.
 */
const ALWAYS_COMPLETE = new Set(["OP09", "OP11"]);

export function seededSubmission(
  operationId: string,
  period: Period,
  open = false,
): Values | null {
  const rand = rng(hash(`${operationId}|${periodKey(period)}`));

  if (open && ALWAYS_COMPLETE.has(operationId)) {
    const values: Values = {};
    for (const indicator of INDICATORS) {
      Object.assign(values, valuesFor(indicator.id, rand));
    }
    return values;
  }

  const behaviour = behaviourOf(operationId);

  // The week in progress is deliberately half done: if it arrived complete
  // there would be nothing left to capture, and the screen that matters most
  // would come up empty.
  const delivers = open ? behaviour.delivers * 0.5 : behaviour.delivers;
  const completes = open ? behaviour.completes * 0.6 : behaviour.completes;

  if (rand() > delivers) return null;

  const values: Values = {};
  for (const indicator of INDICATORS) {
    if (rand() > completes) continue;
    Object.assign(values, valuesFor(indicator.id, rand));
  }
  return Object.keys(values).length > 0 ? values : null;
}
