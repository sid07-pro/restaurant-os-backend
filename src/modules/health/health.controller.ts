// src/modules/health/health.controller.ts

import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
    };
  }
}
