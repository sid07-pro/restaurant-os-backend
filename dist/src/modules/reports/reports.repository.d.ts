import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class ReportsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getCompletedPayments(startDate: Date, endDate: Date): Promise<({
        order: {
            id: string;
            status: import("@prisma/client").$Enums.OrderStatus;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            subtotal: Prisma.Decimal;
            kitchenNotes: string | null;
            priority: boolean;
            preparationStartedAt: Date | null;
            readyAt: Date | null;
            servedAt: Date | null;
            tableId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        orderId: string;
        amount: Prisma.Decimal;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        transactionReference: string | null;
        paidAt: Date | null;
    })[]>;
    getCompletedPaymentsAggregate(startDate: Date, endDate: Date): Promise<{
        totalRevenue: number | Prisma.Decimal;
        orderCount: number;
    }>;
    getOrderCountByDateRange(startDate: Date, endDate: Date): Promise<number>;
    getMenuItemSales(limit: number, order: 'desc' | 'asc', startDate?: Date, endDate?: Date): Promise<{
        menuItemId: string;
        menuItemName: string;
        categoryName: string;
        totalQuantitySold: number;
        totalRevenue: number | Prisma.Decimal;
    }[]>;
    getCategoryBreakdown(startDate?: Date, endDate?: Date): Promise<{
        categoryId: string;
        categoryName: string;
        totalQuantitySold: number;
        totalRevenue: number;
    }[]>;
    getPaymentMethodBreakdown(startDate?: Date, endDate?: Date): Promise<{
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        totalAmount: number | Prisma.Decimal;
        count: number;
    }[]>;
    getRefundStats(startDate?: Date, endDate?: Date): Promise<{
        refundedCount: number;
        refundedAmount: number | Prisma.Decimal;
        completedCount: number;
        completedAmount: number | Prisma.Decimal;
    }>;
    getLowStockItems(): Promise<{
        isLowStock: boolean;
        isOutOfStock: boolean;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        unit: string;
        currentStock: Prisma.Decimal;
        minimumStock: Prisma.Decimal;
        costPrice: Prisma.Decimal;
        supplierName: string | null;
    }[]>;
    getOutOfStockItems(): Promise<{
        isLowStock: boolean;
        isOutOfStock: boolean;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        unit: string;
        currentStock: Prisma.Decimal;
        minimumStock: Prisma.Decimal;
        costPrice: Prisma.Decimal;
        supplierName: string | null;
    }[]>;
    getInventoryMovementSummary(limit: number): Promise<{
        inventoryItemId: string;
        itemName: string;
        sku: string;
        movementCount: number;
        netChange: number | Prisma.Decimal;
    }[]>;
    getTopCustomersBySpending(limit: number): Promise<{
        name: string;
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        loyaltyPoints: number;
        totalVisits: number;
        totalSpent: Prisma.Decimal;
    }[]>;
    getTopCustomersByVisits(limit: number): Promise<{
        name: string;
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        loyaltyPoints: number;
        totalVisits: number;
        totalSpent: Prisma.Decimal;
    }[]>;
    getLoyaltyLeaderboard(limit: number): Promise<{
        name: string;
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        loyaltyPoints: number;
        totalVisits: number;
        totalSpent: Prisma.Decimal;
    }[]>;
    getCustomerStats(): Promise<{
        totalCustomers: number;
        averageSpend: number | Prisma.Decimal;
        repeatCustomerCount: number;
        repeatCustomerRate: number;
    }>;
    getReservationsByDate(dateStr: string): Promise<({
        table: {
            name: string | null;
            id: string;
            status: import("@prisma/client").$Enums.TableStatus;
            createdAt: Date;
            updatedAt: Date;
            tableNumber: string;
            capacity: number;
            notes: string | null;
        };
        customer: {
            name: string;
            id: string;
            email: string | null;
            createdAt: Date;
            updatedAt: Date;
            phone: string;
            loyaltyPoints: number;
            totalVisits: number;
            totalSpent: Prisma.Decimal;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.ReservationStatus;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        tableId: string;
        reservationTime: Date;
        estimatedDurationMinutes: number;
        guestCount: number;
        customerId: string;
    })[]>;
    getReservationUtilization(startDate?: Date, endDate?: Date): Promise<{
        totalReservations: number;
        completedCount: number;
        seatedCount: number;
        cancelledCount: number;
        noShowCount: number;
        utilizationRate: number;
    }>;
    getNoShowStats(startDate?: Date, endDate?: Date): Promise<{
        totalReservations: number;
        noShowCount: number;
        cancellationCount: number;
        noShowRate: number;
        cancellationRate: number;
    }>;
}
