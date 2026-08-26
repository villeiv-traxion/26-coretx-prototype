"use client";

import { Input, Label } from "@traxion-global/design-system/react";
import type { Field } from "./lib/catalog";

/**
 * One field of the form, generated from the catalog.
 *
 * The catalog carries a paragraph of help for most fields and none of it is
 * shown here: twenty-four question marks down a form is twenty-four invitations
 * to stop and read before typing the number you already knew. The text stays in
 * the data, waiting for a better place to put it.
 *
 * The error is said in text and marked with `aria-invalid`, never with colour
 * alone, and the message is the one the catalog carries — written for whoever
 * is capturing, unedited.
 */

/**
 * Shorter labels for the few that do not fit a 9rem field on one line.
 *
 * They live here and not in the catalog on purpose: the catalog is generated
 * from the source system and its wording is kept verbatim, so how much of it
 * fits on screen is this layer's problem. The full label stays on the element
 * as its `title`, so nothing typed into these fields is named by a guess.
 */
const SHORT_LABELS: Record<string, string> = {
  C_L15_metros_cuadrados_disponibles: "m² disponibles",
  C_L15_metros_cuadrados_totales: "m² totales",
  C_L30_horas_laboradas_normales: "Horas normales",
  C_L42_incidencias_y_reclamaciones: "Incidencias y recl.",
};

/**
 * Right padding per unit.
 *
 * The browser draws the number spinner at the right edge of the content box, so
 * the padding is what stands between the arrows and the unit behind them. One
 * value for every unit meant the gap was right for «unidades» and enormous for
 * «m²», which are 45px and 14px of text.
 *
 * The catalog only ever uses these four, and an unknown one falls back to the
 * widest — too much room reads as a wide field, too little as a collision.
 */
const UNIT_PADDING: Record<string, string> = {
  "m²": "pr-9",
  horas: "pr-14",
  unidades: "pr-[4.5rem]",
  personas: "pr-[4.5rem]",
};

const FALLBACK_PADDING = "pr-[4.5rem]";

const styles = {
  block: "flex flex-col gap-1.5",
  label: "truncate text-xs font-medium leading-tight",
  control: "relative",
  input: "h-9 text-sm tabular-nums",
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
  const padding = field.unit
    ? (UNIT_PADDING[field.unit] ?? FALLBACK_PADDING)
    : "";

  return (
    <div className={styles.block}>
      <Label
        htmlFor={field.id}
        className={styles.label}
        title={field.label}
      >
        {SHORT_LABELS[field.id] ?? field.label}
      </Label>

      <div className={styles.control}>
        <Input
          id={field.id}
          type="number"
          inputMode="decimal"
          className={`${styles.input} ${padding}`}
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
