import { IsDecimal, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @IsUUID('4', { message: 'orderId must be a valid UUID' })
  @IsNotEmpty({ message: 'orderId is required' })
  orderId: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'amount must be a valid number' })
  @Min(0.01, { message: 'Amount must be greater than 0' })
  amount: number;

  @IsEnum(PaymentMethod, { message: 'paymentMethod must be CASH, CARD, or UPI' })
  @IsNotEmpty({ message: 'paymentMethod is required' })
  paymentMethod: PaymentMethod;

  @IsString()
  @IsOptional()
  transactionReference?: string;
}
