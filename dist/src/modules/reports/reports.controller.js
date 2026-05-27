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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("./reports.service");
const report_query_dto_1 = require("./dto/report-query.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let ReportsController = class ReportsController {
    service;
    constructor(service) {
        this.service = service;
    }
    getDailyRevenue(query) {
        return this.service.getDailyRevenue(query);
    }
    getWeeklyRevenue(query) {
        return this.service.getWeeklyRevenue(query);
    }
    getMonthlyRevenue(query) {
        return this.service.getMonthlyRevenue(query);
    }
    getRevenueByRange(query) {
        return this.service.getRevenueByRange(query);
    }
    getTopSellingItems(query) {
        return this.service.getTopSellingItems(query);
    }
    getLeastSellingItems(query) {
        return this.service.getLeastSellingItems(query);
    }
    getCategoryBreakdown(query) {
        return this.service.getCategoryBreakdown(query);
    }
    getPaymentMethods(query) {
        return this.service.getPaymentMethodAnalytics(query);
    }
    getRefundStats(query) {
        return this.service.getRefundAnalytics(query);
    }
    getLowStock() {
        return this.service.getLowStockReport();
    }
    getOutOfStock() {
        return this.service.getOutOfStockReport();
    }
    getMovements(query) {
        return this.service.getInventoryMovements(query);
    }
    getTopSpenders(query) {
        return this.service.getTopSpenders(query);
    }
    getTopVisits(query) {
        return this.service.getTopVisitors(query);
    }
    getLoyaltyLeaderboard(query) {
        return this.service.getLoyaltyLeaderboard(query);
    }
    getDailyReservations(date) {
        return this.service.getDailyReservations(date);
    }
    getUtilization(query) {
        return this.service.getReservationUtilization(query);
    }
    getNoShows(query) {
        return this.service.getNoShowStats(query);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('sales/daily'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'CASHIER'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.ReportQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getDailyRevenue", null);
__decorate([
    (0, common_1.Get)('sales/weekly'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'CASHIER'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.ReportQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getWeeklyRevenue", null);
__decorate([
    (0, common_1.Get)('sales/monthly'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'CASHIER'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.ReportQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getMonthlyRevenue", null);
__decorate([
    (0, common_1.Get)('sales/range'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'CASHIER'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.ReportQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getRevenueByRange", null);
__decorate([
    (0, common_1.Get)('menu/top-selling'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.ReportQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getTopSellingItems", null);
__decorate([
    (0, common_1.Get)('menu/least-selling'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.ReportQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getLeastSellingItems", null);
__decorate([
    (0, common_1.Get)('menu/category-breakdown'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.ReportQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getCategoryBreakdown", null);
__decorate([
    (0, common_1.Get)('payments/methods'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'CASHIER'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.ReportQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getPaymentMethods", null);
__decorate([
    (0, common_1.Get)('payments/refunds'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'CASHIER'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.ReportQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getRefundStats", null);
__decorate([
    (0, common_1.Get)('inventory/low-stock'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getLowStock", null);
__decorate([
    (0, common_1.Get)('inventory/out-of-stock'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getOutOfStock", null);
__decorate([
    (0, common_1.Get)('inventory/movements'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.ReportQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getMovements", null);
__decorate([
    (0, common_1.Get)('customers/top-spenders'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.ReportQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getTopSpenders", null);
__decorate([
    (0, common_1.Get)('customers/top-visits'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.ReportQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getTopVisits", null);
__decorate([
    (0, common_1.Get)('customers/loyalty'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.ReportQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getLoyaltyLeaderboard", null);
__decorate([
    (0, common_1.Get)('reservations/daily'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getDailyReservations", null);
__decorate([
    (0, common_1.Get)('reservations/utilization'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.ReportQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getUtilization", null);
__decorate([
    (0, common_1.Get)('reservations/no-shows'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_query_dto_1.ReportQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getNoShows", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.Controller)({ path: 'reports', version: '1' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map