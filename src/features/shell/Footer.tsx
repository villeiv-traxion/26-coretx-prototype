"use client";

import Link from "next/link";
import { useLanguage } from "@/features/i18n";

const styles = {
  footer:
    "mt-auto flex flex-col items-center gap-2 px-2 py-4 text-xs text-muted-foreground/80 sm:flex-row sm:justify-center sm:gap-8 sm:py-8",
  links: "flex gap-4 sm:gap-8",
};

export function Footer() {
  const { t } = useLanguage();
  const year = String(new Date().getFullYear());

  return (
    <footer className={styles.footer}>
      <p>{t.footer.copyright.replace("{year}", year)}</p>
      <div className={styles.links}>
        <Link href="/" target="_blank" rel="noopener noreferrer">
          {t.footer.privacy}
        </Link>
        <Link href="/" target="_blank" rel="noopener noreferrer">
          {t.footer.terms}
        </Link>
      </div>
    </footer>
  );
}
