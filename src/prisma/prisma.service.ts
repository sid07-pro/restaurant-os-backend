// src/prisma/prisma.service.ts

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { CentralizedLogger } from '../common/logger/centralized-logger.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new CentralizedLogger('PrismaService');

  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    try {
      this.logger.log('Attempting to connect to PostgreSQL database via Prisma...');
      await this.$connect();
      this.logger.log('PostgreSQL database connection successfully established.');
    } catch (error) {
      this.logger.error(
        `Failed to establish PostgreSQL connection: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      );
      this.logger.warn(
        'Application started without active database connection pool. Database-reliant endpoints will fail.',
      );
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('PostgreSQL database connection cleanly terminated.');
    } catch (error) {
      this.logger.error('Error during database disconnection cleanup.');
    }
  }
}
