"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "./lib/store";
import { ProfileSelector } from "./ProfileSelector";
import { DemoClock } from "./DemoClock";

/**
 * The app frame: who I am, what day the app thinks it is, and the screens that
 * profile is allowed to see.
 *
 * A capture profile navigation **is a single entry**, so none is painted: a tab
 * bar with one tab in it tells nobody anything.
 */

const COORDINATION_LINKS = [
  { href: "/intelligence/capture/compliance", label: "Cumplimiento" },
  { href: "/intelligence/capture/responsibles", label: "Responsables" },
];

const styles = {
  frame: "flex min-h-[calc(100vh-3.5rem)] flex-col bg-muted/30",
  bar: "border-b bg-background",
  row: "container flex flex-wrap items-center justify-between gap-3 px-4 py-3",
  identity: "flex flex-col",
  eyebrow:
    "text-[0.6875rem] font-medium uppercase tracking-wider text-muted-foreground",
  title: "text-base font-semibold leading-tight",
  controls: "flex flex-wrap items-center gap-2",
  nav: "container flex gap-1 px-4",
  link: "border-b-2 border-transparent px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
  linkActive: "border-b-2 border-primary px-3 py-2 text-sm font-medium",
  body: "container flex-1 px-4 py-6",
};

export function CaptureShell({ children }: { children: React.ReactNode }) {
  const { profile } = useStore();
  const pathname = usePathname();

  return (
    <div className={styles.frame}>
      <div className={styles.bar}>
        <div className={styles.row}>
          <div className={styles.identity}>
            <span className={styles.eyebrow}>CoreTX Intelligence</span>
            <Link href="/intelligence/capture" className={styles.title}>
              CoreTX Captura
            </Link>
          </div>
          <div className={styles.controls}>
            <ProfileSelector />
            <DemoClock />
          </div>
        </div>

        {profile === "coordination" ? (
          <nav className={styles.nav}>
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
          </nav>
        ) : null}
      </div>

      <main className={styles.body}>{children}</main>
    </div>
  );
}
