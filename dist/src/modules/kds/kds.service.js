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
exports.KdsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const realtime_service_1 = require("../realtime/realtime.service");
const ORDER_KDS_INCLUDE = {
    table: true,
    orderItems: {
        include: { menuItem: { select: { id: true, name: true, description: true } } },
    },
};
let KdsService = class KdsService {
    prisma;
    realtimeService;
    constructor(prisma, realtimeService) {
        this.prisma = prisma;
        this.realtimeService = realtimeService;
    }
    calcPreparationDurationSeconds(order) {
        if (!order.preparationStartedAt)
            return null;
        const end = order.readyAt ?? new Date();
        return Math.round((end.getTime() - new Date(order.preparationStartedAt).getTime()) / 1000);
    }
    formatTicket(order) {
        return {
            ...order,
            preparationDurationSeconds: this.calcPreparationDurationSeconds(order),
        };
    }
    async findOrder(orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: ORDER_KDS_INCLUDE,
        });
        if (!order)
            throw new common_1.NotFoundException(`Order with ID ${orderId} not found`);
        return order;
    }
    assertTransition(current, next, allowed) {
        if (!allowed.includes(current)) {
            throw new common_1.UnprocessableEntityException(`This action requires order status to be [${allowed.join(' | ')}]. Current status: ${current}`);
        }
    }
    buildKdsPayload(order) {
        return {
            orderId: order.id,
            tableNumber: order.table?.tableNumber ?? '',
            status: order.status,
            preparationStartedAt: order.preparationStartedAt?.toISOString() ?? null,
            readyAt: order.readyAt?.toISOString() ?? null,
            servedAt: order.servedAt?.toISOString() ?? null,
            timestamp: new Date().toISOString(),
        };
    }
    async getActiveTickets() {
        const orders = await this.prisma.order.findMany({
            where: {
                status: {
                    in: [
                        client_1.OrderStatus.SENT_TO_KITCHEN,
                        client_1.OrderStatus.PREPARING,
                        client_1.OrderStatus.READY,
                    ],
                },
            },
            include: ORDER_KDS_INCLUDE,
            orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
        });
        return orders.map((o) => this.formatTicket(o));
    }
    async startPreparing(orderId) {
        const order = await this.findOrder(orderId);
        this.assertTransition(order.status, client_1.OrderStatus.PREPARING, [
            client_1.OrderStatus.SENT_TO_KITCHEN,
        ]);
        const updated = await this.prisma.order.update({
            where: { id: orderId },
            data: {
                status: client_1.OrderStatus.PREPARING,
                preparationStartedAt: new Date(),
            },
            include: ORDER_KDS_INCLUDE,
        });
        this.realtimeService.emitKdsTicketPreparing(this.buildKdsPayload(updated));
        return this.formatTicket(updated);
    }
    async markReady(orderId) {
        const order = await this.findOrder(orderId);
        this.assertTransition(order.status, client_1.OrderStatus.READY, [
            client_1.OrderStatus.PREPARING,
        ]);
        const updated = await this.prisma.order.update({
            where: { id: orderId },
            data: {
                status: client_1.OrderStatus.READY,
                readyAt: new Date(),
            },
            include: ORDER_KDS_INCLUDE,
        });
        this.realtimeService.emitKdsTicketReady(this.buildKdsPayload(updated));
        return this.formatTicket(updated);
    }
    async markServed(orderId) {
        const order = await this.findOrder(orderId);
        this.assertTransition(order.status, client_1.OrderStatus.SERVED, [
            client_1.OrderStatus.READY,
        ]);
        const updated = await this.prisma.order.update({
            where: { id: orderId },
            data: {
                status: client_1.OrderStatus.SERVED,
                servedAt: new Date(),
            },
            include: ORDER_KDS_INCLUDE,
        });
        this.realtimeService.emitKdsTicketServed(this.buildKdsPayload(updated));
        return this.formatTicket(updated);
    }
    async updateKitchenNotes(orderId, dto) {
        await this.findOrder(orderId);
        const updated = await this.prisma.order.update({
            where: { id: orderId },
            data: { kitchenNotes: dto.kitchenNotes },
            include: ORDER_KDS_INCLUDE,
        });
        return this.formatTicket(updated);
    }
    async updatePriority(orderId, dto) {
        await this.findOrder(orderId);
        const updated = await this.prisma.order.update({
            where: { id: orderId },
            data: { priority: dto.priority },
            include: ORDER_KDS_INCLUDE,
        });
        return this.formatTicket(updated);
    }
    async getTicket(orderId) {
        const order = await this.findOrder(orderId);
        return this.formatTicket(order);
    }
};
exports.KdsService = KdsService;
exports.KdsService = KdsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        realtime_service_1.RealtimeService])
], KdsService);
//# sourceMappingURL=kds.service.js.map