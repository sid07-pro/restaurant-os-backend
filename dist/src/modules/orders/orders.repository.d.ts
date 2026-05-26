import { PrismaService } from '../../prisma/prisma.service';
import { Order, Prisma } from '@prisma/client';
export declare class OrdersRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.OrderCreateInput): Promise<Order>;
    findAll(): Promise<Order[]>;
    findById(id: string): Promise<Order | null>;
    findByTable(tableId: string): Promise<Order[]>;
    update(id: string, data: Prisma.OrderUpdateInput): Promise<Order>;
    delete(id: string): Promise<Order>;
}
