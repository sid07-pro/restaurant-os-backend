import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Table } from '@prisma/client';
export declare class TablesRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.TableCreateInput): Promise<Table>;
    findAll(): Promise<Table[]>;
    findById(id: string): Promise<Table | null>;
    findByTableNumber(tableNumber: string): Promise<Table | null>;
    update(id: string, data: Prisma.TableUpdateInput): Promise<Table>;
    delete(id: string): Promise<Table>;
}
