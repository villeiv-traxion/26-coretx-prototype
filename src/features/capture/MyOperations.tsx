"use client";

import { Card, NoDataMessage } from "@traxion-global/design-system/react";
import { useStore } from "./lib/store";
import { useNow } from "./lib/now";
import { operationsOf, progressOf } from "./lib/compliance";
import { isClosed, periodOf, rangeInWords, timeLeft } from "./lib/periods";
import { getUser } from "./lib/organization";
import { Answer } from "./Answer";
import { OperationRow } from "./OperationRow";

/**
 * The work to be loaded.
 *
 * There is no landing screen before this one: whoever captures walks in and
 * sees what they have to load. A screen whose entire content is a link to
 * another screen never earns its pixels.
 *
 * What is missing drives the order. What is delivered sinks, but is **not
 * hidden**: whoever sent it has to be able to check that it is still there.
 */

const styles = {
  page: "flex flex-col gap-6",
  header: "flex flex-wrap items-end justify-between gap-4",
  deadline: "text-right",
  deadlineValue: "text-lg font-semibold tabular-nums",
  deadlineNote: "text-xs text-muted-foreground",
  list: "divide-y p-0 shadow-none",
  empty: "py-10",
};

export function MyOperations() {
  const state = useStore();
  const now = useNow();
  const period = periodOf(now);
  const closed = isClosed(period, now);
  const remaining = timeLeft(period, now);

  const user = getUser(state.userId);
  const operations = operationsOf(state, state.userId);

  const rows = operations
    .map((operation) => ({
      operation,
      progress: progressOf(state, operation.id, period, now),
    }))
    .sort((a, b) => a.progress.delivered - b.progress.delivered);

  const missing = rows.filter(
    (r) => r.progress.delivered < r.progress.total,
  ).length;

  const sentence = closed
    ? `La semana ${period.week} ya cerró.`
    : missing === 0
      ? `No te falta nada en la semana ${period.week}.`
      : `Te faltan ${missing} de ${rows.length} operaciones.`;

  const support = closed
    ? "Lo entregado quedó como oficial. Lo que no llegó a tiempo aparece como no entregado."
    : `Semana ${period.week} · ${rangeInWords(period)} · ${user?.name ?? ""}`;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Answer sentence={sentence} support={support} />
        {remaining ? (
          <div className={styles.deadline}>
            <p className={styles.deadlineValue}>Cierra en {remaining}</p>
            <p className={styles.deadlineNote}>Viernes a las 14:00</p>
          </div>
        ) : null}
      </div>

      <Card className={styles.list}>
        {rows.length === 0 ? (
          <div className={styles.empty}>
            <NoDataMessage
              title="No tienes operaciones asignadas"
              message="Coordinación asigna quién entrega cada operación. Mientras nadie te asigne una, aquí no hay nada que capturar."
            />
          </div>
        ) : (
          rows.map(({ operation, progress }) => (
            <OperationRow
              key={operation.id}
              operation={operation}
              progress={progress}
            />
          ))
        )}
      </Card>
    </div>
  );
}
