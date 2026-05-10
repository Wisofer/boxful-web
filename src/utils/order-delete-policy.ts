import type { OrderStatus } from "@/types/boxful-api";
export function orderIsDeletable(status: OrderStatus): boolean {
  return status === "PENDING" || status === "CANCELLED";
}
