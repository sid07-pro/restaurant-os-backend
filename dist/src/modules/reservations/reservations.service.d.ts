import { ReservationsRepository } from './reservations.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationStatus } from '@prisma/client';
export declare class ReservationsService {
    private readonly repo;
    private readonly prisma;
    constructor(repo: ReservationsRepository, prisma: PrismaService);
    private checkOverlap;
    create(dto: CreateReservationDto): Promise<{
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
    findOne(id: string): Promise<{
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
    }>;
    update(id: string, dto: UpdateReservationDto): Promise<{
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
    }>;
    updateStatus(id: string, status: ReservationStatus): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
    findByCustomer(customerId: string): Promise<({
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
    findByTable(tableId: string): Promise<({
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
    findByDate(dateStr: string): Promise<({
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
}
