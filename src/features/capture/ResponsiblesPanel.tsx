"use client";

import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Card,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@traxion-global/design-system/react";
import { useStore } from "./lib/store";
import { responsiblesOf } from "./lib/compliance";
import { getCompany, getUser, OPERATIONS } from "./lib/organization";
import { Answer } from "./Answer";
import { AssignmentDialog } from "./AssignmentDialog";
import { WorkloadPanel } from "./WorkloadPanel";

/**
 * Assigning who delivers each operation.
 *
 * This puts a name on it; **it does not create the obligation**. Indicators are
 * asked of the operation whether or not it has a responsible: if the pending
 * count were born from the assignment, an operation with nobody would drop off
 * the list and its gap would go invisible right where it matters most.
 */

const styles = {
  page: "flex flex-col gap-6",
  columns: "grid gap-6 lg:grid-cols-[1fr_18rem] lg:items-start",
  panel: "flex flex-col gap-4",
  search: "max-w-sm",
  table: "overflow-hidden p-0 shadow-none",
  nameCell: "font-medium",
  name: "flex items-center gap-1.5",
  gap: "h-3.5 w-3.5 shrink-0 text-destructive-warm",
  context: "text-xs font-normal text-muted-foreground",
  responsibles: "text-sm leading-snug",
  empty: "text-sm italic text-destructive-warm",
  action: "text-right",
};

export function ResponsiblesPanel() {
  const state = useStore();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return OPERATIONS;
    return OPERATIONS.filter((o) =>
      `${o.name} ${getCompany(o.companyId)?.name ?? ""} ${o.territory}`
        .toLowerCase()
        .includes(term),
    );
  }, [query]);

  const unassigned = OPERATIONS.filter(
    (o) => responsiblesOf(state, o.id).length === 0,
  ).length;

  return (
    <div className={styles.page}>
      <Answer
        sentence={
          unassigned === 0
            ? "Todas las operaciones tienen quien las entregue."
            : `${unassigned} operaciones no tienen quien las entregue.`
        }
        support="Asignar pone nombre. La obligación es de la operación, no de la persona: una operación sin responsable sigue debiendo sus once indicadores cada semana."
      />

      <div className={styles.columns}>
        <div className={styles.panel}>
          <Input
            className={styles.search}
            placeholder="Buscar operación, compañía o territorio…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar operación"
          />

          <Card className={styles.table}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Operación</TableHead>
                  <TableHead>Responsables</TableHead>
                  <TableHead className={styles.action} />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((operation) => {
                  const assigned = responsiblesOf(state, operation.id);
                  return (
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
                          <span className={styles.empty}>Sin asignar</span>
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
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </div>

        <WorkloadPanel />
      </div>
    </div>
  );
}
