import { PrismaService } from '../../prisma/prisma.service';
import { UpdateKitchenNotesDto, UpdatePriorityDto } from './dto/kds.dto';
export declare class KdsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private calcPreparationDurationSeconds;
    private formatTicket;
    private findOrder;
    private assertTransition;
    getActiveTickets(): Promise<any[]>;
    startPreparing(orderId: string): Promise<any>;
    markReady(orderId: string): Promise<any>;
    markServed(orderId: string): Promise<any>;
    updateKitchenNotes(orderId: string, dto: UpdateKitchenNotesDto): Promise<any>;
    updatePriority(orderId: string, dto: UpdatePriorityDto): Promise<any>;
    getTicket(orderId: string): Promise<any>;
}
