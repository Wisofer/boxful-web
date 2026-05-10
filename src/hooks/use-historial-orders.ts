"use client";
import { App } from "antd";
import type { Dayjs } from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { fetchOrders } from "@/services/orders";
import type { HistorialEnvioRow } from "@/types/historial-table";
import { getApiErrorMessage } from "@/utils/api-error";
import { buildOrderListQuery } from "@/utils/build-order-list-query";
import { mapApiOrderToHistorialRow } from "@/utils/map-api-order-to-historial-row";
type MonthRange = [Dayjs | null, Dayjs | null];
export function useHistorialOrders(range: MonthRange) {
  const { message } = App.useApp();
  const [rows, setRows] = useState<HistorialEnvioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const query = buildOrderListQuery(range);
      const orders = await fetchOrders(query);
      const rows = orders.map(mapApiOrderToHistorialRow);
      rows.sort((a, b) => (b.createdAtISO || "").localeCompare(a.createdAtISO || ""));
      setRows(rows);
    } catch (error) {
      message.error(getApiErrorMessage(error));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [message, range]);
  useEffect(() => {
    const id = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(id);
  }, [refresh]);
  return { rows, loading, refresh };
}
