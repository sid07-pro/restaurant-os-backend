import { TablesRepository } from './tables.repository';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { ChangeTableStatusDto } from './dto/change-table-status.dto';
import { RealtimeService } from '../realtime/realtime.service';
export declare class TablesService {
    private readonly tablesRepository;
    private readonly realtimeService;
    constructor(tablesRepository: TablesRepository, realtimeService: RealtimeService);
    private buildTablePayload;
    create(createTableDto: CreateTableDto): Promise<{
        name: string | null;
        id: string;
        status: import("@prisma/client").$Enums.TableStatus;
        createdAt: Date;
        updatedAt: Date;
        tableNumber: string;
        capacity: number;
        notes: string | null;
    }>;
    findAll(): Promise<{
        name: string | null;
        id: string;
        status: import("@prisma/client").$Enums.TableStatus;
        createdAt: Date;
        updatedAt: Date;
        tableNumber: string;
        capacity: number;
        notes: string | null;
    }[]>;
    findOne(id: string): Promise<{
        name: string | null;
        id: string;
        status: import("@prisma/client").$Enums.TableStatus;
        createdAt: Date;
        updatedAt: Date;
        tableNumber: string;
        capacity: number;
        notes: string | null;
    }>;
    update(id: string, updateTableDto: UpdateTableDto): Promise<{
        name: string | null;
        id: string;
        status: import("@prisma/client").$Enums.TableStatus;
        createdAt: Date;
        updatedAt: Date;
        tableNumber: string;
        capacity: number;
        notes: string | null;
    }>;
    changeStatus(id: string, changeStatusDto: ChangeTableStatusDto): Promise<{
        name: string | null;
        id: string;
        status: import("@prisma/client").$Enums.TableStatus;
        createdAt: Date;
        updatedAt: Date;
        tableNumber: string;
        capacity: number;
        notes: string | null;
    }>;
    remove(id: string): Promise<{
        name: string | null;
        id: string;
        status: import("@prisma/client").$Enums.TableStatus;
        createdAt: Date;
        updatedAt: Date;
        tableNumber: string;
        capacity: number;
        notes: string | null;
    }>;
}
