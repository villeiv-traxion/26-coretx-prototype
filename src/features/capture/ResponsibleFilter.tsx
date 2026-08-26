"use client";

import { MultiSelectFilter } from "@/ui/MultiSelectFilter";
import { USERS } from "./lib/organization";

/**
 * The responsible combobox.
 *
 * The whole directory, not only the people who currently carry something: the
 * point of asking «what does Marisol have?» is often to find out that the answer
 * is nothing. Past the search threshold it gets its own search box, which
 * eighteen names need.
 */

const OPTIONS = USERS.map((user) => ({
  value: user.id,
  label: user.name,
}));

const styles = {
  field: "h-8 w-48",
};

interface ResponsibleFilterProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function ResponsibleFilter({ value, onChange }: ResponsibleFilterProps) {
  return (
    <div className={styles.field}>
      <MultiSelectFilter
        options={OPTIONS}
        value={value}
        onValueChange={onChange}
        placeholder="Responsable"
        searchPlaceholder="Buscar persona…"
        selectAllLabel="Todos los responsables"
      />
    </div>
  );
}
