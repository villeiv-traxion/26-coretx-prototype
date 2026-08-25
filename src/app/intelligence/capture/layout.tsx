import type { Metadata } from "next";
import { connection } from "next/server";
import { CaptureShell } from "@/features/capture";

export const metadata: Metadata = {
  title: "CoreTX Captura",
  description:
    "Captura manual de indicadores de la división Logística: quién entrega qué, en qué semana y hasta cuándo se puede corregir.",
};

/**
 * The clock is read once per request and handed to the client through context.
 *
 * Every screen below counts down to Friday at 14:00, so the value has to be the
 * same on both sides of hydration — hence one source instead of each side
 * calling `Date.now()` for itself. `connection()` is what defers it to request
 * time; without it the countdown would be frozen at whenever the deploy ran.
 */
async function readClock(): Promise<number> {
  await connection();
  return Date.now();
}

export default async function CaptureLayout({
  children,
}: LayoutProps<"/intelligence/capture">) {
  const now = await readClock();

  return <CaptureShell now={now}>{children}</CaptureShell>;
}
