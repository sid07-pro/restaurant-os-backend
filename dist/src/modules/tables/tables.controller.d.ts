import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { ChangeTableStatusDto } from './dto/change-table-status.dto';
export declare class TablesController {
    private readonly tablesService;
    constructor(tablesService: TablesService);
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
    changeStatus(id: string, changeTableStatusDto: ChangeTableStatusDto): Promise<{
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
