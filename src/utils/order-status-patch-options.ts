import type { OrderStatus } from "@/types/boxful-api";
import { ORDER_STATUS_SELECT_SEQUENCE } from "@/utils/order-status-label";
export function allowedPatchStatuses(from: OrderStatus): OrderStatus[] {
  switch (from) {
    case "PENDING":
      return [...ORDER_STATUS_SELECT_SEQUENCE];
    case "IN_TRANSIT":
      return ["IN_TRANSIT", "DELIVERED", "CANCELLED"];
    case "DELIVERED":
    case "CANCELLED":
      return [from];
    default:
      return [...ORDER_STATUS_SELECT_SEQUENCE];
  }
}
export function statusPatchFrozen(from: OrderStatus): boolean {
  return from === "DELIVERED" || from === "CANCELLED";
}
export function orderAllowsFullFormEdit(status: OrderStatus): boolean {
  return !statusPatchFrozen(status);
}
