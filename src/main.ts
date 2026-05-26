// src/main.ts

import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import { CentralizedLogger } from './common/logger/centralized-logger.service';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const logger = new CentralizedLogger('Bootstrap');
  
  const app = await NestFactory.create(AppModule, {
    logger: logger,
  });

  // 1. Centralized Global Validation Pipeline
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 2. Centralized Global Exception Filter
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  // 3. API Versioning Strategy (e.g. /api/v1/...)
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // 4. CORS Support
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
