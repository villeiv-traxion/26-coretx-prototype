"use client";

import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Card,
  NoDataMessage,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@traxion-global/design-system/react";
import { useStore } from "./lib/store";
import { useNow } from "./lib/now";
import { useCoordinationFilters, useSelectedPeriod } from "./lib/filters";
import {
  historyOf,
  progressOf,
  responsiblesOf,
  weekSummary,
} from "./lib/compliance";
import { getCompany, OPERATIONS } from "./lib/organization";
import { allWeeks } from "./lib/periods";
import { CoordinationFilters } from "./CoordinationFilters";
import { WeekSummaryInline } from "./WeekSummaryInline";
import { WeekStrip } from "./WeekStrip";
import { StripLegend } from "./StripLegend";

/**
 * The year of compliance, one operation per row.
 *
 * The order is by **proportion** and not by number of failures: "2 bad weeks"
 * from an operation with two weeks of history and from one with forty are 100%
 * and 5%. Presented the same way, the order points at whichever has the least
 * data, which is precisely the one we know least about.
 *
 * It opens the way the capture screen does — a filter bar with the week summary
 * beside it — because both are the same job seen from two sides, and the week
 * the summary names is the column the strip highlights.
 */

const styles = {
  page: "flex flex-col gap-5",
  controls: "flex flex-wrap items-center gap-3",
  table: "overflow-hidden p-0 shadow-none",
  scroller: "overflow-x-auto",
  row: "flex items-center gap-4 border-b px-4 py-2.5 last:border-b-0",
  identity: "sticky left-0 z-10 flex w-56 shrink-0 flex-col bg-background pr-2",
  name: "flex items-center gap-1.5 truncate text-sm font-medium leading-tight",
  gap: "h-3.5 w-3.5 shrink-0 text-destructive-warm",
  context: "truncate text-xs text-muted-foreground",
  strip: "flex min-w-0 flex-1",
  balance: "w-24 shrink-0 text-right text-xs tabular-nums text-muted-foreground",
  ruler: "flex items-center gap-4 border-b bg-muted/70 px-4 py-2",
  rulerGap: "w-56 shrink-0",
  rulerAxis: "flex min-w-0 flex-1 gap-[2px]",
  // Matches the cells exactly, so a tick lands over the week it names.
  rulerTick:
    "min-w-[6px] flex-1 text-center text-[0.5625rem] tabular-nums text-muted-foreground",
  legend: "px-4 py-3",
  empty: "py-10",
};

export function ComplianceTable() {
  const state = useStore();
  const now = useNow();
  const { period, setPeriod } = useSelectedPeriod(now);
  const weeks = useMemo(() => allWeeks(period.year), [period.year]);

  const {
    query,
    setQuery,
    companies,
    setCompanies,
    responsibles,
    setResponsibles,
    unassignedOnly,
    setUnassignedOnly,
    clear,
    active,
  } = useCoordinationFilters();

  const rows = OPERATIONS.map((operation) => {
    const cells = weeks.map((p) => ({
      period: p,
      progress: progressOf(state, operation.id, p, now),
    }));
    const history = historyOf(state, operation.id, weeks, now);
    return {
      operation,
      cells,
      history,
      assigned: responsiblesOf(state, operation.id),
      unassigned: responsiblesOf(state, operation.id).length === 0,
      ratio: history.required === 0 ? 1 : history.complete / history.required,
    };
  }).sort((a, b) => a.ratio - b.ratio);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (unassignedOnly && !row.unassigned) return false;
      if (
        companies.length > 0 &&
        !companies.includes(row.operation.companyId)
      ) {
        return false;
      }
      // Any of the chosen people, not all: the question is «what do these
      // three carry between them», never «what do the three share».
      if (
        responsibles.length > 0 &&
        !row.assigned.some((id) => responsibles.includes(id))
      ) {
        return false;
      }
      return !term || row.operation.name.toLowerCase().includes(term);
    });
  }, [rows, query, companies, responsibles, unassignedOnly]);

  const summary = weekSummary(state, period, now);
  const reported = OPERATIONS.filter(
    (o) => progressOf(state, o.id, period, now).delivered === 11,
  ).length;

  return (
    <div className={styles.page}>
      <div className={styles.controls}>
        <CoordinationFilters
          query={query}
          onQueryChange={setQuery}
          companies={companies}
          onCompaniesChange={setCompanies}
          responsibles={responsibles}
          onResponsiblesChange={setResponsibles}
          unassignedOnly={unassignedOnly}
          onUnassignedOnlyChange={setUnassignedOnly}
          onClear={clear}
          active={active}
        />
        {/* Counts the whole division, never the filtered view: it answers how
            the week is going, not how the table happens to be narrowed. */}
        <WeekSummaryInline
          period={period}
          onPeriodChange={setPeriod}
          now={now}
          complete={reported}
          total={OPERATIONS.length}
        />
      </div>

      <Card className={styles.table}>
        {visible.length === 0 ? (
          <div className={styles.empty}>
            <NoDataMessage
              title="Ninguna operación coincide"
              message="Prueba con otro nombre, otra compañía, otro responsable, o apaga el filtro de sin responsable."
            />
          </div>
        ) : (
          <>
            <div className={styles.scroller}>
              <div className={styles.ruler}>
                <span className={styles.rulerGap} />
                <div className={styles.rulerAxis}>
                  {weeks.map((p) => (
                    <span key={p.week} className={styles.rulerTick}>
                      {p.week % 5 === 0 ? p.week : ""}
                    </span>
                  ))}
                </div>
              </div>

              {visible.map((row) => (
                <div key={row.operation.id} className={styles.row}>
                  <div className={styles.identity}>
                    <span className={styles.name}>
                      {row.unassigned ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertTriangle className={styles.gap} />
                          </TooltipTrigger>
                          <TooltipContent>
                            Nadie tiene asignada esta operación. Se le sigue
                            pidiendo igual.
                          </TooltipContent>
                        </Tooltip>
                      ) : null}
                      {row.operation.name}
                    </span>
                    <span className={styles.context}>
                      {getCompany(row.operation.companyId)?.name} ·{" "}
                      {row.operation.territory}
                    </span>
                  </div>

                  <div className={styles.strip}>
                    <WeekStrip weeks={row.cells} currentWeek={period.week} />
                  </div>

                  <span className={styles.balance}>
                    {row.history.complete} de {row.history.required}
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.legend}>
              <StripLegend />
            </div>
          </>
        )}
      </Card>

      <p className={styles.context}>
        {summary.unassignedOperations === 0
          ? "Todas las operaciones tienen quien las entregue."
          : `${summary.unassignedOperations} operaciones no tienen quien las entregue. Se les sigue pidiendo igual.`}
      </p>
    </div>
  );
}
