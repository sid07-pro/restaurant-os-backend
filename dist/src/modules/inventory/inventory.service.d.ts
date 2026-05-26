import { InventoryRepository } from './inventory.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
export declare class InventoryService {
    private readonly repo;
    private readonly prisma;
    constructor(repo: InventoryRepository, prisma: PrismaService);
    private addFlags;
    create(dto: CreateInventoryItemDto): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateInventoryItemDto): Promise<any>;
    remove(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        unit: string;
        currentStock: import("@prisma/client-runtime-utils").Decimal;
        minimumStock: import("@prisma/client-runtime-utils").Decimal;
        costPrice: import("@prisma/client-runtime-utils").Decimal;
        supplierName: string | null;
    }>;
    adjustStock(id: string, dto: AdjustStockDto): Promise<any>;
    getMovements(id: string): Promise<{
        id: string;
        createdAt: Date;
        quantityChange: import("@prisma/client-runtime-utils").Decimal;
        reason: string;
        inventoryItemId: string;
    }[]>;
}
