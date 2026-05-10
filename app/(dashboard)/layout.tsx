import type { ReactNode } from "react";
import { DashboardShellLayout } from "@/layouts/dashboard-shell-layout";
export default function DashboardSegmentLayout({ children }: { children: ReactNode }) {
  return <DashboardShellLayout>{children}</DashboardShellLayout>;
}
