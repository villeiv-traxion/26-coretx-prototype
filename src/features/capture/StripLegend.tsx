"use client";

/** Without this the strip is decoration: nobody knows what each tone means. */

const KEYS = [
  { className: "bg-primary", label: "Semana completa" },
  { className: "bg-primary/45", label: "Parcial" },
  { className: "bg-destructive/60", label: "Sin entregar" },
  { className: "bg-muted", label: "Sin abrir" },
];

const styles = {
  row: "flex flex-wrap items-center gap-x-4 gap-y-1.5",
  key: "flex items-center gap-1.5 text-xs text-muted-foreground",
  swatch: "h-3 w-3 rounded-[2px]",
};

export function StripLegend() {
  return (
    <div className={styles.row}>
      {KEYS.map((key) => (
        <span key={key.label} className={styles.key}>
          <span className={`${styles.swatch} ${key.className}`} />
          {key.label}
        </span>
      ))}
    </div>
  );
}
