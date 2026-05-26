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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const customers_repository_1 = require("./customers.repository");
let CustomersService = class CustomersService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async create(dto) {
        const existing = await this.repo.findByPhone(dto.phone);
        if (existing) {
            throw new common_1.ConflictException(`Customer with phone number '${dto.phone}' already exists`);
        }
        return this.repo.create({
            name: dto.name,
            phone: dto.phone,
            email: dto.email,
        });
    }
    async findAll(query = {}) {
        return this.repo.findAll(query);
    }
    async findOne(id) {
        const customer = await this.repo.findById(id);
        if (!customer) {
            throw new common_1.NotFoundException(`Customer with ID ${id} not found`);
        }
        return customer;
    }
    async update(id, dto) {
        const customer = await this.findOne(id);
        if (dto.phone && dto.phone !== customer.phone) {
            const existing = await this.repo.findByPhone(dto.phone);
            if (existing) {
                throw new common_1.ConflictException(`Customer with phone number '${dto.phone}' already exists`);
            }
        }
        return this.repo.update(id, dto);
    }
    async remove(id) {
        await this.findOne(id);
        return this.repo.delete(id);
    }
    async addLoyaltyPoints(id, points) {
        const customer = await this.findOne(id);
        const newPoints = customer.loyaltyPoints + points;
        return this.repo.update(id, { loyaltyPoints: newPoints });
    }
    async deductLoyaltyPoints(id, points) {
        const customer = await this.findOne(id);
        if (customer.loyaltyPoints < points) {
            throw new common_1.BadRequestException(`Insufficient loyalty points. Current: ${customer.loyaltyPoints}, attempted deduction: ${points}`);
        }
        const newPoints = customer.loyaltyPoints - points;
        return this.repo.update(id, { loyaltyPoints: newPoints });
    }
    async getLoyaltyBalance(id) {
        const customer = await this.findOne(id);
        return { loyaltyPoints: customer.loyaltyPoints };
    }
    async getSummary(id) {
        const customer = await this.findOne(id);
        return {
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            loyaltyPoints: customer.loyaltyPoints,
            totalVisits: customer.totalVisits,
            totalSpent: customer.totalSpent,
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt,
        };
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [customers_repository_1.CustomersRepository])
], CustomersService);
//# sourceMappingURL=customers.service.js.map