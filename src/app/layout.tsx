import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

// El DS resuelve su tipografía vía `--font-sans` (Roboto en theme.css).
const roboto = Roboto({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "CoreTX",
  description:
    "Plataforma de Traxion: aplicaciones de carga, movilidad de personas y logística, más los ejes transversales Intelligence y Navigate.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={roboto.variable}>
      <body>{children}</body>
    </html>
  );
}
