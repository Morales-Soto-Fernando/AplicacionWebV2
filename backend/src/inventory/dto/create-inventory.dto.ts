import { IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { InventoryCondition, InventoryStatus } from '@prisma/client';

export class CreateInventoryDto {
  @IsUUID()
  productId: string;

  @IsString()
  @MinLength(1)
  serialNumber: string;

  @IsEnum(InventoryStatus)
  status: InventoryStatus;

  @IsEnum(InventoryCondition)
  condition: InventoryCondition;

  @IsOptional()
  @IsString()
  notes?: string;
}