import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { ToggleAvailabilityDto } from './dto/toggle-availability.dto';
export declare class MenuItemsController {
    private readonly menuItemsService;
    constructor(menuItemsService: MenuItemsService);
    create(createMenuItemDto: CreateMenuItemDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        imageUrl: string | null;
        isAvailable: boolean;
        categoryId: string;
    }>;
    findAll(categoryId?: string, search?: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        imageUrl: string | null;
        isAvailable: boolean;
        categoryId: string;
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        imageUrl: string | null;
        isAvailable: boolean;
        categoryId: string;
    }>;
    update(id: string, updateMenuItemDto: UpdateMenuItemDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        imageUrl: string | null;
        isAvailable: boolean;
        categoryId: string;
    }>;
    toggleAvailability(id: string, toggleDto: ToggleAvailabilityDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        imageUrl: string | null;
        isAvailable: boolean;
        categoryId: string;
    }>;
    remove(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        imageUrl: string | null;
        isAvailable: boolean;
        categoryId: string;
    }>;
}
