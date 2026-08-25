"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "./lib/store";
import { NowProvider } from "./lib/now";
import { CaptureBreadcrumb } from "./CaptureBreadcrumb";

/**
 * The app frame: the screens the current profile is allowed to see, and
 * nothing else.
 *
 * There is no title bar. The app already sits under the CoreTX header, and each
 * screen opens by saying what it is in its own first sentence — a strip that
 * only repeats the app name pushes the work further down the page for nothing.
 *
 * Coordination gets two entries, so it gets a nav. Capture has one, so it gets
 * none: a tab bar with a single tab tells nobody anything.
 */

const COORDINATION_LINKS = [
  { href: "/intelligence/capture/compliance", label: "Cumplimiento" },
  { href: "/intelligence/capture/responsibles", label: "Responsables" },
];

const styles = {
  frame: "flex min-h-[calc(100vh-3.5rem)] flex-col bg-muted/30",
  bar: "border-b bg-background",
  nav: "container flex gap-1 px-4",
  link: "border-b-2 border-transparent px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
  linkActive: "border-b-2 border-primary px-3 py-2 text-sm font-medium",
  body: "container flex-1 px-4 py-6",
  trail: "mb-4",
};

interface CaptureShellProps {
  /** Resolved on the server so both renders agree. See `lib/now.tsx`. */
  now: number;
  children: React.ReactNode;
}

export function CaptureShell({ now, children }: CaptureShellProps) {
  const { profile } = useStore();
  const pathname = usePathname();

  return (
    <NowProvider now={now}>
      <div className={styles.frame}>
        {profile === "coordination" ? (
          <nav className={styles.bar}>
            <div className={styles.nav}>
              {COORDINATION_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    pathname === link.href ? styles.linkActive : styles.link
                  }
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        ) : null}

        <main className={styles.body}>
          <CaptureBreadcrumb className={styles.trail} />
          {children}
        </main>
      </div>
    </NowProvider>
  );
}
