import { Module } from '@nestjs/common';
import { MenuItemsService } from './menu-items.service';
import { MenuItemsController } from './menu-items.controller';
import { MenuItemsRepository } from './menu-items.repository';
import { PrismaModule } from '../../prisma/prisma.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [PrismaModule, CategoriesModule],
  controllers: [MenuItemsController],
  providers: [MenuItemsService, MenuItemsRepository],
})
export class MenuItemsModule {}
