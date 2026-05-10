import type { OrderStatus } from "@/types/boxful-api";
const LABELS: Record<OrderStatus, string> = {
  PENDING: "Pendiente",
  IN_TRANSIT: "En tránsito",
  DELIVERED: "Entregada",
  CANCELLED: "Cancelada",
};
export function orderStatusLabel(status: OrderStatus): string {
  return LABELS[status] ?? status;
}
export const ORDER_STATUS_SELECT_SEQUENCE: readonly OrderStatus[] = [
  "PENDING",
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELLED",
] as const;
export function orderStatusTagColor(
  status: OrderStatus,
): "success" | "processing" | "default" | "error" | "warning" {
  switch (status) {
    case "DELIVERED":
      return "success";
    case "IN_TRANSIT":
      return "processing";
    case "CANCELLED":
      return "error";
    case "PENDING":
    default:
      return "default";
  }
}
