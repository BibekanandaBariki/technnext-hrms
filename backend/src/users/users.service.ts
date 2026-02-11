import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findOne(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        const salt = await bcrypt.genSalt(10); // Using 10 as per prompt requirement? Ah prompt says 12.
        // Changing to use prompt requirement if possible, or config.
        // But here I'll just use bcrypt directly.
        // Let's check prompt requirement: "bcrypt (cost factor: 12)"
        const hashedPassword = await bcrypt.hash(data.passwordHash as string, 12);

        return this.prisma.user.create({
            data: {
                ...data,
                passwordHash: hashedPassword,
            },
        });
    }

    async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
        if (data.passwordHash) {
            data.passwordHash = await bcrypt.hash(data.passwordHash as string, 12);
        }
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }
}
