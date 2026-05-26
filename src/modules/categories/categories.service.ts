import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async create(dto: CreateCategoryDto) {
    const trimmedName = dto.name.trim();
    const existing = await this.categoriesRepository.findByName(trimmedName);
    if (existing) {
      throw new ConflictException(`Category '${trimmedName}' already exists`);
    }
    return this.categoriesRepository.create({ ...dto, name: trimmedName });
  }

  async findAll() {
    return this.categoriesRepository.findAll();
  }

  async findOne(id: string) {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id); // ensures exists

    if (dto.name) {
      const trimmedName = dto.name.trim();
      const existing = await this.categoriesRepository.findByName(trimmedName);
      if (existing && existing.id !== id) {
        throw new ConflictException(`Category '${trimmedName}' already exists`);
      }
      dto = { ...dto, name: trimmedName };
    }

    return this.categoriesRepository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id); // ensures exists
    const itemCount = await this.categoriesRepository.countMenuItems(id);
    if (itemCount > 0) {
      throw new BadRequestException(
        `Cannot delete category: it has ${itemCount} menu item(s) linked. Remove items first.`,
      );
    }
    return this.categoriesRepository.delete(id);
  }
}
