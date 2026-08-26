"use client";

import { X } from "lucide-react";
import {
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@traxion-global/design-system/react";
import { FilterSearch } from "@/ui/FilterSearch";
import { WEEK_RANGES, type WeekRange } from "./lib/filters";
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
  field: "h-8 w-40",
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
  /** How many weeks the table shows. Omit on screens without a week axis. */
  range?: WeekRange;
  onRangeChange?: (range: WeekRange) => void;
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
  range,
  onRangeChange,
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

      {range && onRangeChange ? (
        <Select
          value={String(range)}
          onValueChange={(value) => onRangeChange(Number(value) as WeekRange)}
        >
          <SelectTrigger className={styles.field} aria-label="Rango de semanas">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WEEK_RANGES.map((weeks) => (
              <SelectItem key={weeks} value={String(weeks)}>
                Últimas {weeks} semanas
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

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
