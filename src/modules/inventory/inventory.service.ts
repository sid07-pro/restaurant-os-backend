import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InventoryRepository } from './inventory.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { RealtimeService } from '../realtime/realtime.service';

@Injectable()
export class InventoryService {
  constructor(
    private readonly repo: InventoryRepository,
    private readonly prisma: PrismaService,
    private readonly realtimeService: RealtimeService,
  ) {}

  private addFlags(item: any) {
    const stock = Number(item.currentStock);
    const min = Number(item.minimumStock);
    return {
      ...item,
      isLowStock: stock > 0 && stock <= min,
      isOutOfStock: stock === 0,
    };
  }

  private buildInventoryPayload(item: any) {
    return {
      inventoryItemId: item.id,
      name: item.name,
      currentStock: item.currentStock,
      minimumStock: item.minimumStock,
      timestamp: new Date().toISOString(),
    };
  }

  private emitStockAlerts(item: any) {
    const stock = Number(item.currentStock);
    const min = Number(item.minimumStock);
    const payload = this.buildInventoryPayload(item);

    if (stock === 0) {
      this.realtimeService.emitInventoryOutOfStock(payload);
    } else if (stock > 0 && stock <= min) {
      this.realtimeService.emitInventoryLowStock(payload);
    }

    this.realtimeService.emitInventoryUpdated(payload);
  }

  async create(dto: CreateInventoryItemDto) {
    // Check duplicate SKU
    const existing = await this.repo.findBySku(dto.sku);
    if (existing) {
      throw new ConflictException(`Inventory item with SKU '${dto.sku}' already exists`);
    }

    const item = await this.repo.create({
      name: dto.name,
      sku: dto.sku,
      unit: dto.unit,
      currentStock: dto.currentStock ?? 0,
      minimumStock: dto.minimumStock ?? 0,
      costPrice: dto.costPrice ?? 0,
      supplierName: dto.supplierName,
    });

    return this.addFlags(item);
  }

  async findAll() {
    const items = await this.repo.findAll();
    return items.map((i) => this.addFlags(i));
  }

  async findOne(id: string) {
    const item = await this.repo.findById(id);
    if (!item) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }
    return this.addFlags(item);
  }

  async update(id: string, dto: UpdateInventoryItemDto) {
    await this.findOne(id); // existence check
    const item = await this.repo.update(id, dto);
    return this.addFlags(item);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repo.delete(id);
  }

  async adjustStock(id: string, dto: AdjustStockDto) {
    const item = await this.findOne(id);
    const currentStock = Number(item.currentStock);
    const newStock = currentStock + dto.quantityChange;

    if (newStock < 0) {
      throw new BadRequestException(
        `Insufficient stock. Current: ${currentStock}, requested change: ${dto.quantityChange}. ` +
        `Stock cannot become negative.`,
      );
    }

    // Transaction: update stock + record movement
    const [updated] = await this.prisma.$transaction([
      this.prisma.inventoryItem.update({
        where: { id },
        data: { currentStock: newStock },
      }),
      this.prisma.stockMovement.create({
        data: {
          inventoryItemId: id,
          quantityChange: dto.quantityChange,
          reason: dto.reason,
        },
      }),
    ]);

    // Emit inventory alerts
    this.emitStockAlerts(updated);

    return this.addFlags(updated);
  }

  async getMovements(id: string) {
    await this.findOne(id); // existence check
    return this.repo.findMovements(id);
  }
}
