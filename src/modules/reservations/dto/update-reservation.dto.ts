import { IsString, IsInt, Min, IsOptional, IsDateString, IsUUID } from 'class-validator';

export class UpdateReservationDto {
  @IsUUID('4')
  @IsOptional()
  tableId?: string;

  @IsDateString()
  @IsOptional()
  reservationTime?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  estimatedDurationMinutes?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  guestCount?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
