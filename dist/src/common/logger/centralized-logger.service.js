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
        this.printLog('INFO', message, context, () => super.log(message, context));
    }
    error(message, stack, context) {
        this.printLog('ERROR', message, context, () => super.error(message, stack, context), stack);
    }
    warn(message, context) {
        this.printLog('WARN', message, context, () => super.warn(message, context));
    }
    debug(message, context) {
        this.printLog('DEBUG', message, context, () => super.debug(message, context));
    }
    verbose(message, context) {
        this.printLog('VERBOSE', message, context, () => super.verbose(message, context));
    }
    printLog(level, message, context, fallbackFn, stack) {
        if (process.env.NODE_ENV === 'production') {
            let parsedMsg = message;
            if (message instanceof Error) {
                parsedMsg = message.message;
                stack = stack || message.stack;
            }
            else if (typeof message === 'string') {
                try {
                    parsedMsg = JSON.parse(message);
                }
                catch {
                }
            }
            const logObj = {
                time: new Date().toISOString(),
                level,
                context: context || 'App',
                message: typeof parsedMsg === 'string' ? parsedMsg : undefined,
            };
            if (typeof parsedMsg === 'object' && parsedMsg !== null) {
                Object.assign(logObj, parsedMsg);
            }
            if (stack) {
                logObj.stack = stack;
            }
            process.stdout.write(JSON.stringify(logObj) + '\n');
        }
        else {
            fallbackFn?.();
        }
    }
};
exports.CentralizedLogger = CentralizedLogger;
exports.CentralizedLogger = CentralizedLogger = __decorate([
    (0, common_1.Injectable)()
], CentralizedLogger);
//# sourceMappingURL=centralized-logger.service.js.map