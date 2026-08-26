"use client";

import { Search } from "lucide-react";
import { Input } from "@traxion-global/design-system/react";

/**
 * The search box of a filter bar, shaped like the ones in the PGD tables: a
 * 32px field with the icon inside it on the left.
 *
 * Shared so every filter bar in the app has the same one. The design system has
 * no input with an adornment, so this is the wrapper that adds it.
 */

const styles = {
  wrapper: "relative w-48",
  icon: "pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
  input: "h-8 w-full pl-9",
};

interface FilterSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export function FilterSearch({
  value,
  onChange,
  placeholder,
}: FilterSearchProps) {
  return (
    <div className={styles.wrapper}>
      <Search className={styles.icon} aria-hidden />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={styles.input}
        aria-label={placeholder}
      />
    </div>
  );
}
