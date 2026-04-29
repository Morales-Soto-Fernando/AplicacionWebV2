// src/order/order.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InventoryStatus, OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type CreateOrderItemDto = {
  productId: string;
  inventoryUnitId?: string; // opcional
  quantity: number;
};

type CreateOrderDto = {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  startDate: string | Date;
  endDate: string | Date;
  items: CreateOrderItemDto[];
};

type UpdateOrderDto = {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  status?: OrderStatus;
};

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderDto) {
    if (!dto?.items?.length) {
      throw new BadRequestException('items es requerido y no puede estar vacío');
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new BadRequestException('startDate/endDate inválidos');
    }
    if (endDate <= startDate) {
      throw new BadRequestException('endDate debe ser mayor que startDate');
    }

    // 1) Traer productos
    const productIds = [...new Set(dto.items.map((i) => i.productId))];
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      const found = new Set(products.map((p) => p.id));
      const missing = productIds.filter((id) => !found.has(id));
      throw new NotFoundException(`Producto(s) no encontrado(s): ${missing.join(', ')}`);
    }

    const productById = new Map(products.map((p) => [p.id, p]));

    // 2) Validar inventoryUnitId (si viene)
    const unitIds = dto.items
      .map((i) => i.inventoryUnitId)
      .filter((x): x is string => !!x);

    // evitar duplicar la misma unidad en la misma orden
    const unitIdsSet = new Set(unitIds);
    if (unitIds.length !== unitIdsSet.size) {
      throw new BadRequestException(
        'No puedes repetir la misma inventoryUnitId en items de la misma orden',
      );
    }

    const units = unitIds.length
      ? await this.prisma.inventoryUnit.findMany({
          where: { id: { in: unitIds } },
        })
      : [];

    if (units.length !== unitIds.length) {
      const found = new Set(units.map((u) => u.id));
      const missing = unitIds.filter((id) => !found.has(id));
      throw new NotFoundException(`InventoryUnit(s) no encontrada(s): ${missing.join(', ')}`);
    }

    const unitById = new Map(units.map((u) => [u.id, u]));

    // 3) Construir items (TIPADO CORRECTO -> evita never[])
    const itemsToCreate: Prisma.OrderItemCreateWithoutOrderInput[] = [];

    let totalCents = 0;
    let currency: string | null = null;

    for (const item of dto.items) {
      if (!item.quantity || item.quantity <= 0) {
        throw new BadRequestException('quantity debe ser mayor a 0');
      }

      const product = productById.get(item.productId)!;

      // Validar moneda consistente
      currency ??= product.currency;
      if (product.currency !== currency) {
        throw new BadRequestException(
          `Todos los productos deben tener la misma currency. Esperada=${currency}, encontrado=${product.currency}`,
        );
      }

      // Si hay unidad: validar que exista, que coincida con el producto y que esté AVAILABLE
      let connectInventoryUnit:
        | { inventoryUnit: { connect: { id: string } } }
        | {} = {};

      if (item.inventoryUnitId) {
        const unit = unitById.get(item.inventoryUnitId)!;

        if (unit.productId !== product.id) {
          throw new BadRequestException(
            `La unidad ${unit.id} no pertenece al producto ${product.id}`,
          );
        }

        if (unit.status !== InventoryStatus.AVAILABLE) {
          throw new BadRequestException(
            `La unidad ${unit.id} no está disponible (status=${unit.status})`,
          );
        }

        connectInventoryUnit = {
          inventoryUnit: { connect: { id: unit.id } },
        };
      }

      const unitPriceCents = product.priceCents;
      const lineTotalCents = unitPriceCents * item.quantity;

      totalCents += lineTotalCents;

      itemsToCreate.push({
        quantity: item.quantity,
        unitPriceCents,
        lineTotalCents,
        product: { connect: { id: product.id } },
        ...connectInventoryUnit,
      });
    }

    currency ??= 'MXN';

    // 4) Transacción: crear orden + reservar unidades
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          customerName: dto.customerName,
          customerEmail: dto.customerEmail,
          customerPhone: dto.customerPhone ?? null,
          startDate,
          endDate,
          status: OrderStatus.PENDING,
          totalCents,
          currency,
          items: {
            create: itemsToCreate,
          },
        },
        include: {
          items: true,
        },
      });

      if (unitIds.length) {
        // Reservar unidades para evitar doble renta
        const updated = await tx.inventoryUnit.updateMany({
          where: {
            id: { in: unitIds },
            status: InventoryStatus.AVAILABLE,
          },
          data: { status: InventoryStatus.RESERVED },
        });

        if (updated.count !== unitIds.length) {
          throw new BadRequestException(
            'No se pudieron reservar todas las unidades (alguien más las tomó antes)',
          );
        }
      }

      return order;
    });
  }

  async findAll() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true },
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
    const existing = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!existing) throw new NotFoundException(`Order not found: ${id}`);

    const startDate = dto.startDate ? new Date(dto.startDate) : undefined;
    const endDate = dto.endDate ? new Date(dto.endDate) : undefined;

    if (startDate && Number.isNaN(startDate.getTime())) {
      throw new BadRequestException('startDate inválido');
    }
    if (endDate && Number.isNaN(endDate.getTime())) {
      throw new BadRequestException('endDate inválido');
    }
    const finalStart = startDate ?? existing.startDate;
    const finalEnd = endDate ?? existing.endDate;
    if (finalEnd <= finalStart) {
      throw new BadRequestException('endDate debe ser mayor que startDate');
    }

    // Si cambia status, ajustar inventario (si la orden tiene inventoryUnitId en items)
    const unitIds = existing.items
      .map((i) => i.inventoryUnitId)
      .filter((x): x is string => !!x);

    return this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          customerName: dto.customerName,
          customerEmail: dto.customerEmail,
          customerPhone: dto.customerPhone,
          startDate: startDate ? finalStart : undefined,
          endDate: endDate ? finalEnd : undefined,
          status: dto.status,
        },
        include: { items: true },
      });

      if (dto.status && unitIds.length) {
        // Regla simple:
        // - ACTIVE   => RESERVED -> IN_RENT
        // - COMPLETED/CANCELLED => RESERVED/IN_RENT -> AVAILABLE
        if (dto.status === OrderStatus.ACTIVE) {
          await tx.inventoryUnit.updateMany({
            where: { id: { in: unitIds }, status: InventoryStatus.RESERVED },
            data: { status: InventoryStatus.IN_RENT },
          });
        }

        if (dto.status === OrderStatus.COMPLETED || dto.status === OrderStatus.CANCELLED) {
          await tx.inventoryUnit.updateMany({
            where: {
              id: { in: unitIds },
              status: { in: [InventoryStatus.RESERVED, InventoryStatus.IN_RENT] },
            },
            data: { status: InventoryStatus.AVAILABLE },
          });
        }
      }

      return updatedOrder;
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!existing) throw new NotFoundException(`Order not found: ${id}`);

    const unitIds = existing.items
      .map((i) => i.inventoryUnitId)
      .filter((x): x is string => !!x);

    return this.prisma.$transaction(async (tx) => {
      // liberar unidades si estaban reservadas/en renta
      if (unitIds.length) {
        await tx.inventoryUnit.updateMany({
          where: {
            id: { in: unitIds },
            status: { in: [InventoryStatus.RESERVED, InventoryStatus.IN_RENT] },
          },
          data: { status: InventoryStatus.AVAILABLE },
        });
      }

      return tx.order.delete({ where: { id } });
    });
  }
}