/**
 * The rule engine, narrowed to field-scoped rules.
 *
 * Dispatch by kind, no `eval` and no generic parser: the catalog grammar has
 * four known shapes and anything else is ignored visibly rather than accepted
 * in silence.
 *
 * Messages are returned **exactly as the catalog words them**. They are written
 * for the person doing the capture: not reworded, not translated, not
 * "improved".
 */

import type { Indicator, Rule } from "./catalog";
import type { Values } from "./formulas";

export interface Violation {
  fieldId: string;
  message: string;
}

/** `C_L02_faltantes <= C_L02_unidades_contadas` */
const CONSISTENCY = /^(\w+)\s*<=\s*(\w+)$/;
/** `>= 0` */
const RANGE = /^(>=|<=|>|<)\s*(-?[\d.]+)$/;
/** `C_L67_pedidos_totales > 0` */
const NONZERO_BASE = /^(\w+)\s*>\s*0$/;

function evaluate(rule: Rule, values: Values): boolean {
  const value = values[rule.fieldId];
  // An empty field breaks no rule: what an empty field breaks is being there,
  // and that is what `required` is for, not the engine.
  if (typeof value !== "number" || !Number.isFinite(value)) return true;

  switch (rule.kind) {
    case "TYPE":
      return rule.expression === "entero" ? Number.isInteger(value) : true;

    case "RANGE": {
      const m = RANGE.exec(rule.expression);
      if (!m) return true;
      const limit = Number(m[2]);
      if (m[1] === ">=") return value >= limit;
      if (m[1] === "<=") return value <= limit;
      if (m[1] === ">") return value > limit;
      return value < limit;
    }

    case "CONSISTENCY": {
      const m = CONSISTENCY.exec(rule.expression);
      if (!m) return true;
      const total = values[m[2]];
      // Without the total there is nothing to check yet.
      if (typeof total !== "number" || !Number.isFinite(total)) return true;
      return value <= total;
    }

    case "NONZERO_BASE":
      return NONZERO_BASE.test(rule.expression) ? value > 0 : true;

    default:
      return true;
  }
}

/**
 * Returns **every** violation at once, not the first one: whoever is capturing
 * corrects once, not four times in a row.
 */
export function check(indicator: Indicator, values: Values): Violation[] {
  return indicator.rules
    .filter((r) => !evaluate(r, values))
    .map((r) => ({ fieldId: r.fieldId, message: r.message }));
}

/** The violations of a single field, to paint under its input. */
export function checkField(
  indicator: Indicator,
  fieldId: string,
  values: Values,
): string[] {
  return check(indicator, values)
    .filter((v) => v.fieldId === fieldId)
    .map((v) => v.message);
}

/** An indicator is delivered when every field is in and none of them fails. */
export function isComplete(indicator: Indicator, values: Values): boolean {
  const allPresent = indicator.fields.every(
    (f) =>
      !f.required ||
      (typeof values[f.id] === "number" && Number.isFinite(values[f.id])),
  );
  return allPresent && check(indicator, values).length === 0;
}
