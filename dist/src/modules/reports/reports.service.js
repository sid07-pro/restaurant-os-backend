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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const reports_repository_1 = require("./reports.repository");
let ReportsService = class ReportsService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    parseDateRange(query) {
        if (query.startDate && query.endDate) {
            const startDate = new Date(query.startDate);
            const endDate = new Date(query.endDate);
            endDate.setUTCHours(23, 59, 59, 999);
            if (startDate > endDate) {
                throw new common_1.BadRequestException('startDate must be before or equal to endDate');
            }
            return { startDate, endDate };
        }
        return null;
    }
    async getDailyRevenue(query) {
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
    async getWeeklyRevenue(query) {
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
    async getMonthlyRevenue(query) {
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
    async getRevenueByRange(query) {
        const range = this.parseDateRange(query);
        if (!range) {
            throw new common_1.BadRequestException('startDate and endDate are required for range query');
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
    async getTopSellingItems(query) {
        const limit = query.limit ?? 10;
        const range = this.parseDateRange(query);
        return this.repo.getMenuItemSales(limit, 'desc', range?.startDate, range?.endDate);
    }
    async getLeastSellingItems(query) {
        const limit = query.limit ?? 10;
        const range = this.parseDateRange(query);
        return this.repo.getMenuItemSales(limit, 'asc', range?.startDate, range?.endDate);
    }
    async getCategoryBreakdown(query) {
        const range = this.parseDateRange(query);
        return this.repo.getCategoryBreakdown(range?.startDate, range?.endDate);
    }
    async getPaymentMethodAnalytics(query) {
        const range = this.parseDateRange(query);
        return this.repo.getPaymentMethodBreakdown(range?.startDate, range?.endDate);
    }
    async getRefundAnalytics(query) {
        const range = this.parseDateRange(query);
        return this.repo.getRefundStats(range?.startDate, range?.endDate);
    }
    async getLowStockReport() {
        return this.repo.getLowStockItems();
    }
    async getOutOfStockReport() {
        return this.repo.getOutOfStockItems();
    }
    async getInventoryMovements(query) {
        const limit = query.limit ?? 10;
        return this.repo.getInventoryMovementSummary(limit);
    }
    async getTopSpenders(query) {
        const limit = query.limit ?? 10;
        return this.repo.getTopCustomersBySpending(limit);
    }
    async getTopVisitors(query) {
        const limit = query.limit ?? 10;
        return this.repo.getTopCustomersByVisits(limit);
    }
    async getLoyaltyLeaderboard(query) {
        const limit = query.limit ?? 10;
        return this.repo.getLoyaltyLeaderboard(limit);
    }
    async getDailyReservations(dateStr) {
        return this.repo.getReservationsByDate(dateStr);
    }
    async getReservationUtilization(query) {
        const range = this.parseDateRange(query);
        return this.repo.getReservationUtilization(range?.startDate, range?.endDate);
    }
    async getNoShowStats(query) {
        const range = this.parseDateRange(query);
        return this.repo.getNoShowStats(range?.startDate, range?.endDate);
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [reports_repository_1.ReportsRepository])
], ReportsService);
//# sourceMappingURL=reports.service.js.map