import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class InventoryRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.InventoryItemCreateInput): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        unit: string;
        currentStock: Prisma.Decimal;
        minimumStock: Prisma.Decimal;
        costPrice: Prisma.Decimal;
        supplierName: string | null;
    }>;
    findAll(): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        unit: string;
        currentStock: Prisma.Decimal;
        minimumStock: Prisma.Decimal;
        costPrice: Prisma.Decimal;
        supplierName: string | null;
    }[]>;
    findById(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        unit: string;
        currentStock: Prisma.Decimal;
        minimumStock: Prisma.Decimal;
        costPrice: Prisma.Decimal;
        supplierName: string | null;
    } | null>;
    findBySku(sku: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        unit: string;
        currentStock: Prisma.Decimal;
        minimumStock: Prisma.Decimal;
        costPrice: Prisma.Decimal;
        supplierName: string | null;
    } | null>;
    update(id: string, data: Prisma.InventoryItemUpdateInput): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        unit: string;
        currentStock: Prisma.Decimal;
        minimumStock: Prisma.Decimal;
        costPrice: Prisma.Decimal;
        supplierName: string | null;
    }>;
    delete(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        unit: string;
        currentStock: Prisma.Decimal;
        minimumStock: Prisma.Decimal;
        costPrice: Prisma.Decimal;
        supplierName: string | null;
    }>;
    createMovement(data: Prisma.StockMovementUncheckedCreateInput): Promise<{
        id: string;
        createdAt: Date;
        quantityChange: Prisma.Decimal;
        reason: string;
        inventoryItemId: string;
    }>;
    findMovements(inventoryItemId: string): Promise<{
        id: string;
        createdAt: Date;
        quantityChange: Prisma.Decimal;
        reason: string;
        inventoryItemId: string;
    }[]>;
}
