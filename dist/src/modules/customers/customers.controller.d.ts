import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { AdjustLoyaltyDto } from './dto/adjust-loyalty.dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
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
    findAll(search?: string, phone?: string): Promise<{
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
    addLoyaltyPoints(id: string, dto: AdjustLoyaltyDto): Promise<{
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
    deductLoyaltyPoints(id: string, dto: AdjustLoyaltyDto): Promise<{
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
