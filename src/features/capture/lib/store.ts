"use client";

import { useCallback, useSyncExternalStore } from "react";
import { INITIAL_ASSIGNMENTS } from "./organization";
import { periodKey, type Period } from "./periods";
import type { Values } from "./formulas";

/**
 * Prototype state, in `localStorage`.
 *
 * Read through `useSyncExternalStore` rather than React state — the same
 * pattern the language uses — so the persisted value arrives without a
 * `setState` inside an effect and without a hydration mismatch.
 *
 * Only what someone changed lives here: the history of past weeks is derived in
 * `seed.ts` and takes up no bytes at all.
 */

const KEY = "coretx-capture";

export type Profile = "coordination" | "capture";

export interface Submission {
  values: Values;
  savedAt: string;
}

export interface State {
  profile: Profile;
  /** Who I am while in the capture profile. */
  userId: string;
  assignments: Record<string, string[]>;
  /** Key: `OP07|2026-W35`. */
  submissions: Record<string, Submission>;
}

const INITIAL: State = Object.freeze({
  profile: "capture" as Profile,
  // U03 carries three operations, close to the median of the real spreadsheet.
  // Opening on the one person with four would show the queue at its most
  // flattering and hide what most people actually walk into.
  userId: "U03",
  assignments: INITIAL_ASSIGNMENTS,
  submissions: {},
});

const listeners = new Set<() => void>();
let cache: State | null = null;

function read(): State {
  if (cache) return cache;

  let loaded: State;
  try {
    const raw = localStorage.getItem(KEY);
    loaded = raw ? { ...INITIAL, ...JSON.parse(raw) } : INITIAL;
  } catch {
    loaded = INITIAL;
  }

  cache = loaded;
  return loaded;
}

function write(next: State) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private window or storage full: the session carries on, unpersisted.
  }
  listeners.forEach((notify) => notify());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function onServer(): State {
  return INITIAL;
}

export function useStore(): State {
  return useSyncExternalStore(subscribe, read, onServer);
}

export interface Actions {
  setProfile: (profile: Profile) => void;
  setUser: (userId: string) => void;
  assign: (operationId: string, userIds: string[]) => void;
  save: (operationId: string, period: Period, values: Values) => void;
  reset: () => void;
}

export function useActions(): Actions {
  const setProfile = useCallback((profile: Profile) => {
    write({ ...read(), profile });
  }, []);

  const setUser = useCallback((userId: string) => {
    write({ ...read(), userId });
  }, []);

  const assign = useCallback((operationId: string, userIds: string[]) => {
    const current = read();
    write({
      ...current,
      assignments: { ...current.assignments, [operationId]: userIds },
    });
  }, []);

  const save = useCallback(
    (operationId: string, period: Period, values: Values) => {
      const current = read();
      const key = `${operationId}|${periodKey(period)}`;
      write({
        ...current,
        submissions: {
          ...current.submissions,
          [key]: { values, savedAt: new Date().toISOString() },
        },
      });
    },
    [],
  );

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      // Nothing to clear.
    }
    cache = null;
    listeners.forEach((notify) => notify());
  }, []);

  return { setProfile, setUser, assign, save, reset };
}
