import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  ForbiddenException,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateKitchenNotesDto, UpdatePriorityDto } from './dto/kds.dto';
import { RealtimeService } from '../realtime/realtime.service';

const ORDER_KDS_INCLUDE = {
  table: true,
  orderItems: {
    include: { menuItem: { select: { id: true, name: true, description: true } } },
  },
};

@Injectable()
export class KdsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeService: RealtimeService,
  ) {}

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private calcPreparationDurationSeconds(order: any): number | null {
    if (!order.preparationStartedAt) return null;
    const end = order.readyAt ?? new Date();
    return Math.round((end.getTime() - new Date(order.preparationStartedAt).getTime()) / 1000);
  }

  private formatTicket(order: any) {
    return {
      ...order,
      preparationDurationSeconds: this.calcPreparationDurationSeconds(order),
    };
  }

  private async findOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: ORDER_KDS_INCLUDE,
    });
    if (!order) throw new NotFoundException(`Order with ID ${orderId} not found`);
    return order;
  }

  private assertTransition(current: OrderStatus, next: OrderStatus, allowed: OrderStatus[]) {
    if (!allowed.includes(current)) {
      throw new UnprocessableEntityException(
        `This action requires order status to be [${allowed.join(' | ')}]. Current status: ${current}`,
      );
    }
  }

  private buildKdsPayload(order: any) {
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

  // ─── Public API ───────────────────────────────────────────────────────────

  /** Active tickets for kitchen: all non-terminal orders that are kitchen-visible */
  async getActiveTickets() {
    const orders = await this.prisma.order.findMany({
      where: {
        status: {
          in: [
            OrderStatus.SENT_TO_KITCHEN,
            OrderStatus.PREPARING,
            OrderStatus.READY,
          ],
        },
      },
      include: ORDER_KDS_INCLUDE,
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    });
    return orders.map((o) => this.formatTicket(o));
  }

  /** KITCHEN_STAFF: SENT_TO_KITCHEN → PREPARING. Sets preparationStartedAt. */
  async startPreparing(orderId: string) {
    const order = await this.findOrder(orderId);
    this.assertTransition(order.status as OrderStatus, OrderStatus.PREPARING, [
      OrderStatus.SENT_TO_KITCHEN,
    ]);
    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.PREPARING,
        preparationStartedAt: new Date(),
      },
      include: ORDER_KDS_INCLUDE,
    });

    // Emit KDS event
    this.realtimeService.emitKdsTicketPreparing(this.buildKdsPayload(updated));

    return this.formatTicket(updated);
  }

  /** KITCHEN_STAFF: PREPARING → READY. Sets readyAt. */
  async markReady(orderId: string) {
    const order = await this.findOrder(orderId);
    this.assertTransition(order.status as OrderStatus, OrderStatus.READY, [
      OrderStatus.PREPARING,
    ]);
    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.READY,
        readyAt: new Date(),
      },
      include: ORDER_KDS_INCLUDE,
    });

    // Emit KDS event
    this.realtimeService.emitKdsTicketReady(this.buildKdsPayload(updated));

    return this.formatTicket(updated);
  }

  /** WAITER: READY → SERVED. Sets servedAt. */
  async markServed(orderId: string) {
    const order = await this.findOrder(orderId);
    this.assertTransition(order.status as OrderStatus, OrderStatus.SERVED, [
      OrderStatus.READY,
    ]);
    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.SERVED,
        servedAt: new Date(),
      },
      include: ORDER_KDS_INCLUDE,
    });

    // Emit KDS event
    this.realtimeService.emitKdsTicketServed(this.buildKdsPayload(updated));

    return this.formatTicket(updated);
  }

  /** KITCHEN_STAFF / ADMIN / MANAGER: update kitchen-facing notes */
  async updateKitchenNotes(orderId: string, dto: UpdateKitchenNotesDto) {
    await this.findOrder(orderId);
    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { kitchenNotes: dto.kitchenNotes },
      include: ORDER_KDS_INCLUDE,
    });
    return this.formatTicket(updated);
  }

  /** ADMIN / MANAGER: set or clear priority flag */
  async updatePriority(orderId: string, dto: UpdatePriorityDto) {
    await this.findOrder(orderId);
    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { priority: dto.priority },
      include: ORDER_KDS_INCLUDE,
    });
    return this.formatTicket(updated);
  }

  /** Get single ticket with prep duration */
  async getTicket(orderId: string) {
    const order = await this.findOrder(orderId);
    return this.formatTicket(order);
  }
}
