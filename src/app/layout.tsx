import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { Toaster, TooltipProvider } from "@traxion-global/design-system/react";
import { LanguageProvider } from "@/features/i18n";
import { Header, Footer } from "@/features/shell";
import { ChatWidget } from "@/features/chat/ChatWidget";
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

const styles = {
  body: "antialiased",
  shell: "flex min-h-screen flex-col",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={roboto.variable}>
      <body className={styles.body}>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster position="top-right" closeButton />
            <div className={styles.shell}>
              <Header />
              <main>{children}</main>
              <Footer />
              <ChatWidget />
            </div>
          </TooltipProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
