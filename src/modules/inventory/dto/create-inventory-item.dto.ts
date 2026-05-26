import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInventoryItemDto {
  @IsString()
  @IsNotEmpty({ message: 'name is required' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'sku is required' })
  sku: string;

  @IsString()
  @IsNotEmpty({ message: 'unit is required' })
  unit: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'currentStock must be >= 0' })
  @IsOptional()
  currentStock?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'minimumStock must be >= 0' })
  @IsOptional()
  minimumStock?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'costPrice must be >= 0' })
  @IsOptional()
  costPrice?: number;

  @IsString()
  @IsOptional()
  supplierName?: string;
}
