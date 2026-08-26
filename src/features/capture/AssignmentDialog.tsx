"use client";

import { useState } from "react";
import { Check, TriangleAlert, UserPen } from "lucide-react";
import {
  Button,
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@traxion-global/design-system/react";
import { USERS, type Operation } from "./lib/organization";
import { responsiblesOf, workloadByPerson } from "./lib/compliance";
import { useActions, useStore } from "./lib/store";

/**
 * Who delivers this operation.
 *
 * Every person shows up with **how many operations they already carry**.
 * Without that number the screen invites handing everything to whoever is
 * closest at hand, which is exactly how one person ends up answering for
 * sixty-six warehouses.
 *
 * From the third responsible onwards it warns. It does not block: some
 * operations legitimately need them, and a hard rule would only teach people to
 * work around it.
 */

const ADVISED_MAXIMUM = 3;

const styles = {
  trigger: "h-7 gap-1.5 whitespace-nowrap px-2.5 text-xs",
  triggerIcon: "h-3.5 w-3.5",
  content: "sm:max-w-md",
  search: "rounded-md border",
  list: "max-h-64",
  option: "flex items-center justify-between gap-3",
  person: "flex min-w-0 flex-col",
  name: "truncate text-sm",
  role: "truncate text-xs text-muted-foreground",
  right: "flex shrink-0 items-center gap-2",
  workload: "text-xs tabular-nums text-muted-foreground",
  mark: "h-4 w-4 text-primary-dark",
  warning:
    "flex items-start gap-2 pt-1 text-xs leading-snug text-destructive-warm",
  warningIcon: "mt-0.5 h-3.5 w-3.5 shrink-0",
};

interface AssignmentDialogProps {
  operation: Operation;
  /**
   * What opens it. Given one, it replaces the default button — the compliance
   * table hands it the responsible's own name, so the thing you would change is
   * the thing you click.
   */
  children?: React.ReactNode;
}

export function AssignmentDialog({
  operation,
  children,
}: AssignmentDialogProps) {
  const state = useStore();
  const { assign } = useActions();
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState<string[]>([]);

  const workload = workloadByPerson(state);
  const assigned = responsiblesOf(state, operation.id);

  function onOpenChange(next: boolean) {
    if (next) setSelection(assigned);
    setOpen(next);
  }

  function toggle(userId: string) {
    setSelection((previous) =>
      previous.includes(userId)
        ? previous.filter((id) => id !== userId)
        : [...previous, userId],
    );
  }

  function onSave() {
    assign(operation.id, selection);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="outline" className={styles.trigger}>
            <UserPen className={styles.triggerIcon} />
            {assigned.length === 0 ? "Asignar" : "Cambiar"} responsable
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className={styles.content}>
        <DialogHeader>
          <DialogTitle>Asignar responsables</DialogTitle>
          {/* The operation moves into the description: the title says what the
              dialog does, and the sentence below says what it will do it to. */}
          <DialogDescription>
            Quién entrega los once indicadores de {operation.name} cada semana.
          </DialogDescription>
        </DialogHeader>

        <Command className={styles.search}>
          <CommandInput placeholder="Buscar por nombre o puesto…" />
          <CommandList className={styles.list}>
            <CommandEmpty>Nadie con ese nombre.</CommandEmpty>
            {USERS.map((user) => {
              const chosen = selection.includes(user.id);
              return (
                <CommandItem
                  key={user.id}
                  value={`${user.name} ${user.role}`}
                  onSelect={() => toggle(user.id)}
                  className={styles.option}
                >
                  <span className={styles.person}>
                    <span className={styles.name}>{user.name}</span>
                    <span className={styles.role}>{user.role}</span>
                  </span>
                  <span className={styles.right}>
                    <span className={styles.workload}>
                      {workload.get(user.id) ?? 0} op.
                    </span>
                    {chosen ? <Check className={styles.mark} /> : null}
                  </span>
                </CommandItem>
              );
            })}
          </CommandList>
        </Command>

        {selection.length > ADVISED_MAXIMUM ? (
          <p className={styles.warning}>
            <TriangleAlert className={styles.warningIcon} />
            {selection.length} responsables para una sola operación. Se puede,
            pero cuando todos son responsables normalmente no la entrega nadie.
          </p>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={onSave}>Guardar ({selection.length})</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
