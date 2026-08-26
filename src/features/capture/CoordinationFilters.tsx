"use client";

import { X } from "lucide-react";
import { Button, Label, Switch } from "@traxion-global/design-system/react";
import { FilterSearch } from "@/ui/FilterSearch";
import { CompanyFilter } from "./CompanyFilter";
import { ResponsibleFilter } from "./ResponsibleFilter";

/**
 * The filter bar of the coordination screens.
 *
 * Same row, same 32px controls and same clear button as the capture rail: both
 * profiles are narrowing a list of the same operations, and it would be odd to
 * do it two different ways one tab apart.
 *
 * What it drops is the state filter, which belongs to a single week and has no
 * meaning across a year. What it adds is the gap: an operation nobody delivers
 * is the thing coordination is here to close, and it deserves its own switch
 * rather than a column to scan for.
 */

const styles = {
  root: "flex flex-1 flex-wrap items-center gap-2",
  toggle: "flex h-8 items-center gap-2",
  toggleLabel: "cursor-pointer whitespace-nowrap text-xs text-muted-foreground",
  clearIcon: "h-4 w-4",
};

interface CoordinationFiltersProps {
  query: string;
  onQueryChange: (query: string) => void;
  companies: string[];
  onCompaniesChange: (companies: string[]) => void;
  responsibles: string[];
  onResponsiblesChange: (responsibles: string[]) => void;
  unassignedOnly: boolean;
  onUnassignedOnlyChange: (only: boolean) => void;
  onClear: () => void;
  active: boolean;
}

export function CoordinationFilters({
  query,
  onQueryChange,
  companies,
  onCompaniesChange,
  responsibles,
  onResponsiblesChange,
  unassignedOnly,
  onUnassignedOnlyChange,
  onClear,
  active,
}: CoordinationFiltersProps) {
  return (
    <div className={styles.root}>
      <FilterSearch
        value={query}
        onChange={onQueryChange}
        placeholder="Buscar operación"
      />

      <CompanyFilter value={companies} onChange={onCompaniesChange} />

      <ResponsibleFilter
        value={responsibles}
        onChange={onResponsiblesChange}
      />

      <div className={styles.toggle}>
        <Switch
          id="unassigned-only"
          checked={unassignedOnly}
          onCheckedChange={onUnassignedOnlyChange}
        />
        <Label htmlFor="unassigned-only" className={styles.toggleLabel}>
          Solo sin responsable
        </Label>
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
