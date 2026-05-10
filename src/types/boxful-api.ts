export type ApiUser = {
  id: string;
  name: string;
  email: string;
};
export type AuthLoginResponse = {
  access_token: string;
  user: ApiUser;
};
export type AuthRegisterResponse = {
  user: ApiUser;
};
export type OrderStatus = "PENDING" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
export type ApiPackage = {
  description: string;
  weight: number;
  height: number;
  width: number;
  length: number;
  quantity: number;
};
export type ApiOrder = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  departmentId?: string;
  municipalityId?: string;
  notes: string;
  status: OrderStatus;
  isCOD: boolean;
  expectedAmount: number;
  collectedAmount: number;
  shippingCost: number;
  commission: number;
  liquidationAmount: number;
  packages: ApiPackage[];
  createdAt: string;
  updatedAt: string;
};
export type CreateOrderBody = {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  notes: string;
  isCOD: boolean;
  expectedAmount: number;
  collectedAmount: number;
  packages: ApiPackage[];
};
export type OrderListQuery = {
  status?: OrderStatus;
  isCOD?: boolean;
  customerName?: string;
  startDate?: string;
  endDate?: string;
};
export type UpdateOrderBody = Partial<{
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  departmentId: string;
  municipalityId: string;
  notes: string;
  status: OrderStatus;
  isCOD: boolean;
  expectedAmount: number;
  collectedAmount: number;
  packages: ApiPackage[];
}>;
