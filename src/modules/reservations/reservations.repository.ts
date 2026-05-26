import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, ReservationStatus } from '@prisma/client';

@Injectable()
export class ReservationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ReservationUncheckedCreateInput) {
    return this.prisma.reservation.create({
      data,
      include: { customer: true, table: true },
    });
  }

  async findAll(filters: {
    status?: ReservationStatus;
    customerId?: string;
    tableId?: string;
    date?: string;
  } = {}) {
    const where: Prisma.ReservationWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters.tableId) {
      where.tableId = filters.tableId;
    }

    if (filters.date) {
      // Filter by calendar day
      const date = new Date(filters.date);
      const startOfDay = new Date(date.setUTCHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setUTCHours(23, 59, 59, 999));
      where.reservationTime = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    return this.prisma.reservation.findMany({
      where,
      include: { customer: true, table: true },
      orderBy: { reservationTime: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.reservation.findUnique({
      where: { id },
      include: { customer: true, table: true },
    });
  }

  async update(id: string, data: Prisma.ReservationUncheckedUpdateInput) {
    return this.prisma.reservation.update({
      where: { id },
      data,
      include: { customer: true, table: true },
    });
  }

  async delete(id: string) {
    return this.prisma.reservation.delete({
      where: { id },
      include: { customer: true, table: true },
    });
  }

  async findActiveReservationsByTable(tableId: string) {
    return this.prisma.reservation.findMany({
      where: {
        tableId,
        status: {
          in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
        },
      },
    });
  }
}
