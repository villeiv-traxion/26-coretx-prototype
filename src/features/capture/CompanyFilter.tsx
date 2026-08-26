"use client";

import { MultiSelectFilter } from "@/ui/MultiSelectFilter";
import { COMPANIES } from "./lib/organization";

/**
 * The company combobox, shared by every filter bar in the app so the two
 * profiles narrow a list of operations the same way.
 */

const OPTIONS = COMPANIES.map((company) => ({
  value: company.id,
  label: company.name,
}));

const styles = {
  field: "h-8 w-48",
};

interface CompanyFilterProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function CompanyFilter({ value, onChange }: CompanyFilterProps) {
  return (
    <div className={styles.field}>
      <MultiSelectFilter
        options={OPTIONS}
        value={value}
        onValueChange={onChange}
        placeholder="Compañía"
        selectAllLabel="Todas las compañías"
      />
    </div>
  );
}
