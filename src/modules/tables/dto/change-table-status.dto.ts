import { IsEnum, IsNotEmpty } from 'class-validator';
import { TableStatus } from '@prisma/client';

export class ChangeTableStatusDto {
  @IsEnum(TableStatus, { message: 'Invalid table status' })
  @IsNotEmpty({ message: 'Status is required' })
  status: TableStatus;
}
