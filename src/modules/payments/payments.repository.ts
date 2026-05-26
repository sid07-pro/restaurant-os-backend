import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Payment, Prisma } from '@prisma/client';

const PAYMENT_INCLUDE = {
  order: {
    include: {
      table: true,
      orderItems: {
        include: { menuItem: { select: { id: true, name: true } } },
      },
    },
  },
};

@Injectable()
export class PaymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.PaymentCreateInput): Promise<Payment> {
    return this.prisma.payment.create({ data, include: PAYMENT_INCLUDE });
  }

  async findAll(): Promise<Payment[]> {
    return this.prisma.payment.findMany({
      include: PAYMENT_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Payment | null> {
    return this.prisma.payment.findUnique({ where: { id }, include: PAYMENT_INCLUDE });
  }

  async findByOrderId(orderId: string): Promise<Payment | null> {
    return this.prisma.payment.findUnique({ where: { orderId }, include: PAYMENT_INCLUDE });
  }

  async update(id: string, data: Prisma.PaymentUpdateInput): Promise<Payment> {
    return this.prisma.payment.update({ where: { id }, data, include: PAYMENT_INCLUDE });
  }
}
