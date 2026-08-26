"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@traxion-global/design-system/react";
import { getUser, USERS } from "@/features/capture/lib/organization";
import { useActions, useStore, type Profile } from "@/features/capture/lib/store";

/**
 * Demo scaffolding, kept where it cannot be mistaken for product.
 *
 * Neither of these ships. The profile falls out of the standing responsibility
 * of whoever signs in, resolved on the server; picking a person is plain
 * impersonation. They live behind a submenu that says so out loud, and only
 * inside the app they steer.
 */

const styles = {
  content: "max-h-[70vh] w-56 overflow-y-auto",
  label: "text-[0.6875rem] uppercase tracking-wider text-muted-foreground",
};

/**
 * Whose name the avatar shows.
 *
 * Picking a person in the demo options and still reading someone else's name on
 * the avatar reads as a bug, so the two follow each other. Outside the app —
 * and under the coordination profile, where no particular person is chosen —
 * the header keeps its own name.
 */
export function useDisplayName(fallback: string): string {
  const pathname = usePathname();
  const { profile, userId } = useStore();

  if (!pathname.startsWith("/intelligence/capture")) return fallback;
  if (profile !== "capture") return fallback;
  return getUser(userId)?.name ?? fallback;
}

export function DemoOptions() {
  const pathname = usePathname();
  const { profile, userId } = useStore();
  const { setProfile, setUser } = useActions();
  const router = useRouter();

  // Outside CoreTX Captura these controls steer nothing, so they are not shown.
  if (!pathname.startsWith("/intelligence/capture")) return null;

  function onProfileChange(next: string) {
    setProfile(next as Profile);
    // Each profile has its own screen, so switching has to move as well as
    // change: staying put would leave you on one the new profile cannot use.
    router.push(
      next === "coordination"
        ? "/intelligence/capture/compliance"
        : "/intelligence/capture",
    );
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>Opciones del demo</DropdownMenuSubTrigger>
      <DropdownMenuSubContent className={styles.content}>
        <DropdownMenuLabel className={styles.label}>Perfil</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={profile} onValueChange={onProfileChange}>
          <DropdownMenuRadioItem value="capture">Captura</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="coordination">
            Coordinación
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        {profile === "capture" ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className={styles.label}>
              Persona
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup value={userId} onValueChange={setUser}>
              {USERS.map((user) => (
                <DropdownMenuRadioItem key={user.id} value={user.id}>
                  {user.name}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </>
        ) : null}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
