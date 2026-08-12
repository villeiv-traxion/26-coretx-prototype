"use client";

import { useCallback, useSyncExternalStore } from "react";

/** En SSR no hay match posible: se asume el caso más restrictivo. */
function getServerSnapshot(): boolean {
  return false;
}

/**
 * Suscribe a una media query. Usa `useSyncExternalStore` en vez de
 * `useEffect` + `setState` porque esto último es error de lint en React 19.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query],
  );

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Puntero capaz de hover (ratón/trackpad). En táctiles, `false`. */
export function useHasHover(): boolean {
  return useMediaQuery("(hover: hover)");
}

/** `sm` de Tailwind: a partir de aquí el panel es lateral y cabe un submenú al lado. */
export function useIsWideViewport(): boolean {
  return useMediaQuery("(min-width: 640px)");
}
