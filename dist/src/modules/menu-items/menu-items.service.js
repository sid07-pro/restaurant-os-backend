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
exports.MenuItemsService = void 0;
const common_1 = require("@nestjs/common");
const menu_items_repository_1 = require("./menu-items.repository");
const categories_repository_1 = require("../categories/categories.repository");
let MenuItemsService = class MenuItemsService {
    menuItemsRepository;
    categoriesRepository;
    constructor(menuItemsRepository, categoriesRepository) {
        this.menuItemsRepository = menuItemsRepository;
        this.categoriesRepository = categoriesRepository;
    }
    async validateCategory(categoryId) {
        const category = await this.categoriesRepository.findById(categoryId);
        if (!category) {
            throw new common_1.BadRequestException(`Category with ID ${categoryId} does not exist`);
        }
    }
    async create(dto) {
        await this.validateCategory(dto.categoryId);
        const { categoryId, ...rest } = dto;
        return this.menuItemsRepository.create({
            ...rest,
            price: rest.price,
            category: { connect: { id: categoryId } },
        });
    }
    async findAll(categoryId, search) {
        return this.menuItemsRepository.findAll({ categoryId, search });
    }
    async findOne(id) {
        const item = await this.menuItemsRepository.findById(id);
        if (!item) {
            throw new common_1.NotFoundException(`Menu item with ID ${id} not found`);
        }
        return item;
    }
    async update(id, dto) {
        await this.findOne(id);
        if (dto.categoryId) {
            await this.validateCategory(dto.categoryId);
        }
        const { categoryId, ...rest } = dto;
        const data = { ...rest };
        if (categoryId) {
            data.category = { connect: { id: categoryId } };
        }
        return this.menuItemsRepository.update(id, data);
    }
    async toggleAvailability(id, dto) {
        await this.findOne(id);
        return this.menuItemsRepository.update(id, { isAvailable: dto.isAvailable });
    }
    async remove(id) {
        await this.findOne(id);
        return this.menuItemsRepository.delete(id);
    }
};
exports.MenuItemsService = MenuItemsService;
exports.MenuItemsService = MenuItemsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [menu_items_repository_1.MenuItemsRepository,
        categories_repository_1.CategoriesRepository])
], MenuItemsService);
//# sourceMappingURL=menu-items.service.js.map