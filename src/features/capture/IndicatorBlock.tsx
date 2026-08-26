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
 * One indicator on a single line: what it is, the numbers it takes, and **its
 * result, computed live**.
 *
 * Name, fields and result read left to right because that is the order of the
 * sentence they make — this measure, from these numbers, comes out at this. Cut
 * into a header and a body, the same three parts read as three separate things
 * stacked by accident.
 *
 * The result is computed and never captured. Showing it while the person types
 * turns that invariant into something visible: it appears the moment the last
 * field lands, and if an absurd number comes out — an IRA of 12% — the mistake
 * surfaces here instead of three weeks later on a dashboard.
 */

const styles = {
  // Tinted ground so the inputs, which the design system already gives a white
  // one, come forward as the part to fill in.
  card: "flex flex-col gap-3 bg-muted/70 p-4 shadow-none lg:flex-row lg:items-center lg:gap-5",
  // The code on its own line above the name: side by side it stole width from
  // a name that needs all of it.
  //
  // Identity is a fixed width and the slack goes after the fields instead.
  // Letting it stretch made the column wider on the cards with two fields than
  // on the ones with three, so the first input landed at a different place
  // down a column of eleven and the whole form looked ragged.
  //
  // The cost is the longest name, which needs about 390px and only gets it on
  // a wide screen. Two lines on one card beats eleven misaligned rows.
  identity: "flex min-w-0 flex-col gap-0.5 lg:w-72 lg:shrink-0 2xl:w-96",
  // `font-medium`, not semibold: the layout loads Roboto at 400, 500 and 700,
  // so a 600 would be synthesised into the 700 and come out heavier than asked.
  key: "text-sm font-medium tabular-nums text-muted-foreground",
  name: "text-sm font-medium leading-tight",
  // The field area takes everything the name and the result do not, and the
  // fields split it evenly. Fixed-width fields left the slack sitting between
  // the last input and the result, and since it measured exactly one field it
  // read as an empty fourth slot.
  //
  // The trade is that two fields come out wider than three. Nothing is left
  // over to misread.
  fields: "flex min-w-0 flex-1 flex-col gap-4 sm:flex-row",
  field: "min-w-0 sm:flex-1 sm:basis-0",
  // Shaped like a field — same height, label above — because it belongs to the
  // same row of numbers, but far narrower: it only ever holds a percentage to
  // one decimal, and a field-width box for "98.5%" is mostly empty.
  //
  // The dashed border is what says it is not a field: this value is computed,
  // and there is nowhere to type it.
  result: "flex shrink-0 flex-col gap-1.5 sm:w-24",
  caption: "text-xs font-medium leading-tight text-muted-foreground",
  box: "flex h-9 items-center justify-between gap-2 rounded-md border border-dashed border-input px-3",
  done: "h-4 w-4 shrink-0 text-primary-dark",
  figure: "text-sm font-semibold tabular-nums",
  figureEmpty: "text-sm font-semibold tabular-nums text-muted-foreground",
  formula: "max-w-sm text-xs leading-snug",
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
      <div className={styles.identity}>
        <span className={styles.key}>{indicator.id}</span>
        <h3 className={styles.name}>{indicator.name}</h3>
      </div>

      <div className={styles.fields}>
        {indicator.fields.map((field) => (
          <div key={field.id} className={styles.field}>
            <NumberField
              field={field}
              value={values[field.id]}
              readOnly={readOnly}
              errors={violations
                .filter((v) => v.fieldId === field.id)
                .map((v) => v.message)}
              onChange={(value) => onChange(field.id, value)}
            />
          </div>
        ))}
      </div>

      <div className={styles.result}>
        <p className={styles.caption}>Resultado</p>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={styles.box} title={indicator.formula}>
              <span
                className={result === null ? styles.figureEmpty : styles.figure}
              >
                {formatResult(result)}
              </span>
              {complete ? <Check className={styles.done} /> : null}
            </div>
          </TooltipTrigger>
          <TooltipContent className={styles.formula}>
            {indicator.formula}
          </TooltipContent>
        </Tooltip>
      </div>
    </Card>
  );
}
