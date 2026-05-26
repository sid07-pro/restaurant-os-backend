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
exports.OrdersRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const ORDER_INCLUDE = {
    table: true,
    orderItems: {
        include: { menuItem: true },
    },
};
let OrdersRepository = class OrdersRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.order.create({ data, include: ORDER_INCLUDE });
    }
    async findAll() {
        return this.prisma.order.findMany({
            include: ORDER_INCLUDE,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findById(id) {
        return this.prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
    }
    async findByTable(tableId) {
        return this.prisma.order.findMany({
            where: { tableId },
            include: ORDER_INCLUDE,
            orderBy: { createdAt: 'desc' },
        });
    }
    async update(id, data) {
        return this.prisma.order.update({ where: { id }, data, include: ORDER_INCLUDE });
    }
    async delete(id) {
        return this.prisma.order.delete({ where: { id } });
    }
};
exports.OrdersRepository = OrdersRepository;
exports.OrdersRepository = OrdersRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersRepository);
//# sourceMappingURL=orders.repository.js.map