import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { PaymentsRepository } from './payments.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { RealtimeService } from '../realtime/realtime.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly prisma: PrismaService,
    private readonly realtimeService: RealtimeService,
  ) {}

  async create(dto: CreatePaymentDto) {
    // 1. Order must exist
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { payment: true, table: true, orderItems: { include: { menuItem: true } } },
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${dto.orderId} not found`);
    }

    // 2. Order must be SERVED or COMPLETED
    if (order.status !== OrderStatus.SERVED && order.status !== OrderStatus.COMPLETED) {
      throw new BadRequestException(
        `Order must be SERVED or COMPLETED to accept payment. Current status: ${order.status}`,
      );
    }

    // 3. Cannot pay twice
    if (order.payment) {
      throw new ConflictException(`Order ${dto.orderId} already has a payment`);
    }

    // 4. Amount must match subtotal
    const subtotal = Number(order.subtotal);
    if (Math.abs(dto.amount - subtotal) > 0.01) {
      throw new BadRequestException(
        `Payment amount (${dto.amount}) does not match order subtotal (${subtotal})`,
      );
    }

    // 5. Create payment + mark order COMPLETED in a transaction
    const payment = await this.prisma.$transaction(async (tx) => {
      const p = await tx.payment.create({
        data: {
          order: { connect: { id: dto.orderId } },
          amount: dto.amount,
          paymentMethod: dto.paymentMethod,
          paymentStatus: PaymentStatus.COMPLETED,
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
        data: { status: OrderStatus.COMPLETED },
      });

      return p;
    });

    // Emit WebSocket event
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

  async findOne(id: string) {
    const payment = await this.paymentsRepository.findById(id);
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async findByOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }
    const payment = await this.paymentsRepository.findByOrderId(orderId);
    if (!payment) {
      throw new NotFoundException(`No payment found for order ${orderId}`);
    }
    return payment;
  }

  async refund(id: string) {
    const payment = await this.findOne(id);

    if ((payment as any).paymentStatus !== PaymentStatus.COMPLETED) {
      throw new UnprocessableEntityException(
        `Only COMPLETED payments can be refunded. Current status: ${(payment as any).paymentStatus}`,
      );
    }

    const refunded = await this.paymentsRepository.update(id, {
      paymentStatus: PaymentStatus.REFUNDED,
    });

    // Emit WebSocket event
    this.realtimeService.emitPaymentRefunded({
      paymentId: (refunded as any).id,
      orderId: (refunded as any).orderId,
      amount: (refunded as any).amount,
      paymentMethod: (refunded as any).paymentMethod,
      timestamp: new Date().toISOString(),
    });

    return refunded;
  }

  async getReceipt(paymentId: string) {
    const payment = await this.findOne(paymentId) as any;
    const order = payment.order;

    return {
      receiptId: payment.id,
      orderId: order.id,
      tableNumber: order.table.tableNumber,
      items: order.orderItems.map((oi: any) => ({
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
}
