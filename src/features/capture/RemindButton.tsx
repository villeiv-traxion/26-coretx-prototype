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
 * It is always there and sometimes disabled, rather than appearing and
 * vanishing: a control that comes and goes down a column makes the rows jump
 * and leaves the reader wondering what they did to lose it. Disabled says the
 * same thing and stays still — and the tooltip says why.
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

  const names = assigned
    .map((id) => getUser(id)?.name)
    .filter(Boolean)
    .join(", ");

  // Why it cannot be pressed, in the words the tooltip will use.
  const blocked =
    assigned.length === 0
      ? "Nadie tiene asignada esta operación todavía."
      : missing === 0
        ? "Ya entregó los once indicadores de la semana."
        : null;

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
      disabled={blocked !== null}
      onClick={onRemind}
      title={
        blocked ??
        `Recordar a ${names} que faltan ${missing} de ${progress.total}`
      }
      aria-label={
        blocked
          ? `No se puede recordar la semana ${period.week} de ${operation.name}: ${blocked}`
          : `Recordar a ${names} la semana ${period.week} de ${operation.name}`
      }
    >
      <Bell className={styles.icon} />
      Recordar
    </Button>
  );
}
