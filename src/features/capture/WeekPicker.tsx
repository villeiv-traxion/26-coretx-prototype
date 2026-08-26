"use client";

import { useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import {
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
import { periodKey, periodOf, rangeInWords, type Period } from "./lib/periods";

/**
 * Which week the capture screen is working on.
 *
 * Only weeks that have started are offered: nothing is owed for a week that has
 * not happened, and a form for one would be eleven fields nobody can answer.
 * The list runs newest first, because the reason to reach back is almost always
 * to check — or correct, while the window is open — what was delivered a week
 * or two ago.
 */

const styles = {
  trigger:
    "flex items-center gap-1.5 whitespace-nowrap rounded px-1 py-0.5 text-muted-foreground transition-colors hover:bg-muted",
  icon: "h-3.5 w-3.5 shrink-0",
  figure: "font-medium tabular-nums text-foreground",
  chevron: "h-3 w-3 shrink-0 opacity-50",
  content: "w-64 p-0",
  list: "max-h-72",
  item: "flex items-baseline justify-between gap-3",
  itemCurrent: "flex items-baseline justify-between gap-3 font-medium",
  itemWeek: "tabular-nums",
  itemRange: "text-xs text-muted-foreground",
};

interface WeekPickerProps {
  period: Period;
  onChange: (period: Period) => void;
  now: Date;
}

export function WeekPicker({ period, onChange, now }: WeekPickerProps) {
  const [open, setOpen] = useState(false);
  const current = periodOf(now);

  const weeks: Period[] = Array.from({ length: current.week }, (_, i) => ({
    year: current.year,
    week: current.week - i,
  }));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={styles.trigger} aria-label="Cambiar de semana">
        <CalendarDays className={styles.icon} aria-hidden="true" />
        Semana <span className={styles.figure}>{period.week}</span>
        <span>· {rangeInWords(period)}</span>
        <ChevronDown className={styles.chevron} aria-hidden="true" />
      </PopoverTrigger>

      <PopoverContent className={styles.content} align="start">
        <Command>
          <CommandInput placeholder="Ir a la semana…" />
          <CommandList className={styles.list}>
            <CommandEmpty>Esa semana no existe.</CommandEmpty>
            <CommandGroup>
              {weeks.map((week) => (
                <CommandItem
                  key={periodKey(week)}
                  value={`${week.week} ${rangeInWords(week)}`}
                  onSelect={() => {
                    onChange(week);
                    setOpen(false);
                  }}
                  className={
                    week.week === period.week ? styles.itemCurrent : styles.item
                  }
                >
                  <span className={styles.itemWeek}>Semana {week.week}</span>
                  <span className={styles.itemRange}>{rangeInWords(week)}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
