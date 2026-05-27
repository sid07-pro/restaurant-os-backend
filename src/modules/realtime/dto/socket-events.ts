// src/modules/realtime/dto/socket-events.ts

// ─── ORDER EVENTS ─────────────────────────────────────────────────────────────

export interface OrderEventPayload {
  orderId: string;
  tableId: string;
  tableNumber?: string;
  status: string;
  subtotal: number | string;
  timestamp: string;
}

// ─── KDS EVENTS ───────────────────────────────────────────────────────────────

export interface KdsEventPayload {
  orderId: string;
  tableNumber: string;
  status: string;
  preparationStartedAt?: string | null;
  readyAt?: string | null;
  servedAt?: string | null;
  timestamp: string;
}

// ─── TABLE EVENTS ─────────────────────────────────────────────────────────────

export interface TableEventPayload {
  tableId: string;
  tableNumber: string;
  status: string;
  timestamp: string;
}

// ─── RESERVATION EVENTS ──────────────────────────────────────────────────────

export interface ReservationEventPayload {
  reservationId: string;
  customerId: string;
  tableId: string;
  status: string;
  guestCount?: number;
  reservationTime?: string;
  timestamp: string;
}

// ─── PAYMENT EVENTS ──────────────────────────────────────────────────────────

export interface PaymentEventPayload {
  paymentId: string;
  orderId: string;
  amount: any;
  paymentMethod: string;
  timestamp: string;
}

// ─── INVENTORY EVENTS ────────────────────────────────────────────────────────

export interface InventoryEventPayload {
  inventoryItemId: string;
  name: string;
  currentStock: number | string;
  minimumStock: number | string;
  timestamp: string;
}
