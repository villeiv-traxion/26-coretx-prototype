import { Fragment } from "react";
import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  /** Omitir en la página actual (última) para que renderice como texto, no link. */
  href?: string;
  icon?: LucideIcon;
};

const styles = {
  nav: "flex items-center gap-1.5 text-sm text-muted-foreground",
  link: "flex items-center gap-1.5 transition-colors hover:text-foreground",
  current: "flex items-center gap-1.5 text-foreground",
  // Un tramo sin destino (un eje que aún no tiene pantalla) no es la página
  // actual: se queda en gris para no competir con ella.
  plain: "flex items-center gap-1.5",
  icon: "h-4 w-4",
  separator: "h-3.5 w-3.5 shrink-0",
};

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={`${styles.nav} ${className ?? ""}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const Icon = item.icon;
        const content = (
          <>
            {Icon ? <Icon className={styles.icon} aria-hidden /> : null}
            {item.label}
          </>
        );
        return (
          <Fragment key={item.href ?? item.label}>
            {index > 0 ? (
              <ChevronRight className={styles.separator} aria-hidden />
            ) : null}
            {item.href && !isLast ? (
              <Link href={item.href} className={styles.link}>
                {content}
              </Link>
            ) : (
              <span
                className={isLast ? styles.current : styles.plain}
                aria-current={isLast ? "page" : undefined}
              >
                {content}
              </span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
