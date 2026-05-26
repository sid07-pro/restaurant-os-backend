import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class InventoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.InventoryItemCreateInput) {
    return this.prisma.inventoryItem.create({ data });
  }

  async findAll() {
    return this.prisma.inventoryItem.findMany({ orderBy: { name: 'asc' } });
  }

  async findById(id: string) {
    return this.prisma.inventoryItem.findUnique({ where: { id } });
  }

  async findBySku(sku: string) {
    return this.prisma.inventoryItem.findUnique({ where: { sku } });
  }

  async update(id: string, data: Prisma.InventoryItemUpdateInput) {
    return this.prisma.inventoryItem.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.inventoryItem.delete({ where: { id } });
  }

  async createMovement(data: Prisma.StockMovementUncheckedCreateInput) {
    return this.prisma.stockMovement.create({ data });
  }

  async findMovements(inventoryItemId: string) {
    return this.prisma.stockMovement.findMany({
      where: { inventoryItemId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
