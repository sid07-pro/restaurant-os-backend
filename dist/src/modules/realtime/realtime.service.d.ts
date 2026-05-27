import { Server } from 'socket.io';
import { OrderEventPayload, KdsEventPayload, TableEventPayload, ReservationEventPayload, PaymentEventPayload, InventoryEventPayload } from './dto/socket-events';
export declare class RealtimeService {
    private server;
    setServer(server: Server): void;
    private emit;
    emitOrderCreated(payload: OrderEventPayload): void;
    emitOrderUpdated(payload: OrderEventPayload): void;
    emitOrderStatusUpdated(payload: OrderEventPayload): void;
    emitOrderCancelled(payload: OrderEventPayload): void;
    emitKdsTicketCreated(payload: KdsEventPayload): void;
    emitKdsTicketPreparing(payload: KdsEventPayload): void;
    emitKdsTicketReady(payload: KdsEventPayload): void;
    emitKdsTicketServed(payload: KdsEventPayload): void;
    emitTableStatusUpdated(payload: TableEventPayload): void;
    emitTableOccupied(payload: TableEventPayload): void;
    emitTableAvailable(payload: TableEventPayload): void;
    emitReservationCreated(payload: ReservationEventPayload): void;
    emitReservationConfirmed(payload: ReservationEventPayload): void;
    emitReservationSeated(payload: ReservationEventPayload): void;
    emitReservationCompleted(payload: ReservationEventPayload): void;
    emitReservationCancelled(payload: ReservationEventPayload): void;
    emitPaymentCompleted(payload: PaymentEventPayload): void;
    emitPaymentRefunded(payload: PaymentEventPayload): void;
    emitInventoryLowStock(payload: InventoryEventPayload): void;
    emitInventoryOutOfStock(payload: InventoryEventPayload): void;
    emitInventoryUpdated(payload: InventoryEventPayload): void;
}
