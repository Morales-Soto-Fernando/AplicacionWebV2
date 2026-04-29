import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  findAll(filters?: { productId?: string; status?: string }) {
    const where: any = {};
    if (filters?.productId) where.productId = filters.productId;
    if (filters?.status) where.status = filters.status;

    return this.prisma.inventoryUnit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const unit = await this.prisma.inventoryUnit.findUnique({ where: { id } });
    if (!unit) throw new NotFoundException(`InventoryUnit not found: ${id}`);
    return unit;
  }

  async create(data: {
    productId: string;
    serialNumber: string;
    status?: string;
    condition?: string;
    notes?: string;
  }) {
    try {
      return await this.prisma.inventoryUnit.create({
        data: {
          productId: data.productId,
          serialNumber: data.serialNumber,
          status: (data.status as any) ?? undefined,
          condition: (data.condition as any) ?? undefined,
          notes: data.notes ?? undefined,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        // serialNumber unique
        if (e.code === 'P2002') {
          throw new ConflictException(
            `serialNumber ya existe: ${data.serialNumber}`,
          );
        }
      }
      throw e;
    }
  }

  async update(
    id: string,
    data: {
      status?: string;
      condition?: string;
      notes?: string | null;
    },
  ) {
    try {
      return await this.prisma.inventoryUnit.update({
        where: { id },
        data: {
          status: data.status ? (data.status as any) : undefined,
          condition: data.condition ? (data.condition as any) : undefined,
          notes: data.notes === null ? null : data.notes ?? undefined,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        // not found
        if (e.code === 'P2025') {
          throw new NotFoundException(`InventoryUnit not found: ${id}`);
        }
      }
      throw e;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.inventoryUnit.delete({ where: { id } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new NotFoundException(`InventoryUnit not found: ${id}`);
        }
      }
      throw e;
    }
  }
}