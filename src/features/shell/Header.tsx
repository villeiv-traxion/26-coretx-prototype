"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { AppsPanel } from "./AppsPanel";
import { UserControls } from "./UserControls";

/** Prototipo sin autenticación: el usuario del avatar es fijo. */
const DEMO_USER_NAME = "Ana Torres";

const styles = {
  wrapper: "bg-secondary h-14",
  container: "container flex h-full items-center justify-between gap-4 px-4",
  left: "flex items-center gap-3",
  homeLink: "flex items-center",
  logo: "w-28 text-white sm:w-32",
  right: "flex items-center justify-end",
};

export function Header() {
  return (
    <header className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.left}>
          <AppsPanel />
          <Link href="/" className={styles.homeLink}>
            <Logo className={styles.logo} />
          </Link>
        </div>
        <div className={styles.right}>
          <UserControls userName={DEMO_USER_NAME} />
        </div>
      </div>
    </header>
  );
}
