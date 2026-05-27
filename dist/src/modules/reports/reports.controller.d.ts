import { ReportsService } from './reports.service';
import { ReportQueryDto } from './dto/report-query.dto';
export declare class ReportsController {
    private readonly service;
    constructor(service: ReportsService);
    getDailyRevenue(query: ReportQueryDto): Promise<{
        period: string;
        date: string;
        totalRevenue: number | import("@prisma/client-runtime-utils").Decimal;
        paymentCount: number;
        orderCount: number;
    }>;
    getWeeklyRevenue(query: ReportQueryDto): Promise<{
        period: string;
        startDate: string;
        endDate: string;
        totalRevenue: number | import("@prisma/client-runtime-utils").Decimal;
        paymentCount: number;
        orderCount: number;
    }>;
    getMonthlyRevenue(query: ReportQueryDto): Promise<{
        period: string;
        month: string;
        totalRevenue: number | import("@prisma/client-runtime-utils").Decimal;
        paymentCount: number;
        orderCount: number;
    }>;
    getRevenueByRange(query: ReportQueryDto): Promise<{
        period: string;
        startDate: string | undefined;
        endDate: string | undefined;
        totalRevenue: number | import("@prisma/client-runtime-utils").Decimal;
        paymentCount: number;
        orderCount: number;
    }>;
    getTopSellingItems(query: ReportQueryDto): Promise<{
        menuItemId: string;
        menuItemName: string;
        categoryName: string;
        totalQuantitySold: number;
        totalRevenue: number | import("@prisma/client-runtime-utils").Decimal;
    }[]>;
    getLeastSellingItems(query: ReportQueryDto): Promise<{
        menuItemId: string;
        menuItemName: string;
        categoryName: string;
        totalQuantitySold: number;
        totalRevenue: number | import("@prisma/client-runtime-utils").Decimal;
    }[]>;
    getCategoryBreakdown(query: ReportQueryDto): Promise<{
        categoryId: string;
        categoryName: string;
        totalQuantitySold: number;
        totalRevenue: number;
    }[]>;
    getPaymentMethods(query: ReportQueryDto): Promise<{
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        totalAmount: number | import("@prisma/client-runtime-utils").Decimal;
        count: number;
    }[]>;
    getRefundStats(query: ReportQueryDto): Promise<{
        refundedCount: number;
        refundedAmount: number | import("@prisma/client-runtime-utils").Decimal;
        completedCount: number;
        completedAmount: number | import("@prisma/client-runtime-utils").Decimal;
    }>;
    getLowStock(): Promise<{
        isLowStock: boolean;
        isOutOfStock: boolean;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        unit: string;
        currentStock: import("@prisma/client-runtime-utils").Decimal;
        minimumStock: import("@prisma/client-runtime-utils").Decimal;
        costPrice: import("@prisma/client-runtime-utils").Decimal;
        supplierName: string | null;
    }[]>;
    getOutOfStock(): Promise<{
        isLowStock: boolean;
        isOutOfStock: boolean;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        unit: string;
        currentStock: import("@prisma/client-runtime-utils").Decimal;
        minimumStock: import("@prisma/client-runtime-utils").Decimal;
        costPrice: import("@prisma/client-runtime-utils").Decimal;
        supplierName: string | null;
    }[]>;
    getMovements(query: ReportQueryDto): Promise<{
        inventoryItemId: string;
        itemName: string;
        sku: string;
        movementCount: number;
        netChange: number | import("@prisma/client-runtime-utils").Decimal;
    }[]>;
    getTopSpenders(query: ReportQueryDto): Promise<{
        name: string;
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        loyaltyPoints: number;
        totalVisits: number;
        totalSpent: import("@prisma/client-runtime-utils").Decimal;
    }[]>;
    getTopVisits(query: ReportQueryDto): Promise<{
        name: string;
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        loyaltyPoints: number;
        totalVisits: number;
        totalSpent: import("@prisma/client-runtime-utils").Decimal;
    }[]>;
    getLoyaltyLeaderboard(query: ReportQueryDto): Promise<{
        name: string;
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        loyaltyPoints: number;
        totalVisits: number;
        totalSpent: import("@prisma/client-runtime-utils").Decimal;
    }[]>;
    getDailyReservations(date: string): Promise<({
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
            totalSpent: import("@prisma/client-runtime-utils").Decimal;
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
    getUtilization(query: ReportQueryDto): Promise<{
        totalReservations: number;
        completedCount: number;
        seatedCount: number;
        cancelledCount: number;
        noShowCount: number;
        utilizationRate: number;
    }>;
    getNoShows(query: ReportQueryDto): Promise<{
        totalReservations: number;
        noShowCount: number;
        cancellationCount: number;
        noShowRate: number;
        cancellationRate: number;
    }>;
}
