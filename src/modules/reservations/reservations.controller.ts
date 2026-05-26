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
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ReservationStatus } from '@prisma/client';

@Controller({ path: 'reservations', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservationsController {
  constructor(private readonly service: ReservationsService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER', 'CASHIER')
  create(@Body() dto: CreateReservationDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query('status') status?: ReservationStatus,
    @Query('customerId') customerId?: string,
    @Query('tableId') tableId?: string,
    @Query('date') date?: string,
  ) {
    return this.service.findAll({ status, customerId, tableId, date });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER', 'CASHIER')
  update(@Param('id') id: string, @Body() dto: UpdateReservationDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'MANAGER', 'CASHIER')
  @HttpCode(HttpStatus.OK)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateReservationStatusDto,
  ) {
    return this.service.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Get('customer/:customerId')
  findByCustomer(@Param('customerId') customerId: string) {
    return this.service.findByCustomer(customerId);
  }

  @Get('table/:tableId')
  findByTable(@Param('tableId') tableId: string) {
    return this.service.findByTable(tableId);
  }

  @Get('date/:date')
  findByDate(@Param('date') date: string) {
    return this.service.findByDate(date);
  }
}
