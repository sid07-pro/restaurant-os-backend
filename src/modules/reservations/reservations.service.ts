import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ReservationsRepository } from './reservations.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationStatus } from '@prisma/client';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly repo: ReservationsRepository,
    private readonly prisma: PrismaService,
  ) {}

  private async checkOverlap(
    tableId: string,
    time: Date,
    duration: number,
    excludeReservationId?: string,
  ): Promise<boolean> {
    const active = await this.repo.findActiveReservationsByTable(tableId);
    const newStart = time.getTime();
    const newEnd = newStart + duration * 60000;

    for (const r of active) {
      if (excludeReservationId && r.id === excludeReservationId) {
        continue;
      }
      const rStart = new Date(r.reservationTime).getTime();
      const rEnd = rStart + r.estimatedDurationMinutes * 60000;

      // Overlap math: Max(start1, start2) < Min(end1, end2)
      if (newStart < rEnd && rStart < newEnd) {
        return true;
      }
    }
    return false;
  }

  async create(dto: CreateReservationDto) {
    // 1. Verify Customer exists
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
    });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${dto.customerId} not found`);
    }

    // 2. Verify Table exists
    const table = await this.prisma.table.findUnique({
      where: { id: dto.tableId },
    });
    if (!table) {
      throw new NotFoundException(`Table with ID ${dto.tableId} not found`);
    }

    // 3. Verify Table is not OUT_OF_SERVICE
    if (table.status === 'OUT_OF_SERVICE') {
      throw new BadRequestException('Table is out of service');
    }

    // 4. Verify guestCount matches capacity
    if (dto.guestCount > table.capacity) {
      throw new BadRequestException(`Guest count ${dto.guestCount} exceeds table capacity of ${table.capacity}`);
    }

    // 5. Verify time is in the future
    const reservationTime = new Date(dto.reservationTime);
    if (reservationTime.getTime() <= Date.now()) {
      throw new BadRequestException('Reservation time must be in the future');
    }

    // 6. Verify no overlaps
    const duration = dto.estimatedDurationMinutes || 120;
    const hasOverlap = await this.checkOverlap(
      dto.tableId,
      reservationTime,
      duration,
    );
    if (hasOverlap) {
      throw new ConflictException('Overlapping active reservation exists for this table');
    }

    // 7. Save
    return this.repo.create({
      customerId: dto.customerId,
      tableId: dto.tableId,
      reservationTime,
      estimatedDurationMinutes: duration,
      guestCount: dto.guestCount,
      notes: dto.notes,
    });
  }

  async findAll(filters: {
    status?: ReservationStatus;
    customerId?: string;
    tableId?: string;
    date?: string;
  } = {}) {
    return this.repo.findAll(filters);
  }

  async findOne(id: string) {
    const reservation = await this.repo.findById(id);
    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }
    return reservation;
  }

  async update(id: string, dto: UpdateReservationDto) {
    const existing = await this.findOne(id);

    const targetTableId = dto.tableId ?? existing.tableId;
    const table = await this.prisma.table.findUnique({
      where: { id: targetTableId },
    });
    if (!table) {
      throw new NotFoundException(`Table with ID ${targetTableId} not found`);
    }
    if (table.status === 'OUT_OF_SERVICE') {
      throw new BadRequestException('Table is out of service');
    }

    const guestCount = dto.guestCount ?? existing.guestCount;
    if (guestCount > table.capacity) {
      throw new BadRequestException(`Guest count ${guestCount} exceeds table capacity of ${table.capacity}`);
    }

    const reservationTime = dto.reservationTime
      ? new Date(dto.reservationTime)
      : new Date(existing.reservationTime);

    if (dto.reservationTime && reservationTime.getTime() <= Date.now()) {
      throw new BadRequestException('Reservation time must be in the future');
    }

    const duration = dto.estimatedDurationMinutes ?? existing.estimatedDurationMinutes;

    const hasOverlap = await this.checkOverlap(
      targetTableId,
      reservationTime,
      duration,
      id,
    );
    if (hasOverlap) {
      throw new ConflictException('Overlapping active reservation exists for this table');
    }

    return this.repo.update(id, {
      tableId: targetTableId,
      reservationTime,
      estimatedDurationMinutes: duration,
      guestCount,
      notes: dto.notes !== undefined ? dto.notes : existing.notes,
    });
  }

  async updateStatus(id: string, status: ReservationStatus) {
    const existing = await this.findOne(id);
    const current = existing.status;

    let valid = false;
    if (current === status) {
      valid = true;
    } else if (current === 'PENDING') {
      valid = status === 'CONFIRMED' || status === 'CANCELLED';
    } else if (current === 'CONFIRMED') {
      valid = status === 'SEATED' || status === 'CANCELLED' || status === 'NO_SHOW';
    } else if (current === 'SEATED') {
      valid = status === 'COMPLETED';
    }

    if (!valid) {
      throw new UnprocessableEntityException(
        `Invalid status transition from ${current} to ${status}`,
      );
    }

    // Table synchronization side effects
    if (status === 'SEATED') {
      await this.prisma.table.update({
        where: { id: existing.tableId },
        data: { status: 'OCCUPIED' },
      });
    } else if (status === 'COMPLETED') {
      await this.prisma.table.update({
        where: { id: existing.tableId },
        data: { status: 'AVAILABLE' },
      });
    }

    return this.repo.update(id, { status });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repo.delete(id);
  }

  async findByCustomer(customerId: string) {
    // Check customer existence
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }
    return this.repo.findAll({ customerId });
  }

  async findByTable(tableId: string) {
    // Check table existence
    const table = await this.prisma.table.findUnique({
      where: { id: tableId },
    });
    if (!table) {
      throw new NotFoundException(`Table with ID ${tableId} not found`);
    }
    return this.repo.findAll({ tableId });
  }

  async findByDate(dateStr: string) {
    return this.repo.findAll({ date: dateStr });
  }
}
