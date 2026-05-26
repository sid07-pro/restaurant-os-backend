import { IsString, IsNotEmpty, IsUUID, IsInt, Min, IsOptional, IsDateString } from 'class-validator';

export class CreateReservationDto {
  @IsUUID('4')
  @IsNotEmpty()
  customerId: string;

  @IsUUID('4')
  @IsNotEmpty()
  tableId: string;

  @IsDateString()
  @IsNotEmpty()
  reservationTime: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  estimatedDurationMinutes?: number;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  guestCount: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
