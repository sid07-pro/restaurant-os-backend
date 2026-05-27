"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var RealtimeGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const realtime_service_1 = require("./realtime.service");
const ROLE_ROOMS = {
    ADMIN: ['dashboard', 'kds', 'tables', 'reservations', 'inventory'],
    MANAGER: ['dashboard', 'kds', 'tables', 'reservations', 'inventory'],
    CASHIER: ['dashboard'],
    WAITER: ['tables', 'reservations'],
    KITCHEN_STAFF: ['kds'],
};
const VALID_ROOMS = ['dashboard', 'kds', 'tables', 'reservations', 'inventory'];
let RealtimeGateway = RealtimeGateway_1 = class RealtimeGateway {
    jwtService;
    configService;
    realtimeService;
    logger = new common_1.Logger(RealtimeGateway_1.name);
    server;
    constructor(jwtService, configService, realtimeService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.realtimeService = realtimeService;
    }
    afterInit(server) {
        this.realtimeService.setServer(server);
        this.logger.log('WebSocket Gateway initialized');
    }
    onModuleDestroy() {
        this.logger.log('Disconnecting all WebSocket clients for graceful shutdown...');
        this.server?.disconnectSockets(true);
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth?.token ||
                client.handshake.headers?.authorization?.replace('Bearer ', '');
            if (!token) {
                this.logger.warn(`Socket ${client.id}: No token provided, disconnecting`);
                client.emit('error', { message: 'Authentication token is required' });
                client.disconnect(true);
                return;
            }
            const secret = this.configService.get('JWT_SECRET');
            const payload = this.jwtService.verify(token, { secret });
            const user = { id: payload.sub, email: payload.email, role: payload.role };
            client.user = user;
            this.logger.log(`Socket ${client.id}: Authenticated as ${user.email} (${user.role})`);
            client.emit('authenticated', { userId: user.id, role: user.role });
        }
        catch (err) {
            this.logger.warn(`Socket ${client.id}: JWT validation failed: ${err.message}`);
            client.emit('error', { message: 'Invalid or expired token' });
            client.disconnect(true);
        }
    }
    handleDisconnect(client) {
        this.logger.log(`Socket ${client.id}: Disconnected`);
    }
    handleSubscribe(client, data) {
        const user = client.user;
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
    handleUnsubscribe(client, data) {
        const room = data?.room;
        if (room && VALID_ROOMS.includes(room)) {
            client.leave(room);
            this.logger.log(`Socket ${client.id}: Left room '${room}'`);
            client.emit('unsubscribed', { room, message: `Successfully unsubscribed from ${room}` });
        }
    }
};
exports.RealtimeGateway = RealtimeGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RealtimeGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], RealtimeGateway.prototype, "handleSubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('unsubscribe'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], RealtimeGateway.prototype, "handleUnsubscribe", null);
exports.RealtimeGateway = RealtimeGateway = RealtimeGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
        namespace: '/',
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        realtime_service_1.RealtimeService])
], RealtimeGateway);
//# sourceMappingURL=realtime.gateway.js.map