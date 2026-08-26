"use client";

import { useState } from "react";
import {
  Button,
  Label,
  NoDataMessage,
  Progress,
  Switch,
  toast,
} from "@traxion-global/design-system/react";
import { Alert } from "@/ui/Alert";
import { INDICATORS } from "./lib/catalog";
import type { Values } from "./lib/formulas";
import { check, isComplete } from "./lib/rules";
import { useActions, useStore } from "./lib/store";
import { useNow } from "./lib/now";
import { completenessOf, valuesFor } from "./lib/compliance";
import { getCompany, getOperation } from "./lib/organization";
import {
  cutoffInWords,
  isClosed,
  rangeInWords,
  type Period,
} from "./lib/periods";
import { IndicatorBlock } from "./IndicatorBlock";
import { CompletenessBadge } from "./CompletenessBadge";

/**
 * The capture matrix for one operation in one week.
 *
 * Eleven blocks, twenty-four fields, a single button. It replaces eleven
 * separate forms: the whole operation is captured in one go, because whoever
 * captures thinks about their warehouse and not about loose indicators.
 *
 * Past the cutoff the screen still exists, read-only. Hiding it would leave the
 * person with no way to check what it was that they delivered.
 *
 * It renders inside the workspace, beside the list, so it carries no way back of
 * its own: the breadcrumb and the list are both already on screen.
 */

const styles = {
  panel: "flex flex-col gap-4",
  header: "flex flex-wrap items-start justify-between gap-3",
  identity: "flex min-w-0 flex-col gap-1",
  title: "text-lg font-semibold leading-tight sm:text-xl",
  context: "text-sm text-muted-foreground",
  // Badge and switch stack on the right so the head stays two rows tall, in
  // step with the title and its line of context on the left.
  side: "flex shrink-0 flex-col items-end gap-2",
  toggle: "flex items-center gap-2",
  toggleLabel: "cursor-pointer text-xs text-muted-foreground",
  blocks: "flex flex-col gap-3",
  empty: "py-10",
  footer: "flex flex-wrap items-center justify-between gap-6 pt-1",
  gauge: "flex min-w-[12rem] flex-1 items-center gap-3",
  bar: "h-2 flex-1",
  fraction: "shrink-0 text-sm tabular-nums",
};

interface CaptureFormProps {
  operationId: string;
  /**
   * Which week to show. A prop and not a read of the URL: the compliance table
   * opens a cell whose week has nothing to do with the one in the address bar.
   */
  period: Period;
}

export function CaptureForm({ operationId, period }: CaptureFormProps) {
  const state = useStore();
  const now = useNow();
  const { save } = useActions();

  const closed = isClosed(period, now);

  const operation = getOperation(operationId);
  const company = operation ? getCompany(operation.companyId) : undefined;
  const stored = valuesFor(state, operationId, period, now);

  const [draft, setDraft] = useState<Values>(stored);
  const values = closed ? stored : draft;

  // Re-derived on every keystroke: an indicator drops off the list the moment
  // its last field lands. It does mean the rows below shift up while you type.
  const [pendingOnly, setPendingOnly] = useState(false);
  const shown = pendingOnly
    ? INDICATORS.filter((i) => !isComplete(i, values))
    : INDICATORS;

  const delivered = INDICATORS.filter((i) => isComplete(i, values)).length;
  const failures = INDICATORS.flatMap((i) => check(i, values));

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
      `Puedes modificarlos hasta el ${cutoffInWords(period)}.`,
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.identity}>
          <h2 className={styles.title}>{operation.name}</h2>
          <p className={styles.context}>
            {company?.name} · Semana {period.week} · {rangeInWords(period)}
          </p>
        </div>
        <div className={styles.side}>
          <CompletenessBadge
            state={completenessOf({ delivered, total: INDICATORS.length })}
          />
          <div className={styles.toggle}>
            <Switch
              id="pending-only"
              checked={pendingOnly}
              onCheckedChange={setPendingOnly}
            />
            <Label htmlFor="pending-only" className={styles.toggleLabel}>
              Mostrar solo indicadores sin llenar
            </Label>
          </div>
        </div>
      </div>

      {closed ? (
        <Alert
          title={`La semana ${period.week} cerró el ${cutoffInWords(period)}`}
          description="Lo que hay aquí es el dato oficial y ya no se puede modificar."
        />
      ) : null}

      {shown.length === 0 ? (
        <div className={styles.empty}>
          <NoDataMessage
            title="No falta ninguno"
            message="Los once indicadores de esta semana ya están capturados. Apaga el interruptor para volver a verlos."
          />
        </div>
      ) : (
        <div className={styles.blocks}>
          {shown.map((indicator) => (
            <IndicatorBlock
              key={indicator.id}
              indicator={indicator}
              values={values}
              readOnly={closed}
              onChange={onFieldChange}
            />
          ))}
        </div>
      )}

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

        {closed ? null : <Button onClick={onSave}>Guardar</Button>}
      </div>
    </div>
  );
}
