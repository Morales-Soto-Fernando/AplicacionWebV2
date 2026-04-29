import { IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { InventoryCondition, InventoryStatus } from '@prisma/client';

export class UpdateInventoryDto {
  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  serialNumber?: string;

  @IsOptional()
  @IsEnum(InventoryStatus)
  status?: InventoryStatus;

  @IsOptional()
  @IsEnum(InventoryCondition)
  condition?: InventoryCondition;

  @IsOptional()
  @IsString()
  notes?: string;
}