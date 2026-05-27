export interface OrderEventPayload {
    orderId: string;
    tableId: string;
    tableNumber?: string;
    status: string;
    subtotal: number | string;
    timestamp: string;
}
export interface KdsEventPayload {
    orderId: string;
    tableNumber: string;
    status: string;
    preparationStartedAt?: string | null;
    readyAt?: string | null;
    servedAt?: string | null;
    timestamp: string;
}
export interface TableEventPayload {
    tableId: string;
    tableNumber: string;
    status: string;
    timestamp: string;
}
export interface ReservationEventPayload {
    reservationId: string;
    customerId: string;
    tableId: string;
    status: string;
    guestCount?: number;
    reservationTime?: string;
    timestamp: string;
}
export interface PaymentEventPayload {
    paymentId: string;
    orderId: string;
    amount: any;
    paymentMethod: string;
    timestamp: string;
}
export interface InventoryEventPayload {
    inventoryItemId: string;
    name: string;
    currentStock: number | string;
    minimumStock: number | string;
    timestamp: string;
}
