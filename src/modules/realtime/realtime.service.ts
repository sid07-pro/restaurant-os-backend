import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import {
  OrderEventPayload,
  KdsEventPayload,
  TableEventPayload,
  ReservationEventPayload,
  PaymentEventPayload,
  InventoryEventPayload,
} from './dto/socket-events';

@Injectable()
export class RealtimeService {
  private server: Server | null = null;

  setServer(server: Server) {
    this.server = server;
  }

  private emit(room: string, event: string, payload: any) {
    if (!this.server) return;
    this.server.to(room).emit(event, payload);
  }

  // ─── ORDER EVENTS ──────────────────────────────────────────────────────────

  emitOrderCreated(payload: OrderEventPayload) {
    this.emit('dashboard', 'order.created', payload);
    this.emit('kds', 'order.created', payload);
  }

  emitOrderUpdated(payload: OrderEventPayload) {
    this.emit('dashboard', 'order.updated', payload);
  }

  emitOrderStatusUpdated(payload: OrderEventPayload) {
    this.emit('dashboard', 'order.status.updated', payload);
    this.emit('kds', 'order.status.updated', payload);
    this.emit('tables', 'order.status.updated', payload);
  }

  emitOrderCancelled(payload: OrderEventPayload) {
    this.emit('dashboard', 'order.cancelled', payload);
    this.emit('kds', 'order.cancelled', payload);
    this.emit('tables', 'order.cancelled', payload);
  }

  // ─── KDS EVENTS ────────────────────────────────────────────────────────────

  emitKdsTicketCreated(payload: KdsEventPayload) {
    this.emit('kds', 'kds.ticket.created', payload);
  }

  emitKdsTicketPreparing(payload: KdsEventPayload) {
    this.emit('kds', 'kds.ticket.preparing', payload);
    this.emit('dashboard', 'kds.ticket.preparing', payload);
  }

  emitKdsTicketReady(payload: KdsEventPayload) {
    this.emit('kds', 'kds.ticket.ready', payload);
    this.emit('dashboard', 'kds.ticket.ready', payload);
    this.emit('tables', 'kds.ticket.ready', payload);
  }

  emitKdsTicketServed(payload: KdsEventPayload) {
    this.emit('kds', 'kds.ticket.served', payload);
    this.emit('dashboard', 'kds.ticket.served', payload);
  }

  // ─── TABLE EVENTS ──────────────────────────────────────────────────────────

  emitTableStatusUpdated(payload: TableEventPayload) {
    this.emit('tables', 'table.status.updated', payload);
    this.emit('dashboard', 'table.status.updated', payload);
  }

  emitTableOccupied(payload: TableEventPayload) {
    this.emit('tables', 'table.occupied', payload);
    this.emit('dashboard', 'table.occupied', payload);
  }

  emitTableAvailable(payload: TableEventPayload) {
    this.emit('tables', 'table.available', payload);
    this.emit('dashboard', 'table.available', payload);
  }

  // ─── RESERVATION EVENTS ───────────────────────────────────────────────────

  emitReservationCreated(payload: ReservationEventPayload) {
    this.emit('reservations', 'reservation.created', payload);
    this.emit('dashboard', 'reservation.created', payload);
  }

  emitReservationConfirmed(payload: ReservationEventPayload) {
    this.emit('reservations', 'reservation.confirmed', payload);
    this.emit('dashboard', 'reservation.confirmed', payload);
  }

  emitReservationSeated(payload: ReservationEventPayload) {
    this.emit('reservations', 'reservation.seated', payload);
    this.emit('dashboard', 'reservation.seated', payload);
    this.emit('tables', 'reservation.seated', payload);
  }

  emitReservationCompleted(payload: ReservationEventPayload) {
    this.emit('reservations', 'reservation.completed', payload);
    this.emit('dashboard', 'reservation.completed', payload);
  }

  emitReservationCancelled(payload: ReservationEventPayload) {
    this.emit('reservations', 'reservation.cancelled', payload);
    this.emit('dashboard', 'reservation.cancelled', payload);
  }

  // ─── PAYMENT EVENTS ───────────────────────────────────────────────────────

  emitPaymentCompleted(payload: PaymentEventPayload) {
    this.emit('dashboard', 'payment.completed', payload);
  }

  emitPaymentRefunded(payload: PaymentEventPayload) {
    this.emit('dashboard', 'payment.refunded', payload);
  }

  // ─── INVENTORY EVENTS ─────────────────────────────────────────────────────

  emitInventoryLowStock(payload: InventoryEventPayload) {
    this.emit('inventory', 'inventory.low_stock', payload);
    this.emit('dashboard', 'inventory.low_stock', payload);
  }

  emitInventoryOutOfStock(payload: InventoryEventPayload) {
    this.emit('inventory', 'inventory.out_of_stock', payload);
    this.emit('dashboard', 'inventory.out_of_stock', payload);
  }

  emitInventoryUpdated(payload: InventoryEventPayload) {
    this.emit('inventory', 'inventory.updated', payload);
  }
}
