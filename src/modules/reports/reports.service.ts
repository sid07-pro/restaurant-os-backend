import { Injectable, BadRequestException } from '@nestjs/common';
import { ReportsRepository } from './reports.repository';
import { ReportQueryDto } from './dto/report-query.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly repo: ReportsRepository) {}

  private parseDateRange(query: ReportQueryDto): { startDate: Date; endDate: Date } | null {
    if (query.startDate && query.endDate) {
      const startDate = new Date(query.startDate);
      const endDate = new Date(query.endDate);
      endDate.setUTCHours(23, 59, 59, 999);

      if (startDate > endDate) {
        throw new BadRequestException('startDate must be before or equal to endDate');
      }
      return { startDate, endDate };
    }
    return null;
  }

  // ─── SALES ──────────────────────────────────────────────────────────────────

  async getDailyRevenue(query: ReportQueryDto) {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const aggregate = await this.repo.getCompletedPaymentsAggregate(startOfDay, endOfDay);
    const orderCount = await this.repo.getOrderCountByDateRange(startOfDay, endOfDay);

    return {
      period: 'daily',
      date: now.toISOString().split('T')[0],
      totalRevenue: aggregate.totalRevenue,
      paymentCount: aggregate.orderCount,
      orderCount,
    };
  }

  async getWeeklyRevenue(query: ReportQueryDto) {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setUTCHours(0, 0, 0, 0);
    const endOfWeek = new Date(now);
    endOfWeek.setUTCHours(23, 59, 59, 999);

    const aggregate = await this.repo.getCompletedPaymentsAggregate(startOfWeek, endOfWeek);
    const orderCount = await this.repo.getOrderCountByDateRange(startOfWeek, endOfWeek);

    return {
      period: 'weekly',
      startDate: startOfWeek.toISOString().split('T')[0],
      endDate: endOfWeek.toISOString().split('T')[0],
      totalRevenue: aggregate.totalRevenue,
      paymentCount: aggregate.orderCount,
      orderCount,
    };
  }

  async getMonthlyRevenue(query: ReportQueryDto) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setUTCHours(0, 0, 0, 0);
    const endOfMonth = new Date(now);
    endOfMonth.setUTCHours(23, 59, 59, 999);

    const aggregate = await this.repo.getCompletedPaymentsAggregate(startOfMonth, endOfMonth);
    const orderCount = await this.repo.getOrderCountByDateRange(startOfMonth, endOfMonth);

    return {
      period: 'monthly',
      month: now.toISOString().slice(0, 7),
      totalRevenue: aggregate.totalRevenue,
      paymentCount: aggregate.orderCount,
      orderCount,
    };
  }

  async getRevenueByRange(query: ReportQueryDto) {
    const range = this.parseDateRange(query);
    if (!range) {
      throw new BadRequestException('startDate and endDate are required for range query');
    }

    const aggregate = await this.repo.getCompletedPaymentsAggregate(range.startDate, range.endDate);
    const orderCount = await this.repo.getOrderCountByDateRange(range.startDate, range.endDate);

    return {
      period: 'custom',
      startDate: query.startDate,
      endDate: query.endDate,
      totalRevenue: aggregate.totalRevenue,
      paymentCount: aggregate.orderCount,
      orderCount,
    };
  }

  // ─── MENU ───────────────────────────────────────────────────────────────────

  async getTopSellingItems(query: ReportQueryDto) {
    const limit = query.limit ?? 10;
    const range = this.parseDateRange(query);
    return this.repo.getMenuItemSales(limit, 'desc', range?.startDate, range?.endDate);
  }

  async getLeastSellingItems(query: ReportQueryDto) {
    const limit = query.limit ?? 10;
    const range = this.parseDateRange(query);
    return this.repo.getMenuItemSales(limit, 'asc', range?.startDate, range?.endDate);
  }

  async getCategoryBreakdown(query: ReportQueryDto) {
    const range = this.parseDateRange(query);
    return this.repo.getCategoryBreakdown(range?.startDate, range?.endDate);
  }

  // ─── PAYMENTS ───────────────────────────────────────────────────────────────

  async getPaymentMethodAnalytics(query: ReportQueryDto) {
    const range = this.parseDateRange(query);
    return this.repo.getPaymentMethodBreakdown(range?.startDate, range?.endDate);
  }

  async getRefundAnalytics(query: ReportQueryDto) {
    const range = this.parseDateRange(query);
    return this.repo.getRefundStats(range?.startDate, range?.endDate);
  }

  // ─── INVENTORY ──────────────────────────────────────────────────────────────

  async getLowStockReport() {
    return this.repo.getLowStockItems();
  }

  async getOutOfStockReport() {
    return this.repo.getOutOfStockItems();
  }

  async getInventoryMovements(query: ReportQueryDto) {
    const limit = query.limit ?? 10;
    return this.repo.getInventoryMovementSummary(limit);
  }

  // ─── CUSTOMERS ──────────────────────────────────────────────────────────────

  async getTopSpenders(query: ReportQueryDto) {
    const limit = query.limit ?? 10;
    return this.repo.getTopCustomersBySpending(limit);
  }

  async getTopVisitors(query: ReportQueryDto) {
    const limit = query.limit ?? 10;
    return this.repo.getTopCustomersByVisits(limit);
  }

  async getLoyaltyLeaderboard(query: ReportQueryDto) {
    const limit = query.limit ?? 10;
    return this.repo.getLoyaltyLeaderboard(limit);
  }

  // ─── RESERVATIONS ───────────────────────────────────────────────────────────

  async getDailyReservations(dateStr: string) {
    return this.repo.getReservationsByDate(dateStr);
  }

  async getReservationUtilization(query: ReportQueryDto) {
    const range = this.parseDateRange(query);
    return this.repo.getReservationUtilization(range?.startDate, range?.endDate);
  }

  async getNoShowStats(query: ReportQueryDto) {
    const range = this.parseDateRange(query);
    return this.repo.getNoShowStats(range?.startDate, range?.endDate);
  }
}
