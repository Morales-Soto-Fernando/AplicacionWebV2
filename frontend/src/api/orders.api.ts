import { http } from './http';

export type OrderStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  inventoryUnitId?: string | null;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
};

export type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  status: OrderStatus;
  startDate: string;
  endDate: string;
  totalCents: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

export type CreateOrderBody = {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  startDate: string;
  endDate: string;
  items: Array<{
    productId: string;
    inventoryUnitId?: string;
    quantity: number;
  }>;
};

export type UpdateOrderBody = Partial<{
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: OrderStatus;
  startDate: string;
  endDate: string;
}>;

export async function getOrders(): Promise<Order[]> {
  const { data } = await http.get<Order[]>('/orders');
  return data;
}

export async function createOrder(body: CreateOrderBody): Promise<Order> {
  const { data } = await http.post<Order>('/orders', body);
  return data;
}

export async function updateOrder(id: string, body: UpdateOrderBody): Promise<Order> {
  const { data } = await http.patch<Order>(`/orders/${id}`, body);
  return data;
}

export async function deleteOrder(id: string): Promise<void> {
  await http.delete(`/orders/${id}`);
}