"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Button,
  Card,
  NoDataMessage,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@traxion-global/design-system/react";
import { useStore } from "./lib/store";
import { useNow } from "./lib/now";
import { useCoordinationFilters, useSelectedPeriod } from "./lib/filters";
import {
  isShortfall,
  progressOf,
  responsiblesOf,
  weekSummary,
} from "./lib/compliance";
import { getCompany, getUser, OPERATIONS } from "./lib/organization";
import { periodOf, rangeInWords, type Period } from "./lib/periods";
import { AssignmentDialog } from "./AssignmentDialog";
import { CoordinationFilters } from "./CoordinationFilters";
import { WeekCell } from "./WeekCell";
import { RemindButton } from "./RemindButton";

/**
 * Delivery by week: one row per operation, four weeks at a time.
 *
 * A window rather than the whole year. Fifty-two columns only fit by scrolling
 * sideways, and a horizontal scrollbar under a wide table costs more than it
 * gives: the identity columns had to be pinned to survive it, the pinning
 * needed the heavier `DataTable`, and even then a cell halfway across belonged
 * to a header nobody could see. Four columns fit outright with room to spare
 * for the identity beside them, so this is the plain `Table` and moving through
 * the year is two buttons.
 *
 * The window ends on the week the summary names, so the two controls are one
 * piece of state: the last column is always the week being reported on.
 *
 * The order puts the worst proportion first, with **enough history first**: two
 * bad weeks out of two and two out of forty are 100% and 5%, and ordering by the
 * two would point at whichever operation we know least about.
 */

/** Four weeks at a time; the pager walks back through the year from there. */
const WINDOW = 4;

const styles = {
  page: "flex flex-col gap-5",
  card: "overflow-hidden p-0 shadow-none",
  pager:
    "flex flex-wrap items-center justify-between gap-3 border-b px-4 py-2.5",
  pagerLabel: "text-xs text-muted-foreground",
  pagerRange: "font-medium tabular-nums text-foreground",
  pagerButtons: "flex items-center gap-1",
  pagerButton: "h-7 w-7 p-0",
  pagerIcon: "h-4 w-4",
  name: "block truncate font-medium",
  company: "block truncate text-sm font-normal",
  // «Territorio» is what the master data calls it, so that is what it is called
  // here. It only exists for the SID companies — derived from the suffixes of
  // their operation names — and is blank everywhere else rather than invented.
  territory: "text-xs font-normal tabular-nums text-muted-foreground",
  // With a denominator, always. «2» alone cannot be compared between an
  // operation with two weeks of history and one with ten, and the table is
  // ordered by exactly that proportion.
  badHead: "whitespace-nowrap text-center",
  badCell: "text-center",
  // A dot carries the severity and the figure stays plain: colouring the text
  // itself made the same number look like two different numbers depending on
  // the row it sat in.
  badRow: "inline-flex items-center gap-1.5 text-xs tabular-nums",
  badDot: "h-1.5 w-1.5 shrink-0 rounded-full",
  weekHead: "text-center",
  weekCell: "px-1 text-center",
  // The open week gets a rule down its left edge and a word under its number.
  // Its job is not to locate the column — it is always the last one — but to
  // say that this week is still running and should not be read like the ones
  // beside it, which are settled.
  // The open week is the wide one — it carries the nudge as well as the count —
  // so its cells start at the left edge instead of floating in the middle of a
  // column the others do not need.
  //
  // The width is fixed at what that content actually measures — chip, gap and
  // button — so the centred header lands over the middle of the content rather
  // than over the middle of whatever slack the table decided to give the
  // column. Left-aligned content under a centred title only looks centred when
  // the two are the same width.
  weekHeadCurrent: "w-[10.5rem] border-l-2 border-primary text-center",
  weekCellCurrent: "w-[10.5rem] border-l-2 border-primary px-2 text-left",
  currentHead: "inline-flex flex-col items-center",
  currentTag:
    "text-[0.625rem] font-normal leading-tight text-muted-foreground",
  weekRow: "inline-flex items-center gap-1.5",
  // The name is the control. A column of twenty-four identical buttons said
  // the same thing twenty-four times; clicking who is responsible to change who
  // is responsible needs no label at all. The underline on hover is what makes
  // it findable without one.
  responsible:
    "block max-w-[11rem] truncate text-left text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline",
  unassigned:
    "block max-w-[11rem] truncate text-left text-xs text-destructive-warm underline-offset-2 hover:underline",
  empty: "py-10",
  footnote: "text-xs leading-snug text-muted-foreground",
};

/**
 * Where «it slipped» becomes «it fails as a habit».
 *
 * The dot borrows the cells' own two families rather than a traffic light of
 * its own: primary while things are fine — solid with no bad weeks, paler with
 * a few — and destructive once they are not. A green and an amber that appear
 * nowhere else in the row would have been a third scale to learn.
 *
 * A design decision, not a figure from anywhere: nothing in the source material
 * sets a threshold for this column — the reference prototype paints it in two
 * states, any bad week or none. Its 0.5 belongs to a different sentence, the
 * count of operations that «failed for real in half the weeks or more».
 *
 * Three in ten is Iván's call. Being a proportion, it travels with the window:
 * over the four on screen, of which three are closed, a single bad week already
 * clears it. A shorter window is a harsher one.
 */
const CHRONIC = 0.3;

function badDotClass(bad: number, asked: number): string {
  if (bad === 0) return "bg-primary";
  return bad / asked >= CHRONIC ? "bg-destructive" : "bg-primary/40";
}

/** The `count` weeks ending at `period`, never reaching before week 1. */
function windowEndingAt(period: Period, count: number): Period[] {
  const first = Math.max(1, period.week - count + 1);
  return Array.from({ length: period.week - first + 1 }, (_, i) => ({
    year: period.year,
    week: first + i,
  }));
}

export function ComplianceTable() {
  const state = useStore();
  const now = useNow();
  const { period, setPeriod } = useSelectedPeriod(now);
  const current = periodOf(now);

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

  const weeks = useMemo(() => windowEndingAt(period, WINDOW), [period]);

  const canGoBack = weeks[0].week > 1;
  const canGoForward = period.week < current.week;

  function shift(by: number) {
    const week = Math.min(current.week, Math.max(1, period.week + by));
    setPeriod({ year: period.year, week });
  }

  const rows = useMemo(
    () =>
      OPERATIONS.map((operation) => {
        const cells = weeks.map((week) => ({
          period: week,
          progress: progressOf(state, operation.id, week, now),
        }));
        // The week in progress is neither counted nor blamed: nothing is late
        // before the cutoff, and an operation that still has until Friday would
        // otherwise carry a bad week for being mid-week. It leaves the
        // denominator too — «2 de 10» with one week still open is «2 de 9».
        //
        // And a week is only bad if it fell meaningfully short: ten of eleven
        // is painted as fine in its own cell, so counting it here would have the
        // row contradict itself.
        const closed = cells.filter(({ progress }) => progress.closed);
        const bad = closed.filter(({ progress }) => isShortfall(progress)).length;
        const assigned = responsiblesOf(state, operation.id);

        return {
          operation,
          cells,
          bad,
          asked: closed.length,
          assigned,
          unassigned: assigned.length === 0,
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

    const enough = Math.ceil(WINDOW / 2);
    return [...filtered].sort((a, b) => {
      const aEnough = a.asked >= enough ? 1 : 0;
      const bEnough = b.asked >= enough ? 1 : 0;
      if (aEnough !== bEnough) return bEnough - aEnough;
      return b.bad / (b.asked || 1) - a.bad / (a.asked || 1);
    });
  }, [rows, query, companies, responsibles, unassignedOnly]);

  const summary = weekSummary(state, period, now);

  const first = weeks[0];
  const last = weeks[weeks.length - 1];


  return (
    <div className={styles.page}>
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

      <Card className={styles.card}>
        <div className={styles.pager}>
          <span className={styles.pagerLabel}>
            Semanas{" "}
            <span className={styles.pagerRange}>
              {first.week} – {last.week}
            </span>{" "}
            · {rangeInWords(first)} al {rangeInWords(last)}
          </span>

          <div className={styles.pagerButtons}>
            <Button
              variant="outline"
              className={styles.pagerButton}
              disabled={!canGoBack}
              onClick={() => shift(-WINDOW)}
              aria-label="Semanas anteriores"
            >
              <ChevronLeft className={styles.pagerIcon} />
            </Button>
            <Button
              variant="outline"
              className={styles.pagerButton}
              disabled={!canGoForward}
              onClick={() => shift(WINDOW)}
              aria-label="Semanas siguientes"
            >
              <ChevronRight className={styles.pagerIcon} />
            </Button>
          </div>
        </div>

        {visible.length === 0 ? (
          <div className={styles.empty}>
            <NoDataMessage
              title="Ninguna operación coincide"
              message="Prueba con otro nombre, otra compañía, otro responsable, o apaga el filtro de sin responsable."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Operación</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Compañía</TableHead>
                <TableHead>Territorio</TableHead>
                <TableHead className={styles.badHead}>Semanas malas</TableHead>
                {weeks.map((week) => {
                  const isCurrent = week.week === current.week;
                  return (
                    <TableHead
                      key={week.week}
                      className={
                        isCurrent ? styles.weekHeadCurrent : styles.weekHead
                      }
                    >
                      {isCurrent ? (
                        <span className={styles.currentHead}>
                          <span>S{week.week}</span>
                          <span className={styles.currentTag}>en curso</span>
                        </span>
                      ) : (
                        <>S{week.week}</>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((row) => (
                <TableRow key={row.operation.id}>
                  <TableCell>
                    <span className={styles.name}>{row.operation.name}</span>
                  </TableCell>

                  <TableCell>
                    <AssignmentDialog operation={row.operation}>
                      <button
                        type="button"
                        className={
                          row.unassigned
                            ? styles.unassigned
                            : styles.responsible
                        }
                        title={`Cambiar quién entrega ${row.operation.name}`}
                      >
                        {row.unassigned
                          ? "Sin asignar"
                          : row.assigned
                              .map((id) => getUser(id)?.name)
                              .filter(Boolean)
                              .join(", ")}
                      </button>
                    </AssignmentDialog>
                  </TableCell>

                  <TableCell>
                    <span className={styles.company}>
                      {getCompany(row.operation.companyId)?.name}
                    </span>
                  </TableCell>

                  <TableCell className={styles.territory}>
                    {row.operation.territory}
                  </TableCell>

                  <TableCell className={styles.badCell}>
                    <span className={styles.badRow}>
                      <span
                        className={`${styles.badDot} ${badDotClass(row.bad, row.asked)}`}
                        aria-hidden="true"
                      />
                      {row.bad} de {row.asked}
                    </span>
                  </TableCell>

                  {row.cells.map((cell) => (
                    <TableCell
                      key={cell.period.week}
                      className={
                        cell.period.week === current.week
                          ? styles.weekCellCurrent
                          : styles.weekCell
                      }
                    >
                      {/* The nudge sits with the count it is about: «7/11» and
                          «Recordar» are one sentence, and a column of its own
                          put the verb three columns from its subject. Only the
                          open week has one — the others are past nudging. */}
                      <span className={styles.weekRow}>
                        <WeekCell
                          period={cell.period}
                          progress={cell.progress}
                        />
                        {cell.period.week === current.week ? (
                          <RemindButton
                            operation={row.operation}
                            period={cell.period}
                            progress={cell.progress}
                            assigned={row.assigned}
                          />
                        ) : null}
                      </span>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <p className={styles.footnote}>
        Cada celda es lo entregado de esa semana.
        {summary.unassignedOperations > 0
          ? ` ${summary.unassignedOperations} operaciones no tienen quien las entregue y se les sigue pidiendo igual.`
          : ""}
      </p>
    </div>
  );
}
