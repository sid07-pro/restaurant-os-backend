import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { OrdersRepository } from './orders.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { RealtimeService } from '../realtime/realtime.service';

// Valid forward transitions
const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  OPEN: [OrderStatus.SENT_TO_KITCHEN, OrderStatus.CANCELLED],
  SENT_TO_KITCHEN: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  PREPARING: [OrderStatus.READY, OrderStatus.CANCELLED],
  READY: [OrderStatus.SERVED, OrderStatus.CANCELLED],
  SERVED: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  COMPLETED: [],
  CANCELLED: [],
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly prisma: PrismaService,
    private readonly realtimeService: RealtimeService,
  ) {}

  private buildOrderPayload(order: any) {
    return {
      orderId: order.id,
      tableId: order.tableId,
      tableNumber: order.table?.tableNumber,
      status: order.status,
      subtotal: order.subtotal,
      timestamp: new Date().toISOString(),
    };
  }

  async create(dto: CreateOrderDto) {
    // Validate table exists and is not OUT_OF_SERVICE
    const table = await this.prisma.table.findUnique({ where: { id: dto.tableId } });
    if (!table) {
      throw new NotFoundException(`Table with ID ${dto.tableId} not found`);
    }
    if (table.status === 'OUT_OF_SERVICE') {
      throw new BadRequestException(`Table ${table.tableNumber} is OUT_OF_SERVICE and cannot accept orders`);
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    // Validate all menu items and snapshot prices
    const menuItemIds = dto.items.map((i) => i.menuItemId);
    const menuItems = await this.prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
    });

    const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

    for (const item of dto.items) {
      const menuItem = menuItemMap.get(item.menuItemId);
      if (!menuItem) {
        throw new BadRequestException(`Menu item with ID ${item.menuItemId} does not exist`);
      }
      if (!menuItem.isAvailable) {
        throw new BadRequestException(`Menu item '${menuItem.name}' is not available`);
      }
    }

    // Build order items with snapshotted prices
    let subtotal = 0;
    const orderItemsData = dto.items.map((item) => {
      const menuItem = menuItemMap.get(item.menuItemId)!;
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

    // Auto-update table status
    const updatedTable = await this.prisma.table.update({
      where: { id: dto.tableId },
      data: { status: 'OCCUPIED' },
    });

    // Emit WebSocket event
    this.realtimeService.emitOrderCreated({
      ...this.buildOrderPayload(order),
      tableNumber: table.tableNumber,
    });
    
    // Alert realtime service about table update
    this.realtimeService.emitTableStatusUpdated({
      tableId: updatedTable.id,
      status: updatedTable.status,
    });

    return order;
  }

  async findAll() {
    return this.ordersRepository.findAll();
  }

  async findOne(id: string) {
    const order = await this.ordersRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async findByTable(tableId: string) {
    const table = await this.prisma.table.findUnique({ where: { id: tableId } });
    if (!table) {
      throw new NotFoundException(`Table with ID ${tableId} not found`);
    }
    return this.ordersRepository.findByTable(tableId);
  }

  async update(id: string, dto: UpdateOrderDto) {
    await this.findOne(id);
    const order = await this.ordersRepository.update(id, { notes: dto.notes });

    // Emit WebSocket event
    this.realtimeService.emitOrderUpdated(this.buildOrderPayload(order));

    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.findOne(id);
    const currentStatus = order.status as OrderStatus;
    const newStatus = dto.status;

    const allowed = STATUS_TRANSITIONS[currentStatus];
    if (!allowed.includes(newStatus)) {
      throw new UnprocessableEntityException(
        `Cannot transition order from ${currentStatus} to ${newStatus}. ` +
        `Allowed transitions: [${allowed.join(', ') || 'none'}]`,
      );
    }

    const updated = await this.ordersRepository.update(id, { status: newStatus });

    // Emit WebSocket events
    const payload = this.buildOrderPayload(updated);
    if (newStatus === OrderStatus.CANCELLED) {
      this.realtimeService.emitOrderCancelled(payload);
    } else {
      this.realtimeService.emitOrderStatusUpdated(payload);
    }

    return updated;
  }

  async remove(id: string) {
    const order = await this.findOne(id);
    if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException(
        `Cannot delete a ${order.status} order. Only OPEN or in-progress orders can be deleted.`,
      );
    }
    return this.ordersRepository.delete(id);
  }
}
