import type { ApiOrder } from "@/types/boxful-api";

/**
 * `liquidationAmount` (API): con COD suele venir ya como neto (recolectado − envío − comisión).
 * Sin COD el backend suele exponer solo la magnitud positiva del costo de envío; en pantalla queremos el
 * **impacto** al comercio, así que se convierte aquí en negativo sin pedir cambio de contrato.
 */
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
