import type { Metadata } from "next";
import { CaptureShell } from "@/features/capture";

export const metadata: Metadata = {
  title: "CoreTX Captura",
  description:
    "Captura manual de indicadores de la división Logística: quién entrega qué, en qué semana y hasta cuándo se puede corregir.",
};

export default function CaptureLayout({
  children,
}: LayoutProps<"/intelligence/capture">) {
  return <CaptureShell>{children}</CaptureShell>;
}
