import { CustomersRepository } from './customers.repository';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
export declare class CustomersService {
    private readonly repo;
    constructor(repo: CustomersRepository);
    create(dto: CreateCustomerDto): Promise<{
        name: string;
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        loyaltyPoints: number;
        totalVisits: number;
        totalSpent: import("@prisma/client-runtime-utils").Decimal;
    }>;
    findAll(query?: {
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
        totalSpent: import("@prisma/client-runtime-utils").Decimal;
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        loyaltyPoints: number;
        totalVisits: number;
        totalSpent: import("@prisma/client-runtime-utils").Decimal;
    }>;
    update(id: string, dto: UpdateCustomerDto): Promise<{
        name: string;
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        loyaltyPoints: number;
        totalVisits: number;
        totalSpent: import("@prisma/client-runtime-utils").Decimal;
    }>;
    remove(id: string): Promise<{
        name: string;
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        loyaltyPoints: number;
        totalVisits: number;
        totalSpent: import("@prisma/client-runtime-utils").Decimal;
    }>;
    addLoyaltyPoints(id: string, points: number): Promise<{
        name: string;
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        loyaltyPoints: number;
        totalVisits: number;
        totalSpent: import("@prisma/client-runtime-utils").Decimal;
    }>;
    deductLoyaltyPoints(id: string, points: number): Promise<{
        name: string;
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        loyaltyPoints: number;
        totalVisits: number;
        totalSpent: import("@prisma/client-runtime-utils").Decimal;
    }>;
    getLoyaltyBalance(id: string): Promise<{
        loyaltyPoints: number;
    }>;
    getSummary(id: string): Promise<{
        id: string;
        name: string;
        phone: string;
        email: string | null;
        loyaltyPoints: number;
        totalVisits: number;
        totalSpent: import("@prisma/client-runtime-utils").Decimal;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
