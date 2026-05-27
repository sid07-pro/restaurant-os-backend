import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportQueryDto } from './dto/report-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller({ path: 'reports', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  // ─── SALES ──────────────────────────────────────────────────────────────────

  @Get('sales/daily')
  @Roles('ADMIN', 'MANAGER', 'CASHIER')
  getDailyRevenue(@Query() query: ReportQueryDto) {
    return this.service.getDailyRevenue(query);
  }

  @Get('sales/weekly')
  @Roles('ADMIN', 'MANAGER', 'CASHIER')
  getWeeklyRevenue(@Query() query: ReportQueryDto) {
    return this.service.getWeeklyRevenue(query);
  }

  @Get('sales/monthly')
  @Roles('ADMIN', 'MANAGER', 'CASHIER')
  getMonthlyRevenue(@Query() query: ReportQueryDto) {
    return this.service.getMonthlyRevenue(query);
  }

  @Get('sales/range')
  @Roles('ADMIN', 'MANAGER', 'CASHIER')
  getRevenueByRange(@Query() query: ReportQueryDto) {
    return this.service.getRevenueByRange(query);
  }

  // ─── MENU ───────────────────────────────────────────────────────────────────

  @Get('menu/top-selling')
  @Roles('ADMIN', 'MANAGER')
  getTopSellingItems(@Query() query: ReportQueryDto) {
    return this.service.getTopSellingItems(query);
  }

  @Get('menu/least-selling')
  @Roles('ADMIN', 'MANAGER')
  getLeastSellingItems(@Query() query: ReportQueryDto) {
    return this.service.getLeastSellingItems(query);
  }

  @Get('menu/category-breakdown')
  @Roles('ADMIN', 'MANAGER')
  getCategoryBreakdown(@Query() query: ReportQueryDto) {
    return this.service.getCategoryBreakdown(query);
  }

  // ─── PAYMENTS ───────────────────────────────────────────────────────────────

  @Get('payments/methods')
  @Roles('ADMIN', 'MANAGER', 'CASHIER')
  getPaymentMethods(@Query() query: ReportQueryDto) {
    return this.service.getPaymentMethodAnalytics(query);
  }

  @Get('payments/refunds')
  @Roles('ADMIN', 'MANAGER', 'CASHIER')
  getRefundStats(@Query() query: ReportQueryDto) {
    return this.service.getRefundAnalytics(query);
  }

  // ─── INVENTORY ──────────────────────────────────────────────────────────────

  @Get('inventory/low-stock')
  @Roles('ADMIN', 'MANAGER')
  getLowStock() {
    return this.service.getLowStockReport();
  }

  @Get('inventory/out-of-stock')
  @Roles('ADMIN', 'MANAGER')
  getOutOfStock() {
    return this.service.getOutOfStockReport();
  }

  @Get('inventory/movements')
  @Roles('ADMIN', 'MANAGER')
  getMovements(@Query() query: ReportQueryDto) {
    return this.service.getInventoryMovements(query);
  }

  // ─── CUSTOMERS ──────────────────────────────────────────────────────────────

  @Get('customers/top-spenders')
  @Roles('ADMIN', 'MANAGER')
  getTopSpenders(@Query() query: ReportQueryDto) {
    return this.service.getTopSpenders(query);
  }

  @Get('customers/top-visits')
  @Roles('ADMIN', 'MANAGER')
  getTopVisits(@Query() query: ReportQueryDto) {
    return this.service.getTopVisitors(query);
  }

  @Get('customers/loyalty')
  @Roles('ADMIN', 'MANAGER')
  getLoyaltyLeaderboard(@Query() query: ReportQueryDto) {
    return this.service.getLoyaltyLeaderboard(query);
  }

  // ─── RESERVATIONS ───────────────────────────────────────────────────────────

  @Get('reservations/daily')
  @Roles('ADMIN', 'MANAGER')
  getDailyReservations(@Query('date') date: string) {
    return this.service.getDailyReservations(date);
  }

  @Get('reservations/utilization')
  @Roles('ADMIN', 'MANAGER')
  getUtilization(@Query() query: ReportQueryDto) {
    return this.service.getReservationUtilization(query);
  }

  @Get('reservations/no-shows')
  @Roles('ADMIN', 'MANAGER')
  getNoShows(@Query() query: ReportQueryDto) {
    return this.service.getNoShowStats(query);
  }
}
