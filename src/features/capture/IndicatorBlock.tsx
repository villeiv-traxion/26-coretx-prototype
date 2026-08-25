"use client";

import { Check } from "lucide-react";
import {
  Card,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@traxion-global/design-system/react";
import type { Indicator } from "./lib/catalog";
import { compute, formatResult, type Values } from "./lib/formulas";
import { check, isComplete } from "./lib/rules";
import { NumberField } from "./NumberField";

/**
 * One indicator of the form: its fields and **its result, computed live**.
 *
 * The result is computed and never captured. Showing it while the person types
 * turns that invariant into something visible: it appears the moment the last
 * field lands, and if an absurd number comes out — an IRA of 12% — the mistake
 * surfaces here instead of three weeks later on a dashboard.
 */

const styles = {
  card: "overflow-hidden shadow-none",
  header:
    "flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b bg-muted/40 px-4 py-3",
  identity: "flex min-w-0 items-baseline gap-2",
  key: "shrink-0 text-xs font-semibold tabular-nums text-muted-foreground",
  name: "text-sm font-medium leading-tight",
  result: "flex items-center gap-2",
  done: "h-4 w-4 text-primary-dark",
  figure: "text-base font-semibold tabular-nums",
  figureEmpty: "text-base font-semibold tabular-nums text-muted-foreground",
  caption: "text-[0.6875rem] uppercase tracking-wider text-muted-foreground",
  formula: "max-w-sm text-xs leading-snug",
  fields: "grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3",
};

interface IndicatorBlockProps {
  indicator: Indicator;
  values: Values;
  readOnly: boolean;
  onChange: (fieldId: string, value: number | undefined) => void;
}

export function IndicatorBlock({
  indicator,
  values,
  readOnly,
  onChange,
}: IndicatorBlockProps) {
  const violations = check(indicator, values);
  const result = compute(indicator.id, values);
  const complete = isComplete(indicator, values);

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <div className={styles.identity}>
          <span className={styles.key}>{indicator.id}</span>
          <h3 className={styles.name}>{indicator.name}</h3>
        </div>

        <div className={styles.result}>
          {complete ? <Check className={styles.done} /> : null}
          <span className={styles.caption}>Resultado</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={result === null ? styles.figureEmpty : styles.figure}
              >
                {formatResult(result)}
              </span>
            </TooltipTrigger>
            <TooltipContent className={styles.formula}>
              {indicator.formula}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className={styles.fields}>
        {indicator.fields.map((field) => (
          <NumberField
            key={field.id}
            field={field}
            value={values[field.id]}
            readOnly={readOnly}
            errors={violations
              .filter((v) => v.fieldId === field.id)
              .map((v) => v.message)}
            onChange={(value) => onChange(field.id, value)}
          />
        ))}
      </div>
    </Card>
  );
}
