"use client";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
type ShellLayoutContextValue = {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (value: boolean) => void;
  toggleSidebar: () => void;
  belowLg: boolean;
  notifySiderBreakpoint: (broken: boolean) => void;
};
const ShellLayoutContext = createContext<ShellLayoutContextValue | null>(null);
type ShellLayoutProviderProps = {
  children: ReactNode;
};
export function ShellLayoutProvider({ children }: ShellLayoutProviderProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [belowLg, setBelowLg] = useState(false);
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((c) => !c);
  }, []);
  const notifySiderBreakpoint = useCallback((broken: boolean) => {
    setBelowLg(broken);
    if (broken) {
      setSidebarCollapsed(true);
    }
  }, []);
  const value = useMemo<ShellLayoutContextValue>(
    () => ({
      sidebarCollapsed,
      belowLg,
      setSidebarCollapsed,
      toggleSidebar,
      notifySiderBreakpoint,
    }),
    [belowLg, notifySiderBreakpoint, sidebarCollapsed, toggleSidebar],
  );
  return (
    <ShellLayoutContext.Provider value={value}>{children}</ShellLayoutContext.Provider>
  );
}
export function useShellLayout(): ShellLayoutContextValue {
  const ctx = useContext(ShellLayoutContext);
  if (!ctx) {
    throw new Error("useShellLayout debe usarse dentro de ShellLayoutProvider");
  }
  return ctx;
}
