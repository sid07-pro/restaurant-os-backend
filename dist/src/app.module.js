"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const env_config_1 = require("./common/config/env.config");
const prisma_module_1 = require("./prisma/prisma.module");
const health_module_1 = require("./modules/health/health.module");
const auth_module_1 = require("./modules/auth/auth.module");
const tables_module_1 = require("./modules/tables/tables.module");
const categories_module_1 = require("./modules/categories/categories.module");
const menu_items_module_1 = require("./modules/menu-items/menu-items.module");
const orders_module_1 = require("./modules/orders/orders.module");
const kds_module_1 = require("./modules/kds/kds.module");
const payments_module_1 = require("./modules/payments/payments.module");
const inventory_module_1 = require("./modules/inventory/inventory.module");
const customers_module_1 = require("./modules/customers/customers.module");
const reservations_module_1 = require("./modules/reservations/reservations.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                validationSchema: env_config_1.envValidationSchema,
                validationOptions: {
                    abortEarly: true,
                },
            }),
            prisma_module_1.PrismaModule,
            health_module_1.HealthModule,
            auth_module_1.AuthModule,
            tables_module_1.TablesModule,
            categories_module_1.CategoriesModule,
            menu_items_module_1.MenuItemsModule,
            orders_module_1.OrdersModule,
            kds_module_1.KdsModule,
            payments_module_1.PaymentsModule,
            inventory_module_1.InventoryModule,
            customers_module_1.CustomersModule,
            reservations_module_1.ReservationsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map