import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class AdjustStockDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'quantityChange must be a valid number' })
  @IsNotEmpty({ message: 'quantityChange is required' })
  quantityChange: number;

  @IsString()
  @IsNotEmpty({ message: 'reason is required' })
  reason: string;
}
