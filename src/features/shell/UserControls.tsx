"use client";

import {
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@traxion-global/design-system/react";
import { useLanguage } from "@/features/i18n";

const styles = {
  avatarTrigger: "w-9 h-9 cursor-pointer select-none",
  dropdownContent: "w-48",
  dropdownName: "font-medium",
  activeLanguage: "font-semibold",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

interface UserControlsProps {
  userName: string;
}

export function UserControls({ userName }: UserControlsProps) {
  const { t, language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className={styles.avatarTrigger}>
          <AvatarFallback>{getInitials(userName)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={styles.dropdownContent}>
        <DropdownMenuLabel className={styles.dropdownName}>
          {userName}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>{t.common.language}</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              onClick={() => setLanguage("es")}
              className={language === "es" ? styles.activeLanguage : undefined}
            >
              {t.common.languageEs}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setLanguage("en")}
              className={language === "en" ? styles.activeLanguage : undefined}
            >
              {t.common.languageEn}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
