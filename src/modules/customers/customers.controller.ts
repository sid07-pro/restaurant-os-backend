import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { AdjustLoyaltyDto } from './dto/adjust-loyalty.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller({ path: 'customers', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER', 'CASHIER')
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('phone') phone?: string,
  ) {
    return this.customersService.findAll({ search, phone });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER', 'CASHIER')
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customersService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }

  @Post(':id/loyalty/add')
  @Roles('ADMIN', 'MANAGER', 'CASHIER')
  @HttpCode(HttpStatus.OK)
  addLoyaltyPoints(@Param('id') id: string, @Body() dto: AdjustLoyaltyDto) {
    return this.customersService.addLoyaltyPoints(id, dto.points);
  }

  @Post(':id/loyalty/deduct')
  @Roles('ADMIN', 'MANAGER', 'CASHIER')
  @HttpCode(HttpStatus.OK)
  deductLoyaltyPoints(@Param('id') id: string, @Body() dto: AdjustLoyaltyDto) {
    return this.customersService.deductLoyaltyPoints(id, dto.points);
  }

  @Get(':id/loyalty')
  getLoyaltyBalance(@Param('id') id: string) {
    return this.customersService.getLoyaltyBalance(id);
  }

  @Get(':id/summary')
  getSummary(@Param('id') id: string) {
    return this.customersService.getSummary(id);
  }
}
