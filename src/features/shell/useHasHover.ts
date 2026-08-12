"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(hover: hover)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

/** En SSR asumimos táctil: el hover se activa tras hidratar si procede. */
function getServerSnapshot(): boolean {
  return false;
}

/**
 * `true` sólo en dispositivos con puntero capaz de hover (ratón/trackpad).
 * En táctiles los submenús se abren con tap, no con hover.
 */
export function useHasHover(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
