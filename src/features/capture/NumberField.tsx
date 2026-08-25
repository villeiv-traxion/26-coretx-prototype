"use client";

import { HelpCircle } from "lucide-react";
import {
  Input,
  Label,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@traxion-global/design-system/react";
import type { Field } from "./lib/catalog";

/**
 * One field of the form, generated from the catalog.
 *
 * Help goes in a tooltip and not under the field: they are paragraphs, and
 * twenty-four paragraphs turn a form into a document.
 *
 * The error is said in text and marked with `aria-invalid`, never with colour
 * alone, and the message is the one the catalog carries — written for whoever
 * is capturing, unedited.
 */

const styles = {
  block: "flex flex-col gap-1.5",
  row: "flex items-center gap-1.5",
  label: "text-xs font-medium leading-tight",
  help: "h-3.5 w-3.5 shrink-0 cursor-help text-muted-foreground",
  helpText: "max-w-xs text-xs leading-snug",
  control: "relative",
  input: "h-9 pr-14 text-sm tabular-nums",
  unit: "pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground",
  error: "text-xs leading-snug text-destructive",
};

interface NumberFieldProps {
  field: Field;
  value: number | undefined;
  errors: string[];
  readOnly: boolean;
  onChange: (value: number | undefined) => void;
}

export function NumberField({
  field,
  value,
  errors,
  readOnly,
  onChange,
}: NumberFieldProps) {
  const errorId = `${field.id}-error`;

  return (
    <div className={styles.block}>
      <div className={styles.row}>
        <Label htmlFor={field.id} className={styles.label}>
          {field.label}
        </Label>
        {field.help ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle
                className={styles.help}
                aria-label={`Qué es ${field.label}`}
              />
            </TooltipTrigger>
            <TooltipContent className={styles.helpText}>
              {field.help}
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>

      <div className={styles.control}>
        <Input
          id={field.id}
          type="number"
          inputMode="decimal"
          className={styles.input}
          step={field.decimals === 0 ? 1 : 10 ** -field.decimals}
          min={field.min ?? undefined}
          max={field.max ?? undefined}
          value={value ?? ""}
          readOnly={readOnly}
          disabled={readOnly}
          aria-invalid={errors.length > 0}
          aria-describedby={errors.length > 0 ? errorId : undefined}
          onChange={(e) => {
            const raw = e.target.value;
            onChange(raw === "" ? undefined : Number(raw));
          }}
        />
        {field.unit ? <span className={styles.unit}>{field.unit}</span> : null}
      </div>

      {errors.length > 0 ? (
        <div id={errorId}>
          {errors.map((message) => (
            <p key={message} className={styles.error}>
              {message}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
