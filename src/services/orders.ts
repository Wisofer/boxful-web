import type {
  ApiOrder,
  CreateOrderBody,
  OrderListQuery,
  UpdateOrderBody,
} from "@/types/boxful-api";
import { assertValidOrderPathId } from "@/utils/order-path-id";
import { httpClient } from "./http/client";
export async function fetchOrders(query?: OrderListQuery): Promise<ApiOrder[]> {
  const { data } = await httpClient.get<ApiOrder[]>("orders", { params: query });
  return data;
}
export async function createOrder(body: CreateOrderBody): Promise<ApiOrder> {
  const { data } = await httpClient.post<ApiOrder>("orders", body);
  return data;
}
export async function fetchOrderById(orderId: string): Promise<ApiOrder> {
  const id = assertValidOrderPathId(orderId);
  const { data } = await httpClient.get<ApiOrder>(`orders/${encodeURIComponent(id)}`);
  return data;
}
export async function patchOrder(
  orderId: string,
  body: UpdateOrderBody,
): Promise<ApiOrder> {
  const id = assertValidOrderPathId(orderId);
  const { data } = await httpClient.patch<ApiOrder>(
    `orders/${encodeURIComponent(id)}`,
    body,
  );
  return data;
}
export async function deleteOrder(orderId: string): Promise<void> {
  const id = assertValidOrderPathId(orderId);
  await httpClient.delete(`orders/${encodeURIComponent(id)}`);
}
export async function exportOrdersCsvBlob(query?: OrderListQuery): Promise<Blob> {
  const { data } = await httpClient.get<Blob>("orders/export/csv", {
    params: query,
    responseType: "blob",
  });
  return data;
}
