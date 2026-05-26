import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { KdsService } from './kds.service';
import { UpdateKitchenNotesDto, UpdatePriorityDto } from './dto/kds.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller({ path: 'kds', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class KdsController {
  constructor(private readonly kdsService: KdsService) {}

  /**
   * GET /api/v1/kds/tickets
   * View active kitchen tickets.
   * Roles: ALL authenticated staff
   */
  @Get('tickets')
  getActiveTickets() {
    return this.kdsService.getActiveTickets();
  }

  /**
   * GET /api/v1/kds/tickets/:orderId
   * View a single ticket with prep duration.
   * Roles: ALL authenticated staff
   */
  @Get('tickets/:orderId')
  getTicket(@Param('orderId') orderId: string) {
    return this.kdsService.getTicket(orderId);
  }

  /**
   * PATCH /api/v1/kds/tickets/:orderId/start
   * SENT_TO_KITCHEN → PREPARING. Sets preparationStartedAt.
   * Roles: KITCHEN_STAFF, ADMIN, MANAGER
   */
  @Patch('tickets/:orderId/start')
  @Roles('ADMIN', 'MANAGER', 'KITCHEN_STAFF')
  @HttpCode(HttpStatus.OK)
  startPreparing(@Param('orderId') orderId: string) {
    return this.kdsService.startPreparing(orderId);
  }

  /**
   * PATCH /api/v1/kds/tickets/:orderId/ready
   * PREPARING → READY. Sets readyAt.
   * Roles: KITCHEN_STAFF, ADMIN, MANAGER
   */
  @Patch('tickets/:orderId/ready')
  @Roles('ADMIN', 'MANAGER', 'KITCHEN_STAFF')
  @HttpCode(HttpStatus.OK)
  markReady(@Param('orderId') orderId: string) {
    return this.kdsService.markReady(orderId);
  }

  /**
   * PATCH /api/v1/kds/tickets/:orderId/serve
   * READY → SERVED. Sets servedAt.
   * Roles: WAITER, ADMIN, MANAGER
   */
  @Patch('tickets/:orderId/serve')
  @Roles('ADMIN', 'MANAGER', 'WAITER')
  @HttpCode(HttpStatus.OK)
  markServed(@Param('orderId') orderId: string) {
    return this.kdsService.markServed(orderId);
  }

  /**
   * PATCH /api/v1/kds/tickets/:orderId/notes
   * Update kitchen-facing notes.
   * Roles: KITCHEN_STAFF, ADMIN, MANAGER
   */
  @Patch('tickets/:orderId/notes')
  @Roles('ADMIN', 'MANAGER', 'KITCHEN_STAFF')
  @HttpCode(HttpStatus.OK)
  updateKitchenNotes(
    @Param('orderId') orderId: string,
    @Body() dto: UpdateKitchenNotesDto,
  ) {
    return this.kdsService.updateKitchenNotes(orderId, dto);
  }

  /**
   * PATCH /api/v1/kds/tickets/:orderId/priority
   * Set or clear priority flag.
   * Roles: ADMIN, MANAGER
   */
  @Patch('tickets/:orderId/priority')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  updatePriority(
    @Param('orderId') orderId: string,
    @Body() dto: UpdatePriorityDto,
  ) {
    return this.kdsService.updatePriority(orderId, dto);
  }
}
