import { PrismaService } from '../../prisma/prisma.service';
import { Payment, Prisma } from '@prisma/client';
export declare class PaymentsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.PaymentCreateInput): Promise<Payment>;
    findAll(): Promise<Payment[]>;
    findById(id: string): Promise<Payment | null>;
    findByOrderId(orderId: string): Promise<Payment | null>;
    update(id: string, data: Prisma.PaymentUpdateInput): Promise<Payment>;
}
