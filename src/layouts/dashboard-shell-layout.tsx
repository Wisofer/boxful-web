"use client";
import type { ReactNode } from "react";
import { RequireAuth } from "@/features/auth";
import { AppShell } from "@/layouts/app-shell";
export function DashboardShellLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <RequireAuth>{children}</RequireAuth>
    </AppShell>
  );
}
