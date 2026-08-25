"use client";

import Link from "next/link";
import { Button, Progress } from "@traxion-global/design-system/react";
import { getCompany, type Operation } from "./lib/organization";
import type { WeekProgress } from "./lib/compliance";
import { SubmissionStatusBadge } from "./SubmissionStatusBadge";

/** One operation in the queue of whoever is capturing. */

const styles = {
  row: "flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-5",
  identity: "min-w-0 flex-1",
  name: "truncate font-medium leading-tight",
  company: "truncate text-xs text-muted-foreground",
  gauge: "flex items-center gap-3 sm:w-56",
  bar: "h-2 flex-1",
  fraction: "w-16 shrink-0 text-right text-sm tabular-nums",
  tail: "flex items-center gap-3 sm:w-56 sm:justify-end",
  button: "w-full sm:w-auto",
};

interface OperationRowProps {
  operation: Operation;
  progress: WeekProgress;
}

export function OperationRow({ operation, progress }: OperationRowProps) {
  const complete = progress.delivered === progress.total;
  const company = getCompany(operation.companyId);

  return (
    <div className={styles.row}>
      <div className={styles.identity}>
        <p className={styles.name}>{operation.name}</p>
        <p className={styles.company}>
          {company?.name} · {operation.territory}
        </p>
      </div>

      <div className={styles.gauge}>
        <Progress
          className={styles.bar}
          value={(progress.delivered / progress.total) * 100}
        />
        <span className={styles.fraction}>
          {progress.delivered} de {progress.total}
        </span>
      </div>

      <div className={styles.tail}>
        <SubmissionStatusBadge status={progress.status} />
        <Button
          asChild
          variant={complete || progress.closed ? "outline" : "default"}
          className={styles.button}
        >
          <Link href={`/intelligence/capture/operation/${operation.id}`}>
            {progress.closed ? "Ver" : complete ? "Revisar" : "Capturar"}
          </Link>
        </Button>
      </div>
    </div>
  );
}
