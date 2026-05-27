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
exports.TablesService = void 0;
const common_1 = require("@nestjs/common");
const tables_repository_1 = require("./tables.repository");
const realtime_service_1 = require("../realtime/realtime.service");
let TablesService = class TablesService {
    tablesRepository;
    realtimeService;
    constructor(tablesRepository, realtimeService) {
        this.tablesRepository = tablesRepository;
        this.realtimeService = realtimeService;
    }
    buildTablePayload(table) {
        return {
            tableId: table.id,
            tableNumber: table.tableNumber,
            status: table.status,
            timestamp: new Date().toISOString(),
        };
    }
    async create(createTableDto) {
        const existingTable = await this.tablesRepository.findByTableNumber(createTableDto.tableNumber);
        if (existingTable) {
            throw new common_1.ConflictException(`Table number ${createTableDto.tableNumber} already exists`);
        }
        return this.tablesRepository.create(createTableDto);
    }
    async findAll() {
        return this.tablesRepository.findAll();
    }
    async findOne(id) {
        const table = await this.tablesRepository.findById(id);
        if (!table) {
            throw new common_1.NotFoundException(`Table with ID ${id} not found`);
        }
        return table;
    }
    async update(id, updateTableDto) {
        const table = await this.findOne(id);
        if (updateTableDto.tableNumber && updateTableDto.tableNumber !== table.tableNumber) {
            const existingTable = await this.tablesRepository.findByTableNumber(updateTableDto.tableNumber);
            if (existingTable) {
                throw new common_1.ConflictException(`Table number ${updateTableDto.tableNumber} already exists`);
            }
        }
        return this.tablesRepository.update(id, updateTableDto);
    }
    async changeStatus(id, changeStatusDto) {
        await this.findOne(id);
        const updated = await this.tablesRepository.update(id, { status: changeStatusDto.status });
        const payload = this.buildTablePayload(updated);
        this.realtimeService.emitTableStatusUpdated(payload);
        if (changeStatusDto.status === 'OCCUPIED') {
            this.realtimeService.emitTableOccupied(payload);
        }
        else if (changeStatusDto.status === 'AVAILABLE') {
            this.realtimeService.emitTableAvailable(payload);
        }
        return updated;
    }
    async remove(id) {
        await this.findOne(id);
        return this.tablesRepository.delete(id);
    }
};
exports.TablesService = TablesService;
exports.TablesService = TablesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tables_repository_1.TablesRepository,
        realtime_service_1.RealtimeService])
], TablesService);
//# sourceMappingURL=tables.service.js.map