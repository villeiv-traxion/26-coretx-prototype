"use client";

import { X } from "lucide-react";
import { Button } from "@traxion-global/design-system/react";
import { FilterSearch } from "@/ui/FilterSearch";
import { MultiSelectFilter } from "@/ui/MultiSelectFilter";
import type { Completeness } from "./lib/compliance";
import { COMPLETENESS_LABELS } from "./CompletenessBadge";
import { CompanyFilter } from "./CompanyFilter";

/**
 * Narrowing the rail: by name, by company and by how much is in.
 *
 * Laid out the way the PGD table filters are — one row, every control the same
 * height and width, search first and the clear button only once something is
 * on. Two products that filter lists should not make people learn it twice.
 *
 * The search matches the operation name and nothing else. The company has its
 * own combobox: a name typed into a free-text box that silently also matches
 * companies makes it impossible to tell why a row survived.
 *
 * The state filter reuses the badge labels rather than wording its own, so the
 * thing you pick and the thing you then see on screen are the same word.
 */

const STATE_ORDER: Completeness[] = ["PENDING", "PARTIAL", "COMPLETE"];

const STATE_OPTIONS = STATE_ORDER.map((key) => ({
  value: key,
  label: COMPLETENESS_LABELS[key].text,
}));

const styles = {
  root: "flex flex-1 flex-wrap items-center gap-2",
  // Every control at 32px: the DS Input is h-10 and Button triggers are h-8.
  field: "h-8 w-48",
  clearIcon: "h-4 w-4",
};

interface OperationFiltersProps {
  query: string;
  onQueryChange: (query: string) => void;
  companies: string[];
  onCompaniesChange: (companies: string[]) => void;
  states: Completeness[];
  onStatesChange: (states: Completeness[]) => void;
  onClear: () => void;
  /** Whether anything is narrowing the rail right now. */
  active: boolean;
}

export function OperationFilters({
  query,
  onQueryChange,
  companies,
  onCompaniesChange,
  states,
  onStatesChange,
  onClear,
  active,
}: OperationFiltersProps) {
  return (
    <div className={styles.root}>
      <FilterSearch
        value={query}
        onChange={onQueryChange}
        placeholder="Buscar operación"
      />

      <CompanyFilter value={companies} onChange={onCompaniesChange} />

      <div className={styles.field}>
        <MultiSelectFilter
          options={STATE_OPTIONS}
          value={states}
          onValueChange={(values) => onStatesChange(values as Completeness[])}
          placeholder="Estado"
          selectAllLabel="Todos los estados"
        />
      </div>

      {active ? (
        <Button variant="outline" onClick={onClear}>
          <X className={styles.clearIcon} />
          Limpiar
        </Button>
      ) : null}
    </div>
  );
}
