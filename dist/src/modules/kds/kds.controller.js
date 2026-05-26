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
exports.KdsController = void 0;
const common_1 = require("@nestjs/common");
const kds_service_1 = require("./kds.service");
const kds_dto_1 = require("./dto/kds.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let KdsController = class KdsController {
    kdsService;
    constructor(kdsService) {
        this.kdsService = kdsService;
    }
    getActiveTickets() {
        return this.kdsService.getActiveTickets();
    }
    getTicket(orderId) {
        return this.kdsService.getTicket(orderId);
    }
    startPreparing(orderId) {
        return this.kdsService.startPreparing(orderId);
    }
    markReady(orderId) {
        return this.kdsService.markReady(orderId);
    }
    markServed(orderId) {
        return this.kdsService.markServed(orderId);
    }
    updateKitchenNotes(orderId, dto) {
        return this.kdsService.updateKitchenNotes(orderId, dto);
    }
    updatePriority(orderId, dto) {
        return this.kdsService.updatePriority(orderId, dto);
    }
};
exports.KdsController = KdsController;
__decorate([
    (0, common_1.Get)('tickets'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], KdsController.prototype, "getActiveTickets", null);
__decorate([
    (0, common_1.Get)('tickets/:orderId'),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], KdsController.prototype, "getTicket", null);
__decorate([
    (0, common_1.Patch)('tickets/:orderId/start'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'KITCHEN_STAFF'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], KdsController.prototype, "startPreparing", null);
__decorate([
    (0, common_1.Patch)('tickets/:orderId/ready'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'KITCHEN_STAFF'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], KdsController.prototype, "markReady", null);
__decorate([
    (0, common_1.Patch)('tickets/:orderId/serve'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'WAITER'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], KdsController.prototype, "markServed", null);
__decorate([
    (0, common_1.Patch)('tickets/:orderId/notes'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'KITCHEN_STAFF'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, kds_dto_1.UpdateKitchenNotesDto]),
    __metadata("design:returntype", void 0)
], KdsController.prototype, "updateKitchenNotes", null);
__decorate([
    (0, common_1.Patch)('tickets/:orderId/priority'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, kds_dto_1.UpdatePriorityDto]),
    __metadata("design:returntype", void 0)
], KdsController.prototype, "updatePriority", null);
exports.KdsController = KdsController = __decorate([
    (0, common_1.Controller)({ path: 'kds', version: '1' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [kds_service_1.KdsService])
], KdsController);
//# sourceMappingURL=kds.controller.js.map