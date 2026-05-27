import { PrismaService } from '../../prisma/prisma.service';
export declare class HealthService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getLiveness(): {
        status: string;
        timestamp: string;
    };
    getReadiness(): Promise<{
        status: string;
        timestamp: string;
        database: string;
        websocket: string;
        memory: {
            rss: string;
            heapTotal: string;
            heapUsed: string;
        };
        cpuLoad: number[];
    }>;
    getDetailedHealth(): {
        status: string;
        timestamp: string;
        uptime: number;
        version: string;
        environment: string;
    };
}
