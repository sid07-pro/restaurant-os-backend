"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const helmet_1 = __importDefault(require("helmet"));
const compressionPkg = __importStar(require("compression"));
const hppPkg = __importStar(require("hpp"));
const app_module_1 = require("./app.module");
const centralized_logger_service_1 = require("./common/logger/centralized-logger.service");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const timeout_interceptor_1 = require("./common/interceptors/timeout.interceptor");
const express_1 = require("express");
const compression = compressionPkg.default || compressionPkg;
const hpp = hppPkg.default || hppPkg;
async function bootstrap() {
    const logger = new centralized_logger_service_1.CentralizedLogger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: logger,
    });
    app.set('trust proxy', 1);
    app.use((0, helmet_1.default)());
    app.use(compression());
    app.use(hpp());
    app.use((0, express_1.json)({ limit: '100kb' }));
    app.use((0, express_1.urlencoded)({ extended: true, limit: '100kb' }));
    app.enableShutdownHooks();
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(), new timeout_interceptor_1.TimeoutInterceptor());
    const httpAdapterHost = app.get(core_1.HttpAdapterHost);
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter(httpAdapterHost));
    app.setGlobalPrefix('api');
    app.enableVersioning({
        type: common_1.VersioningType.URI,
        defaultVersion: '1',
    });
    const corsOrigins = process.env.CORS_ORIGINS || '*';
    app.enableCors({
        origin: corsOrigins === '*' ? true : corsOrigins.split(','),
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    const port = process.env.PORT || 3000;
    process.on('unhandledRejection', (reason, promise) => {
        logger.error(`Unhandled Rejection at: ${promise} reason: ${reason}`);
    });
    await app.listen(port);
    logger.log(`Restaurant OS Backend successfully initialized on port ${port} under ${process.env.NODE_ENV || 'development'} environment.`);
}
bootstrap();
//# sourceMappingURL=main.js.map