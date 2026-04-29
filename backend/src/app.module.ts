// src/app.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ProductModule } from './product/product.module';
import { InventoryModule } from './inventory/inventory.module';
import { OrderModule } from './order/order.module';


@Module({
  imports: [PrismaModule, ProductModule, InventoryModule, OrderModule],
})
export class AppModule {}