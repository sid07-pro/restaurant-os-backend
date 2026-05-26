import { IsString, IsNotEmpty, IsPhoneNumber, IsOptional, IsInt, Min } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @IsString()
  @IsOptional()
  email?: string;
}
