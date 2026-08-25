"use client";

import { MousePointerClick } from "lucide-react";
import { Card } from "@traxion-global/design-system/react";
import { useStore } from "./lib/store";
import { useNow } from "./lib/now";
import { operationsOf, progressOf } from "./lib/compliance";
import { isClosed, periodOf, rangeInWords, timeLeft } from "./lib/periods";
import { getUser } from "./lib/organization";
import { Answer } from "./Answer";
import { OperationList } from "./OperationList";
import { CaptureForm } from "./CaptureForm";

/**
 * The capture screen: the rail of operations on the left, the form for whichever
 * one is selected on the right.
 *
 * Both live inside a single surface, split by nothing but a change of ground —
 * the rail sits on a darker grey, the panel does not, and the selected tab takes
 * the panel's colour so it reads as opening into it. A border between the two
 * would put back the seam the whole arrangement is trying to remove.
 *
 * The rail column stretches the full height so its ground runs the length of a
 * long form; only its contents stick.
 *
 * Both panes answer at two routes — the bare app root with nothing selected,
 * and `/operation/[id]` with one — so the URL still names what you are looking
 * at, the back button works, and a link to one operation can be sent.
 *
 * Below `lg` there is only ever one pane: the rail until you pick something,
 * the form afterwards. Two columns on a phone is neither of them.
 */

const styles = {
  page: "flex flex-col gap-5",
  header: "flex flex-wrap items-end justify-between gap-4",
  deadline: "text-right",
  deadlineValue: "text-lg font-semibold tabular-nums",
  deadlineNote: "text-xs text-muted-foreground",
  /**
   * No `overflow-hidden` here, deliberately. Clipping would make this card the
   * scroll container for the sticky rail inside it, and a sticky element whose
   * scrollport never scrolls gets pinned to its `top` offset instead of resting
   * at the flow position — pushing the first tab down by that offset the moment
   * the panel beside it grows tall. The rail rounds its own left corners
   * instead, and the sticky then answers to the page.
   */
  surface: "grid p-0 shadow-none lg:grid-cols-[19rem_1fr]",
  rail: "rounded-xl bg-muted lg:rounded-r-none",
  railHidden: "hidden rounded-xl bg-muted lg:block lg:rounded-r-none",
  // Both columns carry their own rounding: without the card clipping them, a
  // square-cornered background would run straight over its rounded border.
  panel: "min-w-0 rounded-xl bg-background p-4 sm:p-5 lg:rounded-l-none",
  panelHidden:
    "hidden min-w-0 rounded-xl bg-background p-4 sm:p-5 lg:block lg:rounded-l-none",
  placeholder:
    "flex flex-col items-center justify-center gap-3 px-6 py-24 text-center",
  placeholderIcon: "h-6 w-6 text-muted-foreground",
  placeholderText: "max-w-xs text-sm text-muted-foreground",
};

export function CaptureWorkspace({ selectedId }: { selectedId?: string }) {
  const state = useStore();
  const now = useNow();
  const period = periodOf(now);
  const closed = isClosed(period, now);
  const remaining = timeLeft(period, now);

  const user = getUser(state.userId);
  const rows = operationsOf(state, state.userId)
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

      <Card className={styles.surface}>
        <div className={selectedId ? styles.railHidden : styles.rail}>
          <OperationList rows={rows} selectedId={selectedId} />
        </div>

        <div className={selectedId ? styles.panel : styles.panelHidden}>
          {selectedId ? (
            <CaptureForm key={selectedId} operationId={selectedId} />
          ) : (
            <div className={styles.placeholder}>
              <MousePointerClick className={styles.placeholderIcon} />
              <p className={styles.placeholderText}>
                Elige una operación de la izquierda para capturar sus once
                indicadores de esta semana.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
