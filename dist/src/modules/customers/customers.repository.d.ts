import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class CustomersRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.CustomerCreateInput): Promise<{
        name: string;
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        loyaltyPoints: number;
        totalVisits: number;
        totalSpent: Prisma.Decimal;
    }>;
    findAll(params?: {
        search?: string;
        phone?: string;
    }): Promise<{
        name: string;
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        loyaltyPoints: number;
        totalVisits: number;
        totalSpent: Prisma.Decimal;
    }[]>;
    findById(id: string): Promise<{
        name: string;
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        loyaltyPoints: number;
        totalVisits: number;
        totalSpent: Prisma.Decimal;
    } | null>;
    findByPhone(phone: string): Promise<{
        name: string;
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        loyaltyPoints: number;
        totalVisits: number;
        totalSpent: Prisma.Decimal;
    } | null>;
    update(id: string, data: Prisma.CustomerUpdateInput): Promise<{
        name: string;
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        loyaltyPoints: number;
        totalVisits: number;
        totalSpent: Prisma.Decimal;
    }>;
    delete(id: string): Promise<{
        name: string;
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        loyaltyPoints: number;
        totalVisits: number;
        totalSpent: Prisma.Decimal;
    }>;
}
