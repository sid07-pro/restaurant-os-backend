"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const centralized_logger_service_1 = require("./common/logger/centralized-logger.service");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
async function bootstrap() {
    const logger = new centralized_logger_service_1.CentralizedLogger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: logger,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
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
    await app.listen(port);
    logger.log(`Restaurant OS Backend successfully initialized on port ${port} under ${process.env.NODE_ENV} environment.`);
}
bootstrap();
//# sourceMappingURL=main.js.map