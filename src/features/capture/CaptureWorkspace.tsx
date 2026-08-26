"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@traxion-global/design-system/react";
import { useStore } from "./lib/store";
import { useNow } from "./lib/now";
import { completenessOf, operationsOf, progressOf } from "./lib/compliance";
import {
  useFilterSearch,
  useOperationFilters,
  useSelectedPeriod,
} from "./lib/filters";
import { periodKey } from "./lib/periods";
import { WeekSummaryInline } from "./WeekSummaryInline";
import { OperationFilters } from "./OperationFilters";
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
 *
 * Arriving with nothing selected opens the first operation of the rail rather
 * than an invitation to pick one. Whoever comes here came to capture, and half
 * of them only have one operation anyway — a screen whose whole content is
 * «choose something» spends a click on a decision that makes itself.
 */

const styles = {
  page: "flex flex-col gap-5",
  // Filters take the slack, the week summary keeps its width and drops to a
  // line of its own when the two no longer fit.
  controls: "flex flex-wrap items-center gap-3",
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
  panel: "min-w-0 rounded-xl bg-background p-7 sm:p-8 lg:rounded-l-none",
  panelHidden:
    "hidden min-w-0 rounded-xl bg-background p-7 sm:p-8 lg:block lg:rounded-l-none",
};

export function CaptureWorkspace({ selectedId }: { selectedId?: string }) {
  const state = useStore();
  const now = useNow();
  const { period, setPeriod } = useSelectedPeriod(now);

  const rows = operationsOf(state, state.userId)
    .map((operation) => ({
      operation,
      progress: progressOf(state, operation.id, period, now),
    }))
    .sort((a, b) => a.progress.delivered - b.progress.delivered);

  const complete = rows.filter(
    (r) => r.progress.delivered === r.progress.total,
  ).length;

  const {
    query,
    setQuery,
    companies,
    setCompanies,
    states,
    setStates,
    clear,
    active: filtering,
  } = useOperationFilters();

  // An empty selection means "no restriction", not "nothing matches": that is
  // what the combobox trigger says when it shows its placeholder.
  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rows.filter(({ operation, progress }) => {
      if (companies.length > 0 && !companies.includes(operation.companyId)) {
        return false;
      }
      if (states.length > 0 && !states.includes(completenessOf(progress))) {
        return false;
      }
      return !term || operation.name.toLowerCase().includes(term);
    });
  }, [rows, query, companies, states]);

  const router = useRouter();
  const search = useFilterSearch();
  const firstId = visible[0]?.operation.id;

  // `replace`, not `push`: the bare root is a step nobody chose, and leaving it
  // in the history would make Back bounce off it straight back to here.
  useEffect(() => {
    if (selectedId || !firstId) return;
    router.replace(`/intelligence/capture/operation/${firstId}${search}`);
  }, [selectedId, firstId, search, router]);

  return (
    <div className={styles.page}>
      {/* The week summary counts the whole week and never the filtered view:
          it answers how you are doing, not how the rail happens to be
          narrowed. */}
      <div className={styles.controls}>
        <OperationFilters
          query={query}
          onQueryChange={setQuery}
          companies={companies}
          onCompaniesChange={setCompanies}
          states={states}
          onStatesChange={setStates}
          onClear={clear}
          active={filtering}
        />
        <WeekSummaryInline
          period={period}
          onPeriodChange={setPeriod}
          now={now}
          complete={complete}
          total={rows.length}
        />
      </div>

      <Card className={styles.surface}>
        <div className={selectedId ? styles.railHidden : styles.rail}>
          <OperationList
            rows={visible}
            selectedId={selectedId}
            filtered={filtering}
          />
        </div>

        <div className={selectedId ? styles.panel : styles.panelHidden}>
          {selectedId ? (
            <CaptureForm
              key={`${selectedId}|${periodKey(period)}`}
              operationId={selectedId}
            />
          ) : null}
        </div>
      </Card>
    </div>
  );
}
