"use client";

import { NowProvider } from "./lib/now";
import { CaptureBreadcrumb } from "./CaptureBreadcrumb";

/**
 * The app frame: where you are, and the clock everything below runs on.
 *
 * There is no title bar and no tabs — each profile has one screen, and a tab bar
 * with a single tab tells nobody anything. The breadcrumb stays: it is the only
 * thing on the page saying this is CoreTX Captura inside CoreTX Intelligence,
 * and the way back out of an operation.
 */

const styles = {
  frame: "flex min-h-[calc(100vh-3.5rem)] flex-col bg-muted/30",
  body: "container flex-1 px-4 py-6",
  trail: "mb-4",
};

interface CaptureShellProps {
  /** Resolved on the server so both renders agree. See `lib/now.tsx`. */
  now: number;
  children: React.ReactNode;
}

export function CaptureShell({ now, children }: CaptureShellProps) {
  return (
    <NowProvider now={now}>
      <div className={styles.frame}>
        <main className={styles.body}>
          <CaptureBreadcrumb className={styles.trail} />
          {children}
        </main>
      </div>
    </NowProvider>
  );
}
