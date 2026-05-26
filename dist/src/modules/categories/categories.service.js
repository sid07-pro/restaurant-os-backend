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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const categories_repository_1 = require("./categories.repository");
let CategoriesService = class CategoriesService {
    categoriesRepository;
    constructor(categoriesRepository) {
        this.categoriesRepository = categoriesRepository;
    }
    async create(dto) {
        const trimmedName = dto.name.trim();
        const existing = await this.categoriesRepository.findByName(trimmedName);
        if (existing) {
            throw new common_1.ConflictException(`Category '${trimmedName}' already exists`);
        }
        return this.categoriesRepository.create({ ...dto, name: trimmedName });
    }
    async findAll() {
        return this.categoriesRepository.findAll();
    }
    async findOne(id) {
        const category = await this.categoriesRepository.findById(id);
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        return category;
    }
    async update(id, dto) {
        await this.findOne(id);
        if (dto.name) {
            const trimmedName = dto.name.trim();
            const existing = await this.categoriesRepository.findByName(trimmedName);
            if (existing && existing.id !== id) {
                throw new common_1.ConflictException(`Category '${trimmedName}' already exists`);
            }
            dto = { ...dto, name: trimmedName };
        }
        return this.categoriesRepository.update(id, dto);
    }
    async remove(id) {
        await this.findOne(id);
        const itemCount = await this.categoriesRepository.countMenuItems(id);
        if (itemCount > 0) {
            throw new common_1.BadRequestException(`Cannot delete category: it has ${itemCount} menu item(s) linked. Remove items first.`);
        }
        return this.categoriesRepository.delete(id);
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [categories_repository_1.CategoriesRepository])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map