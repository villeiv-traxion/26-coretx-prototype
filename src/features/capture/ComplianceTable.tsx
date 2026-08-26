"use client";

import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Card,
  NoDataMessage,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@traxion-global/design-system/react";
import { useStore } from "./lib/store";
import { useNow } from "./lib/now";
import { useCoordinationFilters, useSelectedPeriod } from "./lib/filters";
import { progressOf, responsiblesOf, weekSummary } from "./lib/compliance";
import { getCompany, OPERATIONS } from "./lib/organization";
import { isFuture, periodOf, startOf, type Period } from "./lib/periods";
import { CoordinationFilters } from "./CoordinationFilters";
import { WeekSummaryInline } from "./WeekSummaryInline";
import { WeekCell } from "./WeekCell";

/**
 * Delivery by week: one row per operation, one column per week of the range.
 *
 * A window of eight rather than the whole year. Fifty-two columns only fit as
 * coloured squares, and a square cannot say «9 de 11» — which is the difference
 * between an operation that slipped and one that never reported at all. Eight
 * columns fit the numbers, and the range selector reaches further back when the
 * question needs it.
 *
 * The order puts the worst proportion first, with **enough history first**: two
 * bad weeks out of two and two out of forty are 100% and 5%, and ordering by
 * the two would point at whichever operation we know least about.
 */

const styles = {
  page: "flex flex-col gap-5",
  controls: "flex flex-wrap items-center gap-3",
  card: "overflow-hidden p-0 shadow-none",
  scroller: "overflow-x-auto",
  nameHead: "sticky left-0 z-10 bg-background",
  weekHead: "text-center",
  balanceHead: "whitespace-nowrap text-right",
  nameCell: "sticky left-0 z-10 bg-background font-medium",
  name: "flex items-center gap-1.5",
  gap: "h-3.5 w-3.5 shrink-0 text-destructive-warm",
  context: "text-xs font-normal text-muted-foreground",
  weekCell: "px-1 text-center",
  balance: "text-right text-xs tabular-nums text-muted-foreground",
  balanceBad:
    "text-right text-xs font-medium tabular-nums text-destructive-warm",
  empty: "py-10",
  footnote: "text-xs leading-snug text-muted-foreground",
};

/** The `count` weeks ending at `period`, oldest first. */
function windowEndingAt(period: Period, count: number): Period[] {
  const end = startOf(period);
  return Array.from({ length: count }, (_, i) => {
    const day = new Date(end);
    day.setDate(day.getDate() - (count - 1 - i) * 7);
    return periodOf(day);
  });
}

export function ComplianceTable() {
  const state = useStore();
  const now = useNow();
  const { period, setPeriod } = useSelectedPeriod(now);

  const {
    query,
    setQuery,
    companies,
    setCompanies,
    responsibles,
    setResponsibles,
    unassignedOnly,
    setUnassignedOnly,
    range,
    setRange,
    clear,
    active,
  } = useCoordinationFilters();

  const weeks = useMemo(() => windowEndingAt(period, range), [period, range]);

  const rows = OPERATIONS.map((operation) => {
    const cells = weeks.map((p) => ({
      period: p,
      progress: progressOf(state, operation.id, p, now),
    }));

    // Weeks actually asked for, and how many of those fell short. Both counted
    // over the range on screen, so the figure answers what is being looked at.
    const asked = cells.filter(({ period: p }) => !isFuture(p, now));
    const bad = asked.filter(
      ({ progress }) => progress.delivered < progress.total,
    ).length;

    const assigned = responsiblesOf(state, operation.id);

    return {
      operation,
      cells,
      bad,
      asked: asked.length,
      assigned,
      unassigned: assigned.length === 0,
    };
  });

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      if (unassignedOnly && !row.unassigned) return false;
      if (
        companies.length > 0 &&
        !companies.includes(row.operation.companyId)
      ) {
        return false;
      }
      // Any of the chosen people, not all: the question is «what do these three
      // carry between them», never «what do the three share».
      if (
        responsibles.length > 0 &&
        !row.assigned.some((id) => responsibles.includes(id))
      ) {
        return false;
      }
      return !term || row.operation.name.toLowerCase().includes(term);
    });

    const enough = Math.ceil(range / 2);
    return [...filtered].sort((a, b) => {
      const aEnough = a.asked >= enough ? 1 : 0;
      const bEnough = b.asked >= enough ? 1 : 0;
      if (aEnough !== bEnough) return bEnough - aEnough;
      return b.bad / (b.asked || 1) - a.bad / (a.asked || 1);
    });
  }, [rows, query, companies, responsibles, unassignedOnly, range]);

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
          range={range}
          onRangeChange={setRange}
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

      <Card className={styles.card}>
        {visible.length === 0 ? (
          <div className={styles.empty}>
            <NoDataMessage
              title="Ninguna operación coincide"
              message="Prueba con otro nombre, otra compañía, otro responsable, o apaga el filtro de sin responsable."
            />
          </div>
        ) : (
          <div className={styles.scroller}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={styles.nameHead}>Operación</TableHead>
                  {weeks.map((week) => (
                    <TableHead key={week.week} className={styles.weekHead}>
                      S{week.week}
                    </TableHead>
                  ))}
                  <TableHead className={styles.balanceHead}>
                    Semanas malas
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((row) => (
                  <TableRow key={row.operation.id}>
                    <TableCell className={styles.nameCell}>
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
                    </TableCell>

                    {row.cells.map((cell) => (
                      <TableCell
                        key={cell.period.week}
                        className={styles.weekCell}
                      >
                        <WeekCell
                          period={cell.period}
                          progress={cell.progress}
                        />
                      </TableCell>
                    ))}

                    <TableCell
                      className={
                        row.bad > 0 ? styles.balanceBad : styles.balance
                      }
                    >
                      {row.bad} de {row.asked}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <p className={styles.footnote}>
        Cada celda es lo entregado de esa semana; un punto significa que a esa
        operación no se le pedía nada ese periodo, no que fallara.
        {summary.unassignedOperations > 0
          ? ` ${summary.unassignedOperations} operaciones no tienen quien las entregue y se les sigue pidiendo igual.`
          : ""}
      </p>
    </div>
  );
}
