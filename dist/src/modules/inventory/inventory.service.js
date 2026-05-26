"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const inventory_repository_1 = require("./inventory.repository");
const prisma_service_1 = require("../../prisma/prisma.service");
let InventoryService = class InventoryService {
    repo;
    prisma;
    constructor(repo, prisma) {
        this.repo = repo;
        this.prisma = prisma;
    }
    addFlags(item) {
        const stock = Number(item.currentStock);
        const min = Number(item.minimumStock);
        return {
            ...item,
            isLowStock: stock > 0 && stock <= min,
            isOutOfStock: stock === 0,
        };
    }
    async create(dto) {
        const existing = await this.repo.findBySku(dto.sku);
        if (existing) {
            throw new common_1.ConflictException(`Inventory item with SKU '${dto.sku}' already exists`);
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
    async findOne(id) {
        const item = await this.repo.findById(id);
        if (!item) {
            throw new common_1.NotFoundException(`Inventory item with ID ${id} not found`);
        }
        return this.addFlags(item);
    }
    async update(id, dto) {
        await this.findOne(id);
        const item = await this.repo.update(id, dto);
        return this.addFlags(item);
    }
    async remove(id) {
        await this.findOne(id);
        return this.repo.delete(id);
    }
    async adjustStock(id, dto) {
        const item = await this.findOne(id);
        const currentStock = Number(item.currentStock);
        const newStock = currentStock + dto.quantityChange;
        if (newStock < 0) {
            throw new common_1.BadRequestException(`Insufficient stock. Current: ${currentStock}, requested change: ${dto.quantityChange}. ` +
                `Stock cannot become negative.`);
        }
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
        return this.addFlags(updated);
    }
    async getMovements(id) {
        await this.findOne(id);
        return this.repo.findMovements(id);
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [inventory_repository_1.InventoryRepository,
        prisma_service_1.PrismaService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map