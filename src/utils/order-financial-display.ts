import type { ApiOrder } from "@/types/boxful-api";
export function signedLiquidationNetForUi(order: ApiOrder): number {
  const raw = Number(order.liquidationAmount) || 0;
  return order.isCOD ? raw : -raw;
}
export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
