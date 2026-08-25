"use client";

import { Clock } from "lucide-react";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
} from "@traxion-global/design-system/react";
import { ANCHOR, useActions, useNow } from "./lib/store";
import { cutoffOf, periodOf, startOf } from "./lib/periods";

/**
 * The demo date control.
 *
 * A prototype whose subject is a deadline cannot be shown if the deadline
 * cannot be moved: without this, the step from draft to official — which is the
 * whole idea — would only be visible by waiting until Friday.
 */

const FORMAT = new Intl.DateTimeFormat("es-MX", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const styles = {
  trigger: "h-8 gap-2 px-3 text-xs font-normal tabular-nums",
  icon: "h-3.5 w-3.5",
  content: "w-72 p-0",
  header: "px-4 pb-3 pt-4",
  title: "text-sm font-medium",
  note: "mt-1 text-xs leading-snug text-muted-foreground",
  list: "flex flex-col p-2",
  jump: "h-8 justify-start px-2 text-xs font-normal",
};

export function DemoClock() {
  const now = useNow();
  const { setClock } = useActions();
  const period = periodOf(now);

  const jumps: { label: string; target: () => Date }[] = [
    {
      label: "Lunes, con la semana recién abierta",
      target: () => {
        const d = startOf(period);
        d.setHours(9, 0, 0, 0);
        return d;
      },
    },
    {
      label: "Viernes 13:00 — una hora para el corte",
      target: () => {
        const d = cutoffOf(period);
        d.setHours(13, 0, 0, 0);
        return d;
      },
    },
    {
      label: "Viernes 14:01 — la semana ya cerró",
      target: () => {
        const d = cutoffOf(period);
        d.setMinutes(d.getMinutes() + 1);
        return d;
      },
    },
    {
      label: "La semana siguiente, recién abierta",
      target: () => {
        const d = startOf(period);
        d.setDate(d.getDate() + 7);
        d.setHours(9, 0, 0, 0);
        return d;
      },
    },
    {
      label: "Volver al inicio de la demostración",
      target: () => new Date(ANCHOR),
    },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={styles.trigger}>
          <Clock className={styles.icon} />
          {FORMAT.format(now)}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className={styles.content}>
        <div className={styles.header}>
          <p className={styles.title}>Fecha de la demostración</p>
          <p className={styles.note}>
            La aplicación toma esta fecha por hoy. Muévela para ver qué pasa
            cuando llega el corte del viernes.
          </p>
        </div>
        <Separator />
        <div className={styles.list}>
          {jumps.map((jump) => (
            <Button
              key={jump.label}
              variant="ghost"
              className={styles.jump}
              onClick={() => setClock(jump.target())}
            >
              {jump.label}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
