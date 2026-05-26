import { PrismaService } from '../../prisma/prisma.service';
import { Category, Prisma } from '@prisma/client';
export declare class CategoriesRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.CategoryCreateInput): Promise<Category>;
    findAll(): Promise<Category[]>;
    findById(id: string): Promise<Category | null>;
    findByName(name: string): Promise<Category | null>;
    update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category>;
    delete(id: string): Promise<Category>;
    countMenuItems(id: string): Promise<number>;
}
