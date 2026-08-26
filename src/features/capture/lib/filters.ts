"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Completeness } from "./compliance";
import { isFuture, periodFromKey, periodKey, periodOf, type Period } from "./periods";

/**
 * The rail filters, kept in the URL.
 *
 * They used to be component state, and picking an operation is a navigation —
 * so the workspace remounted and every filter reset itself. Putting them in the
 * query string fixes that and buys the other half for free: a link to a
 * narrowed rail arrives narrowed.
 *
 * The text box keeps a local copy so typing stays instant. Only the settled
 * value reaches the URL, and the timer is cleared on unmount so a keystroke
 * left in flight cannot navigate back to the screen you just left.
 */

const QUERY = "q";
const COMPANIES = "co";
const STATES = "st";

/** Long enough to swallow a burst of typing, short enough to feel immediate. */
const SETTLE_MS = 300;

function parseList(raw: string | null): string[] {
  return raw ? raw.split(",").filter(Boolean) : [];
}

export interface OperationFilterState {
  query: string;
  setQuery: (query: string) => void;
  companies: string[];
  setCompanies: (companies: string[]) => void;
  states: Completeness[];
  setStates: (states: Completeness[]) => void;
  /**
   * Drops all three at once.
   *
   * Calling the three setters in a row does not work: each builds its URL from
   * the params of the render it was created in, so they overwrite one another
   * and only the last deletion survives.
   */
  clear: () => void;
  /** Whether anything is narrowing the rail right now. */
  active: boolean;
}

export function useOperationFilters(): OperationFilterState {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const urlQuery = params.get(QUERY) ?? "";
  const companies = useMemo(
    () => parseList(params.get(COMPANIES)),
    [params],
  );
  const states = useMemo(
    () => parseList(params.get(STATES)) as Completeness[],
    [params],
  );

  // Seeded from the URL on every mount, which is what makes the value survive
  // a jump between operations.
  const [draft, setDraft] = useState(urlQuery);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const write = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      const search = next.toString();
      router.replace(search ? `${pathname}?${search}` : pathname, {
        scroll: false,
      });
    },
    [params, pathname, router],
  );

  const setQuery = useCallback(
    (value: string) => {
      setDraft(value);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => write(QUERY, value.trim()), SETTLE_MS);
    },
    [write],
  );

  const setCompanies = useCallback(
    (value: string[]) => write(COMPANIES, value.join(",")),
    [write],
  );

  const setStates = useCallback(
    (value: Completeness[]) => write(STATES, value.join(",")),
    [write],
  );

  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setDraft("");
    const next = new URLSearchParams(params.toString());
    next.delete(QUERY);
    next.delete(COMPANIES);
    next.delete(STATES);
    const search = next.toString();
    router.replace(search ? `${pathname}?${search}` : pathname, {
      scroll: false,
    });
  }, [params, pathname, router]);

  return {
    query: draft,
    setQuery,
    companies,
    setCompanies,
    states,
    setStates,
    clear,
    active: draft.trim() !== "" || companies.length > 0 || states.length > 0,
  };
}

const WEEK = "w";

/**
 * Which week the screen is showing.
 *
 * In the URL for the same reasons the filters are: it survives picking an
 * operation, and a link opens on the week it was sent from.
 *
 * A week that has not started yet is refused and the current one used instead.
 * Nothing is owed for a week that has not happened, so a form for it would be
 * eleven fields nobody can answer.
 */
export function useSelectedPeriod(now: Date): {
  period: Period;
  setPeriod: (period: Period) => void;
  isCurrent: boolean;
} {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const current = periodOf(now);
  const raw = params.get(WEEK);

  const period = useMemo(() => {
    if (!raw) return current;
    const parsed = periodFromKey(raw);
    if (!Number.isFinite(parsed.year) || !Number.isFinite(parsed.week)) {
      return current;
    }
    return isFuture(parsed, now) ? current : parsed;
    // `current` is derived from `now`, so it moves with it and needs no entry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw, now]);

  const setPeriod = useCallback(
    (next: Period) => {
      const params2 = new URLSearchParams(params.toString());
      if (periodKey(next) === periodKey(current)) params2.delete(WEEK);
      else params2.set(WEEK, periodKey(next));
      const search = params2.toString();
      router.replace(search ? `${pathname}?${search}` : pathname, {
        scroll: false,
      });
    },
    [params, pathname, router, current],
  );

  return {
    period,
    setPeriod,
    isCurrent: periodKey(period) === periodKey(current),
  };
}

/** The current query string, ready to hang off a link so filters survive it. */
export function useFilterSearch(): string {
  const params = useSearchParams();
  const search = params.toString();
  return search ? `?${search}` : "";
}
