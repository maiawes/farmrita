import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { isLocalDemoMode } from "@/lib/development";

import "./globals.css";

export const metadata: Metadata = {
  title: "CÁSSIA Clinical",
  description: "Plataforma de gestão clínica",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <AppShell demoMode={isLocalDemoMode()}>{children}</AppShell>
      </body>
    </html>
  );
}
