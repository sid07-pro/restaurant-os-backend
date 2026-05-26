import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { MenuItemsRepository } from './menu-items.repository';
import { CategoriesRepository } from '../categories/categories.repository';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { ToggleAvailabilityDto } from './dto/toggle-availability.dto';

@Injectable()
export class MenuItemsService {
  constructor(
    private readonly menuItemsRepository: MenuItemsRepository,
    private readonly categoriesRepository: CategoriesRepository,
  ) {}

  private async validateCategory(categoryId: string) {
    const category = await this.categoriesRepository.findById(categoryId);
    if (!category) {
      throw new BadRequestException(`Category with ID ${categoryId} does not exist`);
    }
  }

  async create(dto: CreateMenuItemDto) {
    await this.validateCategory(dto.categoryId);
    const { categoryId, ...rest } = dto;
    return this.menuItemsRepository.create({
      ...rest,
      price: rest.price,
      category: { connect: { id: categoryId } },
    });
  }

  async findAll(categoryId?: string, search?: string) {
    return this.menuItemsRepository.findAll({ categoryId, search });
  }

  async findOne(id: string) {
    const item = await this.menuItemsRepository.findById(id);
    if (!item) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }
    return item;
  }

  async update(id: string, dto: UpdateMenuItemDto) {
    await this.findOne(id);
    if (dto.categoryId) {
      await this.validateCategory(dto.categoryId);
    }

    const { categoryId, ...rest } = dto;
    const data: any = { ...rest };
    if (categoryId) {
      data.category = { connect: { id: categoryId } };
    }

    return this.menuItemsRepository.update(id, data);
  }

  async toggleAvailability(id: string, dto: ToggleAvailabilityDto) {
    await this.findOne(id);
    return this.menuItemsRepository.update(id, { isAvailable: dto.isAvailable });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.menuItemsRepository.delete(id);
  }
}
