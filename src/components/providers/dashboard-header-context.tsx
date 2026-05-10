"use client";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useDashboardHeader } from "@/hooks/use-dashboard-header";
export type DashboardPageHeaderConfig = {
  title: ReactNode;
  rightSlot?: ReactNode;
};
type DashboardHeaderApiState = ReturnType<typeof useDashboardHeader>;
export type DashboardHeaderContextValue = DashboardHeaderApiState & {
  pageHeader: DashboardPageHeaderConfig | null;
  setPageHeader: (config: DashboardPageHeaderConfig | null) => void;
};
const DashboardHeaderContext = createContext<DashboardHeaderContextValue | null>(null);
export function DashboardHeaderProvider({ children }: { children: ReactNode }) {
  const api = useDashboardHeader();
  const [pageHeader, setPageHeaderState] = useState<DashboardPageHeaderConfig | null>(
    null,
  );
  const setPageHeader = useCallback((config: DashboardPageHeaderConfig | null) => {
    setPageHeaderState(config);
  }, []);
  const value = useMemo(
    (): DashboardHeaderContextValue => ({
      displayName: api.displayName,
      liquidationMonthTotal: api.liquidationMonthTotal,
      liquidationSummaryMonthLabel: api.liquidationSummaryMonthLabel,
      loading: api.loading,
      pageHeader,
      setPageHeader,
    }),
    [
      api.displayName,
      api.liquidationMonthTotal,
      api.liquidationSummaryMonthLabel,
      api.loading,
      pageHeader,
      setPageHeader,
    ],
  );
  return (
    <DashboardHeaderContext.Provider value={value}>
      {children}
    </DashboardHeaderContext.Provider>
  );
}
export function useDashboardHeaderFromShell(): DashboardHeaderContextValue {
  const ctx = useContext(DashboardHeaderContext);
  if (!ctx) {
    throw new Error(
      "useDashboardHeaderFromShell debe usarse dentro de DashboardHeaderProvider",
    );
  }
  return ctx;
}
