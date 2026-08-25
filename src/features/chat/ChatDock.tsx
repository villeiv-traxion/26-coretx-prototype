"use client";

import { usePathname } from "next/navigation";
import { ChatWidget } from "./ChatWidget";

/**
 * Decide en qué rutas se ancla el globo de chat.
 *
 * El widget vive en el layout raíz, así que sin esta puerta aparece también
 * dentro de las apps. La decisión se aísla aquí para que `ChatWidget` siga
 * ocupándose sólo de la conversación, y porque el orden de hooks impide un
 * `return null` temprano dentro del propio widget.
 */

const HIDDEN_ON = ["/intelligence/capture"];

export function ChatDock() {
  const pathname = usePathname();
  const hidden = HIDDEN_ON.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  return hidden ? null : <ChatWidget />;
}
