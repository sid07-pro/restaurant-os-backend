"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationsService = void 0;
const common_1 = require("@nestjs/common");
const reservations_repository_1 = require("./reservations.repository");
const prisma_service_1 = require("../../prisma/prisma.service");
let ReservationsService = class ReservationsService {
    repo;
    prisma;
    constructor(repo, prisma) {
        this.repo = repo;
        this.prisma = prisma;
    }
    async checkOverlap(tableId, time, duration, excludeReservationId) {
        const active = await this.repo.findActiveReservationsByTable(tableId);
        const newStart = time.getTime();
        const newEnd = newStart + duration * 60000;
        for (const r of active) {
            if (excludeReservationId && r.id === excludeReservationId) {
                continue;
            }
            const rStart = new Date(r.reservationTime).getTime();
            const rEnd = rStart + r.estimatedDurationMinutes * 60000;
            if (newStart < rEnd && rStart < newEnd) {
                return true;
            }
        }
        return false;
    }
    async create(dto) {
        const customer = await this.prisma.customer.findUnique({
            where: { id: dto.customerId },
        });
        if (!customer) {
            throw new common_1.NotFoundException(`Customer with ID ${dto.customerId} not found`);
        }
        const table = await this.prisma.table.findUnique({
            where: { id: dto.tableId },
        });
        if (!table) {
            throw new common_1.NotFoundException(`Table with ID ${dto.tableId} not found`);
        }
        if (table.status === 'OUT_OF_SERVICE') {
            throw new common_1.BadRequestException('Table is out of service');
        }
        if (dto.guestCount > table.capacity) {
            throw new common_1.BadRequestException(`Guest count ${dto.guestCount} exceeds table capacity of ${table.capacity}`);
        }
        const reservationTime = new Date(dto.reservationTime);
        if (reservationTime.getTime() <= Date.now()) {
            throw new common_1.BadRequestException('Reservation time must be in the future');
        }
        const duration = dto.estimatedDurationMinutes || 120;
        const hasOverlap = await this.checkOverlap(dto.tableId, reservationTime, duration);
        if (hasOverlap) {
            throw new common_1.ConflictException('Overlapping active reservation exists for this table');
        }
        return this.repo.create({
            customerId: dto.customerId,
            tableId: dto.tableId,
            reservationTime,
            estimatedDurationMinutes: duration,
            guestCount: dto.guestCount,
            notes: dto.notes,
        });
    }
    async findAll(filters = {}) {
        return this.repo.findAll(filters);
    }
    async findOne(id) {
        const reservation = await this.repo.findById(id);
        if (!reservation) {
            throw new common_1.NotFoundException(`Reservation with ID ${id} not found`);
        }
        return reservation;
    }
    async update(id, dto) {
        const existing = await this.findOne(id);
        const targetTableId = dto.tableId ?? existing.tableId;
        const table = await this.prisma.table.findUnique({
            where: { id: targetTableId },
        });
        if (!table) {
            throw new common_1.NotFoundException(`Table with ID ${targetTableId} not found`);
        }
        if (table.status === 'OUT_OF_SERVICE') {
            throw new common_1.BadRequestException('Table is out of service');
        }
        const guestCount = dto.guestCount ?? existing.guestCount;
        if (guestCount > table.capacity) {
            throw new common_1.BadRequestException(`Guest count ${guestCount} exceeds table capacity of ${table.capacity}`);
        }
        const reservationTime = dto.reservationTime
            ? new Date(dto.reservationTime)
            : new Date(existing.reservationTime);
        if (dto.reservationTime && reservationTime.getTime() <= Date.now()) {
            throw new common_1.BadRequestException('Reservation time must be in the future');
        }
        const duration = dto.estimatedDurationMinutes ?? existing.estimatedDurationMinutes;
        const hasOverlap = await this.checkOverlap(targetTableId, reservationTime, duration, id);
        if (hasOverlap) {
            throw new common_1.ConflictException('Overlapping active reservation exists for this table');
        }
        return this.repo.update(id, {
            tableId: targetTableId,
            reservationTime,
            estimatedDurationMinutes: duration,
            guestCount,
            notes: dto.notes !== undefined ? dto.notes : existing.notes,
        });
    }
    async updateStatus(id, status) {
        const existing = await this.findOne(id);
        const current = existing.status;
        let valid = false;
        if (current === status) {
            valid = true;
        }
        else if (current === 'PENDING') {
            valid = status === 'CONFIRMED' || status === 'CANCELLED';
        }
        else if (current === 'CONFIRMED') {
            valid = status === 'SEATED' || status === 'CANCELLED' || status === 'NO_SHOW';
        }
        else if (current === 'SEATED') {
            valid = status === 'COMPLETED';
        }
        if (!valid) {
            throw new common_1.UnprocessableEntityException(`Invalid status transition from ${current} to ${status}`);
        }
        if (status === 'SEATED') {
            await this.prisma.table.update({
                where: { id: existing.tableId },
                data: { status: 'OCCUPIED' },
            });
        }
        else if (status === 'COMPLETED') {
            await this.prisma.table.update({
                where: { id: existing.tableId },
                data: { status: 'AVAILABLE' },
            });
        }
        return this.repo.update(id, { status });
    }
    async remove(id) {
        await this.findOne(id);
        return this.repo.delete(id);
    }
    async findByCustomer(customerId) {
        const customer = await this.prisma.customer.findUnique({
            where: { id: customerId },
        });
        if (!customer) {
            throw new common_1.NotFoundException(`Customer with ID ${customerId} not found`);
        }
        return this.repo.findAll({ customerId });
    }
    async findByTable(tableId) {
        const table = await this.prisma.table.findUnique({
            where: { id: tableId },
        });
        if (!table) {
            throw new common_1.NotFoundException(`Table with ID ${tableId} not found`);
        }
        return this.repo.findAll({ tableId });
    }
    async findByDate(dateStr) {
        return this.repo.findAll({ date: dateStr });
    }
};
exports.ReservationsService = ReservationsService;
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [reservations_repository_1.ReservationsRepository,
        prisma_service_1.PrismaService])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map