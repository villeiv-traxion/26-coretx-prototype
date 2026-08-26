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
} from "@traxion-global/design-system/react";
import { Alert } from "@/ui/Alert";
import { useStore } from "./lib/store";
import { useCoordinationFilters } from "./lib/filters";
import { responsiblesOf } from "./lib/compliance";
import { getCompany, getUser, OPERATIONS } from "./lib/organization";
import { CoordinationFilters } from "./CoordinationFilters";
import { AssignmentDialog } from "./AssignmentDialog";
import { WorkloadPanel } from "./WorkloadPanel";

/**
 * Assigning who delivers each operation.
 *
 * This puts a name on it; **it does not create the obligation**. Indicators are
 * asked of the operation whether or not it has a responsible: if the pending
 * count were born from the assignment, an operation with nobody would drop off
 * the list and its gap would go invisible right where it matters most.
 *
 * Same filter bar as the compliance table and the capture rail. The one thing
 * this screen states outright is the gap, and it does so in an alert rather
 * than a headline: it is a condition to fix, not the title of the page.
 */

const styles = {
  page: "flex flex-col gap-5",
  columns: "grid gap-5 lg:grid-cols-[1fr_18rem] lg:items-start",
  panel: "flex flex-col gap-4",
  table: "overflow-hidden p-0 shadow-none",
  nameCell: "font-medium",
  name: "flex items-center gap-1.5",
  gap: "h-3.5 w-3.5 shrink-0 text-destructive-warm",
  context: "text-xs font-normal text-muted-foreground",
  responsibles: "text-sm leading-snug",
  unassigned: "text-sm italic text-destructive-warm",
  action: "text-right",
  empty: "py-10",
};

export function ResponsiblesPanel() {
  const state = useStore();
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

  const rows = OPERATIONS.map((operation) => ({
    operation,
    assigned: responsiblesOf(state, operation.id),
  }));

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rows.filter(({ operation, assigned }) => {
      if (unassignedOnly && assigned.length > 0) return false;
      if (companies.length > 0 && !companies.includes(operation.companyId)) {
        return false;
      }
      // Any of the chosen people, not all: the question is «what do these
      // three carry between them», never «what do the three share».
      if (
        responsibles.length > 0 &&
        !assigned.some((id) => responsibles.includes(id))
      ) {
        return false;
      }
      return !term || operation.name.toLowerCase().includes(term);
    });
  }, [rows, query, companies, responsibles, unassignedOnly]);

  const missing = rows.filter((r) => r.assigned.length === 0).length;

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

      {missing > 0 ? (
        <Alert
          variant="warning"
          title={`${missing} operaciones no tienen quien las entregue`}
          description="Asignar pone nombre. La obligación es de la operación, no de la persona: una operación sin responsable sigue debiendo sus once indicadores cada semana."
        />
      ) : null}

      <div className={styles.columns}>
        <div className={styles.panel}>
          <Card className={styles.table}>
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
                    <TableHead>Responsables</TableHead>
                    <TableHead className={styles.action} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map(({ operation, assigned }) => (
                    <TableRow key={operation.id}>
                      <TableCell className={styles.nameCell}>
                        <span className={styles.name}>
                          {assigned.length === 0 ? (
                            <AlertTriangle className={styles.gap} />
                          ) : null}
                          {operation.name}
                        </span>
                        <span className={styles.context}>
                          {getCompany(operation.companyId)?.name} ·{" "}
                          {operation.territory}
                        </span>
                      </TableCell>
                      <TableCell>
                        {assigned.length === 0 ? (
                          <span className={styles.unassigned}>Sin asignar</span>
                        ) : (
                          <span className={styles.responsibles}>
                            {assigned
                              .map((id) => getUser(id)?.name)
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className={styles.action}>
                        <AssignmentDialog operation={operation} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>

        <WorkloadPanel />
      </div>
    </div>
  );
}
