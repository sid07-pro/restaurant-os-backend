// src/main.ts

import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import * as compressionPkg from 'compression';
import * as hppPkg from 'hpp';
import { AppModule } from './app.module';
import { CentralizedLogger } from './common/logger/centralized-logger.service';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json, urlencoded } from 'express';

const compression = compressionPkg.default || compressionPkg;
const hpp = hppPkg.default || hppPkg;

async function bootstrap() {
  const logger = new CentralizedLogger('Bootstrap');
  
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: logger,
  });

  // Enable Trust Proxy for rate limiting behind reverse proxies (Render, Railway, etc.)
  app.set('trust proxy', 1);

  // Security Middlewares
  app.use(helmet());
  app.use(compression());
  app.use(hpp()); // HTTP Parameter Pollution protection
  
  // Request payload limits
  app.use(json({ limit: '100kb' }));
  app.use(urlencoded({ extended: true, limit: '100kb' }));

  // Enable Graceful Shutdown hooks
  app.enableShutdownHooks();

  // Global Validation Pipeline
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global Interceptors
  app.useGlobalInterceptors(new LoggingInterceptor(), new TimeoutInterceptor());

  // Global Exception Filter
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  // API Versioning Strategy
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // CORS Support
  const corsOrigins = process.env.CORS_ORIGINS || '*';
  app.enableCors({
    origin: corsOrigins === '*' ? true : corsOrigins.split(','),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  
  // Global Unhandled Rejection Handler (prevents node crashes from dangling promises)
  process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise} reason: ${reason}`);
  });

  await app.listen(port);
  
  logger.log(`Restaurant OS Backend successfully initialized on port ${port} under ${process.env.NODE_ENV || 'development'} environment.`);
}
bootstrap();
