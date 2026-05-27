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
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const centralized_logger_service_1 = require("../logger/centralized-logger.service");
let AllExceptionsFilter = class AllExceptionsFilter {
    httpAdapterHost;
    logger = new centralized_logger_service_1.CentralizedLogger('ExceptionsFilter');
    constructor(httpAdapterHost) {
        this.httpAdapterHost = httpAdapterHost;
    }
    catch(exception, host) {
        const { httpAdapter } = this.httpAdapterHost;
        const ctx = host.switchToHttp();
        const httpStatus = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const exceptionResponse = exception instanceof common_1.HttpException
            ? exception.getResponse()
            : 'Internal server error';
        const message = typeof exceptionResponse === 'object' && exceptionResponse !== null
            ? exceptionResponse.message || JSON.stringify(exceptionResponse)
            : exceptionResponse;
        const isProduction = process.env.NODE_ENV === 'production';
        const safeMessage = isProduction && httpStatus === common_1.HttpStatus.INTERNAL_SERVER_ERROR
            ? 'Internal server error'
            : message;
        const responseBody = {
            statusCode: httpStatus,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
            message: safeMessage,
            ...(isProduction ? {} : { stack: exception instanceof Error ? exception.stack : undefined }),
        };
        this.logger.error(`Exception thrown at ${responseBody.path}: ${exception instanceof Error ? exception.message : JSON.stringify(exception)}`, exception instanceof Error ? exception.stack : undefined);
        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [core_1.HttpAdapterHost])
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map