"use client";

import { createContext, useContext } from "react";

/**
 * The current time, resolved once on the server and handed down.
 *
 * Every screen here depends on what time it is — which week is open, how much
 * of the deadline is left, whether a submission is still a draft — and all of
 * them are client components that Next also renders on the server. If each side
 * called `new Date()` on its own they would disagree and hydration would warn,
 * so the server settles it and the client is told.
 *
 * That is also why the layout is dynamic: prerendering these pages at build
 * time would freeze the countdown at whenever the deploy happened.
 */

const NowContext = createContext<number | null>(null);

export function NowProvider({
  now,
  children,
}: {
  now: number;
  children: React.ReactNode;
}) {
  return <NowContext.Provider value={now}>{children}</NowContext.Provider>;
}

/** The date the app takes for today. */
export function useNow(): Date {
  const now = useContext(NowContext);
  if (now === null) {
    throw new Error("useNow must be used within a NowProvider");
  }
  return new Date(now);
}
