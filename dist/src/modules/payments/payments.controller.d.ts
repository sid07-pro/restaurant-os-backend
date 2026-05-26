import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    create(createPaymentDto: CreatePaymentDto): Promise<{
        order: {
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
            orderItems: ({
                menuItem: {
                    name: string;
                    id: string;
                };
            } & {
                id: string;
                createdAt: Date;
                notes: string | null;
                quantity: number;
                unitPrice: import("@prisma/client-runtime-utils").Decimal;
                lineTotal: import("@prisma/client-runtime-utils").Decimal;
                menuItemId: string;
                orderId: string;
            })[];
        } & {
            id: string;
            status: import("@prisma/client").$Enums.OrderStatus;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            subtotal: import("@prisma/client-runtime-utils").Decimal;
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
        amount: import("@prisma/client-runtime-utils").Decimal;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        transactionReference: string | null;
        paidAt: Date | null;
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        orderId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        transactionReference: string | null;
        paidAt: Date | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        orderId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        transactionReference: string | null;
        paidAt: Date | null;
    }>;
    getReceipt(id: string): Promise<{
        receiptId: any;
        orderId: any;
        tableNumber: any;
        items: any;
        subtotal: any;
        paymentMethod: any;
        paymentStatus: any;
        transactionReference: any;
        paidAt: any;
    }>;
    refund(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        orderId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        transactionReference: string | null;
        paidAt: Date | null;
    }>;
    findByOrder(orderId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        orderId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        transactionReference: string | null;
        paidAt: Date | null;
    }>;
}
