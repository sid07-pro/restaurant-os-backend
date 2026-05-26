import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateTableDto {
  @IsString()
  @IsNotEmpty({ message: 'Table number is required' })
  tableNumber: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @Min(1, { message: 'Capacity must be at least 1' })
  capacity: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
