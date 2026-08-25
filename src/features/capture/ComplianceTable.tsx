"use client";

import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Card,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@traxion-global/design-system/react";
import { useStore } from "./lib/store";
import { useNow } from "./lib/now";
import {
  historyOf,
  progressOf,
  responsiblesOf,
  weekSummary,
} from "./lib/compliance";
import { COMPANIES, OPERATIONS } from "./lib/organization";
import { allWeeks, periodOf } from "./lib/periods";
import { Answer } from "./Answer";
import { WeekStrip } from "./WeekStrip";
import { StripLegend } from "./StripLegend";

/**
 * The year of compliance, one operation per row.
 *
 * The order is by **proportion** and not by number of failures: "2 bad weeks"
 * from an operation with two weeks of history and from one with forty are 100%
 * and 5%. Presented the same way, the order points at whichever has the least
 * data, which is precisely the one we know least about.
 */

const styles = {
  page: "flex flex-col gap-6",
  header: "flex flex-col gap-3",
  table: "overflow-hidden p-0 shadow-none",
  scroller: "overflow-x-auto",
  row: "flex items-center gap-4 border-b px-4 py-2.5 last:border-b-0",
  identity: "sticky left-0 z-10 flex w-56 shrink-0 flex-col bg-background pr-2",
  name: "flex items-center gap-1.5 truncate text-sm font-medium leading-tight",
  gap: "h-3.5 w-3.5 shrink-0 text-destructive-warm",
  territory: "truncate text-xs text-muted-foreground",
  strip: "shrink-0",
  balance: "w-24 shrink-0 text-right text-xs tabular-nums text-muted-foreground",
  ruler: "flex items-center gap-4 border-b bg-muted/40 px-4 py-2",
  rulerGap: "w-56 shrink-0",
  rulerAxis: "flex shrink-0 gap-[2px]",
  rulerTick:
    "w-[9px] shrink-0 text-center text-[0.5625rem] tabular-nums text-muted-foreground",
};

export function ComplianceTable() {
  const state = useStore();
  const now = useNow();
  const period = periodOf(now);
  const weeks = useMemo(() => allWeeks(period.year), [period.year]);

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
      unassigned: responsiblesOf(state, operation.id).length === 0,
      ratio: history.required === 0 ? 1 : history.complete / history.required,
    };
  }).sort((a, b) => a.ratio - b.ratio);

  const summary = weekSummary(state, period, now);
  const percent = Math.round((summary.delivered / summary.expected) * 100);
  const missing = summary.expected - summary.delivered;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Answer
          sentence={`La semana ${period.week} va al ${percent}%. Faltan ${missing} envíos en ${summary.pendingOperations} operaciones.`}
          support={`${OPERATIONS.length} operaciones · ${COMPANIES.length} compañías · ${summary.unassignedOperations} sin responsable asignado`}
        />
        <StripLegend />
      </div>

      <Card className={styles.table}>
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

          {rows.map((row) => (
            <div key={row.operation.id} className={styles.row}>
              <div className={styles.identity}>
                <span className={styles.name}>
                  {row.unassigned ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertTriangle className={styles.gap} />
                      </TooltipTrigger>
                      <TooltipContent>
                        Nadie tiene asignada esta operación. Se le sigue pidiendo
                        igual.
                      </TooltipContent>
                    </Tooltip>
                  ) : null}
                  {row.operation.name}
                </span>
                <span className={styles.territory}>
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
      </Card>
    </div>
  );
}
