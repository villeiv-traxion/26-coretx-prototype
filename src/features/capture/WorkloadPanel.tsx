"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@traxion-global/design-system/react";
import { PER_WEEK_TOTAL, workloadByPerson } from "./lib/compliance";
import { getUser, OPERATIONS } from "./lib/organization";
import { useStore } from "./lib/store";

/**
 * Who carries how much.
 *
 * This is the screen that turns "the work should be spread out" into something
 * a person can do on a Tuesday. Without it nothing stops concentration coming
 * back: you spread it once, and three months later one person answers for half
 * a division again.
 */

/** Above this, one person is holding up too much of the week. */
const CONCENTRATION = 5;

const styles = {
  card: "shadow-none",
  header: "pb-2",
  title: "text-sm font-medium",
  body: "flex flex-col gap-2 pt-0",
  row: "flex items-baseline justify-between gap-3 text-sm",
  name: "truncate",
  figure: "shrink-0 tabular-nums text-muted-foreground",
  figureHigh: "shrink-0 font-medium tabular-nums text-destructive-warm",
  note: "pt-1 text-xs leading-snug text-muted-foreground",
};

export function WorkloadPanel() {
  const state = useStore();
  const workload = workloadByPerson(state);

  const ranked = [...workload.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const unassigned = OPERATIONS.filter(
    (o) => (state.assignments[o.id] ?? []).length === 0,
  ).length;

  return (
    <Card className={styles.card}>
      <CardHeader className={styles.header}>
        <CardTitle className={styles.title}>Carga por persona</CardTitle>
      </CardHeader>
      <CardContent className={styles.body}>
        {ranked.map(([userId, count]) => (
          <div key={userId} className={styles.row}>
            <span className={styles.name}>{getUser(userId)?.name}</span>
            <span
              className={
                count >= CONCENTRATION ? styles.figureHigh : styles.figure
              }
            >
              {count * PER_WEEK_TOTAL} envíos / sem.
            </span>
          </div>
        ))}
        <p className={styles.note}>
          {unassigned === 0
            ? "Todas las operaciones tienen a alguien."
            : `${unassigned} operaciones no tienen a nadie. Se les sigue pidiendo igual.`}
        </p>
      </CardContent>
    </Card>
  );
}
