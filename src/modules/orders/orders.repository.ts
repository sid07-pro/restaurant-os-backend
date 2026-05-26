import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Order, Prisma } from '@prisma/client';

const ORDER_INCLUDE = {
  table: true,
  orderItems: {
    include: { menuItem: true },
  },
};

@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.OrderCreateInput): Promise<Order> {
    return this.prisma.order.create({ data, include: ORDER_INCLUDE });
  }

  async findAll(): Promise<Order[]> {
    return this.prisma.order.findMany({
      include: ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Order | null> {
    return this.prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
  }

  async findByTable(tableId: string): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: { tableId },
      include: ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: Prisma.OrderUpdateInput): Promise<Order> {
    return this.prisma.order.update({ where: { id }, data, include: ORDER_INCLUDE });
  }

  async delete(id: string): Promise<Order> {
    return this.prisma.order.delete({ where: { id } });
  }
}
