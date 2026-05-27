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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const payments_repository_1 = require("./payments.repository");
const prisma_service_1 = require("../../prisma/prisma.service");
const realtime_service_1 = require("../realtime/realtime.service");
let PaymentsService = class PaymentsService {
    paymentsRepository;
    prisma;
    realtimeService;
    constructor(paymentsRepository, prisma, realtimeService) {
        this.paymentsRepository = paymentsRepository;
        this.prisma = prisma;
        this.realtimeService = realtimeService;
    }
    async create(dto) {
        const order = await this.prisma.order.findUnique({
            where: { id: dto.orderId },
            include: { payment: true, table: true, orderItems: { include: { menuItem: true } } },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${dto.orderId} not found`);
        }
        if (order.status !== client_1.OrderStatus.SERVED && order.status !== client_1.OrderStatus.COMPLETED) {
            throw new common_1.BadRequestException(`Order must be SERVED or COMPLETED to accept payment. Current status: ${order.status}`);
        }
        if (order.payment) {
            throw new common_1.ConflictException(`Order ${dto.orderId} already has a payment`);
        }
        const subtotal = Number(order.subtotal);
        if (Math.abs(dto.amount - subtotal) > 0.01) {
            throw new common_1.BadRequestException(`Payment amount (${dto.amount}) does not match order subtotal (${subtotal})`);
        }
        const payment = await this.prisma.$transaction(async (tx) => {
            const p = await tx.payment.create({
                data: {
                    order: { connect: { id: dto.orderId } },
                    amount: dto.amount,
                    paymentMethod: dto.paymentMethod,
                    paymentStatus: client_1.PaymentStatus.COMPLETED,
                    transactionReference: dto.transactionReference,
                    paidAt: new Date(),
                },
                include: {
                    order: {
                        include: {
                            table: true,
                            orderItems: { include: { menuItem: { select: { id: true, name: true } } } },
                        },
                    },
                },
            });
            await tx.order.update({
                where: { id: dto.orderId },
                data: { status: client_1.OrderStatus.COMPLETED },
            });
            return p;
        });
        this.realtimeService.emitPaymentCompleted({
            paymentId: payment.id,
            orderId: payment.orderId,
            amount: payment.amount,
            paymentMethod: payment.paymentMethod,
            timestamp: new Date().toISOString(),
        });
        return payment;
    }
    async findAll() {
        return this.paymentsRepository.findAll();
    }
    async findOne(id) {
        const payment = await this.paymentsRepository.findById(id);
        if (!payment) {
            throw new common_1.NotFoundException(`Payment with ID ${id} not found`);
        }
        return payment;
    }
    async findByOrder(orderId) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${orderId} not found`);
        }
        const payment = await this.paymentsRepository.findByOrderId(orderId);
        if (!payment) {
            throw new common_1.NotFoundException(`No payment found for order ${orderId}`);
        }
        return payment;
    }
    async refund(id) {
        const payment = await this.findOne(id);
        if (payment.paymentStatus !== client_1.PaymentStatus.COMPLETED) {
            throw new common_1.UnprocessableEntityException(`Only COMPLETED payments can be refunded. Current status: ${payment.paymentStatus}`);
        }
        const refunded = await this.paymentsRepository.update(id, {
            paymentStatus: client_1.PaymentStatus.REFUNDED,
        });
        this.realtimeService.emitPaymentRefunded({
            paymentId: refunded.id,
            orderId: refunded.orderId,
            amount: refunded.amount,
            paymentMethod: refunded.paymentMethod,
            timestamp: new Date().toISOString(),
        });
        return refunded;
    }
    async getReceipt(paymentId) {
        const payment = await this.findOne(paymentId);
        const order = payment.order;
        return {
            receiptId: payment.id,
            orderId: order.id,
            tableNumber: order.table.tableNumber,
            items: order.orderItems.map((oi) => ({
                name: oi.menuItem.name,
                quantity: oi.quantity,
                unitPrice: oi.unitPrice,
                lineTotal: oi.lineTotal,
            })),
            subtotal: order.subtotal,
            paymentMethod: payment.paymentMethod,
            paymentStatus: payment.paymentStatus,
            transactionReference: payment.transactionReference,
            paidAt: payment.paidAt,
        };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [payments_repository_1.PaymentsRepository,
        prisma_service_1.PrismaService,
        realtime_service_1.RealtimeService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map