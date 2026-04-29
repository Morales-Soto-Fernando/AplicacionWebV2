import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, InventoryStatus, OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderDto) {
    if (!dto.items?.length) {
      throw new BadRequestException('items is required and must not be empty');
    }

    const status: OrderStatus = dto.status ?? OrderStatus.PENDING;

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('startDate/endDate must be valid ISO dates');
    }
    if (endDate <= startDate) {
      throw new BadRequestException('endDate must be greater than startDate');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1) Productos
      const productIds = [...new Set(dto.items.map((i) => i.productId))];
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      if (products.length !== productIds.length) {
        const found = new Set(products.map((p) => p.id));
        const missing = productIds.filter((id) => !found.has(id));
        throw new NotFoundException(`Product not found: ${missing.join(', ')}`);
      }

      const productById = new Map(products.map((p) => [p.id, p]));

      // 2) InventoryUnitIds
      const inventoryIds = dto.items
        .map((i) => i.inventoryUnitId)
        .filter(Boolean) as string[];

      if (inventoryIds.length) {
        const units = await tx.inventoryUnit.findMany({
          where: { id: { in: inventoryIds } },
        });

        if (units.length !== inventoryIds.length) {
          const found = new Set(units.map((u) => u.id));
          const missing = inventoryIds.filter((id) => !found.has(id));
          throw new NotFoundException(
            `InventoryUnit not found: ${missing.join(', ')}`,
          );
        }

        // Validar que la unidad sea del mismo producto
        const unitById = new Map(units.map((u) => [u.id, u]));
        for (const it of dto.items) {
          if (it.inventoryUnitId) {
            const unit = unitById.get(it.inventoryUnitId);
            if (unit && unit.productId !== it.productId) {
              throw new BadRequestException(
                `InventoryUnit ${it.inventoryUnitId} does not belong to product ${it.productId}`,
              );
            }
          }
        }
      }

      // 3) Construir items con precios
      const itemsToCreate: Prisma.OrderItemCreateWithoutOrderInput[] = [];
      let totalCents = 0;
      let currency = 'MXN';

      for (const it of dto.items) {
        if (!it.quantity || it.quantity <= 0) {
          throw new BadRequestException('quantity must be >= 1');
        }

        const product = productById.get(it.productId)!;

        const unitPriceCents = product.priceCents;
        const lineTotalCents = unitPriceCents * it.quantity;

        totalCents += lineTotalCents;
        currency = product.currency ?? currency;

        itemsToCreate.push({
          product: { connect: { id: it.productId } },
          inventoryUnit: it.inventoryUnitId
            ? { connect: { id: it.inventoryUnitId } }
            : undefined,
          quantity: it.quantity,
          unitPriceCents,
          lineTotalCents,
        });
      }

      // 4) Crear orden
      const order = await tx.order.create({
        data: {
          customerName: dto.customerName,
          customerEmail: dto.customerEmail,
          customerPhone: dto.customerPhone ?? null,

          status,
          startDate,
          endDate,
          totalCents,
          currency,

          items: { create: itemsToCreate },
        },
        include: { items: true },
      });

      // ✅ A + B: actualizar inventario según status
      await this.applyInventoryStatusForOrder(tx, order.id, status);

      return tx.order.findUnique({
        where: { id: order.id },
        include: { items: true },
      });
    });
  }

  async findAll() {
    return this.prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) throw new NotFoundException(`Order not found: ${id}`);
    return order;
  }

  async update(id: string, dto: UpdateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!existing) throw new NotFoundException(`Order not found: ${id}`);

      const updated = await tx.order.update({
        where: { id },
        data: {
          customerName: dto.customerName ?? undefined,
          customerEmail: dto.customerEmail ?? undefined,
          customerPhone: dto.customerPhone ?? undefined,
          startDate: dto.startDate ? new Date(dto.startDate) : undefined,
          endDate: dto.endDate ? new Date(dto.endDate) : undefined,
          status: dto.status ?? undefined,
        },
      });

      // ✅ si cambia status, actualiza inventario acorde
      if (dto.status && dto.status !== existing.status) {
        await this.applyInventoryStatusForOrder(tx, id, dto.status);
      }

      return tx.order.findUnique({
        where: { id: updated.id },
        include: { items: true },
      });
    });
  }

  async remove(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!existing) throw new NotFoundException(`Order not found: ${id}`);

      // devolver inventario
      await this.setUnitsToStatus(tx, existing.items, InventoryStatus.AVAILABLE);

      await tx.order.delete({ where: { id } });
      return { deleted: true, id };
    });
  }

  // ✅ IMPORTANTE: aquí tx debe ser Prisma.TransactionClient
  private async applyInventoryStatusForOrder(
    tx: Prisma.TransactionClient,
    orderId: string,
    status: OrderStatus,
  ) {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) throw new NotFoundException(`Order not found: ${orderId}`);

    if (status === OrderStatus.PENDING) {
      await this.setUnitsToStatus(tx, order.items, InventoryStatus.RESERVED, [
        InventoryStatus.AVAILABLE,
      ]);
    }

    if (status === OrderStatus.ACTIVE) {
      await this.setUnitsToStatus(tx, order.items, InventoryStatus.IN_RENT, [
        InventoryStatus.AVAILABLE,
        InventoryStatus.RESERVED,
      ]);
    }

    if (status === OrderStatus.COMPLETED || status === OrderStatus.CANCELLED) {
      await this.setUnitsToStatus(tx, order.items, InventoryStatus.AVAILABLE, [
        InventoryStatus.IN_RENT,
        InventoryStatus.RESERVED,
      ]);
    }
  }

  private async setUnitsToStatus(
    tx: Prisma.TransactionClient,
    items: { inventoryUnitId: string | null }[],
    toStatus: InventoryStatus,
    allowedFrom?: InventoryStatus[],
  ) {
    const unitIds = items
      .map((i) => i.inventoryUnitId)
      .filter(Boolean) as string[];

    if (!unitIds.length) return;

    for (const id of unitIds) {
      const where: Prisma.InventoryUnitWhereInput = { id };
      if (allowedFrom?.length) where.status = { in: allowedFrom };

      const res = await tx.inventoryUnit.updateMany({
        where,
        data: { status: toStatus },
      });

      // ✅ evita renta doble / cambios inválidos
      if (allowedFrom?.length && res.count === 0) {
        throw new ConflictException(
          `InventoryUnit ${id} cannot change to ${toStatus} (not in allowed state)`,
        );
      }
    }
  }
}