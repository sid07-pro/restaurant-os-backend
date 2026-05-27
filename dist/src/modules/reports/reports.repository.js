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
exports.ReportsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ReportsRepository = class ReportsRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCompletedPayments(startDate, endDate) {
        return this.prisma.payment.findMany({
            where: {
                paymentStatus: 'COMPLETED',
                paidAt: { gte: startDate, lte: endDate },
            },
            include: { order: true },
        });
    }
    async getCompletedPaymentsAggregate(startDate, endDate) {
        const result = await this.prisma.payment.aggregate({
            where: {
                paymentStatus: 'COMPLETED',
                paidAt: { gte: startDate, lte: endDate },
            },
            _sum: { amount: true },
            _count: true,
        });
        return {
            totalRevenue: result._sum.amount ?? 0,
            orderCount: result._count,
        };
    }
    async getOrderCountByDateRange(startDate, endDate) {
        return this.prisma.order.count({
            where: {
                createdAt: { gte: startDate, lte: endDate },
                status: { not: 'CANCELLED' },
            },
        });
    }
    async getMenuItemSales(limit, order, startDate, endDate) {
        const where = {};
        if (startDate && endDate) {
            where.createdAt = { gte: startDate, lte: endDate };
        }
        const items = await this.prisma.orderItem.groupBy({
            by: ['menuItemId'],
            where,
            _sum: { quantity: true, lineTotal: true },
            orderBy: { _sum: { quantity: order } },
            take: limit,
        });
        const menuItemIds = items.map((i) => i.menuItemId);
        const menuItems = await this.prisma.menuItem.findMany({
            where: { id: { in: menuItemIds } },
            include: { category: true },
        });
        const menuMap = new Map(menuItems.map((m) => [m.id, m]));
        return items.map((i) => ({
            menuItemId: i.menuItemId,
            menuItemName: menuMap.get(i.menuItemId)?.name ?? 'Unknown',
            categoryName: menuMap.get(i.menuItemId)?.category?.name ?? 'Unknown',
            totalQuantitySold: i._sum.quantity ?? 0,
            totalRevenue: i._sum.lineTotal ?? 0,
        }));
    }
    async getCategoryBreakdown(startDate, endDate) {
        const where = {};
        if (startDate && endDate) {
            where.createdAt = { gte: startDate, lte: endDate };
        }
        const items = await this.prisma.orderItem.findMany({
            where,
            include: {
                menuItem: { include: { category: true } },
            },
        });
        const categoryMap = new Map();
        for (const item of items) {
            const catId = item.menuItem.categoryId;
            const catName = item.menuItem.category.name;
            const existing = categoryMap.get(catId) || { name: catName, totalQuantity: 0, totalRevenue: 0 };
            existing.totalQuantity += item.quantity;
            existing.totalRevenue += Number(item.lineTotal);
            categoryMap.set(catId, existing);
        }
        return Array.from(categoryMap.entries()).map(([id, data]) => ({
            categoryId: id,
            categoryName: data.name,
            totalQuantitySold: data.totalQuantity,
            totalRevenue: data.totalRevenue,
        }));
    }
    async getPaymentMethodBreakdown(startDate, endDate) {
        const where = { paymentStatus: 'COMPLETED' };
        if (startDate && endDate) {
            where.paidAt = { gte: startDate, lte: endDate };
        }
        const groups = await this.prisma.payment.groupBy({
            by: ['paymentMethod'],
            where,
            _sum: { amount: true },
            _count: true,
        });
        return groups.map((g) => ({
            paymentMethod: g.paymentMethod,
            totalAmount: g._sum.amount ?? 0,
            count: g._count,
        }));
    }
    async getRefundStats(startDate, endDate) {
        const where = { paymentStatus: 'REFUNDED' };
        if (startDate && endDate) {
            where.updatedAt = { gte: startDate, lte: endDate };
        }
        const result = await this.prisma.payment.aggregate({
            where,
            _sum: { amount: true },
            _count: true,
        });
        const completedWhere = { paymentStatus: 'COMPLETED' };
        if (startDate && endDate) {
            completedWhere.paidAt = { gte: startDate, lte: endDate };
        }
        const completed = await this.prisma.payment.aggregate({
            where: completedWhere,
            _sum: { amount: true },
            _count: true,
        });
        return {
            refundedCount: result._count,
            refundedAmount: result._sum.amount ?? 0,
            completedCount: completed._count,
            completedAmount: completed._sum.amount ?? 0,
        };
    }
    async getLowStockItems() {
        const items = await this.prisma.inventoryItem.findMany({
            orderBy: { currentStock: 'asc' },
        });
        return items
            .filter((i) => {
            const stock = Number(i.currentStock);
            const min = Number(i.minimumStock);
            return stock > 0 && stock <= min;
        })
            .map((i) => ({
            ...i,
            isLowStock: true,
            isOutOfStock: false,
        }));
    }
    async getOutOfStockItems() {
        const items = await this.prisma.inventoryItem.findMany({
            orderBy: { name: 'asc' },
        });
        return items
            .filter((i) => Number(i.currentStock) === 0)
            .map((i) => ({
            ...i,
            isLowStock: false,
            isOutOfStock: true,
        }));
    }
    async getInventoryMovementSummary(limit) {
        const movements = await this.prisma.stockMovement.groupBy({
            by: ['inventoryItemId'],
            _count: true,
            _sum: { quantityChange: true },
            orderBy: { _count: { inventoryItemId: 'desc' } },
            take: limit,
        });
        const itemIds = movements.map((m) => m.inventoryItemId);
        const items = await this.prisma.inventoryItem.findMany({
            where: { id: { in: itemIds } },
        });
        const itemMap = new Map(items.map((i) => [i.id, i]));
        return movements.map((m) => ({
            inventoryItemId: m.inventoryItemId,
            itemName: itemMap.get(m.inventoryItemId)?.name ?? 'Unknown',
            sku: itemMap.get(m.inventoryItemId)?.sku ?? 'Unknown',
            movementCount: m._count,
            netChange: m._sum.quantityChange ?? 0,
        }));
    }
    async getTopCustomersBySpending(limit) {
        return this.prisma.customer.findMany({
            orderBy: { totalSpent: 'desc' },
            take: limit,
        });
    }
    async getTopCustomersByVisits(limit) {
        return this.prisma.customer.findMany({
            orderBy: { totalVisits: 'desc' },
            take: limit,
        });
    }
    async getLoyaltyLeaderboard(limit) {
        return this.prisma.customer.findMany({
            orderBy: { loyaltyPoints: 'desc' },
            take: limit,
        });
    }
    async getCustomerStats() {
        const result = await this.prisma.customer.aggregate({
            _avg: { totalSpent: true },
            _count: true,
        });
        const repeatCustomers = await this.prisma.customer.count({
            where: { totalVisits: { gt: 1 } },
        });
        return {
            totalCustomers: result._count,
            averageSpend: result._avg.totalSpent ?? 0,
            repeatCustomerCount: repeatCustomers,
            repeatCustomerRate: result._count > 0
                ? Math.round((repeatCustomers / result._count) * 10000) / 100
                : 0,
        };
    }
    async getReservationsByDate(dateStr) {
        const date = new Date(dateStr);
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);
        return this.prisma.reservation.findMany({
            where: {
                reservationTime: { gte: startOfDay, lte: endOfDay },
            },
            include: { customer: true, table: true },
            orderBy: { reservationTime: 'asc' },
        });
    }
    async getReservationUtilization(startDate, endDate) {
        const where = {};
        if (startDate && endDate) {
            where.reservationTime = { gte: startDate, lte: endDate };
        }
        const total = await this.prisma.reservation.count({ where });
        const completed = await this.prisma.reservation.count({
            where: { ...where, status: 'COMPLETED' },
        });
        const seated = await this.prisma.reservation.count({
            where: { ...where, status: 'SEATED' },
        });
        const cancelled = await this.prisma.reservation.count({
            where: { ...where, status: 'CANCELLED' },
        });
        const noShow = await this.prisma.reservation.count({
            where: { ...where, status: 'NO_SHOW' },
        });
        return {
            totalReservations: total,
            completedCount: completed,
            seatedCount: seated,
            cancelledCount: cancelled,
            noShowCount: noShow,
            utilizationRate: total > 0
                ? Math.round(((completed + seated) / total) * 10000) / 100
                : 0,
        };
    }
    async getNoShowStats(startDate, endDate) {
        const where = {};
        if (startDate && endDate) {
            where.reservationTime = { gte: startDate, lte: endDate };
        }
        const total = await this.prisma.reservation.count({ where });
        const noShows = await this.prisma.reservation.count({
            where: { ...where, status: 'NO_SHOW' },
        });
        const cancellations = await this.prisma.reservation.count({
            where: { ...where, status: 'CANCELLED' },
        });
        return {
            totalReservations: total,
            noShowCount: noShows,
            cancellationCount: cancellations,
            noShowRate: total > 0
                ? Math.round((noShows / total) * 10000) / 100
                : 0,
            cancellationRate: total > 0
                ? Math.round((cancellations / total) * 10000) / 100
                : 0,
        };
    }
};
exports.ReportsRepository = ReportsRepository;
exports.ReportsRepository = ReportsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsRepository);
//# sourceMappingURL=reports.repository.js.map