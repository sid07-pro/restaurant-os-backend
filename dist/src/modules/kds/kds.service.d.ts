import { PrismaService } from '../../prisma/prisma.service';
import { UpdateKitchenNotesDto, UpdatePriorityDto } from './dto/kds.dto';
import { RealtimeService } from '../realtime/realtime.service';
export declare class KdsService {
    private readonly prisma;
    private readonly realtimeService;
    constructor(prisma: PrismaService, realtimeService: RealtimeService);
    private calcPreparationDurationSeconds;
    private formatTicket;
    private findOrder;
    private assertTransition;
    private buildKdsPayload;
    getActiveTickets(): Promise<any[]>;
    startPreparing(orderId: string): Promise<any>;
    markReady(orderId: string): Promise<any>;
    markServed(orderId: string): Promise<any>;
    updateKitchenNotes(orderId: string, dto: UpdateKitchenNotesDto): Promise<any>;
    updatePriority(orderId: string, dto: UpdatePriorityDto): Promise<any>;
    getTicket(orderId: string): Promise<any>;
}
