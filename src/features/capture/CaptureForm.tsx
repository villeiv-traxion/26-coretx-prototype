"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import {
  Button,
  Card,
  Progress,
  toast,
} from "@traxion-global/design-system/react";
import { INDICATORS } from "./lib/catalog";
import type { Values } from "./lib/formulas";
import { check, isComplete } from "./lib/rules";
import { useActions, useNow, useStore } from "./lib/store";
import { savedAt, valuesFor } from "./lib/compliance";
import { getCompany, getOperation } from "./lib/organization";
import {
  cutoffInWords,
  isClosed,
  periodOf,
  rangeInWords,
  timeLeft,
} from "./lib/periods";
import { IndicatorBlock } from "./IndicatorBlock";
import { SubmissionStatusBadge } from "./SubmissionStatusBadge";

/**
 * The capture matrix for one operation in one week.
 *
 * Eleven blocks, twenty-four fields, a single button. It replaces eleven
 * separate forms: the whole operation is captured in one go, because whoever
 * captures thinks about their warehouse and not about loose indicators.
 *
 * Past the cutoff the screen still exists, read-only. Hiding it would leave the
 * person with no way to check what it was that they delivered.
 */

const styles = {
  page: "flex flex-col gap-5 pb-24",
  back: "-ml-2 h-8 gap-1.5 self-start px-2 text-xs text-muted-foreground",
  backIcon: "h-3.5 w-3.5",
  header: "flex flex-wrap items-start justify-between gap-4",
  identity: "flex flex-col gap-1",
  title: "text-xl font-semibold leading-tight sm:text-2xl",
  context: "text-sm text-muted-foreground",
  status: "flex flex-col items-end gap-1",
  deadline: "text-sm font-medium tabular-nums",
  notice:
    "flex items-start gap-3 border-l-4 border-secondary bg-muted/60 px-4 py-3 text-sm shadow-none",
  noticeIcon: "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground",
  noticeText: "leading-snug",
  blocks: "flex flex-col gap-3",
  footer:
    "sticky bottom-0 -mx-4 mt-2 flex flex-wrap items-center justify-between gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur",
  gauge: "flex min-w-[12rem] flex-1 items-center gap-3",
  bar: "h-2 max-w-xs flex-1",
  fraction: "text-sm tabular-nums",
  actions: "flex items-center gap-2",
};

export function CaptureForm({ operationId }: { operationId: string }) {
  const state = useStore();
  const now = useNow();
  const { save } = useActions();

  const period = periodOf(now);
  const closed = isClosed(period, now);
  const remaining = timeLeft(period, now);

  const operation = getOperation(operationId);
  const company = operation ? getCompany(operation.companyId) : undefined;
  const stored = valuesFor(state, operationId, period, now);

  const [draft, setDraft] = useState<Values>(stored);
  const values = closed ? stored : draft;

  const delivered = INDICATORS.filter((i) => isComplete(i, values)).length;
  const failures = INDICATORS.flatMap((i) => check(i, values));
  const alreadySaved = savedAt(state, operationId, period);

  if (!operation) return null;

  function onFieldChange(fieldId: string, value: number | undefined) {
    setDraft((previous) => {
      const next = { ...previous };
      if (value === undefined || Number.isNaN(value)) delete next[fieldId];
      else next[fieldId] = value;
      return next;
    });
  }

  function onSave() {
    // Every message comes back at once: whoever captures corrects one time.
    if (failures.length > 0) {
      toast.error(
        `Hay ${failures.length} ${failures.length === 1 ? "dato que revisar" : "datos que revisar"}`,
        "Los campos marcados en rojo explican qué está mal. Nada se guardó.",
      );
      return;
    }

    save(operationId, period, draft);
    toast.success(
      "Gracias, tus datos quedaron guardados",
      `Están como borrador: puedes modificarlos hasta el ${cutoffInWords(period)}.`,
    );
  }

  return (
    <div className={styles.page}>
      <Button asChild variant="ghost" className={styles.back}>
        <Link href="/intelligence/capture">
          <ArrowLeft className={styles.backIcon} />
          Mis operaciones
        </Link>
      </Button>

      <div className={styles.header}>
        <div className={styles.identity}>
          <h1 className={styles.title}>{operation.name}</h1>
          <p className={styles.context}>
            {company?.name} · Semana {period.week} · {rangeInWords(period)}
          </p>
        </div>
        <div className={styles.status}>
          <SubmissionStatusBadge
            status={
              delivered === 0
                ? closed
                  ? "MISSED"
                  : "PENDING"
                : closed
                  ? "OFFICIAL"
                  : "DRAFT"
            }
          />
          {remaining ? (
            <span className={styles.deadline}>Cierra en {remaining}</span>
          ) : null}
        </div>
      </div>

      {closed ? (
        <Card className={styles.notice}>
          <Lock className={styles.noticeIcon} />
          <p className={styles.noticeText}>
            La semana {period.week} cerró el {cutoffInWords(period)}. Lo que hay
            aquí es el dato oficial y ya no se puede modificar.
          </p>
        </Card>
      ) : null}

      <div className={styles.blocks}>
        {INDICATORS.map((indicator) => (
          <IndicatorBlock
            key={indicator.id}
            indicator={indicator}
            values={values}
            readOnly={closed}
            onChange={onFieldChange}
          />
        ))}
      </div>

      <div className={styles.footer}>
        <div className={styles.gauge}>
          <Progress
            className={styles.bar}
            value={(delivered / INDICATORS.length) * 100}
          />
          <span className={styles.fraction}>
            {delivered} de {INDICATORS.length} indicadores
          </span>
        </div>

        {closed ? null : (
          <div className={styles.actions}>
            {alreadySaved ? (
              <Button asChild variant="outline">
                <Link href="/intelligence/capture">Seguir con otra</Link>
              </Button>
            ) : null}
            <Button onClick={onSave}>Guardar</Button>
          </div>
        )}
      </div>
    </div>
  );
}
