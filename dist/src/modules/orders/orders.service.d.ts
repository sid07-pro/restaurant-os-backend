import { OrdersRepository } from './orders.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
export declare class OrdersService {
    private readonly ordersRepository;
    private readonly prisma;
    constructor(ordersRepository: OrdersRepository, prisma: PrismaService);
    create(dto: CreateOrderDto): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        tableId: string;
    }>;
    findAll(): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        tableId: string;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        tableId: string;
    }>;
    findByTable(tableId: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        tableId: string;
    }[]>;
    update(id: string, dto: UpdateOrderDto): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        tableId: string;
    }>;
    updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        tableId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        tableId: string;
    }>;
}
