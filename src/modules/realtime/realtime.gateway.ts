import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, OnModuleDestroy } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RealtimeService } from './realtime.service';

// Role → allowed rooms
const ROLE_ROOMS: Record<string, string[]> = {
  ADMIN: ['dashboard', 'kds', 'tables', 'reservations', 'inventory'],
  MANAGER: ['dashboard', 'kds', 'tables', 'reservations', 'inventory'],
  CASHIER: ['dashboard'],
  WAITER: ['tables', 'reservations'],
  KITCHEN_STAFF: ['kds'],
};

const VALID_ROOMS = ['dashboard', 'kds', 'tables', 'reservations', 'inventory'];

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/',
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleDestroy
{
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly realtimeService: RealtimeService,
  ) {}

  afterInit(server: Server) {
    this.realtimeService.setServer(server);
    this.logger.log('WebSocket Gateway initialized');
  }

  onModuleDestroy() {
    this.logger.log('Disconnecting all WebSocket clients for graceful shutdown...');
    this.server?.disconnectSockets(true);
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth?.token as string) ||
        (client.handshake.headers?.authorization?.replace('Bearer ', '') as string);

      if (!token) {
        this.logger.warn(`Socket ${client.id}: No token provided, disconnecting`);
        client.emit('error', { message: 'Authentication token is required' });
        client.disconnect(true);
        return;
      }

      const secret = this.configService.get<string>('JWT_SECRET') as string;
      const payload = this.jwtService.verify(token, { secret });
      const user = { id: payload.sub, email: payload.email, role: payload.role };

      (client as any).user = user;
      this.logger.log(`Socket ${client.id}: Authenticated as ${user.email} (${user.role})`);
      client.emit('authenticated', { userId: user.id, role: user.role });
    } catch (err: any) {
      this.logger.warn(`Socket ${client.id}: JWT validation failed: ${err.message}`);
      client.emit('error', { message: 'Invalid or expired token' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Socket ${client.id}: Disconnected`);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ) {
    const user = (client as any).user;
    if (!user) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    const room = data?.room;
    if (!room || !VALID_ROOMS.includes(room)) {
      client.emit('error', { message: `Invalid room: ${room}. Valid rooms: ${VALID_ROOMS.join(', ')}` });
      return;
    }

    const allowedRooms = ROLE_ROOMS[user.role] || [];
    if (!allowedRooms.includes(room)) {
      client.emit('error', {
        message: `Access denied. Role ${user.role} cannot join room '${room}'`,
      });
      return;
    }

    client.join(room);
    this.logger.log(`Socket ${client.id}: Joined room '${room}'`);
    client.emit('subscribed', { room, message: `Successfully subscribed to ${room}` });
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ) {
    const room = data?.room;
    if (room && VALID_ROOMS.includes(room)) {
      client.leave(room);
      this.logger.log(`Socket ${client.id}: Left room '${room}'`);
      client.emit('unsubscribed', { room, message: `Successfully unsubscribed from ${room}` });
    }
  }
}
