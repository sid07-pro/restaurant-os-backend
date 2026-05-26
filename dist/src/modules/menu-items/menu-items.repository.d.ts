import { PrismaService } from '../../prisma/prisma.service';
import { MenuItem, Prisma } from '@prisma/client';
export interface FindAllMenuItemsOptions {
    categoryId?: string;
    search?: string;
}
export declare class MenuItemsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.MenuItemCreateInput): Promise<MenuItem>;
    findAll(options?: FindAllMenuItemsOptions): Promise<MenuItem[]>;
    findById(id: string): Promise<MenuItem | null>;
    update(id: string, data: Prisma.MenuItemUpdateInput): Promise<MenuItem>;
    delete(id: string): Promise<MenuItem>;
}
