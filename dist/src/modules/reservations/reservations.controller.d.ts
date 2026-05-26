import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import { ReservationStatus } from '@prisma/client';
export declare class ReservationsController {
    private readonly service;
    constructor(service: ReservationsService);
    create(dto: CreateReservationDto): Promise<{
        customer: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string;
            email: string | null;
            loyaltyPoints: number;
            totalVisits: number;
            totalSpent: import("@prisma/client-runtime-utils").Decimal;
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
    findAll(status?: ReservationStatus, customerId?: string, tableId?: string, date?: string): Promise<({
        customer: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string;
            email: string | null;
            loyaltyPoints: number;
            totalVisits: number;
            totalSpent: import("@prisma/client-runtime-utils").Decimal;
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
    findOne(id: string): Promise<{
        customer: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string;
            email: string | null;
            loyaltyPoints: number;
            totalVisits: number;
            totalSpent: import("@prisma/client-runtime-utils").Decimal;
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
    update(id: string, dto: UpdateReservationDto): Promise<{
        customer: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string;
            email: string | null;
            loyaltyPoints: number;
            totalVisits: number;
            totalSpent: import("@prisma/client-runtime-utils").Decimal;
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
    updateStatus(id: string, dto: UpdateReservationStatusDto): Promise<{
        customer: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string;
            email: string | null;
            loyaltyPoints: number;
            totalVisits: number;
            totalSpent: import("@prisma/client-runtime-utils").Decimal;
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
    remove(id: string): Promise<{
        customer: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string;
            email: string | null;
            loyaltyPoints: number;
            totalVisits: number;
            totalSpent: import("@prisma/client-runtime-utils").Decimal;
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
    findByCustomer(customerId: string): Promise<({
        customer: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string;
            email: string | null;
            loyaltyPoints: number;
            totalVisits: number;
            totalSpent: import("@prisma/client-runtime-utils").Decimal;
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
    findByTable(tableId: string): Promise<({
        customer: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string;
            email: string | null;
            loyaltyPoints: number;
            totalVisits: number;
            totalSpent: import("@prisma/client-runtime-utils").Decimal;
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
    findByDate(date: string): Promise<({
        customer: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string;
            email: string | null;
            loyaltyPoints: number;
            totalVisits: number;
            totalSpent: import("@prisma/client-runtime-utils").Decimal;
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
}
