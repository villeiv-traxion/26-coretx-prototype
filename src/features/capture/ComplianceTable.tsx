"use client";

import { useMemo } from "react";
import {
  DataTable,
  DataTableContent,
  DataTablePagination,
  NoDataMessage,
  useDataTable,
  type ColumnDef,
} from "@traxion-global/design-system/react";
import { useStore } from "./lib/store";
import { useNow } from "./lib/now";
import { useCoordinationFilters, useSelectedPeriod } from "./lib/filters";
import {
  progressOf,
  responsiblesOf,
  weekSummary,
  type WeekProgress,
} from "./lib/compliance";
import {
  getCompany,
  getUser,
  OPERATIONS,
  type Operation,
} from "./lib/organization";
import { elapsedWeeks, periodKey, type Period } from "./lib/periods";
import { AssignmentDialog } from "./AssignmentDialog";
import { CoordinationFilters } from "./CoordinationFilters";
import { WeekSummaryInline } from "./WeekSummaryInline";
import { WeekCell } from "./WeekCell";

/**
 * Delivery by week: one row per operation, one column per elapsed week.
 *
 * The year so far is on screen and the table scrolls sideways through it, with
 * **operation and responsible pinned to the left edge** so a cell in week 30
 * never becomes an anonymous number. That is what makes thirty-odd columns
 * usable, and it is why this is the design system `DataTable` rather than the
 * plain `Table`: pinning is its feature, declared per column.
 *
 * The order puts the worst proportion first, with **enough history first**: two
 * bad weeks out of two and two out of forty are 100% and 5%, and ordering by
 * the two would point at whichever operation we know least about.
 */

interface ComplianceRow {
  operation: Operation;
  assigned: string[];
  unassigned: boolean;
  byWeek: Map<string, { period: Period; progress: WeekProgress }>;
  bad: number;
  asked: number;
}

/** Wide enough that the year overflows any screen, which is what pinning needs. */
const NAME_WIDTH = 220;
const RESPONSIBLE_WIDTH = 190;
const WEEK_WIDTH = 58;

const styles = {
  page: "flex flex-col gap-5",
  controls: "flex flex-wrap items-center gap-3",
  name: "truncate font-medium",
  context: "truncate text-xs font-normal text-muted-foreground",
  weekHead: "text-center",
  weekCell: "text-center",
  responsibleRow: "flex items-center gap-2",
  responsible: "min-w-0 truncate text-xs text-muted-foreground",
  unassigned: "min-w-0 truncate text-xs text-destructive-warm",
  footnote: "text-xs leading-snug text-muted-foreground",
};

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
    clear,
    active,
  } = useCoordinationFilters();

  // Up to the week in progress and no further: a column for a week that has
  // not started is a column of dots.
  const weeks = useMemo(() => elapsedWeeks(now), [now]);

  // Room for the whole division on one page. Coordination came to see all of
  // it; paging twenty-four operations would only hide a third of the answer.
  const tableState = useDataTable<ComplianceRow>({ pageSize: 30 });

  const rows = useMemo<ComplianceRow[]>(
    () =>
      OPERATIONS.map((operation) => {
        const byWeek = new Map<
          string,
          { period: Period; progress: WeekProgress }
        >();
        let bad = 0;
        let asked = 0;

        for (const week of weeks) {
          const progress = progressOf(state, operation.id, week, now);
          byWeek.set(periodKey(week), { period: week, progress });
          asked++;
          if (progress.delivered < progress.total) bad++;
        }

        const assigned = responsiblesOf(state, operation.id);
        return {
          operation,
          assigned,
          unassigned: assigned.length === 0,
          byWeek,
          bad,
          asked,
        };
      }),
    [state, weeks, now],
  );

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

    const enough = Math.ceil(weeks.length / 2);
    return [...filtered].sort((a, b) => {
      const aEnough = a.asked >= enough ? 1 : 0;
      const bEnough = b.asked >= enough ? 1 : 0;
      if (aEnough !== bEnough) return bEnough - aEnough;
      return b.bad / (b.asked || 1) - a.bad / (a.asked || 1);
    });
  }, [rows, query, companies, responsibles, unassignedOnly, weeks.length]);

  const columns = useMemo<ColumnDef<ComplianceRow>[]>(
    () => [
      {
        id: "operation",
        header: "Operación",
        size: NAME_WIDTH,
        pin: "left",
        enableHiding: false,
        cell: ({ row }) => (
          <>
            <span className={styles.name} title={row.original.operation.name}>
              {row.original.operation.name}
            </span>
            <span className={styles.context}>
              {getCompany(row.original.operation.companyId)?.name} ·{" "}
              {row.original.operation.territory}
            </span>
          </>
        ),
      },
      {
        id: "responsible",
        header: "Responsable",
        size: RESPONSIBLE_WIDTH,
        pin: "left",
        enableHiding: false,
        cell: ({ row }) => {
          const names = row.original.assigned
            .map((id) => getUser(id)?.name)
            .filter(Boolean)
            .join(", ");
          return (
            <span className={styles.responsibleRow}>
              <span
                className={
                  row.original.unassigned ? styles.unassigned : styles.responsible
                }
                title={names || "Sin asignar"}
              >
                {row.original.unassigned ? "Sin asignar" : names}
              </span>
              <AssignmentDialog operation={row.original.operation} compact />
            </span>
          );
        },
      },
      ...weeks.map<ColumnDef<ComplianceRow>>((week) => ({
        id: periodKey(week),
        header: `S${week.week}`,
        size: WEEK_WIDTH,
        enableSorting: false,
        cell: ({ row }) => {
          const cell = row.original.byWeek.get(periodKey(week));
          if (!cell) return null;
          return (
            <div className={styles.weekCell}>
              <WeekCell period={cell.period} progress={cell.progress} />
            </div>
          );
        },
      })),
    ],
    [weeks],
  );

  const summary = weekSummary(state, period, now);
  const reported = OPERATIONS.filter(
    (o) => progressOf(state, o.id, period, now).delivered === 11,
  ).length;

  const { pageIndex, pageSize } = tableState.pagination;
  const page = visible.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

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

      <DataTable
        columns={columns}
        data={page}
        pageCount={Math.max(1, Math.ceil(visible.length / pageSize))}
        emptyState={
          <NoDataMessage
            title="Ninguna operación coincide"
            message="Prueba con otro nombre, otra compañía, otro responsable, o apaga el filtro de sin responsable."
          />
        }
        {...tableState}
      >
        <DataTableContent />
        <DataTablePagination />
      </DataTable>

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
