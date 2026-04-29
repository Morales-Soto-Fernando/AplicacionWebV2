import { http } from './http';
import type {
  InventoryCondition,
  InventoryStatus,
  InventoryUnit,
} from './types';

export type CreateInventoryBody = {
  productId: string;
  serialNumber: string;
  status: InventoryStatus;
  condition: InventoryCondition;
  notes?: string;
};

export type UpdateInventoryBody = Partial<{
  productId: string;
  serialNumber: string;
  status: InventoryStatus;
  condition: InventoryCondition;
  notes: string | null;
}>;

export async function getInventory(): Promise<InventoryUnit[]> {
  const { data } = await http.get<InventoryUnit[]>('/inventory');
  return data;
}

export async function createInventory(
  body: CreateInventoryBody,
): Promise<InventoryUnit> {
  const { data } = await http.post<InventoryUnit>('/inventory', body);
  return data;
}

export async function updateInventory(
  id: string,
  body: UpdateInventoryBody,
): Promise<InventoryUnit> {
  const { data } = await http.patch<InventoryUnit>(`/inventory/${id}`, body);
  return data;
}

export async function deleteInventory(id: string): Promise<void> {
  await http.delete(`/inventory/${id}`);
}