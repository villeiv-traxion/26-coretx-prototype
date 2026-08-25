"use client";

import * as React from "react";
import { Check, ChevronDown, Minus } from "lucide-react";
import { cn } from "@traxion-global/design-system";
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@traxion-global/design-system/react";

/**
 * A combobox that filters by several values at once.
 *
 * Ported from the table filters of the PGD project so the two products filter
 * the same way; the CSS prefix that project needs for shell isolation is
 * dropped here.
 *
 * The search box only appears past a threshold. Below it, a search input over
 * four options is one more thing to read before finding what was already on
 * screen.
 */

export interface MultiSelectFilterOption {
  value: string;
  label: string;
}

export interface MultiSelectFilterProps {
  options: MultiSelectFilterOption[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  selectAllLabel?: string;
  emptyMessage?: string;
  /** The search input is rendered when `options.length` exceeds this. */
  searchThreshold?: number;
  className?: string;
}

const styles = {
  trigger: "w-full justify-between gap-2 font-normal",
  triggerActive: "border-primary",
  triggerLabel: "min-w-0 flex-1 truncate text-left",
  placeholder: "text-muted-foreground",
  triggerRight: "flex shrink-0 items-center gap-2",
  countBadge:
    "flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium leading-none text-primary-foreground",
  countHidden: "invisible",
  chevron: "h-4 w-4 opacity-50",
  content: "w-[var(--radix-popover-trigger-width)] p-0",
  command: "max-h-[320px]",
  search: "h-9",
  selectAllRow:
    "flex cursor-pointer select-none items-center gap-2 border-b px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none",
  itemRow: "flex items-center gap-2 text-popover-foreground",
  checkSlot: "flex h-4 w-4 shrink-0 items-center justify-center",
  checkIcon: "h-4 w-4 text-popover-foreground",
};

export const MultiSelectFilter = React.forwardRef<
  HTMLButtonElement,
  MultiSelectFilterProps
>(
  (
    {
      options,
      value,
      defaultValue,
      onValueChange,
      placeholder = "Selecciona…",
      searchPlaceholder = "Buscar…",
      selectAllLabel = "Seleccionar todas",
      emptyMessage = "Sin resultados.",
      searchThreshold = 10,
      className,
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState<string[]>(
      defaultValue ?? [],
    );
    const isControlled = value !== undefined;
    const selected = isControlled ? value : internalValue;

    const commit = (next: string[]) => {
      if (!isControlled) setInternalValue(next);
      onValueChange?.(next);
    };

    const toggle = (val: string) =>
      commit(
        selected.includes(val)
          ? selected.filter((v) => v !== val)
          : [...selected, val],
      );

    const allSelected = options.length > 0 && selected.length === options.length;
    const someSelected = selected.length > 0 && !allSelected;
    const toggleAll = () =>
      commit(allSelected ? [] : options.map((o) => o.value));

    const selectedLabels = React.useMemo(
      () =>
        options
          .filter((o) => selected.includes(o.value))
          .map((o) => o.label)
          .join(", "),
      [options, selected],
    );

    // The count badge only appears when the joined labels overflow the trigger.
    // Its slot is reserved whenever there is a selection, so showing and hiding
    // it never shifts the trigger width.
    const labelRef = React.useRef<HTMLSpanElement>(null);
    const [overflowing, setOverflowing] = React.useState(false);
    React.useLayoutEffect(() => {
      const el = labelRef.current;
      if (!el) return;
      const check = () => setOverflowing(el.scrollWidth > el.clientWidth);
      check();
      const observer = new ResizeObserver(check);
      observer.observe(el);
      return () => observer.disconnect();
    }, [selectedLabels]);

    const showSearch = options.length > searchThreshold;

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              styles.trigger,
              selected.length > 0 && styles.triggerActive,
              className,
            )}
          >
            <span
              ref={labelRef}
              className={cn(
                styles.triggerLabel,
                selected.length === 0 && styles.placeholder,
              )}
            >
              {selected.length === 0 ? placeholder : selectedLabels}
            </span>
            <span className={styles.triggerRight}>
              {selected.length > 0 ? (
                <span
                  className={cn(
                    styles.countBadge,
                    !overflowing && styles.countHidden,
                  )}
                  aria-hidden={!overflowing}
                >
                  {selected.length}
                </span>
              ) : null}
              <ChevronDown className={styles.chevron} />
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className={styles.content} align="start">
          <Command className={styles.command}>
            {showSearch ? (
              <CommandInput
                placeholder={searchPlaceholder}
                className={styles.search}
              />
            ) : null}
            <div
              role="option"
              aria-selected={allSelected}
              tabIndex={0}
              className={styles.selectAllRow}
              onClick={toggleAll}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleAll();
                }
              }}
            >
              <span className={styles.checkSlot} aria-hidden>
                {allSelected ? (
                  <Check className={styles.checkIcon} />
                ) : someSelected ? (
                  <Minus className={styles.checkIcon} />
                ) : null}
              </span>
              <span>{selectAllLabel}</span>
            </div>
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const checked = selected.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      value={`${option.label} ${option.value}`}
                      onSelect={() => toggle(option.value)}
                      className={styles.itemRow}
                    >
                      <span className={styles.checkSlot} aria-hidden>
                        {checked ? <Check className={styles.checkIcon} /> : null}
                      </span>
                      <span>{option.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
);
MultiSelectFilter.displayName = "MultiSelectFilter";
