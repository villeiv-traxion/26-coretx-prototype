"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@traxion-global/design-system/react";
import { USERS } from "./lib/organization";
import { useActions, useStore, type Profile } from "./lib/store";

/**
 * The prototype has no authentication, so the profile is picked in plain sight.
 * In the product it comes from the standing responsibility of whoever signs in,
 * resolved on the server — not from a dropdown.
 */

const styles = {
  row: "flex items-center gap-2",
  profile: "h-8 w-[9.5rem] text-xs",
  user: "h-8 w-[11rem] text-xs",
};

export function ProfileSelector() {
  const { profile, userId } = useStore();
  const { setProfile, setUser } = useActions();
  const router = useRouter();

  function onProfileChange(next: string) {
    setProfile(next as Profile);
    // The two views share no routes: staying put would mean staying on a screen
    // the new profile cannot see.
    router.push(
      next === "coordination"
        ? "/intelligence/capture/compliance"
        : "/intelligence/capture",
    );
  }

  return (
    <div className={styles.row}>
      <Select value={profile} onValueChange={onProfileChange}>
        <SelectTrigger className={styles.profile} aria-label="Perfil">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="capture">Perfil: Captura</SelectItem>
          <SelectItem value="coordination">Perfil: Coordinación</SelectItem>
        </SelectContent>
      </Select>

      {profile === "capture" ? (
        <Select value={userId} onValueChange={setUser}>
          <SelectTrigger className={styles.user} aria-label="Persona">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {USERS.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
    </div>
  );
}
