import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository implements IUserRepository {
    constructor(private prisma: PrismaService) {}

    async findByEmail(email: string): Promise<User | null> {
        const user = await this.prisma.users.findUnique({
            where: { email },
        });
        return user ? User.of(user) : null;
    }

    async findByUsername(username: string): Promise<User | null> {
        const user = await this.prisma.users.findUnique({
            where: { username },
        });
        return user ? User.of(user) : null;
    }

    async findById(id: number): Promise<User | null> {
        const user = await this.prisma.users.findUnique({
            where: { id },
        });
        return user ? User.of(user) : null;
    }

    async create(user: User): Promise<User> {
        const createdUser = await this.prisma.users.create({
            data: {
                email: user.email,
                username: user.username,
                universityCode: user.universityCode,
                hashedPassword: user.hashedPassword,
                updatedAt: new Date(),
            },
        });
        return User.of(createdUser);
    }
}
