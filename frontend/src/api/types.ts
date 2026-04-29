export type ProductCategory = 'CONSOLE' | 'ACCESSORY' | 'GAME';

export type InventoryStatus =
  | 'AVAILABLE'
  | 'RESERVED'
  | 'IN_RENT'
  | 'MAINTENANCE'
  | 'RETIRED';

export type InventoryCondition = 'NEW' | 'GOOD' | 'FAIR' | 'DAMAGED';

export type Product = {
  id: string;
  name: string;
  brand: string;
  model?: string | null;
  category: ProductCategory;
  description?: string | null;
  imageUrl?: string | null;
  priceCents: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type InventoryUnit = {
  id: string;
  productId: string;
  serialNumber: string;
  status: InventoryStatus;
  condition: InventoryCondition;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';