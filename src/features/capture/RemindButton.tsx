"use client";

import { Bell } from "lucide-react";
import { Button, toast } from "@traxion-global/design-system/react";
import type { WeekProgress } from "./lib/compliance";
import { getUser, type Operation } from "./lib/organization";
import type { Period } from "./lib/periods";

/**
 * The only thing coordination should be able to do about a week that is short.
 *
 * The action is to remind, not to capture. The reference prototype puts a
 * «Completar» here that opens someone else's form, and flags it against itself:
 * «El botón lleva a capturar por otra persona. La acción correcta es recordar,
 * y recordar es E2.» Recording the number for somebody is how a submission ends
 * up carrying a name that never typed it.
 *
 * It appears only where it can do something: the week still open, still short,
 * and with somebody to remind. A finished week needs no nudge, a closed one is
 * past nudging, and an operation with nobody assigned needs a responsible —
 * which is the column next door, not this button.
 */

const styles = {
  button: "h-7 gap-1.5 whitespace-nowrap px-2.5 text-xs",
  icon: "h-3.5 w-3.5",
};

interface RemindButtonProps {
  operation: Operation;
  period: Period;
  progress: WeekProgress;
  assigned: string[];
}

export function RemindButton({
  operation,
  period,
  progress,
  assigned,
}: RemindButtonProps) {
  const missing = progress.total - progress.delivered;
  const canRemind =
    !progress.closed &&
    progress.status !== "FUTURE" &&
    missing > 0 &&
    assigned.length > 0;

  if (!canRemind) return null;

  const names = assigned
    .map((id) => getUser(id)?.name)
    .filter(Boolean)
    .join(", ");

  function onRemind() {
    // Nothing is sent. The scheduler and outbound mail arrive with E2 — until
    // then this is the shape of the action, not the action.
    toast.success(
      "Recordatorio enviado",
      `Se avisó a ${names} que faltan ${missing} de ${progress.total} indicadores de ${operation.name} en la semana ${period.week}.`,
    );
  }

  return (
    <Button
      variant="outline"
      className={styles.button}
      onClick={onRemind}
      aria-label={`Recordar a ${names} la semana ${period.week} de ${operation.name}`}
    >
      <Bell className={styles.icon} />
      Recordar
    </Button>
  );
}
