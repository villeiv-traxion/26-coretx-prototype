"use client";

import { NoDataMessage } from "@traxion-global/design-system/react";
import type { Operation } from "./lib/organization";
import type { WeekProgress } from "./lib/compliance";
import { OperationListItem } from "./OperationListItem";

/**
 * The rail of operations this person answers for, this week.
 *
 * Ordered by what is missing, so the work rises to the top. What is already in
 * stays on the rail rather than dropping off it: whoever sent it needs to be
 * able to see that it is still there.
 *
 * The dividers sit lighter than the rail behind them, so they part two unopened
 * tabs without drawing a hard line across the selected one — which is meant to
 * run straight into the panel beside it.
 */

const styles = {
  rail: "divide-y divide-border lg:sticky lg:top-4",
  empty: "py-10",
};

interface OperationListProps {
  rows: { operation: Operation; progress: WeekProgress }[];
  selectedId?: string;
  /** Whether a filter is narrowing the rail, which changes what empty means. */
  filtered?: boolean;
}

export function OperationList({
  rows,
  selectedId,
  filtered = false,
}: OperationListProps) {
  if (rows.length === 0) {
    // An empty rail because of a filter and an empty rail because nobody
    // assigned you anything are two different pieces of news.
    return (
      <div className={styles.empty}>
        {filtered ? (
          <NoDataMessage
            title="Ninguna operación coincide"
            message="Prueba con otro nombre o quita el filtro de estado."
          />
        ) : (
          <NoDataMessage
            title="No tienes operaciones asignadas"
            message="Coordinación asigna quién entrega cada operación. Mientras nadie te asigne una, aquí no hay nada que capturar."
          />
        )}
      </div>
    );
  }

  return (
    <div className={styles.rail}>
      {rows.map(({ operation, progress }) => (
        <OperationListItem
          key={operation.id}
          operation={operation}
          progress={progress}
          selected={operation.id === selectedId}
        />
      ))}
    </div>
  );
}
