import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller({ version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('payments')
  @Roles('ADMIN', 'MANAGER', 'CASHIER')
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get('payments')
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get('payments/:id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Get('payments/:id/receipt')
  getReceipt(@Param('id') id: string) {
    return this.paymentsService.getReceipt(id);
  }

  @Post('payments/:id/refund')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  refund(@Param('id') id: string) {
    return this.paymentsService.refund(id);
  }

  @Get('orders/:orderId/payment')
  findByOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.findByOrder(orderId);
  }
}
