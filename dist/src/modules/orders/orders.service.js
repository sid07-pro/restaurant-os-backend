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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const orders_repository_1 = require("./orders.repository");
const prisma_service_1 = require("../../prisma/prisma.service");
const realtime_service_1 = require("../realtime/realtime.service");
const STATUS_TRANSITIONS = {
    OPEN: [client_1.OrderStatus.SENT_TO_KITCHEN, client_1.OrderStatus.CANCELLED],
    SENT_TO_KITCHEN: [client_1.OrderStatus.PREPARING, client_1.OrderStatus.CANCELLED],
    PREPARING: [client_1.OrderStatus.READY, client_1.OrderStatus.CANCELLED],
    READY: [client_1.OrderStatus.SERVED, client_1.OrderStatus.CANCELLED],
    SERVED: [client_1.OrderStatus.COMPLETED, client_1.OrderStatus.CANCELLED],
    COMPLETED: [],
    CANCELLED: [],
};
let OrdersService = class OrdersService {
    ordersRepository;
    prisma;
    realtimeService;
    constructor(ordersRepository, prisma, realtimeService) {
        this.ordersRepository = ordersRepository;
        this.prisma = prisma;
        this.realtimeService = realtimeService;
    }
    buildOrderPayload(order) {
        return {
            orderId: order.id,
            tableId: order.tableId,
            tableNumber: order.table?.tableNumber,
            status: order.status,
            subtotal: order.subtotal,
            timestamp: new Date().toISOString(),
        };
    }
    async create(dto) {
        const table = await this.prisma.table.findUnique({ where: { id: dto.tableId } });
        if (!table) {
            throw new common_1.NotFoundException(`Table with ID ${dto.tableId} not found`);
        }
        if (table.status === 'OUT_OF_SERVICE') {
            throw new common_1.BadRequestException(`Table ${table.tableNumber} is OUT_OF_SERVICE and cannot accept orders`);
        }
        if (!dto.items || dto.items.length === 0) {
            throw new common_1.BadRequestException('Order must contain at least one item');
        }
        const menuItemIds = dto.items.map((i) => i.menuItemId);
        const menuItems = await this.prisma.menuItem.findMany({
            where: { id: { in: menuItemIds } },
        });
        const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));
        for (const item of dto.items) {
            const menuItem = menuItemMap.get(item.menuItemId);
            if (!menuItem) {
                throw new common_1.BadRequestException(`Menu item with ID ${item.menuItemId} does not exist`);
            }
            if (!menuItem.isAvailable) {
                throw new common_1.BadRequestException(`Menu item '${menuItem.name}' is not available`);
            }
        }
        let subtotal = 0;
        const orderItemsData = dto.items.map((item) => {
            const menuItem = menuItemMap.get(item.menuItemId);
            const unitPrice = Number(menuItem.price);
            const lineTotal = unitPrice * item.quantity;
            subtotal += lineTotal;
            return {
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                unitPrice,
                lineTotal,
                notes: item.notes,
            };
        });
        const order = await this.ordersRepository.create({
            table: { connect: { id: dto.tableId } },
            notes: dto.notes,
            status: 'SENT_TO_KITCHEN',
            subtotal,
            orderItems: {
                create: orderItemsData,
            },
        });
        const updatedTable = await this.prisma.table.update({
            where: { id: dto.tableId },
            data: { status: 'OCCUPIED' },
        });
        this.realtimeService.emitOrderCreated({
            ...this.buildOrderPayload(order),
            tableNumber: table.tableNumber,
        });
        this.realtimeService.emitTableStatusUpdated({
            tableId: updatedTable.id,
            tableNumber: table.tableNumber,
            status: updatedTable.status,
            timestamp: new Date().toISOString(),
        });
        return order;
    }
    async findAll() {
        return this.ordersRepository.findAll();
    }
    async findOne(id) {
        const order = await this.ordersRepository.findById(id);
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${id} not found`);
        }
        return order;
    }
    async findByTable(tableId) {
        const table = await this.prisma.table.findUnique({ where: { id: tableId } });
        if (!table) {
            throw new common_1.NotFoundException(`Table with ID ${tableId} not found`);
        }
        return this.ordersRepository.findByTable(tableId);
    }
    async update(id, dto) {
        await this.findOne(id);
        const order = await this.ordersRepository.update(id, { notes: dto.notes });
        this.realtimeService.emitOrderUpdated(this.buildOrderPayload(order));
        return order;
    }
    async updateStatus(id, dto) {
        const order = await this.findOne(id);
        const currentStatus = order.status;
        const newStatus = dto.status;
        const allowed = STATUS_TRANSITIONS[currentStatus];
        if (!allowed.includes(newStatus)) {
            throw new common_1.UnprocessableEntityException(`Cannot transition order from ${currentStatus} to ${newStatus}. ` +
                `Allowed transitions: [${allowed.join(', ') || 'none'}]`);
        }
        const updated = await this.ordersRepository.update(id, { status: newStatus });
        const payload = this.buildOrderPayload(updated);
        if (newStatus === client_1.OrderStatus.CANCELLED) {
            this.realtimeService.emitOrderCancelled(payload);
        }
        else {
            this.realtimeService.emitOrderStatusUpdated(payload);
        }
        return updated;
    }
    async remove(id) {
        const order = await this.findOne(id);
        if (order.status === client_1.OrderStatus.COMPLETED || order.status === client_1.OrderStatus.CANCELLED) {
            throw new common_1.BadRequestException(`Cannot delete a ${order.status} order. Only OPEN or in-progress orders can be deleted.`);
        }
        return this.ordersRepository.delete(id);
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [orders_repository_1.OrdersRepository,
        prisma_service_1.PrismaService,
        realtime_service_1.RealtimeService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map