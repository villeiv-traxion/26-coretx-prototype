"use client";

import { Badge } from "@traxion-global/design-system/react";
import type { SubmissionStatus } from "./lib/compliance";

/**
 * The status, said in words and marked with colour — never colour alone.
 *
 * "Borrador" is blue and not amber on purpose: it is not a warning, it is work
 * already done that can still be corrected. What warns is the deadline.
 */

const LABELS: Record<
  SubmissionStatus,
  { text: string; variant: "gray" | "blue" | "green" | "red" } | null
> = {
  FUTURE: null,
  PENDING: { text: "Pendiente", variant: "gray" },
  DRAFT: { text: "Borrador", variant: "blue" },
  OFFICIAL: { text: "Oficial", variant: "green" },
  MISSED: { text: "No entregado", variant: "red" },
};

export function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  const label = LABELS[status];
  if (!label) return null;
  return <Badge variant={label.variant}>{label.text}</Badge>;
}
