"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeService = void 0;
const common_1 = require("@nestjs/common");
let RealtimeService = class RealtimeService {
    server = null;
    setServer(server) {
        this.server = server;
    }
    emit(room, event, payload) {
        if (!this.server)
            return;
        this.server.to(room).emit(event, payload);
    }
    emitOrderCreated(payload) {
        this.emit('dashboard', 'order.created', payload);
        this.emit('kds', 'order.created', payload);
    }
    emitOrderUpdated(payload) {
        this.emit('dashboard', 'order.updated', payload);
    }
    emitOrderStatusUpdated(payload) {
        this.emit('dashboard', 'order.status.updated', payload);
        this.emit('kds', 'order.status.updated', payload);
        this.emit('tables', 'order.status.updated', payload);
    }
    emitOrderCancelled(payload) {
        this.emit('dashboard', 'order.cancelled', payload);
        this.emit('kds', 'order.cancelled', payload);
        this.emit('tables', 'order.cancelled', payload);
    }
    emitKdsTicketCreated(payload) {
        this.emit('kds', 'kds.ticket.created', payload);
    }
    emitKdsTicketPreparing(payload) {
        this.emit('kds', 'kds.ticket.preparing', payload);
        this.emit('dashboard', 'kds.ticket.preparing', payload);
    }
    emitKdsTicketReady(payload) {
        this.emit('kds', 'kds.ticket.ready', payload);
        this.emit('dashboard', 'kds.ticket.ready', payload);
        this.emit('tables', 'kds.ticket.ready', payload);
    }
    emitKdsTicketServed(payload) {
        this.emit('kds', 'kds.ticket.served', payload);
        this.emit('dashboard', 'kds.ticket.served', payload);
    }
    emitTableStatusUpdated(payload) {
        this.emit('tables', 'table.status.updated', payload);
        this.emit('dashboard', 'table.status.updated', payload);
    }
    emitTableOccupied(payload) {
        this.emit('tables', 'table.occupied', payload);
        this.emit('dashboard', 'table.occupied', payload);
    }
    emitTableAvailable(payload) {
        this.emit('tables', 'table.available', payload);
        this.emit('dashboard', 'table.available', payload);
    }
    emitReservationCreated(payload) {
        this.emit('reservations', 'reservation.created', payload);
        this.emit('dashboard', 'reservation.created', payload);
    }
    emitReservationConfirmed(payload) {
        this.emit('reservations', 'reservation.confirmed', payload);
        this.emit('dashboard', 'reservation.confirmed', payload);
    }
    emitReservationSeated(payload) {
        this.emit('reservations', 'reservation.seated', payload);
        this.emit('dashboard', 'reservation.seated', payload);
        this.emit('tables', 'reservation.seated', payload);
    }
    emitReservationCompleted(payload) {
        this.emit('reservations', 'reservation.completed', payload);
        this.emit('dashboard', 'reservation.completed', payload);
    }
    emitReservationCancelled(payload) {
        this.emit('reservations', 'reservation.cancelled', payload);
        this.emit('dashboard', 'reservation.cancelled', payload);
    }
    emitPaymentCompleted(payload) {
        this.emit('dashboard', 'payment.completed', payload);
    }
    emitPaymentRefunded(payload) {
        this.emit('dashboard', 'payment.refunded', payload);
    }
    emitInventoryLowStock(payload) {
        this.emit('inventory', 'inventory.low_stock', payload);
        this.emit('dashboard', 'inventory.low_stock', payload);
    }
    emitInventoryOutOfStock(payload) {
        this.emit('inventory', 'inventory.out_of_stock', payload);
        this.emit('dashboard', 'inventory.out_of_stock', payload);
    }
    emitInventoryUpdated(payload) {
        this.emit('inventory', 'inventory.updated', payload);
    }
};
exports.RealtimeService = RealtimeService;
exports.RealtimeService = RealtimeService = __decorate([
    (0, common_1.Injectable)()
], RealtimeService);
//# sourceMappingURL=realtime.service.js.map