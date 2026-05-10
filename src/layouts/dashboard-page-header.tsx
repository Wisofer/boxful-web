"use client";
import { useLayoutEffect, type ReactNode } from "react";
import { useDashboardHeaderFromShell } from "@/components/providers/dashboard-header-context";
export type DashboardPageHeaderProps = {
  title: ReactNode;
  rightSlot?: ReactNode;
};
export function DashboardPageHeader({ title, rightSlot }: DashboardPageHeaderProps) {
  const { setPageHeader } = useDashboardHeaderFromShell();
  useLayoutEffect(() => {
    setPageHeader({ title, rightSlot });
    return () => setPageHeader(null);
  }, [title, rightSlot, setPageHeader]);
  return null;
}
