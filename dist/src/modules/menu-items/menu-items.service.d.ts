import { MenuItemsRepository } from './menu-items.repository';
import { CategoriesRepository } from '../categories/categories.repository';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { ToggleAvailabilityDto } from './dto/toggle-availability.dto';
export declare class MenuItemsService {
    private readonly menuItemsRepository;
    private readonly categoriesRepository;
    constructor(menuItemsRepository: MenuItemsRepository, categoriesRepository: CategoriesRepository);
    private validateCategory;
    create(dto: CreateMenuItemDto): Promise<{
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
    update(id: string, dto: UpdateMenuItemDto): Promise<{
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
    toggleAvailability(id: string, dto: ToggleAvailabilityDto): Promise<{
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
