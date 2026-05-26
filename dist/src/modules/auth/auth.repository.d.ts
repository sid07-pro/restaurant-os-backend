import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
export declare class AuthRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    createUser(data: Prisma.UserCreateInput): Promise<User>;
    countAdminUsers(): Promise<number>;
}
