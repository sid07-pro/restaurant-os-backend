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
exports.UpdatePriorityDto = exports.UpdateKitchenNotesDto = void 0;
const class_validator_1 = require("class-validator");
class UpdateKitchenNotesDto {
    kitchenNotes;
}
exports.UpdateKitchenNotesDto = UpdateKitchenNotesDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'kitchenNotes must not be empty' }),
    __metadata("design:type", String)
], UpdateKitchenNotesDto.prototype, "kitchenNotes", void 0);
class UpdatePriorityDto {
    priority;
}
exports.UpdatePriorityDto = UpdatePriorityDto;
__decorate([
    (0, class_validator_1.IsBoolean)({ message: 'priority must be a boolean' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'priority is required' }),
    __metadata("design:type", Boolean)
], UpdatePriorityDto.prototype, "priority", void 0);
//# sourceMappingURL=kds.dto.js.map