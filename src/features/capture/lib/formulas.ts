/**
 * The eleven formulas.
 *
 * The result is computed, never captured: there is no field to type a
 * percentage into, not here and not in the form. That is the reason this file
 * has to exist.
 *
 * Each function carries, in its comment, the formula exactly as the catalog
 * words it — prose written by a person, and **unsigned**. They were transcribed
 * by hand, one at a time, so they can be checked line by line when someone
 * reviews them.
 */

import { INDICATORS } from "./catalog";

export type Values = Record<string, number>;

type Formula = (v: Values) => number | null;

/** Divides while guarding the base: no denominator means no result, not zero. */
function ratio(numerator: number, base: number): number | null {
  if (!Number.isFinite(numerator) || !Number.isFinite(base) || base === 0) {
    return null;
  }
  return numerator / base;
}

const FORMULAS: Record<string, Formula> = {
  // 1 - (ABS(Sobrantes - Faltantes) / Unidades contadas)
  // Absolute value of a DIFFERENCE, not of a sum.
  L02: (v) => {
    const r = ratio(
      Math.abs(v.C_L02_sobrantes - v.C_L02_faltantes),
      v.C_L02_unidades_contadas,
    );
    return r === null ? null : 1 - r;
  },

  // 1 - (Vacantes de personal / Requerimiento aprobado)
  L11: (v) => {
    const r = ratio(
      v.C_L11_vacantes_de_personal,
      v.C_L11_requerimiento_aprobado,
    );
    return r === null ? null : 1 - r;
  },

  // Metros cuadrados disponibles / Metros cuadrados totales
  L15: (v) =>
    ratio(
      v.C_L15_metros_cuadrados_disponibles,
      v.C_L15_metros_cuadrados_totales,
    ),

  // Horas extra / Horas laboradas, where
  //   Horas extra     = dobles + triples
  //   Horas laboradas = horas extra + normales
  // The denominator is DERIVED; it is not a captured field.
  L30: (v) => {
    const overtime = v.C_L30_horas_extra_dobles + v.C_L30_horas_extra_triples;
    return ratio(overtime, overtime + v.C_L30_horas_laboradas_normales);
  },

  // 1 - (Ubicaciones con error / Ubicaciones auditadas)
  L37: (v) => {
    const r = ratio(
      v.C_L37_ubicaciones_con_error,
      v.C_L37_ubicaciones_auditadas,
    );
    return r === null ? null : 1 - r;
  },

  // Descargas en tiempo / Descargas totales
  L38: (v) => ratio(v.C_L38_descargas_en_tiempo, v.C_L38_descargas_totales),

  // Cargas en tiempo / Cargas totales
  L39: (v) => ratio(v.C_L39_cargas_en_tiempo, v.C_L39_cargas_totales),

  // Incidencias y reclamaciones (empresa + cliente) / Notas embarcadas
  L42: (v) =>
    ratio(v.C_L42_incidencias_y_reclamaciones, v.C_L42_notas_embarcadas),

  // IDs on time / IDs de recibo
  L58: (v) => ratio(v.C_L58_id_s_on_time, v.C_L58_id_s_de_recibo),

  // Escaneo interno / Escaneo Amazon
  L64: (v) => ratio(v.C_L64_escaneo_interno, v.C_L64_escaneo_amazon),

  // Pedidos perfectos / Pedidos totales
  L67: (v) => ratio(v.C_L67_pedidos_perfectos, v.C_L67_pedidos_totales),
};

/**
 * An indicator result, or `null` when a field is missing. A half-filled
 * indicator does not have a partial result: it has no result.
 */
export function compute(indicatorId: string, values: Values): number | null {
  const indicator = INDICATORS.find((i) => i.id === indicatorId);
  const formula = FORMULAS[indicatorId];
  if (!indicator || !formula) return null;

  const complete = indicator.fields.every(
    (f) => typeof values[f.id] === "number" && Number.isFinite(values[f.id]),
  );
  if (!complete) return null;

  const result = formula(values);
  return result === null || !Number.isFinite(result) ? null : result;
}

/** All eleven are percentages. Painted x100 with one decimal. */
export function formatResult(result: number | null): string {
  if (result === null) return "—";
  return `${(result * 100).toFixed(1)}%`;
}
