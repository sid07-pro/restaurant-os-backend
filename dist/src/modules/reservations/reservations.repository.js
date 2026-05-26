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
exports.ReservationsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ReservationsRepository = class ReservationsRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.reservation.create({
            data,
            include: { customer: true, table: true },
        });
    }
    async findAll(filters = {}) {
        const where = {};
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
    async findById(id) {
        return this.prisma.reservation.findUnique({
            where: { id },
            include: { customer: true, table: true },
        });
    }
    async update(id, data) {
        return this.prisma.reservation.update({
            where: { id },
            data,
            include: { customer: true, table: true },
        });
    }
    async delete(id) {
        return this.prisma.reservation.delete({
            where: { id },
            include: { customer: true, table: true },
        });
    }
    async findActiveReservationsByTable(tableId) {
        return this.prisma.reservation.findMany({
            where: {
                tableId,
                status: {
                    in: [client_1.ReservationStatus.PENDING, client_1.ReservationStatus.CONFIRMED],
                },
            },
        });
    }
};
exports.ReservationsRepository = ReservationsRepository;
exports.ReservationsRepository = ReservationsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReservationsRepository);
//# sourceMappingURL=reservations.repository.js.map