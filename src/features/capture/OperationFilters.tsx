"use client";

import { Search, X } from "lucide-react";
import { Button, Input } from "@traxion-global/design-system/react";
import { MultiSelectFilter } from "@/ui/MultiSelectFilter";
import type { Completeness } from "./lib/compliance";
import { COMPANIES } from "./lib/organization";
import { COMPLETENESS_LABELS } from "./CompletenessBadge";

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

const COMPANY_OPTIONS = COMPANIES.map((company) => ({
  value: company.id,
  label: company.name,
}));

const styles = {
  root: "flex flex-1 flex-wrap items-center gap-2",
  // Every control at 32px: the DS Input is h-10 and Button triggers are h-8.
  field: "h-8 w-48",
  searchWrapper: "relative w-48",
  searchIcon:
    "pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
  searchInput: "h-8 w-full pl-9",
  clearIcon: "h-4 w-4",
  count: "text-xs text-muted-foreground",
};

interface OperationFiltersProps {
  query: string;
  onQueryChange: (query: string) => void;
  companies: string[];
  onCompaniesChange: (companies: string[]) => void;
  states: Completeness[];
  onStatesChange: (states: Completeness[]) => void;
  /** Showing / total, so a shrunken rail never looks like a missing assignment. */
  showing: number;
  total: number;
}

export function OperationFilters({
  query,
  onQueryChange,
  companies,
  onCompaniesChange,
  states,
  onStatesChange,
  showing,
  total,
}: OperationFiltersProps) {
  const active =
    query.trim() !== "" || companies.length > 0 || states.length > 0;

  return (
    <div className={styles.root}>
      <div className={styles.searchWrapper}>
        <Search className={styles.searchIcon} aria-hidden />
        <Input
          placeholder="Buscar operación"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          className={styles.searchInput}
          aria-label="Buscar operación"
        />
      </div>

      <div className={styles.field}>
        <MultiSelectFilter
          options={COMPANY_OPTIONS}
          value={companies}
          onValueChange={onCompaniesChange}
          placeholder="Compañía"
          selectAllLabel="Todas las compañías"
        />
      </div>

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
        <>
          <Button
            variant="outline"
            onClick={() => {
              onQueryChange("");
              onCompaniesChange([]);
              onStatesChange([]);
            }}
          >
            <X className={styles.clearIcon} />
            Limpiar
          </Button>
          <span className={styles.count}>
            {showing} de {total}
          </span>
        </>
      ) : null}
    </div>
  );
}
