"use client";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { useEffect, useMemo, useState } from "react";
import { fetchOrders } from "@/services/orders";
import { fetchCurrentUser } from "@/services/users";
import { signedLiquidationNetForUi } from "@/utils/order-financial-display";
dayjs.locale("es");
type DashboardHeaderState = {
  displayName: string;
  liquidationMonthTotal: number;
  liquidationSummaryMonthLabel: string;
  loading: boolean;
};
export function useDashboardHeader(): DashboardHeaderState {
  const [displayName, setDisplayName] = useState("");
  const [liquidationMonthTotal, setLiquidationMonthTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const liquidationSummaryMonthLabel = useMemo(
    () =>
      dayjs()
        .locale("es")
        .format("MMMM [de] YYYY")
        .replace(/^\w/u, (c) => c.toUpperCase()),
    [],
  );
  useEffect(() => {
    let cancelled = false;
    const startDate = dayjs().startOf("month").format("YYYY-MM-DD");
    const endDate = dayjs().endOf("month").format("YYYY-MM-DD");
    void (async () => {
      try {
        const [user, orders] = await Promise.all([
          fetchCurrentUser(),
          fetchOrders({ startDate, endDate }),
        ]);
        if (cancelled) return;
        const name =
          user.name?.trim() || user.email?.split("@")[0]?.trim() || "Usuario";
        setDisplayName(name);
        const sum = orders.reduce((acc, o) => acc + signedLiquidationNetForUi(o), 0);
        setLiquidationMonthTotal(sum);
      } catch {
        if (!cancelled) {
          setDisplayName("Usuario");
          setLiquidationMonthTotal(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return {
    displayName,
    liquidationMonthTotal,
    liquidationSummaryMonthLabel,
    loading,
  };
}
