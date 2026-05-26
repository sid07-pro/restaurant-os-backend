import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Table } from '@prisma/client';

@Injectable()
export class TablesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.TableCreateInput): Promise<Table> {
    return this.prisma.table.create({ data });
  }

  async findAll(): Promise<Table[]> {
    return this.prisma.table.findMany({
      orderBy: { tableNumber: 'asc' },
    });
  }

  async findById(id: string): Promise<Table | null> {
    return this.prisma.table.findUnique({ where: { id } });
  }

  async findByTableNumber(tableNumber: string): Promise<Table | null> {
    return this.prisma.table.findUnique({ where: { tableNumber } });
  }

  async update(id: string, data: Prisma.TableUpdateInput): Promise<Table> {
    return this.prisma.table.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Table> {
    return this.prisma.table.delete({ where: { id } });
  }
}
