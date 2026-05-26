import { KdsService } from './kds.service';
import { UpdateKitchenNotesDto, UpdatePriorityDto } from './dto/kds.dto';
export declare class KdsController {
    private readonly kdsService;
    constructor(kdsService: KdsService);
    getActiveTickets(): Promise<any[]>;
    getTicket(orderId: string): Promise<any>;
    startPreparing(orderId: string): Promise<any>;
    markReady(orderId: string): Promise<any>;
    markServed(orderId: string): Promise<any>;
    updateKitchenNotes(orderId: string, dto: UpdateKitchenNotesDto): Promise<any>;
    updatePriority(orderId: string, dto: UpdatePriorityDto): Promise<any>;
}
