import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CustomersRepository } from './customers.repository';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly repo: CustomersRepository) {}

  async create(dto: CreateCustomerDto) {
    const existing = await this.repo.findByPhone(dto.phone);
    if (existing) {
      throw new ConflictException(`Customer with phone number '${dto.phone}' already exists`);
    }

    return this.repo.create({
      name: dto.name,
      phone: dto.phone,
      email: dto.email,
    });
  }

  async findAll(query: { search?: string; phone?: string } = {}) {
    return this.repo.findAll(query);
  }

  async findOne(id: string) {
    const customer = await this.repo.findById(id);
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto) {
    const customer = await this.findOne(id);

    if (dto.phone && dto.phone !== customer.phone) {
      const existing = await this.repo.findByPhone(dto.phone);
      if (existing) {
        throw new ConflictException(`Customer with phone number '${dto.phone}' already exists`);
      }
    }

    return this.repo.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repo.delete(id);
  }

  async addLoyaltyPoints(id: string, points: number) {
    const customer = await this.findOne(id);
    const newPoints = customer.loyaltyPoints + points;

    return this.repo.update(id, { loyaltyPoints: newPoints });
  }

  async deductLoyaltyPoints(id: string, points: number) {
    const customer = await this.findOne(id);
    if (customer.loyaltyPoints < points) {
      throw new BadRequestException(
        `Insufficient loyalty points. Current: ${customer.loyaltyPoints}, attempted deduction: ${points}`
      );
    }

    const newPoints = customer.loyaltyPoints - points;
    return this.repo.update(id, { loyaltyPoints: newPoints });
  }

  async getLoyaltyBalance(id: string) {
    const customer = await this.findOne(id);
    return { loyaltyPoints: customer.loyaltyPoints };
  }

  async getSummary(id: string) {
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
}
