"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Progress } from "@traxion-global/design-system/react";
import { getCompany, type Operation } from "./lib/organization";
import type { WeekProgress } from "./lib/compliance";
import { CompletenessBadge } from "./CompletenessBadge";

/**
 * One operation in the rail, behaving like a vertical tab.
 *
 * The selected one takes the page background — the same one the detail panel
 * has — so the two read as a single surface and the tab looks like it opens
 * into the form rather than sitting beside it. There is no border between them
 * to give the seam away; the rail is told apart by its muted ground, not by a
 * line.
 *
 * Selection rests on that change of ground alone. It carries here because the
 * selected tab is the one physically joined to the open panel, which is a much
 * louder signal than any swatch of colour would be.
 *
 * The closed tabs keep a right edge and the open one gives it up — that line is
 * the wall the panel sits behind, and the tab that opens is the one that breaks
 * through it. It carries no border at all, not even a transparent one, so the
 * white runs the last pixel into the panel.
 *
 * The closed ones also take a shadow cast inward from that right edge, which is
 * what makes them read as lying under the panel rather than merely beside it.
 */

const styles = {
  item: "block border-r border-border px-4 py-3 shadow-[inset_-4px_0_4px_-3px_rgb(0_0_0/0.10)] transition-colors hover:bg-background/50",
  itemSelected: "block bg-background px-4 py-3",
  head: "flex items-start justify-between gap-2",
  identity: "min-w-0",
  name: "truncate text-sm font-medium leading-tight",
  company: "truncate text-xs text-muted-foreground",
  chevron: "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground lg:hidden",
  gauge: "mt-2 flex items-center gap-2",
  // Grey rather than the DS default: in the rail the bar reports how much is
  // in, and the brand colour there was reading as a filled bar even at zero.
  // The child selector is how the Radix indicator inside Progress gets reached.
  bar: "h-1.5 flex-1 bg-border [&>div]:bg-secondary-medium",
  fraction: "shrink-0 text-xs tabular-nums text-muted-foreground",
};

interface OperationListItemProps {
  operation: Operation;
  progress: WeekProgress;
  selected: boolean;
}

export function OperationListItem({
  operation,
  progress,
  selected,
}: OperationListItemProps) {
  const company = getCompany(operation.companyId);

  return (
    <Link
      href={`/intelligence/capture/operation/${operation.id}`}
      aria-current={selected ? "page" : undefined}
      className={selected ? styles.itemSelected : styles.item}
    >
      <div className={styles.head}>
        <div className={styles.identity}>
          <p className={styles.name}>{operation.name}</p>
          <p className={styles.company}>
            {company?.name} · {operation.territory}
          </p>
        </div>
        <CompletenessBadge
          delivered={progress.delivered}
          total={progress.total}
        />
        <ChevronRight className={styles.chevron} aria-hidden="true" />
      </div>

      <div className={styles.gauge}>
        <Progress
          className={styles.bar}
          value={(progress.delivered / progress.total) * 100}
        />
        <span className={styles.fraction}>
          {progress.delivered} de {progress.total}
        </span>
      </div>
    </Link>
  );
}
