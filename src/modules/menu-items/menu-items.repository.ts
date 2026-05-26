import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MenuItem, Prisma } from '@prisma/client';

export interface FindAllMenuItemsOptions {
  categoryId?: string;
  search?: string;
}

@Injectable()
export class MenuItemsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.MenuItemCreateInput): Promise<MenuItem> {
    return this.prisma.menuItem.create({
      data,
      include: { category: true },
    });
  }

  async findAll(options: FindAllMenuItemsOptions = {}): Promise<MenuItem[]> {
    const where: Prisma.MenuItemWhereInput = {};

    if (options.categoryId) {
      where.categoryId = options.categoryId;
    }

    if (options.search) {
      where.name = { contains: options.search, mode: 'insensitive' };
    }

    return this.prisma.menuItem.findMany({
      where,
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<MenuItem | null> {
    return this.prisma.menuItem.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  async update(id: string, data: Prisma.MenuItemUpdateInput): Promise<MenuItem> {
    return this.prisma.menuItem.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async delete(id: string): Promise<MenuItem> {
    return this.prisma.menuItem.delete({ where: { id } });
  }
}
