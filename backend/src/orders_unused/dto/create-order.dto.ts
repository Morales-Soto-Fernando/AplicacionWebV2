import { OrderStatus } from '@prisma/client';

export class CreateOrderItemDto {
  productId: string;
  inventoryUnitId?: string; // opcional, pero recomendado si es renta por unidad
  quantity: number;
}

export class CreateOrderDto {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;

  startDate: string; // ISO string
  endDate: string;   // ISO string

  // si no mandas status, queda PENDING
  status?: OrderStatus;

  items: CreateOrderItemDto[];
}