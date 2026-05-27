import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, ReservationStatus } from '@prisma/client';
export declare class ReservationsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.ReservationUncheckedCreateInput): Promise<{
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
    }>;
    findAll(filters?: {
        status?: ReservationStatus;
        customerId?: string;
        tableId?: string;
        date?: string;
    }): Promise<({
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
    findById(id: string): Promise<({
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
    }) | null>;
    update(id: string, data: Prisma.ReservationUncheckedUpdateInput): Promise<{
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
    }>;
    delete(id: string): Promise<{
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
    }>;
    findActiveReservationsByTable(tableId: string): Promise<{
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
    }[]>;
}
