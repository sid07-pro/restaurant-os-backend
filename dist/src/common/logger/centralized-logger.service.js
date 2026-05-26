"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CentralizedLogger = void 0;
const common_1 = require("@nestjs/common");
let CentralizedLogger = class CentralizedLogger extends common_1.ConsoleLogger {
    log(message, context) {
        const formatted = this.formatJsonMessage('INFO', message, context);
        super.log(formatted);
    }
    error(message, stack, context) {
        const formatted = this.formatJsonMessage('ERROR', message, context);
        super.error(formatted, stack);
    }
    warn(message, context) {
        const formatted = this.formatJsonMessage('WARN', message, context);
        super.warn(formatted);
    }
    debug(message, context) {
        const formatted = this.formatJsonMessage('DEBUG', message, context);
        super.debug(formatted);
    }
    verbose(message, context) {
        const formatted = this.formatJsonMessage('VERBOSE', message, context);
        super.verbose(formatted);
    }
    formatJsonMessage(level, message, context) {
        const timestamp = new Date().toISOString();
        const msg = typeof message === 'object' ? JSON.stringify(message) : message;
        return `{"time":"${timestamp}","level":"${level}","context":"${context || 'App'}","message":"${msg}"}`;
    }
};
exports.CentralizedLogger = CentralizedLogger;
exports.CentralizedLogger = CentralizedLogger = __decorate([
    (0, common_1.Injectable)()
], CentralizedLogger);
//# sourceMappingURL=centralized-logger.service.js.map