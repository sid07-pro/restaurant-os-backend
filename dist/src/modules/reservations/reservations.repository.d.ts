import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, ReservationStatus } from '@prisma/client';
export declare class ReservationsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.ReservationUncheckedCreateInput): Promise<{
        customer: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string;
            email: string | null;
            loyaltyPoints: number;
            totalVisits: number;
            totalSpent: Prisma.Decimal;
        };
        table: {
            id: string;
            status: import("@prisma/client").$Enums.TableStatus;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string | null;
            tableNumber: string;
            capacity: number;
        };
    } & {
        id: string;
        reservationTime: Date;
        estimatedDurationMinutes: number;
        guestCount: number;
        status: import("@prisma/client").$Enums.ReservationStatus;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        tableId: string;
    }>;
    findAll(filters?: {
        status?: ReservationStatus;
        customerId?: string;
        tableId?: string;
        date?: string;
    }): Promise<({
        customer: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string;
            email: string | null;
            loyaltyPoints: number;
            totalVisits: number;
            totalSpent: Prisma.Decimal;
        };
        table: {
            id: string;
            status: import("@prisma/client").$Enums.TableStatus;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string | null;
            tableNumber: string;
            capacity: number;
        };
    } & {
        id: string;
        reservationTime: Date;
        estimatedDurationMinutes: number;
        guestCount: number;
        status: import("@prisma/client").$Enums.ReservationStatus;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        tableId: string;
    })[]>;
    findById(id: string): Promise<({
        customer: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string;
            email: string | null;
            loyaltyPoints: number;
            totalVisits: number;
            totalSpent: Prisma.Decimal;
        };
        table: {
            id: string;
            status: import("@prisma/client").$Enums.TableStatus;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string | null;
            tableNumber: string;
            capacity: number;
        };
    } & {
        id: string;
        reservationTime: Date;
        estimatedDurationMinutes: number;
        guestCount: number;
        status: import("@prisma/client").$Enums.ReservationStatus;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        tableId: string;
    }) | null>;
    update(id: string, data: Prisma.ReservationUncheckedUpdateInput): Promise<{
        customer: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string;
            email: string | null;
            loyaltyPoints: number;
            totalVisits: number;
            totalSpent: Prisma.Decimal;
        };
        table: {
            id: string;
            status: import("@prisma/client").$Enums.TableStatus;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string | null;
            tableNumber: string;
            capacity: number;
        };
    } & {
        id: string;
        reservationTime: Date;
        estimatedDurationMinutes: number;
        guestCount: number;
        status: import("@prisma/client").$Enums.ReservationStatus;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        tableId: string;
    }>;
    delete(id: string): Promise<{
        customer: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string;
            email: string | null;
            loyaltyPoints: number;
            totalVisits: number;
            totalSpent: Prisma.Decimal;
        };
        table: {
            id: string;
            status: import("@prisma/client").$Enums.TableStatus;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string | null;
            tableNumber: string;
            capacity: number;
        };
    } & {
        id: string;
        reservationTime: Date;
        estimatedDurationMinutes: number;
        guestCount: number;
        status: import("@prisma/client").$Enums.ReservationStatus;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        tableId: string;
    }>;
    findActiveReservationsByTable(tableId: string): Promise<{
        id: string;
        reservationTime: Date;
        estimatedDurationMinutes: number;
        guestCount: number;
        status: import("@prisma/client").$Enums.ReservationStatus;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        tableId: string;
    }[]>;
}
