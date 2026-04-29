import { ProductCategory } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
  IsUrl,
  Length,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  brand!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  model?: string | null;

  // Puedes mandarlo o dejar que Prisma use el default (CONSOLE)
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string | null;

  // Permitimos vacío "" (como en tu seed). Si viene con algo, validamos que sea URL.
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @ValidateIf((o) => o.imageUrl !== '' && o.imageUrl !== null && o.imageUrl !== undefined)
  @IsUrl({ require_protocol: true })
  imageUrl?: string | null;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceCents!: number;

  // Prisma default "MXN" — opcional, pero si lo mandas debe ser 3 letras.
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}