/*
  Warnings:

  - The values [RENTED] on the enum `InventoryStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING_PAYMENT,PAID,SCHEDULED,IN_PROGRESS,REFUNDED] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `serial` on the `InventoryUnit` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryDate` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `depositTotal` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `requestedDate` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `days` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `qty` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `subtotal` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `unitDailyPrice` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `dailyPrice` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `deposit` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[serialNumber]` on the table `InventoryUnit` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `serialNumber` to the `InventoryUnit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalCents` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lineTotalCents` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitPriceCents` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceCents` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InventoryCondition" AS ENUM ('NEW', 'GOOD', 'FAIR', 'DAMAGED');

-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('CONSOLE', 'ACCESSORY', 'GAME');

-- AlterEnum
BEGIN;
CREATE TYPE "InventoryStatus_new" AS ENUM ('AVAILABLE', 'RESERVED', 'IN_RENT', 'MAINTENANCE', 'RETIRED');
ALTER TABLE "public"."InventoryUnit" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "InventoryUnit" ALTER COLUMN "status" TYPE "InventoryStatus_new" USING ("status"::text::"InventoryStatus_new");
ALTER TYPE "InventoryStatus" RENAME TO "InventoryStatus_old";
ALTER TYPE "InventoryStatus_new" RENAME TO "InventoryStatus";
DROP TYPE "public"."InventoryStatus_old";
ALTER TABLE "InventoryUnit" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED');
ALTER TABLE "public"."Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- DropIndex
DROP INDEX "InventoryUnit_serial_key";

-- AlterTable
ALTER TABLE "InventoryUnit" DROP COLUMN "serial",
ADD COLUMN     "condition" "InventoryCondition" NOT NULL DEFAULT 'GOOD',
ADD COLUMN     "serialNumber" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "deliveryDate",
DROP COLUMN "depositTotal",
DROP COLUMN "requestedDate",
DROP COLUMN "total",
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'MXN',
ADD COLUMN     "customerPhone" TEXT,
ADD COLUMN     "totalCents" INTEGER NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "days",
DROP COLUMN "qty",
DROP COLUMN "subtotal",
DROP COLUMN "unitDailyPrice",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lineTotalCents" INTEGER NOT NULL,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "unitPriceCents" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "dailyPrice",
DROP COLUMN "deposit",
DROP COLUMN "type",
ADD COLUMN     "category" "ProductCategory" NOT NULL DEFAULT 'CONSOLE',
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'MXN',
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "model" TEXT,
ADD COLUMN     "priceCents" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "ProductType";

-- CreateIndex
CREATE UNIQUE INDEX "InventoryUnit_serialNumber_key" ON "InventoryUnit"("serialNumber");

-- CreateIndex
CREATE INDEX "InventoryUnit_productId_idx" ON "InventoryUnit"("productId");

-- CreateIndex
CREATE INDEX "InventoryUnit_status_idx" ON "InventoryUnit"("status");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_customerEmail_idx" ON "Order"("customerEmail");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE INDEX "OrderItem_inventoryUnitId_idx" ON "OrderItem"("inventoryUnitId");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");

-- CreateIndex
CREATE INDEX "Product_brand_idx" ON "Product"("brand");

-- CreateIndex
CREATE INDEX "Product_isActive_idx" ON "Product"("isActive");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
