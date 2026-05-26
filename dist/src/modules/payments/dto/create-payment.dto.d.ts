import { PaymentMethod } from '@prisma/client';
export declare class CreatePaymentDto {
    orderId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    transactionReference?: string;
}
