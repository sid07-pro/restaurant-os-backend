import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller({ path: 'health', version: '1' })
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  getHealth() {
    return this.healthService.getDetailedHealth();
  }

  @Get('live')
  getLiveness() {
    return this.healthService.getLiveness();
  }

  @Get('ready')
  async getReadiness() {
    return this.healthService.getReadiness();
  }
}
