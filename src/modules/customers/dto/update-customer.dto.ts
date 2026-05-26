import { IsString, IsOptional, IsInt, Min, IsNumber, IsPhoneNumber } from 'class-validator';

export class UpdateCustomerDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  loyaltyPoints?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  totalVisits?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalSpent?: number;
}
