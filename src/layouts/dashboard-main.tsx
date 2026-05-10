import type { ReactNode } from "react";
type DashboardMainProps = {
  children: ReactNode;
};
export function DashboardMain({ children }: DashboardMainProps) {
  return (
    <div className="mx-auto flex w-full min-w-0 max-w-dashboard flex-1 flex-col bg-white">
      {children}
    </div>
  );
}
