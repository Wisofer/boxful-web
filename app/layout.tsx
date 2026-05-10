import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { RootProviders } from "@/layouts/root-providers";
import "./globals.css";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-app",
  display: "swap",
});
export const metadata: Metadata = {
  title: "boxful",
  description: "Gestión de envíos",
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable}`}>
      <body className="min-h-[100dvh] antialiased">
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
