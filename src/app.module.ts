// src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './common/config/env.config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: true,
      },
    }),
    PrismaModule,
    HealthModule,
  ],
})
export class AppModule {}
